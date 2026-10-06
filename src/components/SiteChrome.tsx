import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-[11px] font-semibold tracking-wide text-white">
            DR
          </span>
          <span className="text-sm font-medium tracking-tight">
            Dealer AI Readiness
          </span>
        </Link>
        <p className="hidden text-xs text-muted sm:block">
          Growth experiment inspired by Spyne
        </p>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl">
          This is an experimental growth assessment. Results are based on
          publicly visible website signals and should be treated as directional,
          not a formal audit.
        </p>
        <p>A concept prototype. Not affiliated with Spyne.</p>
      </div>
    </footer>
  );
}
