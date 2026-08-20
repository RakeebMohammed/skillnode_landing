import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default function Home() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
        </>
      )}

      <AnalyticsTracker />
      <Header />

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div>
              <span className="hero-eyebrow">
                <span className="pulse" />
                India&apos;s First Hyperlocal Marketplace
              </span>
              <h1>
                Hire talent. <span className="accent">Empower freelancers.</span>
              </h1>
              <p className="lede">
                Connect with verified professionals near you or across India.
                Post a project, get proposals, and pay securely — all in one
                place.
              </p>
              <div className="hero-stats">
                <div>
                  <strong>1000+</strong>
                  <span>Verified professionals</span>
                </div>
                <div>
                  <strong>700+</strong>
                  <span>Freelance categories</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
              </div>
            </div>

            <QuestionnaireForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
