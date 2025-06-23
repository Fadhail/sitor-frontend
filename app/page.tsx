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
                    SITOR adalah platform cerdas yang membantu pemimpin kelompok memantau emosi anggota secara realtime melalui deteksi wajah. Cocok untuk kerja tim, diskusi proyek, dan kegiatan kolaboratif. Didukung oleh SITOR Assistant, fitur AI yang memberikan rekomendasi berdasarkan emosi yang terdeteksi.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Link href="/register">
                    <Button className="w-full min-w-[200px]">Get Started</Button>
                  </Link>
                </div>
              </div>
                <div className="flex justify-center">
                  <img
                  src="/sitor.png"
                  alt="SITOR Hero Image"
                  className="max-w-xs h-auto rounded-lg shadow-lg hidden md:block"
                  style={{ width: "auto", height: "auto" }}
                  />
                </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Fitur Utama</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SITOR menawarkan berbagai fitur untuk meningkatkan pengalaman kerja tim Anda. Dengan teknologi deteksi wajah dan analisis emosi, SITOR memberikan wawasan yang mendalam tentang suasana hati anggota tim Anda.

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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Pemantauan Emosi Anggota Grup</h3>
                  <p className="text-muted-foreground">
                    Ketua kelompok dapat memantau ekspresi wajah dan emosi seluruh anggota secara real-time, membantu memahami suasana hati tim saat mengerjakan proyek bersama.
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
                    <rect x="3" y="4" width="18" height="12" rx="2"></rect>
                    <path d="M12 16v4"></path>
                    <path d="M8 20h8"></path>
                    <path d="M10 4V2"></path>
                    <path d="M14 4V2"></path>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">SITOR Assistant (AI Rekomendasi Emosi)</h3>
                  <p className="text-muted-foreground">
                    AI bawaan kami menganalisis emosi yang terdeteksi dan memberikan saran yang tepat untuk menjaga produktivitas dan suasana kerja tetap positif.
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
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M17 11v-1a4 4 0 1 0-8 0v1"></path>
                    <path d="M17 17v-1a4 4 0 1 0-8 0v1"></path>
                    <circle cx="17" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Peran Dinamis: Ketua & Anggota</h3>
                  <p className="text-muted-foreground">
                    SITOR mendukung struktur tim dengan dua peran utama — Ketua sebagai pemantau dan Anggota sebagai peserta deteksi. Ini memungkinkan pemantauan yang terarah dan pengalaman yang terorganisir.
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
