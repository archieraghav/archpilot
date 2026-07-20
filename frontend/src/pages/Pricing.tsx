import { Check } from "lucide-react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "For testing ArchPilot on real data.",
    features: ["1 dataset", "50 AI queries/mo", "Basic dashboard", "Community support"],
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    description: "For small businesses making weekly decisions.",
    features: ["Unlimited datasets", "2,000 AI queries/mo", "Business Copilot insights", "Forecasting", "Email support"],
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$149",
    period: "/mo",
    description: "For teams running board-level reporting.",
    features: ["Everything in Growth", "Unlimited AI queries", "Executive report exports", "Priority support"],
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold">Simple, transparent pricing</h1>
          <p className="mt-3 text-graphite">This is a demo pricing page — no payment is processed.</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border p-8 ${
                tier.highlighted
                  ? "border-blueprint shadow-lg shadow-blueprint/10"
                  : "border-line dark:border-white/10"
              }`}
            >
              <h3 className="font-display text-lg font-semibold">{tier.name}</h3>
              <p className="mt-2 text-sm text-graphite">{tier.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold">{tier.price}</span>
                <span className="font-mono text-sm text-graphite">{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-blueprint" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-8 block rounded-md px-4 py-2 text-center text-sm font-medium ${
                  tier.highlighted
                    ? "bg-blueprint text-white hover:bg-blueprint/90"
                    : "border border-line hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                }`}
              >
                Choose {tier.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  )
}