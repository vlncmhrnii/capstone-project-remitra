"use client";

export default function PelangganPageSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-4xl border border-neutral-200 bg-neutral-50 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-400/10" />
      </div>

      <div className="relative border-b border-white/70 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/70 sm:p-6 lg:p-7">
        <div className="animate-pulse">
          <div className="h-6 w-36 rounded-full bg-orange-100 dark:bg-neutral-800" />
          <div className="mt-5 h-12 w-full max-w-3xl rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 h-5 w-full max-w-2xl rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-2 h-5 w-3/4 max-w-xl rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/90">
          <div className="animate-pulse">
            <div className="h-11 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`pelanggan-skeleton-${index}`}
              className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/90"
            >
              <div className="animate-pulse">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-neutral-800" />
                    <div className="space-y-2">
                      <div className="h-5 w-40 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-4 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="ml-auto h-4 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="ml-auto h-8 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
