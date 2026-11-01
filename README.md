# Simple POS

A simple point of sale for a small takeaway shop. Tap items, tap how the customer paid, done.
It runs locally on SQLite: no accounts or cloud services needed.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The database (`data/pos.db`) and sample items are created on first start.

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `cashier123` |

Change both passwords on the Staff page before real use.

For a real shop, run `npm run build` then `npm start`. Without HTTPS (for example on a local network), start it with
`INSECURE_COOKIES=1 npm start` so sign-in works.

## Vercel demo

The app deploys to Vercel as a demo only. Vercel's disk is temporary, so sales and edits disappear whenever
the server restarts, and it starts again from the sample items. For a real shop, run it on one machine as above.

Set an `AUTH_SECRET` environment variable on Vercel (any long random string) so logins work across its servers.
Sales made in the demo may not appear on every page, because each page can run on a server with its own temporary data.

## What each role gets

- **Cashier:** Sell screen and their own sales today, with receipts.
- **Admin:** also live Reports (sales, employees, items, cash in register, past days), Items, Staff and Settings.

**Petty cash** is the starting cash in the register. The admin sets it each day on Reports. If they don't, it uses the
default from Settings. Reports shows petty cash + cash sales as what should be in the register.

**Giving change:** tapping Cash asks how much the customer handed over and shows the change to give. It warns if the register may not hold enough, and saves the amounts on the receipt and in Reports.

**The More card** on the Sell screen holds items marked as hidden. They are recorded and reported like any other sale.

## Handy commands

- `npm run user -- <username> <password> [admin|cashier] "Full Name"` creates an account or resets a password.
- Back up the shop's data by copying the `data/` folder while the app is stopped.
