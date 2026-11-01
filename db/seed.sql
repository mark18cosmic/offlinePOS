insert into settings (id, store_name, currency, tax_rate, receipt_footer)
values (1, 'My Shop', 'MVR', 0, 'Thank you!');

-- Placeholder prices: change them on the Items page.
insert into products (name, price, icon, is_hidden) values
  ('Coffee', 2500, 'coffee', 0),
  ('Water', 500, 'water', 0),
  ('Small Nuts', 500, 'nuts', 0),
  ('Big Nuts', 1000, 'nuts', 0),
  ('Takeaway Plate', 5000, 'plate', 0),
  ('Cigarettes 1', 5000, 'cigarette', 1),
  ('Cigarettes 2', 7500, 'cigarette', 1);
