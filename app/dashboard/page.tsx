"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, SmilePlus, Clock, Users, MessageCircle } from "lucide-react"
import Link from "next/link"
import { EmotionChat } from "@/components/emotion-chat"

export default function DashboardPage() {
  const [userName, setUserName] = useState("")
  const [currentEmotion, setCurrentEmotion] = useState<string>("")
  const [emotionHistory, setEmotionHistory] = useState<string[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const { name } = JSON.parse(userData)
      setUserName(name)
    }
  }, [])

  useEffect(() => {
    // Load recent emotion data
    const history = JSON.parse(localStorage.getItem("emotionHistory") || "[]")
    if (history.length > 0) {
      // Specify the type of record for type safety
      type EmotionRecord = { emotion: string }
      const recent = history.slice(-10).map((record: EmotionRecord) => record.emotion)
      setEmotionHistory(recent)
      setCurrentEmotion(history[history.length - 1]?.emotion || "")
    }

    // Listen for emotion updates from detection page
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentEmotion" && e.newValue) {
        setCurrentEmotion(e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <SmilePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Happy</div>
            <p className="text-xs text-muted-foreground">Consistent for 3 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Detection</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 hours ago</div>
            <p className="text-xs text-muted-foreground">Detected: Happy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Welcome back, {userName || "User"}!</CardTitle>
            <CardDescription>Here&apos;s a summary of your emotion detection activities</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center bg-muted rounded-md">
              <p className="text-muted-foreground">Emotion trend chart will appear here</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest emotion detection sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <SmilePlus className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Emotion Detection Session</p>
                  <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
                </div>
                <div className="ml-auto font-medium">Happy</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <SmilePlus className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Emotion Detection Session</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 9:15 AM</p>
                </div>
                <div className="ml-auto font-medium">Neutral</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <SmilePlus className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Emotion Detection Session</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 4:45 PM</p>
                </div>
                <div className="ml-auto font-medium">Surprised</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex justify-center">
            <Link href="/dashboard/detect">
              <Button size="lg" className="gap-2">
                <SmilePlus className="h-5 w-5" />
                Start New Detection
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          {isChatOpen && (
            <EmotionChat
              currentEmotion={currentEmotion}
              emotionHistory={emotionHistory}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
