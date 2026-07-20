import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  full_name: string
  company_name: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    try {
      const res = await api.get<User>("/auth/me")
      setUser(res.data)
    } catch {
      setUser(null)
      localStorage.removeItem("archpilot_token")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("archpilot_token")
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const form = new URLSearchParams()
    form.set("username", email)
    form.set("password", password)
    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    localStorage.setItem("archpilot_token", res.data.access_token)
    await fetchMe()
  }

  const signup = async (email: string, password: string, fullName: string, companyName?: string) => {
    await api.post("/auth/signup", {
      email,
      password,
      full_name: fullName,
      company_name: companyName || null,
    })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem("archpilot_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}