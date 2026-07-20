import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <Navbar />
      <section className="mx-auto max-w-xl px-6 py-20">
        <h1 className="font-display text-4xl font-semibold">Get in touch</h1>
        <p className="mt-3 text-graphite">Questions, feedback, or partnership ideas — send them over.</p>

        {submitted ? (
          <div className="mt-8 rounded-md border border-blueprint/30 bg-blueprint/5 p-4 text-sm">
            Message received. We'll get back to you soon.
          </div>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input required className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input required type="email" className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <textarea required rows={5} className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10" />
            </div>
            <button type="submit" className="rounded-md bg-ink px-6 py-2.5 text-sm font-medium text-paper dark:bg-blueprint">
              Send message
            </button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  )
}