import { AnalyzeForm } from "@/components/AnalyzeForm";
import { Footer, Header } from "@/components/SiteChrome";

const steps = [
  {
    n: "01",
    title: "Enter your dealership URL",
    body: "Use any public rooftop site. We only read what a shopper can already see.",
  },
  {
    n: "02",
    title: "We analyze the digital buying experience",
    body: "Lead capture, inventory presentation, conversion paths, and conversational readiness.",
  },
  {
    n: "03",
    title: "Get your score and biggest opportunities",
    body: "A 0–100 readiness score, the top revenue leaks, and where Spyne could help.",
  },
];

const pillars = [
  {
    title: "Lead capture",
    body: "Can a shopper reach you, book a visit, or start a conversation without waiting for the sales floor?",
  },
  {
    title: "Inventory presentation",
    body: "Are vehicles easy to find, consistently merchandised, and visually strong enough to hold attention?",
  },
  {
    title: "Conversion",
    body: "Is the next step obvious — test drive, finance, trade-in, or contact — on the pages that matter?",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-8 pt-16 sm:pt-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Dealer AI Readiness Score
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
            Find the biggest revenue leaks in your dealership&apos;s digital
            buying journey.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            See where your dealership may be losing buyers before they ever
            reach your sales team. Enter your dealership website and get a
            quick AI-powered assessment of lead capture, inventory presentation
            and conversion.
          </p>
          <div className="mt-10 max-w-2xl rounded-2xl border border-line bg-white p-4 sm:p-5">
            <AnalyzeForm />
          </div>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            We analyze your dealership&apos;s digital experience across lead
            capture, inventory presentation and conversion.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            How it works
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="rounded-2xl border border-line bg-white p-6">
                <p className="text-xs font-medium text-muted">{step.n}</p>
                <h2 className="mt-3 text-lg font-medium">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            What we analyze
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {pillars.map((item) => (
              <div key={item.title} className="border-t border-line pt-5">
                <h2 className="text-lg font-medium">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl sm:text-4xl">
                How ready is your dealership&apos;s digital sales experience?
              </h2>
              <p className="mt-3 text-sm text-muted">
                A directional score for GTM conversations — not a production
                audit, CRM, or SEO tool.
              </p>
            </div>
            <a
              href="#dealer-url"
              className="inline-flex h-12 items-center rounded-lg bg-accent px-5 text-sm font-medium text-white"
            >
              Analyze a dealership →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
