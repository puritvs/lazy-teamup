import { QueCheckForm } from "@/features/que-check/components/QueCheckForm";
import { AppNav } from "@/components/AppNav";
export default function QueCheckPage() {
  return (
    <main className="min-h-screen bg-black px-3 py-4 text-zinc-100 sm:px-6 sm:py-8">
      <AppNav />
      <section className="mx-auto w-full max-w-[1000px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:rounded-2xl sm:p-8">
        <QueCheckForm events={[]} dateFormat="day-month-year" />
      </section>
    </main>
  );
}
