export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center gap-12 px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Chill <span className="text-indigo-500">&amp;</span> Flow
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Guided yoga flows for every level. Build a daily practice, track your
          progress, and find your calm — all in one place.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/flows"
            className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Start Flowing
          </a>
          <a
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 px-8 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}
