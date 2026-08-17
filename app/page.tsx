import AnalyticsTracker from "@/components/AnalyticsTracker";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LandingForm from "@/components/LandingForm";

export default function HomePage() {
  return <><AnalyticsTracker /><Header /><main className="contact-main"><section className="contact-card"><div className="contact-copy"><span className="contact-kicker">SKILLNODE</span><h1>Let’s build something meaningful.</h1><p>Tell us what you need. Our verified professional network is ready to help you move forward.</p><div className="contact-points"><span>Verified professionals</span><span>Global & hyperlocal talent</span><span>Built around trust</span></div></div><LandingForm /></section></main><Footer /></>;
}
