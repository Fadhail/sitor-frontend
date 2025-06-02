"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, Download, AlertTriangle, Loader2 } from "lucide-react"
import Script from "next/script"

interface Detection {
  expression: string
  probability: number
}

interface FaceApiWindow extends Window {
  faceapi?: unknown
}

export default function DetectPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionResults, setDetectionResults] = useState<Detection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [faceApiLoaded, setFaceApiLoaded] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)

  // Load face-api.js
  useEffect(() => {
    if (faceApiLoaded) {
      loadModels()
    }
  }, [faceApiLoaded])

  const loadModels = async () => {
    try {
      const faceapi = (window as FaceApiWindow).faceapi
      if (!faceapi || typeof faceapi !== 'object') {
        setError("Face API not loaded properly")
        return
      }

      setLoadingProgress(10)

      // Load models sequentially and update progress
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (faceapi as any).nets.tinyFaceDetector.load("/models")
      setLoadingProgress(40)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (faceapi as any).nets.faceLandmark68Net.load("/models")
      setLoadingProgress(60)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (faceapi as any).nets.faceRecognitionNet.load("/models")
      setLoadingProgress(80)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (faceapi as any).nets.faceExpressionNet.load("/models")
      setLoadingProgress(100)

      setIsModelLoaded(true)
    } catch (err) {
      console.error("Error loading models:", err)
      setError("Failed to load facial recognition models. Please refresh and try again.")
    }
  }

  const startVideo = async () => {
    setError(null)

    if (!isModelLoaded) {
      setError("Models are still loading. Please wait.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOn(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please ensure you've granted camera permissions.")
      setIsCameraOn(false)
    }
  }

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()

      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsCameraOn(false)
    setIsDetecting(false)
  }

  const startDetection = () => {
    if (!isModelLoaded) {
      setError("Models are still loading. Please wait.")
      return
    }

    if (!videoRef.current || !videoRef.current.srcObject) {
      startVideo()
    }

    setIsDetecting(true)
    detectEmotions()
  }

  const detectEmotions = async () => {
    if (!isDetecting) return

    const faceapi = (window as FaceApiWindow).faceapi
    if (!faceapi || typeof faceapi !== 'object' || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const width = video.videoWidth;
    const height = video.videoHeight;
    // Set canvas DOM attributes to match video size
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const __faceApiDimsObj: { width: number; height: number } = { width, height };
    // @ts-expect-error face-api.js is loaded globally from CDN
    faceapi.matchDimensions(canvas, __faceApiDimsObj)

    try {
      const detections = await faceapi
        // @ts-expect-error face-api.js is loaded globally from CDN
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      const ctx = canvas.getContext("2d")
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)

      // @ts-expect-error face-api.js is loaded globally from CDN
      const resizedDetections = faceapi.resizeResults(detections, __faceApiDimsObj)
      // @ts-expect-error face-api.js is loaded globally from CDN
      faceapi.draw.drawDetections(canvas, resizedDetections)
      // @ts-expect-error face-api.js is loaded globally from CDN
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      // @ts-expect-error face-api.js is loaded globally from CDN
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

      // Show dominant emotion as overlay text (if detected)
      if (resizedDetections.length > 0) {
        const expressions = resizedDetections[0].expressions
        const results = Object.entries(expressions)
          .map(([expression, probability]) => ({
            expression,
            probability: Number(probability),
          }))
          .sort((a, b) => b.probability - a.probability)
        setDetectionResults(results)

        // Overlay dominant emotion text
        if (ctx) {
          ctx.save()
          ctx.font = 'bold 24px Arial'
          ctx.fillStyle = 'rgba(0,0,0,0.7)'
          ctx.fillRect(10, 10, 260, 40)
          ctx.fillStyle = '#fff'
          ctx.fillText(`Dominant: ${results[0].expression} (${Math.round(results[0].probability * 100)}%)`, 20, 40)
          ctx.restore()
        }

        // Save detection to history
        const timestamp = new Date().toISOString()
        const dominantEmotion = results[0].expression
        const history = JSON.parse(localStorage.getItem("emotionHistory") || "[]")
        history.push({
          timestamp,
          emotion: dominantEmotion,
          probability: results[0].probability,
        })
        if (history.length > 50) {
          history.shift()
        }
        localStorage.setItem("emotionHistory", JSON.stringify(history))
      }

      if (isDetecting) {
        requestAnimationFrame(detectEmotions)
      }
    } catch (err) {
      console.error("Error during detection:", err)
      setError("An error occurred during emotion detection.")
      setIsDetecting(false)
    }
  }

  const captureScreenshot = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement("a")
    link.download = `emotion-detection-${new Date().toISOString()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

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
      default:
        return "bg-gray-500"
    }
  }

  // Update dashboard with current emotion
  useEffect(() => {
    if (detectionResults.length > 0) {
      const dominantEmotion = detectionResults[0].expression
      // Store current emotion for dashboard
      localStorage.setItem("currentEmotion", dominantEmotion)

      // Trigger storage event for dashboard to update
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "currentEmotion",
          newValue: dominantEmotion,
        }),
      )
    }
  }, [detectionResults])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Script
        src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
        onLoad={() => setFaceApiLoaded(true)}
        onError={() => setError("Failed to load face-api.js library")}
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SITOR Emotion Detection</CardTitle>
              <CardDescription>Use your webcam to detect facial expressions and emotions in real-time</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative w-full max-w-md">
                {!isModelLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">Loading models...</p>
                    <Progress value={loadingProgress} className="w-64 mt-2" />
                  </div>
                )}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onPlay={() => {
                      if (isDetecting) detectEmotions()
                    }}
                  />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                  {/* Fix: Only show overlay if camera is off and models are loaded */}
                  {!isCameraOn ? (
                    isModelLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click &quot;Start Camera&quot; to begin</p>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 flex-wrap">
              {!isCameraOn ? (
                <Button onClick={startVideo} disabled={!isModelLoaded}>
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopVideo} variant="outline">
                  Stop Camera
                </Button>
              )}

              {!isDetecting ? (
                <Button onClick={startDetection} disabled={!isModelLoaded || !isCameraOn}>
                  Start Detection
                </Button>
              ) : (
                <Button onClick={() => setIsDetecting(false)} variant="secondary">
                  Pause Detection
                </Button>
              )}

              <Button onClick={captureScreenshot} variant="outline" disabled={!isCameraOn}>
                <Download className="mr-2 h-4 w-4" />
                Save Screenshot
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
              <CardDescription>Real-time emotion probabilities</CardDescription>
            </CardHeader>
            <CardContent>
              {detectionResults.length > 0 ? (
                <div className="space-y-4">
                  {detectionResults.slice(0, 6).map((result) => (
                    <div key={result.expression} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{result.expression}</span>
                        <span>{Math.round(result.probability * 100)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${getEmotionColor(result.expression)}`}
                          style={{ width: `${result.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-4 border-t">
                    <p className="font-medium">Dominant Emotion</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getEmotionColor(detectionResults[0].expression)}`} />
                      <span className="text-xl font-bold capitalize">{detectionResults[0].expression}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No emotions detected yet</p>
                  <p className="text-sm mt-2">Start detection to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
