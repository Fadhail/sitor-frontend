"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, Home, LogOut, Menu, SmilePlus, User, Users2Icon, X } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; photoUrl?: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)

    if (loggedIn) {
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!isLoggedIn) {
    return null // Don't render anything while checking auth
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop (fixed) */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:bg-background z-40">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold">SITOR</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-4 py-2">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Dashboard</h2>
            <div className="space-y-1">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/groups">
                <Button variant="ghost" className="w-full justify-start">
                  <Users2Icon className="mr-2 h-4 w-4" />
                  Grup
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
              {/* Profile menu removed */}
            </div>
          </div>
        </nav>
        <div className="mt-auto border-t p-4">
          <Link href="/dashboard/profile" className="block">
            <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent transition">
              <Avatar>
                <AvatarImage src={user && 'photoUrl' in user ? user.photoUrl : undefined} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name ? user.name[0] : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </Link>
          <Button variant="outline" className="mt-2 w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile header and menu */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold">SITOR</span>
          </Link>
        </header>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background shadow-lg">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <span className="text-xl font-bold">SITOR</span>
                </Link>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <div className="px-4 py-2">
                  <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Dashboard</h2>
                  <div className="space-y-1">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Button>
                    </Link>
                    <Link href="/dashboard/groups" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Users2Icon className="mr-2 h-4 w-4" />
                        Groups
                      </Button>
                    </Link>
                    <Link href="/dashboard/reports" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Reports
                      </Button>
                    </Link>
                    {/* Profile menu removed */}
                  </div>
                </div>
              </nav>
              <div className="mt-auto border-t p-4">
                <Link href="/dashboard/profile" className="block w-full">
                  <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent transition">
                    <Avatar>
                      <AvatarImage src={user && 'photoUrl' in user ? user.photoUrl : undefined} alt={user?.name || "User"} />
                      <AvatarFallback>{user?.name ? user.name[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </Link>
                <Button variant="outline" className="mt-2 w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content, sidebar fixed */}
        <main className="relative flex-1 p-4 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
