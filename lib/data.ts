import { db } from "./db";
import type { Order, OrderItem, Product, Settings, StaffMember } from "./types";

export function getSettings() {
  return db.prepare("select * from settings where id = 1").get() as Settings;
}

export function getProducts() {
  return db.prepare("select * from products order by is_hidden, id").all() as Product[];
}

/** YYYY-MM-DD in the server's timezone. */
export function localDay(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const ORDER_SELECT = `
  select o.*, u.full_name as staff,
    (select coalesce(sum(i.quantity), 0) from order_items i where i.order_id = o.id) as item_count
  from orders o left join users u on u.id = o.created_by`;

/** A day's start and end as ISO timestamps, in the server's own timezone. */
function dayRange(day: string) {
  const start = new Date(`${day}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()] as const;
}

/** Today's sales rung up by one person, newest first. */
export function getTodaysOrdersFor(userId: number) {
  return db
    .prepare(`${ORDER_SELECT} where o.created_at >= ? and o.created_at < ? and o.created_by = ? order by o.id desc`)
    .all(...dayRange(localDay()), userId) as Order[];
}

export function getOrder(id: number) {
  const order = db.prepare(`${ORDER_SELECT} where o.id = ?`).get(id) as Order | undefined;
  if (!order) return null;
  const items = db
    .prepare("select id, name, unit_price, quantity from order_items where order_id = ? order by id")
    .all(id) as OrderItem[];
  return { order, items };
}

/** Starting cash for a day: what the admin set, else today's default, else the default that applied that day. */
export function getPettyCash(day: string) {
  const row = db.prepare("select amount, is_manual from petty_cash_days where day = ?").get(day) as
    | { amount: number; is_manual: number }
    | undefined;
  if (row?.is_manual) return { amount: row.amount, isDefault: false };
  if (day === localDay()) return { amount: getSettings().petty_cash_default, isDefault: true };
  return { amount: row?.amount ?? 0, isDefault: true };
}

export function getDailyReport(day: string) {
  const range = dayRange(day);
  const orders = db
    .prepare(`${ORDER_SELECT} where o.created_at >= ? and o.created_at < ? order by o.id desc`)
    .all(...range) as Order[];
  const paid = orders.filter((order) => order.status === "paid");
  const sum = (list: Order[]) => list.reduce((total, order) => total + order.total, 0);

  const employees = [...Map.groupBy(paid, (order) => order.staff ?? "Unknown")].map(([name, sales]) => ({
    name,
    count: sales.length,
    total: sum(sales),
    cash: sum(sales.filter((sale) => sale.payment_method === "cash")),
  }));
  employees.sort((a, b) => b.total - a.total);

  const items = db
    .prepare(
      `select i.name, sum(i.quantity) as quantity, sum(i.quantity * i.unit_price) as total
       from order_items i join orders o on o.id = i.order_id
       where o.status = 'paid' and o.created_at >= ? and o.created_at < ?
       group by i.name order by total desc`,
    )
    .all(...range) as { name: string; quantity: number; total: number }[];

  // Sales per hour of the day, for the report chart.
  const hourly = Array.from({ length: 24 }, () => 0);
  for (const order of paid) hourly[new Date(order.created_at).getHours()] += order.total;

  return {
    orders,
    hourly,
    changeGiven: paid.reduce((total, order) => total + order.change_given, 0),
    total: sum(paid),
    count: paid.length,
    byMethod: {
      cash: sum(paid.filter((order) => order.payment_method === "cash")),
      card: sum(paid.filter((order) => order.payment_method === "card")),
      transfer: sum(paid.filter((order) => order.payment_method === "transfer")),
    },
    employees,
    items,
  };
}

export function getStaff() {
  return db
    .prepare("select id, username, full_name, role from users where is_active = 1 order by role, full_name")
    .all() as StaffMember[];
}
