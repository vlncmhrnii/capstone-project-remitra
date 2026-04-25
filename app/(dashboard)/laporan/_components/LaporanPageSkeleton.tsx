"use client";

export default function LaporanPageSkeleton() {
  return (
    <div className="space-y-4">
      <section className="relative w-full overflow-hidden rounded-3xl border border-orange-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="relative overflow-hidden border-b border-orange-300/70 bg-linear-to-r from-orange-600 via-orange-500 to-orange-400 px-4 py-4 dark:border-orange-800 dark:from-orange-700 dark:via-orange-600 dark:to-orange-500 md:px-5 md:py-5">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded-full bg-white/35" />
            <div className="mt-3 h-8 w-60 rounded-2xl bg-white/30" />
            <div className="mt-3 h-4 w-full max-w-md rounded-full bg-white/25" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-4 md:p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`laporan-summary-skeleton-${index}`}
              className="rounded-3xl border border-orange-300 bg-orange-50/90 p-4 md:min-h-52 md:p-5"
            >
              <div className="animate-pulse">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-xl bg-orange-200" />
                  <div className="h-6 w-16 rounded-full bg-orange-200" />
                </div>
                <div className="mt-6 h-5 w-28 rounded-full bg-orange-200" />
                <div className="mt-3 h-10 w-36 rounded-2xl bg-orange-200" />
                <div className="mt-3 h-4 w-full max-w-[12rem] rounded-full bg-orange-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <article className="flex h-full flex-col rounded-3xl border border-orange-200 bg-linear-to-br from-orange-50 via-white to-orange-50/70 p-4 dark:border-orange-800 dark:from-orange-950/30 dark:via-neutral-900 dark:to-orange-950/20 md:p-5">
          <div className="animate-pulse">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="h-3 w-28 rounded-full bg-orange-200" />
                <div className="mt-3 h-7 w-44 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-10 w-10 rounded-2xl bg-orange-200" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`laporan-category-skeleton-${index}`}
                  className="rounded-2xl border border-orange-200 bg-white/90 p-4 dark:border-orange-900/60 dark:bg-neutral-900/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-7 w-18 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                  <div className="mt-4 h-4 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-2 h-4 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              ))}
            </div>

            <div className="mt-4 h-12 rounded-2xl bg-white/80 dark:bg-neutral-900/60" />
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-orange-200 bg-white/95 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 md:p-5">
        <div className="animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`laporan-card-skeleton-${index}`}
                className="overflow-hidden rounded-2xl border border-orange-100 bg-white/95 shadow-sm dark:border-orange-900 dark:bg-neutral-900/90"
              >
                <div className="border-b border-orange-100 bg-orange-50/80 px-5 py-3.5 dark:border-orange-900 dark:bg-orange-950/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-orange-200" />
                      <div>
                        <div className="h-5 w-36 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                        <div className="mt-2 h-4 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="ml-auto h-6 w-18 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                      <div className="ml-auto h-4 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="h-4 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-3 h-4 w-5/6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-3 h-4 w-2/3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
