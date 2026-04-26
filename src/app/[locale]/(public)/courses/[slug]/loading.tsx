export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-4">
        <div className="flex gap-2">
           <div className="h-6 w-20 rounded-full bg-muted" />
           <div className="h-6 w-24 rounded-full bg-muted/60" />
        </div>
        <div className="h-12 w-2/3 rounded-2xl bg-muted" />
        <div className="h-6 w-1/2 rounded-xl bg-muted/60" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-12">
          <div className="aspect-video rounded-3xl bg-muted/40 border" />
          <div className="space-y-4 rounded-3xl border p-8">
             <div className="h-8 w-48 rounded-xl bg-muted" />
             <div className="space-y-2">
                <div className="h-4 w-full rounded-lg bg-muted/60" />
                <div className="h-4 w-full rounded-lg bg-muted/60" />
                <div className="h-4 w-3/4 rounded-lg bg-muted/60" />
             </div>
          </div>
        </div>

        <aside className="space-y-6">
           <div className="h-64 rounded-3xl border bg-card/50 p-6" />
        </aside>
      </div>
    </div>
  );
}
