import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/theme/ThemeProvider"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import Landing from "@/pages/Landing"
import Pricing from "@/pages/Pricing"
import About from "@/pages/About"
import Contact from "@/pages/Contact"
import NotFound from "@/pages/NotFound"
import Login from "@/pages/auth/Login"
import Signup from "@/pages/auth/Signup"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster richColors position="top-right" />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<div className="p-8">Dashboard coming Day 18</div>} />
                <Route path="/datasets" element={<div className="p-8">Datasets coming Day 9</div>} />
                <Route path="/chat" element={<div className="p-8">Chat coming Day 14</div>} />
                <Route path="/copilot" element={<div className="p-8">Copilot coming Day 16</div>} />
                <Route path="/reports" element={<div className="p-8">Reports coming Day 19</div>} />
                <Route path="/settings" element={<div className="p-8">Settings coming Day 20</div>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App