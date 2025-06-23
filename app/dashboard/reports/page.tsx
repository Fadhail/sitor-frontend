"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, BarChart3 } from "lucide-react"
import { getUserDetections, getDashboardSummary } from "@/service/api"
import { ReportStatCards } from "@/components/reports/ReportStatCards"
import { EmotionBarChart } from "@/components/reports/EmotionBarChart"
import { EmotionPieChart } from "@/components/reports/EmotionPieChart"
import { DetectionHistoryList } from "@/components/reports/DetectionHistoryList"
import { getEmotionColor, formatDate } from "@/lib/utils"

interface EmotionRecord {
  timestamp: string
  emotion: string
  probability: number
}

export default function ReportsPage() {
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDetections() {
      try {
        // Ambil data summary dari backend (sudah berisi deteksi user)
        const res = await getDashboardSummary()
        const summary = res.data.summary
        // Ambil data recent (deteksi terakhir) dan konversi ke format yang dibutuhkan komponen
        const data = Array.isArray(summary.recent) ? summary.recent : []
        setEmotionHistory(
          data.map((d: any) => ({
            timestamp: d.timestamp,
            emotion: d.dominant,
            probability: d.probability ?? 1,
          }))
        )
      } catch (err: any) {
        setError("Gagal mengambil riwayat deteksi")
      }
    }
    fetchDetections()
  }, [])

  // Calculate emotion statistics
  const calculateStats = () => {
    if (emotionHistory.length === 0) return { dominant: "Tidak Ada Data", counts: {} }
    const counts: Record<string, number> = {}
    emotionHistory.forEach((record) => {
      counts[record.emotion] = (counts[record.emotion] || 0) + 1
    })
    let dominant = "neutral"
    let maxCount = 0
    Object.entries(counts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominant = emotion
      }
    })
    return { dominant, counts }
  }
  const stats = calculateStats()

  // Export report as CSV
  const exportReport = () => {
    if (emotionHistory.length === 0) return
    let csvContent = "Timestamp,Emosi,Probabilitas\n"
    emotionHistory.forEach((record) => {
      csvContent += `${record.timestamp},${record.emotion},${record.probability}\n`
    })
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `emotion-report-${new Date().toISOString()}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Emosi</h1>
          <p className="text-muted-foreground">Lihat dan analisis riwayat deteksi emosi anda</p>
        </div>
        <Button onClick={exportReport} disabled={emotionHistory.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <ReportStatCards emotionHistory={emotionHistory} dominant={stats.dominant} />
      <Tabs defaultValue="daily" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="daily">Harian</TabsTrigger>
            <TabsTrigger value="weekly">Mingguan</TabsTrigger>
            <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Pilih Tanggal
            </Button>
          </div>
        </div>
        <TabsContent value="daily" className="mt-4">
          <div className="space-y-8">
            {emotionHistory.length > 0 ? (
              <>
                <EmotionBarChart emotionHistory={emotionHistory} counts={stats.counts} />
                <EmotionPieChart dominant={stats.dominant} />
              </>
            ) : (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada data tersedia</h3>
                <p className="text-sm text-muted-foreground mt-2">Mulai mendeteksi emosi untuk membuat laporan</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <div className="space-y-8">
            {emotionHistory.length > 0 ? (
              <>
                <EmotionBarChart emotionHistory={emotionHistory} counts={stats.counts} />
                <EmotionPieChart dominant={stats.dominant} />
              </>
            ) : (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada data tersedia</h3>
                <p className="text-sm text-muted-foreground mt-2">Mulai mendeteksi emosi untuk membuat laporan</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <div className="space-y-8">
            {emotionHistory.length > 0 ? (
              <>
                <EmotionBarChart emotionHistory={emotionHistory} counts={stats.counts} />
                <EmotionPieChart dominant={stats.dominant} />
              </>
            ) : (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Tidak ada data tersedia</h3>
                <p className="text-sm text-muted-foreground mt-2">Mulai mendeteksi emosi untuk membuat laporan</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <div>
        <h2 className="text-xl font-bold mb-2">Detection History</h2>
        <DetectionHistoryList emotionHistory={emotionHistory} />
      </div>
    </div>
  )
}
