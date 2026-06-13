import { CalendarDashboard } from "@/features/calendar/components/CalendarDashboard";
import { AppNav } from "@/components/AppNav";
export default function Home() {
  return (
    <main className="min-h-screen bg-black px-3 py-4 text-zinc-100 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-[1600px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:rounded-2xl sm:p-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Lazy Teamup</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Monthly calendar summaries and event insights.
            </p>
          </div>

          <div className="w-fit rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
            Teamup Dashboard
          </div>
        </header>

        <CalendarDashboard />
      </section>
    </main>
  );
}
