import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success("Welcome back")
      navigate("/dashboard")
    } catch {
      toast.error("Incorrect email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper font-body text-ink dark:bg-ink dark:text-paper">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Log in to ArchPilot</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-50 dark:bg-blueprint"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-graphite">
          No account? <Link to="/signup" className="text-blueprint">Sign up</Link>
        </p>
      </div>
    </div>
  )
}