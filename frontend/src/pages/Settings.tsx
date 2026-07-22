import { useTheme } from "@/theme/ThemeProvider"
import { useAuth } from "@/context/AuthContext"

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <div className="mt-8 max-w-md space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-line p-4 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Appearance</p>
            <p className="font-mono text-xs text-graphite">Currently using {theme} mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-md border border-line px-3 py-1.5 text-sm dark:border-white/10"
          >
            Switch to {theme === "light" ? "dark" : "light"}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-line p-4 dark:border-white/10">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="font-mono text-xs text-graphite">End your current session</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-red-500/30 px-3 py-1.5 text-sm text-red-500"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}