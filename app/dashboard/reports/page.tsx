"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, BarChart3, PieChart } from "lucide-react"

interface EmotionRecord {
  timestamp: string
  emotion: string
  probability: number
}

export default function ReportsPage() {
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([])

  useEffect(() => {
    // Load emotion history from localStorage
    const history = JSON.parse(localStorage.getItem("emotionHistory") || "[]")
    setEmotionHistory(history)
  }, [])

  // Calculate emotion statistics
  const calculateStats = () => {
    if (emotionHistory.length === 0) return { dominant: "No data", counts: {} }

    const counts: Record<string, number> = {}

    emotionHistory.forEach((record) => {
      counts[record.emotion] = (counts[record.emotion] || 0) + 1
    })

    // Find dominant emotion
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // Get emotion color
  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case "happy":
        return "bg-green-500"
      case "sad":
        return "bg-blue-500"
      case "angry":
        return "bg-red-500"
      case "fearful":
        return "bg-purple-500"
      case "disgusted":
        return "bg-yellow-500"
      case "surprised":
        return "bg-pink-500"
      case "neutral":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Generate mock chart data
  const generateChartData = () => {
    const emotions = ["happy", "sad", "angry", "fearful", "disgusted", "surprised", "neutral"]

    return (
      <div className="h-[300px] flex items-end justify-around gap-2 pt-10 pb-4">
        {emotions.map((emotion) => {
          const count = stats.counts[emotion] || 0
          const percentage = emotionHistory.length > 0 ? Math.round((count / emotionHistory.length) * 100) : 0
          const height = `${Math.max(percentage, 5)}%`

          return (
            <div key={emotion} className="flex flex-col items-center gap-2">
              <div className="text-xs font-medium">{percentage}%</div>
              <div className={`w-12 ${getEmotionColor(emotion)} rounded-t-md`} style={{ height }}></div>
              <div className="text-xs capitalize">{emotion}</div>
            </div>
          )
        })}
      </div>
    )
  }

  // Generate mock pie chart
  const generatePieChart = () => {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 flex items-center justify-center">
            <PieChart className="w-full h-full text-muted-foreground" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium">Dominant</div>
              <div className="text-xl font-bold capitalize">{stats.dominant}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Export report as CSV
  const exportReport = () => {
    if (emotionHistory.length === 0) return

    // Create CSV content
    let csvContent = "Timestamp,Emotion,Probability\n"

    emotionHistory.forEach((record) => {
      csvContent += `${record.timestamp},${record.emotion},${record.probability}\n`
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.setAttribute("href", url)
    link.setAttribute("download", `emotion-report-${new Date().toISOString()}.csv`)
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">SITOR Emotion Reports</h1>
          <p className="text-muted-foreground">View and analyze your emotion detection history</p>
        </div>
        <Button onClick={exportReport} disabled={emotionHistory.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Sessions</CardTitle>
            <CardDescription>Number of detection sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{emotionHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Dominant Emotion</CardTitle>
            <CardDescription>Most frequently detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getEmotionColor(stats.dominant)}`} />
              <span className="text-2xl font-bold capitalize">{stats.dominant}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Last Detection</CardTitle>
            <CardDescription>Most recent session</CardDescription>
          </CardHeader>
          <CardContent>
            {emotionHistory.length > 0 ? (
              <div>
                <div className="text-xl font-bold capitalize">{emotionHistory[emotionHistory.length - 1].emotion}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(emotionHistory[emotionHistory.length - 1].timestamp)}
                </div>
              </div>
            ) : (
              <div className="text-xl font-bold">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Select Date
            </Button>
          </div>
        </div>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Emotion Distribution</CardTitle>
              <CardDescription>Breakdown of emotions detected today</CardDescription>
            </CardHeader>
            <CardContent>
              {emotionHistory.length > 0 ? (
                <div className="space-y-8">
                  {generateChartData()}
                  {generatePieChart()}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No Data Available</h3>
                  <p className="text-sm text-muted-foreground mt-2">Start detecting emotions to generate reports</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Emotion Distribution</CardTitle>
              <CardDescription>Breakdown of emotions detected this week</CardDescription>
            </CardHeader>
            <CardContent>
              {emotionHistory.length > 0 ? (
                <div className="space-y-8">
                  {generateChartData()}
                  {generatePieChart()}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No Data Available</h3>
                  <p className="text-sm text-muted-foreground mt-2">Start detecting emotions to generate reports</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Emotion Distribution</CardTitle>
              <CardDescription>Breakdown of emotions detected this month</CardDescription>
            </CardHeader>
            <CardContent>
              {emotionHistory.length > 0 ? (
                <div className="space-y-8">
                  {generateChartData()}
                  {generatePieChart()}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No Data Available</h3>
                  <p className="text-sm text-muted-foreground mt-2">Start detecting emotions to generate reports</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Detection History</CardTitle>
          <CardDescription>Recent emotion detection sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {emotionHistory.length > 0 ? (
            <div className="space-y-4">
              {[...emotionHistory]
                .reverse()
                .slice(0, 10)
                .map((record, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(record.emotion)}`} />
                    <div className="flex-1">
                      <p className="font-medium capitalize">{record.emotion}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(record.timestamp)}</p>
                    </div>
                    <div className="text-sm font-medium">{Math.round(record.probability * 100)}%</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No detection history available</p>
              <p className="text-sm mt-2">Start detecting emotions to build your history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
