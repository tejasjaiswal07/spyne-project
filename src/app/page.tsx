import { AnalyzeForm } from "@/components/AnalyzeForm";
import { Footer, Header } from "@/components/SiteChrome";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-xl px-5 py-16">
          <h1 className="text-2xl font-medium">Dealer website score</h1>
          <p className="mt-2 text-sm text-muted">
            Paste a URL. Get a 0–100 score and three leaks.
          </p>
          <div className="mt-6">
            <AnalyzeForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
