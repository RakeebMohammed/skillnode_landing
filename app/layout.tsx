import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import "./admin-base.css";
import "./admin-dashboard.css";
import "./admin-filters.css";
import "./chart-theme.css";
import "./analytics-features.css";
import "./dashboard-filter-polish.css";
import "./admin-ui-polish.css";
import "./footer-live-final.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillNode - India's First Hyperlocal Marketplace",
  description: "SkillNode - India's First Hyperlocal Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);r.style.colorScheme=t}catch(e){}})();',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
