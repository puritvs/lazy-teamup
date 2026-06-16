import { QueCheckDashboard } from "@/features/que-check/components/QueCheckDashboard";

export default function QueCheckPage() {
  return (
    <main className="min-h-screen bg-black px-3 pb-24 pt-4 text-zinc-100 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-[1400px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:rounded-2xl sm:p-8">
        <QueCheckDashboard />
      </section>
    </main>
  );
}
