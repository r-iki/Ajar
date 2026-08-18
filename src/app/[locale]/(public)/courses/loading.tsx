export default function Loading() {
  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-2xl bg-muted" />
        <div className="h-6 w-96 animate-pulse rounded-xl bg-muted/60" />
      </header>

      <div className="flex gap-2">
         {[1,2,3,4].map(i => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-muted/40" />
         ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-[2.5rem] border bg-card p-0 transition-all">
            <div className="aspect-video w-full animate-pulse bg-muted" />
            <div className="flex flex-1 flex-col p-8 space-y-4">
               <div className="h-4 w-20 animate-pulse rounded-lg bg-muted/60" />
               <div className="space-y-2">
                  <div className="h-6 w-full animate-pulse rounded-xl bg-muted" />
                  <div className="h-6 w-2/3 animate-pulse rounded-xl bg-muted/80" />
               </div>
               <div className="pt-4 border-t flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded-lg bg-muted/60" />
                  <div className="h-10 w-24 animate-pulse rounded-2xl bg-muted" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
