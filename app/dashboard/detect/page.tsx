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
  const [landmarksDrawn, setLandmarksDrawn] = useState(false)

  // Load face-api.js
  useEffect(() => {
    if (faceApiLoaded) {
      loadModels()
    }
  }, [faceApiLoaded])

  // Pastikan deteksi berjalan saat isDetecting berubah ke true
  useEffect(() => {
    if (isDetecting) {
      detectEmotions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetecting])

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
      setLoadingProgress(25)

      // Load SSD MobileNet as fallback
      try {
        await (faceapi as any).nets.ssdMobilenetv1.load("/models")
      } catch (ssdError) {
        console.warn('[DEBUG] SsdMobilenetv1 failed to load:', ssdError)
      }
      setLoadingProgress(40)
      await (faceapi as any).nets.faceLandmark68Net.load("/models")
      setLoadingProgress(70)
      await (faceapi as any).nets.faceRecognitionNet.load("/models")
      setLoadingProgress(85)
      await (faceapi as any).nets.faceExpressionNet.load("/models")
      setLoadingProgress(100)

      const landmarkModel = (faceapi as any).nets.faceLandmark68Net

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
        setIsDetecting(true) // Mulai deteksi otomatis
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
    // Bersihkan canvas dan landmark saat kamera di-stop
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    setLandmarksDrawn(false)
  }

  const detectEmotions = async () => {
    if (!isDetecting) return

    const faceapi = (window as FaceApiWindow).faceapi
    if (!faceapi || typeof faceapi !== 'object' || !videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Check if video is ready and has valid dimensions
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      // Retry after a short delay if video isn't ready
      if (isDetecting) {
        setTimeout(() => detectEmotions(), 100)
      }
      return
    }

    // PERBAIKAN: Set canvas dimensions berdasarkan display size video element
    const videoRect = video.getBoundingClientRect()
    const displaySize = { 
      width: video.offsetWidth || videoRect.width, 
      height: video.offsetHeight || videoRect.height 
    }
    
    // Set canvas size to match video display size
    canvas.width = displaySize.width
    canvas.height = displaySize.height
    canvas.style.width = `${displaySize.width}px`
    canvas.style.height = `${displaySize.height}px`

    // @ts-expect-error face-api.js is loaded globally from CDN
    faceapi.matchDimensions(canvas, displaySize)

    try {
      // Use single-chain detection for better compatibility
      const detections = await faceapi
        // @ts-expect-error face-api.js is loaded globally from CDN
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withFaceExpressions()

      // Get canvas context
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (detections.length > 0) {
        // Resize detections to match canvas dimensions
        // @ts-expect-error face-api.js is loaded globally from CDN
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // Force draw landmarks manually - this is the most reliable method
        if (resizedDetections[0] && resizedDetections[0].landmarks) {
          const landmarks = resizedDetections[0].landmarks

          // Manual landmark drawing - most reliable
          ctx.save()
          ctx.fillStyle = '#00FF00' // Bright green untuk visibility
          ctx.lineWidth = 1

          // Get landmark points with multiple fallbacks
          let points = null
          if (landmarks.positions) {
            points = landmarks.positions
          } else if (landmarks._positions) {
            points = landmarks._positions
          } else if (landmarks.points) {
            points = landmarks.points
          } else if (Array.isArray(landmarks)) {
            points = landmarks
          } else {
            // Try to extract from nested objects
            const keys = Object.keys(landmarks)
            for (const key of keys) {
              if (Array.isArray(landmarks[key])) {
                points = landmarks[key]
                break
              }
            }
          }

          if (points && Array.isArray(points) && points.length > 0) {
            // Draw all landmark points
            points.forEach((point: any) => {
              if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                // PERBAIKAN: Pastikan koordinat berada dalam batas canvas
                const x = Math.max(0, Math.min(point.x, canvas.width))
                const y = Math.max(0, Math.min(point.y, canvas.height))
                
                // Draw landmark point dengan ukuran yang lebih kecil dan konsisten
                ctx.beginPath()
                ctx.arc(x, y, 1.5, 0, 2 * Math.PI)
                ctx.fill()
              }
            })
            
            setLandmarksDrawn(true)
          } else {
            // Try alternative landmark drawing using face-api built-in method
            try {
              // @ts-expect-error face-api.js is loaded globally from CDN
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
              setLandmarksDrawn(true)
            } catch (drawError) {
              setLandmarksDrawn(false)
            }
          }

          ctx.restore()
        } else {
          setLandmarksDrawn(false)
        }

        // Process expressions
        const expressions = resizedDetections[0].expressions
        const results = Object.entries(expressions)
          .map(([expression, probability]) => ({
            expression,
            probability: Number(probability),
          }))
          .sort((a, b) => b.probability - a.probability)

        setDetectionResults(results)

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
      } else {
        setLandmarksDrawn(false)
      }

      // Continue detection loop
      if (isDetecting) {
        // Use setTimeout dengan delay yang lebih lama untuk mengurangi berkedip
        setTimeout(() => detectEmotions(), 150)
      }
    } catch (err) {
      console.error('[DEBUG] Error during detection:', err)
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
                    width="640"
                    height="480"
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => {
                    }}
                    onPlay={() => {
                    }}
                  />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
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
