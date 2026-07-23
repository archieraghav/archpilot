import { Link, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Database, MessageSquare, Sparkles, FileText, Settings, LogOut, UserCircle , Menu, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { NotificationCenter } from "@/components/NotificationCenter"
import { DashboardFooter } from "@/components/layout/DashboardFooter"
import { useState } from "react"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/datasets", icon: Database, label: "Datasets" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/copilot", icon: Sparkles, label: "Copilot" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/profile", icon: UserCircle, label: "Profile" },
  
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-md border border-line bg-paper p-2 dark:border-white/10 dark:bg-ink md:hidden"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-paper transition-transform dark:border-white/10 dark:bg-ink md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="font-display text-lg font-semibold">
            Arch<span className="text-blueprint">Pilot</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button onClick={() => setMobileOpen(false)} className="md:hidden">
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-graphite hover:bg-black/5 hover:text-ink dark:hover:bg-white/5 dark:hover:text-paper"
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-3 dark:border-white/10">
          <div className="truncate px-2 py-1 font-mono text-xs text-graphite">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-graphite hover:bg-black/5 hover:text-ink dark:hover:bg-white/5 dark:hover:text-paper"
          >
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col overflow-y-auto pt-16 md:pt-0">
        <div className="flex-1">
          <Outlet />
        </div>
        <DashboardFooter />
      </main>
    </div>
  )
}