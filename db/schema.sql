-- Money is stored as whole minor units (e.g. 12.50 MVR = 1250) to avoid rounding errors.
create table if not exists users (
  id integer primary key,
  username text not null unique collate nocase,
  full_name text not null,
  password_hash text not null,
  role text not null default 'cashier' check (role in ('admin', 'cashier')),
  is_active integer not null default 1, -- removed staff stay in the data so old reports keep their names
  created_at text not null
);

create table if not exists sessions (
  token_hash text primary key,
  user_id integer not null references users on delete cascade,
  expires_at text not null
);

create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'My Shop',
  currency text not null default 'MVR',
  tax_rate real not null default 0,
  receipt_footer text not null default 'Thank you!',
  cash_enabled integer not null default 1,
  card_enabled integer not null default 1,
  transfer_enabled integer not null default 1,
  petty_cash_enabled integer not null default 1,
  petty_cash_default integer not null default 0
);

-- is_hidden items sit behind the "More" card on the sell screen. They are recorded like any other sale.
create table if not exists products (
  id integer primary key,
  name text not null,
  price integer not null check (price >= 0),
  icon text not null default 'bag',
  is_available integer not null default 1,
  is_hidden integer not null default 0
);

-- The auto-incrementing id doubles as the sale number shown to staff.
create table if not exists orders (
  id integer primary key autoincrement,
  status text not null default 'paid' check (status in ('paid', 'cancelled')),
  subtotal integer not null,
  tax_percent real not null default 0,
  tax_amount integer not null default 0,
  total integer not null,
  payment_method text not null check (payment_method in ('cash', 'card', 'transfer')),
  cash_received integer, -- cash sales only
  change_given integer not null default 0,
  created_by integer references users on delete set null,
  created_at text not null
);
create index if not exists orders_created_at on orders (created_at);

create table if not exists order_items (
  id integer primary key,
  order_id integer not null references orders on delete cascade,
  product_id integer references products on delete set null,
  name text not null, -- snapshot at time of sale
  unit_price integer not null,
  quantity integer not null check (quantity > 0)
);
create index if not exists order_items_order on order_items (order_id);

-- Starting cash in the register for one day. is_manual = the admin set it for that day;
-- otherwise the row is a snapshot of the default, so later default changes leave past days alone.
create table if not exists petty_cash_days (
  day text primary key, -- YYYY-MM-DD, server timezone
  amount integer not null check (amount >= 0),
  is_manual integer not null default 0
);
