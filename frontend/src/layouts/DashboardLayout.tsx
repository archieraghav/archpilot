import { Link, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Database, MessageSquare, Sparkles, FileText, Settings, LogOut, UserCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { NotificationCenter } from "@/components/NotificationCenter"
import { DashboardFooter } from "@/components/layout/DashboardFooter"

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

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <aside className="flex w-60 flex-col border-r border-line dark:border-white/10">
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="font-display text-lg font-semibold">
            Arch<span className="text-blueprint">Pilot</span>
          </Link>
          <NotificationCenter />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-graphite hover:bg-black/5 hover:text-ink dark:hover:bg-white/5 dark:hover:text-paper"
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-3 dark:border-white/10">
          <div className="px-2 py-1 font-mono text-xs text-graphite">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-graphite hover:bg-black/5 hover:text-ink dark:hover:bg-white/5 dark:hover:text-paper"
          >
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex min-h-screen flex-1 flex-col overflow-y-auto">
        <div className="flex-1">
          <Outlet />
        </div>
      <DashboardFooter />
      </main>
    </div>
  )
}