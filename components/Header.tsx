"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const NAV_LINKS = [
  { label: "Find Work", href: "https://www.skillnode.in/find-job" },
  { label: "Find Talent", href: "https://www.skillnode.in/find-talent" },
  { label: "How It Works", href: "https://www.skillnode.in/how-it-works" },
];

interface ThemeToggleProps {
  mounted: boolean;
  theme: Theme;
  onToggle: () => void;
}

function ThemeToggle({ mounted, theme, onToggle }: ThemeToggleProps) {
  if (!mounted) {
    return <span className="theme-toggle-placeholder" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      data-analytics-ignore="true"
      aria-label="Toggle Theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggle}
    >
      {theme === "dark" ? (
        <svg className="theme-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg className="theme-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const initialTheme: Theme = root.classList.contains("dark") ? "dark" : "light";
    setTheme(initialTheme);
    setMounted(true);

    const updateScrollState = () => setScrolled(window.scrollY > 40);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    root.style.colorScheme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  const useWhiteLogo = theme === "dark";

  return (
    <header
      className={`site-header ${scrolled ? "is-scrolled" : ""}`}
      aria-label="Primary"
    >
      <div className="site-header-shell">
        <div className="container header-inner">
          <a
            href="https://www.skillnode.in/"
            className={`header-logo ${useWhiteLogo ? "header-logo-white" : ""}`}
            aria-label="SkillNode home"
            onClick={() => setOpen(false)}
          >
            <img src="/skillnode-logo.svg" alt="SkillNode" />
          </a>

          <div className="header-navigation">
            <nav className="main-nav" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>

            <ThemeToggle mounted={mounted} theme={theme} onToggle={toggleTheme} />

            <a href="https://www.skillnode.in/signup" className="header-signup">
              Sign up
            </a>
            <a href="https://www.skillnode.in/login" className="header-login">
              Log In
            </a>
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h16M4 12h16M4 19h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="mobile-navigation"
        className={`mobile-nav ${open ? "open" : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="mobile-nav-head">
          <a
            href="https://www.skillnode.in/"
            className={`mobile-logo ${theme === "dark" ? "header-logo-white" : ""}`}
            aria-label="SkillNode home"
            onClick={() => setOpen(false)}
          >
            <img src="/skillnode-logo.svg" alt="SkillNode" />
          </a>
          <div className="mobile-nav-controls">
            <ThemeToggle mounted={mounted} theme={theme} onToggle={toggleTheme} />
            <button
              type="button"
              className="mobile-nav-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="mobile-nav-links" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="mobile-nav-actions">
          <a href="https://www.skillnode.in/signup" onClick={() => setOpen(false)}>
            Sign up
          </a>
          <a
            href="https://www.skillnode.in/login"
            className="header-login"
            onClick={() => setOpen(false)}
          >
            Log In
          </a>
        </div>
      </aside>
    </header>
  );
}
