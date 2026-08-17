import type { Metadata } from "next";
import "./globals.css";
import "./admin-dashboard.css";
import "./analytics-features.css";
import "./skillnode-theme.css";
import "./exact-skillnode.css";
import "./header-theme.css";
import "./header-glass.css";
import "./footer-exact.css";
import "./skillnode-fonts.css";

export const metadata: Metadata = {
  title: "SkillNode — Connect with verified professionals",
  description: "SkillNode landing page and analytics platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
