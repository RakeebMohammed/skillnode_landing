"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("skillnode-theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark); document.documentElement.classList.toggle("dark", isDark);
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("skillnode-theme", next ? "dark" : "light");
  }

  return <header className={`exact-header${scrolled ? " is-scrolled" : ""}`} aria-label="Primary"><div className="exact-header-shell"><div className="exact-header-inner"><a href="https://www.skillnode.in/" className="exact-logo"><img src="https://skillnode.in/logo-w-dot.svg" alt="Logo" /></a><div className="exact-navigation"><nav><a href="https://www.skillnode.in/find-job">Find Work</a><a href="https://www.skillnode.in/find-talent">Find Talent</a><a href="https://www.skillnode.in/how-it-works">How It Works</a><button className="exact-theme" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? "☀" : "☾"}</button><a href="https://www.skillnode.in/signup">Sign up</a><a className="exact-login" href="https://www.skillnode.in/login">Log In</a></nav><button className="exact-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16" /></svg></button></div></div>{open && <nav className="exact-mobile-nav"><button className="exact-theme mobile-theme" onClick={toggleTheme}>{dark ? "☀ Light mode" : "☾ Dark mode"}</button><a href="https://www.skillnode.in/find-job">Find Work</a><a href="https://www.skillnode.in/find-talent">Find Talent</a><a href="https://www.skillnode.in/how-it-works">How It Works</a><a href="https://www.skillnode.in/signup">Sign up</a><a href="https://www.skillnode.in/login">Log In</a></nav>}</div></header>;
}
