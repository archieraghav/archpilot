import { Link } from "react-router-dom"
import { ArrowRight, Upload, MessageSquare, TrendingUp } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

function BlueprintSchematic() {
  return (
    <svg viewBox="0 0 640 280" className="w-full max-w-2xl" fill="none">
      <rect x="0.5" y="0.5" width="639" height="279" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="4 4" />

      <rect x="30" y="110" width="120" height="60" rx="4" stroke="currentColor" strokeOpacity="0.4" />
      <text x="90" y="145" textAnchor="middle" className="fill-current font-mono text-[10px] opacity-60">RAW DATA</text>

      <line x1="150" y1="140" x2="255" y2="140" stroke="#3B82F6" strokeDasharray="3 3" strokeWidth="1.5" />
      <circle cx="255" cy="140" r="3" fill="#3B82F6" />

      <rect x="260" y="95" width="130" height="90" rx="6" stroke="#3B82F6" strokeWidth="1.5" />
      <text x="325" y="135" textAnchor="middle" className="fill-current font-mono text-[10px] font-medium">ARCHPILOT</text>
      <text x="325" y="150" textAnchor="middle" className="fill-current font-mono text-[9px] opacity-50">ENGINE</text>

      <line x1="390" y1="140" x2="495" y2="140" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth="1.5" />
      <circle cx="495" cy="140" r="3" fill="#F59E0B" />

      <rect x="500" y="70" width="110" height="42" rx="4" stroke="#F59E0B" strokeOpacity="0.6" />
      <text x="555" y="95" textAnchor="middle" className="fill-current font-mono text-[9px] opacity-70">+8% FORECAST</text>

      <rect x="500" y="120" width="110" height="42" rx="4" stroke="#F59E0B" strokeOpacity="0.6" />
      <text x="555" y="145" textAnchor="middle" className="fill-current font-mono text-[9px] opacity-70">ANOMALY: REGION B</text>

      <rect x="500" y="170" width="110" height="42" rx="4" stroke="#F59E0B" strokeOpacity="0.6" />
      <text x="555" y="195" textAnchor="middle" className="fill-current font-mono text-[9px] opacity-70">TOP 3 CUSTOMERS</text>

      <path d="M15 15 L15 30 M15 15 L30 15" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
      <path d="M625 265 L625 250 M625 265 L610 265" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <Navbar />

      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-20 text-center">
        <span className="mb-6 rounded-full border border-line px-3 py-1 font-accent text-sm tracking-wide text-graphite dark:border-white/10">
          AI Business Intelligence
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Your data has answers.
          <br />
          <span className="text-blueprint">ArchPilot finds them first.</span>
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg text-graphite">
          Upload a spreadsheet. Ask a question in plain English. Get a proactive
          copilot that surfaces the trends, risks, and forecasts you didn't know
          to look for.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-md bg-ink px-6 py-3 font-body text-sm font-medium text-paper hover:bg-ink/90 dark:bg-blueprint dark:hover:bg-blueprint/90"
          >
            Start free <ArrowRight size={16} />
          </Link>
          <Link
            to="/pricing"
            className="rounded-md border border-line px-6 py-3 font-body text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            View pricing
          </Link>
        </div>

        <div className="mt-16 text-blueprint">
          <BlueprintSchematic />
        </div>
      </section>

      <section className="border-t border-line py-20 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-semibold">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: Upload, step: "01", title: "Upload your dataset", body: "CSV or Excel. ArchPilot cleans it, profiles it, and scores its quality automatically." },
              { icon: MessageSquare, step: "02", title: "Ask it anything", body: "\"Which customers drive the most revenue?\" Get an answer grounded in your actual numbers." },
              { icon: TrendingUp, step: "03", title: "Get surfaced insights", body: "The Copilot proactively flags anomalies, risks, and opportunities before you ask." },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="rounded-lg border border-line p-6 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <Icon className="text-blueprint" size={22} />
                  <span className="font-mono text-xs text-graphite">{step}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-medium">{title}</h3>
                <p className="mt-2 font-body text-sm text-graphite">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}