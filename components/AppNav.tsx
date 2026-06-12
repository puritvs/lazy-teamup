import Link from "next/link";

export function AppNav() {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      <Link
        href="/"
        className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
      >
        Dashboard
      </Link>

      <Link
        href="/que-check"
        className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
      >
        Que Check
      </Link>
    </nav>
  );
}
