export type Role = "admin" | "cashier";
export type OrderStatus = "paid" | "cancelled";
export type PaymentMethod = "cash" | "card" | "transfer";

export type User = { id: number; username: string; full_name: string; role: Role };

export type Settings = {
  store_name: string;
  currency: string;
  tax_rate: number;
  receipt_footer: string;
  cash_enabled: number;
  card_enabled: number;
  transfer_enabled: number;
  petty_cash_enabled: number;
  petty_cash_default: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  icon: string;
  is_available: number;
  is_hidden: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  total: number;
  payment_method: PaymentMethod;
  cash_received: number | null;
  change_given: number;
  created_at: string;
  item_count: number;
  staff: string | null;
};

export type OrderItem = { id: number; name: string; unit_price: number; quantity: number };

export type StaffMember = { id: number; username: string; full_name: string; role: Role };
