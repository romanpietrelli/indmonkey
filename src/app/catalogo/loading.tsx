export default function LoadingCatalogo() {
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      <div className="animate-pulse">
        <div className="h-24 w-64 bg-zinc-900 mb-12 rounded opacity-20" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[3/4] bg-zinc-900 rounded opacity-20" />
              <div className="h-4 w-3/4 bg-zinc-900 rounded opacity-20" />
              <div className="h-4 w-1/4 bg-zinc-900 rounded opacity-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
