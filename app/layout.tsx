import type { Metadata } from "next";
import "./globals.css";
import "./admin-dashboard.css";
import "./admin-filters.css";
import "./chart-theme.css";
import "./analytics-features.css";
import "./skillnode-theme.css";
import "./exact-skillnode.css";
import "./header-theme.css";
import "./header-glass.css";
import "./footer-exact.css";
import "./header-footer-polish.css";
import "./exact-live-fixes.css";
import "./dark-footer.css";
import "./footer-text-fixes.css";
import "./footer-live-tokens.css";
import "./footer-logo-theme.css";
import "./skillnode-fonts.css";
import "./footer-reference.css";

export const metadata: Metadata = {
  title: "SkillNode — Connect with verified professionals",
  description: "SkillNode landing page and analytics platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
