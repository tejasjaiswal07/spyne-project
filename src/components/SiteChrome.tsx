import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-12 max-w-2xl items-center px-5">
        <Link href="/" className="text-sm font-medium tracking-tight">
          Dealer AI Readiness
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-2xl px-5 py-5 text-xs text-muted">
        Public website signals only. Directional, not an audit.
      </div>
    </footer>
  );
}
