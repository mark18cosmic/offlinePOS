import { z } from "zod";

const name = z.string().trim().min(1, "Please enter a name").max(80, "That name is too long");

export const productSchema = z.object({
  name,
  price: z
    .number({ error: "Enter a price" })
    .min(0, "Price cannot be negative")
    .max(9_999_999, "That price is too high"),
  icon: z.string().trim().min(1, "Pick a picture").max(20),
  isAvailable: z.boolean(),
  isHidden: z.boolean(),
});

export const settingsSchema = z
  .object({
    storeName: name,
    currency: z.string().trim().min(1, "Enter a currency").max(5, "Use a symbol or short code"),
    taxRate: z.number({ error: "Enter a number" }).min(0, "Cannot be negative").max(100, "Cannot be over 100"),
    receiptFooter: z.string().trim().max(200, "That text is too long"),
    cashEnabled: z.boolean(),
    cardEnabled: z.boolean(),
    transferEnabled: z.boolean(),
    pettyCashEnabled: z.boolean(),
    pettyCashDefault: z
      .number({ error: "Enter an amount" })
      .min(0, "Cannot be negative")
      .max(9_999_999, "That amount is too high"),
  })
  .refine((value) => value.cashEnabled || value.cardEnabled || value.transferEnabled, {
    path: ["cashEnabled"],
    message: "Keep at least one way to pay switched on",
  });

export const saleSchema = z.object({
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  cashReceived: z.number().int().min(0).max(999_999_999).nullable(), // minor units, cash sales only
  items: z
    .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive().max(999) }))
    .min(1),
});

const password = z.string().min(4, "Use at least 4 characters").max(100, "That password is too long");

export const cashierSchema = z.object({
  fullName: name,
  username: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(30, "That username is too long")
    .regex(/^\S+$/, "No spaces please"),
  password,
});

export const passwordSchema = z.object({ password });

export type CashierInput = z.infer<typeof cashierSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SaleInput = z.infer<typeof saleSchema>;

/** What every mutating Server Action returns, so screens can show the message. */
export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
