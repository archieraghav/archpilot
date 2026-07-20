import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <span className="font-mono text-sm text-graphite">ERROR 404</span>
      <h1 className="mt-2 font-display text-3xl font-semibold">This page isn't on the blueprint.</h1>
      <Link to="/" className="mt-6 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper dark:bg-blueprint">
        Back to home
      </Link>
    </div>
  )
}