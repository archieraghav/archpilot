import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function About() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-4xl font-semibold">Why ArchPilot exists</h1>
        <p className="mt-6 text-graphite">
          Most business dashboards wait for you to ask the right question.
          ArchPilot was built on the opposite premise: your data should tell
          you what matters before you know to look for it.
        </p>
        <p className="mt-4 text-graphite">
          We combine natural language querying with a proactive analysis
          engine that reads your uploaded datasets the way an analyst would —
          checking for trends, outliers, and risk, and reporting back without
          being asked.
        </p>
        <p className="mt-4 text-graphite">
          ArchPilot is an independent project built to demonstrate what a
          modern, AI-native BI tool can look like on entirely free
          infrastructure.
        </p>
      </section>
      <Footer />
    </div>
  )
}