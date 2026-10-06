import { AnalyzeForm } from "@/components/AnalyzeForm";
import { Footer, Header } from "@/components/SiteChrome";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-5 py-20 sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Is this dealer losing buyers on the website?
          </h1>
          <p className="mt-4 text-base text-muted">
            Paste a URL. Get a 0–100 score and the three biggest leaks.
          </p>
          <div className="mt-8 rounded-2xl border border-line bg-white p-4 sm:p-5">
            <AnalyzeForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
