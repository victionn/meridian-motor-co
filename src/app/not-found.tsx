import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl">Page not found.</h1>
      <p className="mt-4 text-muted">The page you&apos;re after doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
