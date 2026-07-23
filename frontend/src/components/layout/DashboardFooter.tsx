import { Link2 } from "lucide-react"

export function DashboardFooter() {
  return (
    <footer className="border-t border-line px-6 py-4 dark:border-white/10">
      <div className="flex flex-col items-center justify-between gap-2 font-mono text-xs text-graphite sm:flex-row">
        <span>Built by Archie Singh Raghav — ArchPilot © 2026</span>
        <div className="flex gap-4">
          <a href="https://github.com/archieraghav" target="_blank" rel="noreferrer" className="hover:text-blueprint">
            <Link2 size={13} /> GitHub
          </a>
          <a href="https://linkedin.com/in/archie-singh-raghav-a40843272" target="_blank" rel="noreferrer" className="hover:text-blueprint">
            <Link2 size={13} /> LinkedIn
          </a>
          <a href="https://twitter.com/archieraghav02" target="_blank" rel="noreferrer" className="hover:text-blueprint">
            <Link2 size={13} /> Twitter
          </a>
        </div>
      </div>
    </footer>
  )
}