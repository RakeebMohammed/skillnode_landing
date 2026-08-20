export default function Footer() {
  return (
    <footer className="site-footer skillnode-live-footer">
      <div className="container footer-shell">
        <div className="footer-card">
          <div className="footer-panel">
            <div className="footer-top">
              <div className="footer-brand">
                <a href="https://www.skillnode.in/" aria-label="SkillNode home">
                  <img
                    className="footer-logo"
                    src="/skillnode-logo.svg"
                    alt="SkillNode"
                  />
                </a>
                <p>
                  SkillNode &mdash; A global and hyperlocal freelance marketplace
                  built on trust, research, and innovation. Connecting verified
                  professionals and businesses to create opportunity in every
                  era of work.
                </p>

                <div className="footer-social">
                  <a
                    href="https://www.facebook.com/share/1H6VeiLSA2/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/skillnodesolution/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4.983 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.017-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1A4.2 4.2 0 0 1 21 14.5V21h-4v-5.2c0-1.2-.02-2.8-1.7-2.8-1.7 0-2 1.3-2 2.7V21h-4V9Z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/skillnodeindia"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="footer-links">
                <div className="footer-col">
                  <h3>For Candidates</h3>
                  <ul>
                    <li><a href="https://www.skillnode.in/find-job">Browse Jobs</a></li>
                    <li><a href="https://www.skillnode.in/find-talent">Browse Profile</a></li>
                  </ul>
                </div>

                <div className="footer-col">
                  <h3>Resources</h3>
                  <ul>
                    <li><a href="https://www.skillnode.in/blog">Blog</a></li>
                  </ul>
                </div>

                <div className="footer-col">
                  <h3>Company</h3>
                  <ul>
                    <li><a href="https://www.skillnode.in/about">About</a></li>
                    <li><a href="https://www.skillnode.in/how-it-works">How It Works</a></li>
                    <li><a href="https://www.skillnode.in/careers">Careers</a></li>
                    <li><a href="https://www.skillnode.in/contact">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-rule" />

            <div className="footer-bottom">
              <p>
                &copy; {new Date().getFullYear()} SKILLNODE SOLUTIONS PRIVATE
                LIMITED. All rights reserved.
              </p>
              <nav className="footer-legal" aria-label="Legal">
                <a href="https://www.skillnode.in/legal#privacy">Privacy Policy</a>
                <a href="https://www.skillnode.in/legal#terms-of-use">Terms of Service</a>
                <a href="https://www.skillnode.in/#">Cookies Settings</a>
                <a href="https://www.skillnode.in/faq">FAQ</a>
              </nav>
            </div>
          </div>

          <div className="footer-wordmark" aria-hidden="true">
            SKILLNODE
          </div>
        </div>
      </div>
    </footer>
  );
}
