"use client"

import { useEffect, useState } from "react"
import { BarChart3, SmilePlus, Clock, Users, MessageCircle } from "lucide-react"
import Link from "next/link"
import { EmotionChat } from "@/components/emotion-chat"
import { getDashboardSummary } from "@/service/api"
import { StatCard } from "@/components/dashboard/StatCard"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { EmotionTrendLineChart } from "@/components/dashboard/EmotionTrendLineChart"
import { useUserGroups } from "./groups/useUserGroups"

export default function DashboardPage() {
  const [userName, setUserName] = useState("")
  const [summary, setSummary] = useState<any>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [error, setError] = useState("")
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const { name } = JSON.parse(userData)
      setUserName(name)
    }
    async function fetchSummary() {
      try {
        const res = await getDashboardSummary()
        setSummary(res.data.summary)
      } catch (err: any) {
        setError("Failed to fetch dashboard data")
      }
    }
    fetchSummary()
  }, [])

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await import("@/service/api").then(m => m.getGroups())
        setGroups(res.data.groups || [])
      } catch {
        setGroups([])
      }
    }
    fetchGroups()
  }, [])

  const userId = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}').id : null;
  const userGroups = useUserGroups(userId, groups);

  function formatDate(dateStr: string) {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    // Format: Senin, 19 Juni 2025
    const hari = d.toLocaleDateString("id-ID", { weekday: "long" })
    const tanggal = d.getDate()
    const bulan = d.toLocaleDateString("id-ID", { month: "long" })
    const tahun = d.getFullYear()
    return `${hari}, ${tanggal} ${bulan} ${tahun}`
  }
  function cap(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "-"
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Detections" icon={<SmilePlus className="h-4 w-4 text-muted-foreground" />} value={summary ? summary.total : "-"} />
        <StatCard title="Average Mood" icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} value={summary ? cap(summary.averageEmotion?.dominant) : "-"} />
        <StatCard title="Last Detection" icon={<Clock className="h-4 w-4 text-muted-foreground" />} value={summary && summary.lastDetection ? formatDate(summary.lastDetection.timestamp) : "-"} description={summary && summary.lastDetection ? `Terdeteksi: ${formatDate(summary.lastDetection.timestamp)} - ${Object.entries(summary.lastDetection.emotions).reduce((a, [k, v]) => (v as number) > (summary.lastDetection.emotions[a] as number || 0) ? k : a, "neutral")}` : undefined} />
        <StatCard title="Total Grup Dimasuki" icon={<Users className="h-4 w-4 text-muted-foreground" />} value={userGroups.length} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="bg-muted rounded-md h-[240px] flex flex-col items-center justify-center">
            {summary && summary.recent && summary.recent.length > 0 ? (
              <EmotionTrendLineChart recent={summary.recent} />
            ) : (
              <p className="text-muted-foreground">Emotion trend chart will appear here</p>
            )}
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-card rounded-md p-4 h-full">
            <h3 className="font-semibold mb-2">Recent Activities</h3>
            <RecentActivity activities={summary?.recent || []} />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          {isChatOpen && (
            <EmotionChat
              currentEmotion={summary?.lastDetection ? Object.entries(summary.lastDetection.emotions).reduce((a, [k, v]) => (v as number) > (summary.lastDetection.emotions[a] as number || 0) ? k : a, "neutral") : ""
              }
              emotionHistory={summary?.recent?.map((r: any) => r.dominant) || []}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </div>
      </div>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsChatOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow bg-primary text-white flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}
