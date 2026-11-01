import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AppToaster } from "@/components/theme";
import "./globals.css";

// Bundled from node_modules so the app needs no internet connection.
const jakarta = localFont({
  src: "../node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
});

export const metadata: Metadata = {
  title: "POS",
  description: "A simple point of sale.",
};

export const viewport: Viewport = {
  themeColor: "#0b3d39",
  viewportFit: "cover",
};

// Runs before first paint so dark mode never flashes white.
const applyTheme = `try{var t=localStorage.getItem("pos-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyTheme }} />
      </head>
      <body className={jakarta.variable}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
