import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

export default function Profile() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [companyName, setCompanyName] = useState(user?.company_name || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch("/auth/me", { full_name: fullName, company_name: companyName })
      toast.success("Profile updated")
    } catch {
      toast.error("Could not update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-graphite">{user?.email}</p>

      <form onSubmit={handleSave} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Company</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-50 dark:bg-blueprint"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  )
}