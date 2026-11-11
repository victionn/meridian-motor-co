"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x py-32 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="mt-3 font-display text-4xl">Something went wrong.</h1>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
