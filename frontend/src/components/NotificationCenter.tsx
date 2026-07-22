import { useState } from "react"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  { id: "1", title: "Analysis complete", description: "Business Copilot found 8 new insights", time: "2h ago", read: false },
  { id: "2", title: "Dataset uploaded", description: "business-sample.csv is ready to explore", time: "1d ago", read: true },
]

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-graphite hover:text-ink dark:hover:text-paper"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-signal" />
        )}
      </button>

      {open && (
        <div className="fixed left-4 top-16 z-50 w-80 rounded-lg border border-line bg-paper p-3 shadow-lg dark:border-white/10 dark:bg-ink md:left-64">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="font-body text-sm font-medium">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="font-mono text-[10px] text-blueprint">
                Mark all read
              </button>
            )}
          </div>
          <div className="space-y-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-md px-3 py-2 text-sm ${!n.read ? "bg-blueprint/5" : ""}`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="whitespace-normal break-words text-xs text-graphite">{n.description}</p>
                <p className="mt-1 font-mono text-[10px] text-graphite">{n.time}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center font-mono text-xs text-graphite">No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}