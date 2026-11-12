export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        CSE706 · Group 7
      </p>
      <h1 className="text-4xl font-bold tracking-tight">Event Registration System</h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Find college and tech events, reserve your seat in one click, and get a
        confirmation email.
      </p>
    </main>
  );
}
