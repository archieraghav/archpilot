import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-line py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 font-body text-sm text-graphite md:flex-row">
        <span>© 2026 ArchPilot. Built for businesses who read their own data.</span>
        <div className="flex gap-6">
          <Link to="/about" className="hover:text-ink dark:hover:text-paper">About</Link>
          <Link to="/pricing" className="hover:text-ink dark:hover:text-paper">Pricing</Link>
          <Link to="/contact" className="hover:text-ink dark:hover:text-paper">Contact</Link>
        </div>
      </div>
    </footer>
  )
}