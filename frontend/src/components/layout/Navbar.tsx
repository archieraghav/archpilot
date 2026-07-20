import { Link } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/theme/ThemeProvider"

export function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur dark:bg-ink/80 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Arch<span className="text-blueprint">Pilot</span>
        </Link>

        <nav className="hidden items-center gap-8 font-body text-sm text-graphite md:flex">
          <Link to="/pricing" className="hover:text-ink dark:hover:text-paper">Pricing</Link>
          <Link to="/about" className="hover:text-ink dark:hover:text-paper">About</Link>
          <Link to="/contact" className="hover:text-ink dark:hover:text-paper">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-md border border-line p-2 text-graphite hover:text-ink dark:border-white/10 dark:hover:text-paper"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <Link
            to="/signup"
            className="rounded-md bg-ink px-4 py-2 font-body text-sm font-medium text-paper hover:bg-ink/90 dark:bg-blueprint dark:hover:bg-blueprint/90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}