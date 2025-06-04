import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="text-xl font-bold">SITOR</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px] items-center">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    SITOR (Emosi Detector)
                  </h1>
                  <p className="mx-auto lg:mx-0 max-w-[600px] text-muted-foreground md:text-xl">
                    Our advanced facial recognition technology analyzes expressions to identify emotions in real-time.
                    Perfect for research, customer experience analysis, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Link href="/register">
                    <Button className="w-full min-w-[200px]">Get Started</Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-xl border bg-muted lg:order-last">
                <div className="flex h-full items-center justify-center p-4">
                  <div className="relative w-full max-w-sm">
                    <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-purple-600 opacity-50 blur-xl"></div>
                    <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-blue-600 opacity-50 blur-xl"></div>
                    <div className="relative rounded-lg border bg-background p-4 shadow-lg">
                      <div className="space-y-2">
                        <div className="h-2 w-1/2 rounded bg-muted"></div>
                        <div className="h-12 rounded bg-muted"></div>
                        <div className="flex gap-2">
                          <div className="h-4 w-4 rounded-full bg-green-500"></div>
                          <div className="h-4 flex-1 rounded bg-muted"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                          <div className="h-4 flex-1 rounded bg-muted"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-4 w-4 rounded-full bg-red-500"></div>
                          <div className="h-4 flex-1 rounded bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers comprehensive emotion detection capabilities with powerful features
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z"></path>
                    <path d="M8 9h.01"></path>
                    <path d="M16 9h.01"></path>
                    <path d="M8 13a4 4 0 0 0 8 0"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Real-time Detection</h3>
                  <p className="text-muted-foreground">
                    Analyze emotions in real-time through your webcam with high accuracy and minimal latency.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Detailed Reports</h3>
                  <p className="text-muted-foreground">
                    Get comprehensive reports with emotion trends, statistics, and historical data analysis.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Secure Login</h3>
                  <p className="text-muted-foreground">
                    Keep your data safe with our secure authentication system and personalized user accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container mx-auto max-w-7xl flex flex-col gap-2 sm:flex-row items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SITOR (Emosi Detector). All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
