"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Camera, Download, Loader2 } from "lucide-react"
import { createDetection } from "@/service/detections"
import { updateCameraStatus } from "@/service/api"

interface Detection {
  expression: string
  probability: number
}

interface FaceApiWindow extends Window {
  faceapi?: unknown
}

export default function DetectPage() {
  // Ambil groupId dari URL (hanya satu deklarasi di awal komponen)
  const groupId = typeof window !== 'undefined' ? window.location.pathname.split("/").find((v, i, arr) => arr[i - 1] === "groups") || "default" : "default";

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionResults, setDetectionResults] = useState<Detection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [faceApiLoaded, setFaceApiLoaded] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [allDetections, setAllDetections] = useState<Detection[]>([])
  const [detectionHistory, setDetectionHistory] = useState<Detection[]>([])

  // State untuk modal notifikasi sesi berakhir
  const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
  // State untuk status sesi grup
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [cameraStatusError, setCameraStatusError] = useState<string | null>(null);

  // Inject face-api.js from CDN if not loaded
  useEffect(() => {
    // @ts-expect-error
    if (!window.faceapi) {
      if (!document.getElementById("faceapi-cdn")) {
        const script = document.createElement("script");
        script.id = "faceapi-cdn";
        script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
        script.async = true;
        script.onload = () => setFaceApiLoaded(true);
        script.onerror = () => setError("Gagal memuat library face-api.js. Cek koneksi internet atau CDN.");
        document.body.appendChild(script);
      }
    } else {
      setFaceApiLoaded(true)
    }
  }, [])

  // Load face-api.js
  useEffect(() => {
    if (faceApiLoaded) {
      loadModels()
    }
  }, [faceApiLoaded])

  // Pastikan deteksi berjalan saat isDetecting berubah ke true
  useEffect(() => {
    if (isDetecting) {
      detectEmotions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetecting]);

  // Update detectionHistory setiap kali detectionResults berubah
  useEffect(() => {
    if (isDetecting && detectionResults.length > 0) {
      setDetectionHistory((prev) => [...prev, ...detectionResults]);
    }
  }, [detectionResults, isDetecting]);

  // Aktifkan video dan deteksi saat user klik "Aktifkan Kamera"
  useEffect(() => {
    if (isCameraActive && isModelLoaded && !isCameraOn) {
      startVideo();
    }
    // Stop kamera jika user menonaktifkan
    if (!isCameraActive && isCameraOn) {
      stopVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive, isModelLoaded])

  // Reset detectionHistory saat groupId/sessionActive berubah (misal sesi baru dimulai)
  useEffect(() => {
    setDetectionHistory([]);
  }, [groupId, sessionActive]);

  // Ref untuk detectionHistory agar interval selalu dapat data terbaru
  const detectionHistoryRef = useRef<Detection[]>([]);
  useEffect(() => { detectionHistoryRef.current = detectionHistory; }, [detectionHistory]);

  // Kirim data deteksi emosi ke backend secara realtime setiap 1 detik
  useEffect(() => {
    if (!isDetecting || !isCameraOn || sessionActive !== true) return;
    let interval: NodeJS.Timeout | null = null;
    interval = setInterval(() => {
      const history = detectionHistoryRef.current;
      if (history.length > 0) {
        const emotionCounts: Record<string, number> = {
          neutral: 0, happy: 0, sad: 0, angry: 0, surprised: 0, disgusted: 0
        };
        history.forEach((d) => {
          if (emotionCounts[d.expression] !== undefined) {
            emotionCounts[d.expression] += 1;
          }
        });
        const total = history.length;
        const emotionPercents: Record<string, number> = {};
        Object.keys(emotionCounts).forEach((k) => {
          emotionPercents[k] = total > 0 ? Math.round((emotionCounts[k] / total) * 100) : 0;
        });
        createDetection({ groupId, emotions: emotionPercents }).catch(() => {});
        setDetectionHistory([]); // Reset setelah kirim
      }
    }, 1000);
    return () => { if (interval) clearInterval(interval); };
  }, [isDetecting, isCameraOn, sessionActive, groupId]);

  // Otomatis aktifkan kamera jika sessionActive berubah ke true (sesi baru dimulai)
  useEffect(() => {
    if (sessionActive === true && !isCameraActive) {
      setIsCameraActive(true);
    }
  }, [sessionActive]);

  // Kirim status kamera aktif ke backend saat pertama kali kamera dinyalakan
  useEffect(() => {
    if (isCameraActive && isCameraOn) {
      const groupId = window.location.pathname.split("/").find((v, i, arr) => arr[i - 1] === "groups") || "default";
      updateCameraStatus({ groupId, isActive: true }).catch(() => {});
    }
  }, [isCameraActive, isCameraOn]);

  // Kirim status kamera nonaktif ke backend saat kamera dimatikan
  useEffect(() => {
    if (!isCameraActive && !isCameraOn) {
      const groupId = window.location.pathname.split("/").find((v, i, arr) => arr[i - 1] === "groups") || "default";
      updateCameraStatus({ groupId, isActive: false }).catch(() => {});
    }
  }, [isCameraActive, isCameraOn]);

  // Handle perubahan status sesi grup dari backend
  useEffect(() => {
    if (showSessionEndedModal) return;
    let interval: NodeJS.Timeout;
    let notified = false;
    async function checkSession() {
      try {
        setCameraStatusError(null);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.xeroon.my.id";
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${backendUrl}/api/groups/${groupId}/camera-status`, { headers });
        if (res.status === 401) {
          setCameraStatusError('Akses tidak valid. Silakan login ulang.');
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (res.status === 404 || res.status === 410) {
          setSessionActive(false);
          setCameraStatusError('Sesi grup telah diakhiri oleh ketua. Semua user disconnect.');
          if (!notified) {
            notified = true;
            setIsCameraActive(false);
            stopVideo();
            setShowSessionEndedModal(true);
          }
        } else {
          setSessionActive(true);
          setCameraStatusError(null);
          const data = await res.json();
          if (Array.isArray(data.statuses) && data.statuses.length === 0 && !notified) {
            notified = true;
            setIsCameraActive(false);
            stopVideo();
            setShowSessionEndedModal(true);
          }
        }
      } catch (err) {
        setCameraStatusError('Gagal mengambil status kamera.');
      }
    }
    interval = setInterval(checkSession, 100);
    return () => {
      clearInterval(interval);
      setIsDetecting(false); // hentikan deteksi saat unmount
    };
  }, [showSessionEndedModal, groupId]);

  // Reset state notifikasi sesi berakhir dan error saat halaman dibuka atau groupId berubah
  useEffect(() => {
    setShowSessionEndedModal(false);
    setSessionActive(null);
    setCameraStatusError(null);
  }, [groupId]);

  const loadModels = async () => {
    try {
      const faceapi = (window as FaceApiWindow).faceapi
      if (!faceapi || typeof faceapi !== 'object') {
        setError("Face API not loaded properly")
        return
      }

      // Load models sequentially and update progress
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (faceapi as any).nets.tinyFaceDetector.load("/models")
      // Load SSD MobileNet as fallback
      try {
        await (faceapi as any).nets.ssdMobilenetv1.load("/models")
      } catch (ssdError) {
        console.warn('[DEBUG] SsdMobilenetv1 failed to load:', ssdError)
      }
      await (faceapi as any).nets.faceLandmark68Net.load("/models")
      await (faceapi as any).nets.faceRecognitionNet.load("/models")
      await (faceapi as any).nets.faceExpressionNet.load("/models")

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
        setIsDetecting(true)
        setCameraStatusError(null); // Reset error jika berhasil
        // Kirim status kamera aktif ke backend
        const groupId = window.location.pathname.split("/").find((v, i, arr) => arr[i - 1] === "groups") || "default"
        updateCameraStatus({ groupId, isActive: true }).catch(() => {})
      }
    } catch (e) {
      setCameraStatusError("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan dan tidak ada aplikasi lain yang menggunakan kamera.");
      setIsCameraOn(false);
      setIsDetecting(false);
    }
  }

  // Perbaiki: pastikan semua stream video benar-benar dimatikan (termasuk jika ada lebih dari satu track)
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      videoRef.current.srcObject = null;
    }
    // Juga hentikan semua stream aktif di browser (fallback, untuk browser yang bandel)
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
          if (device.kind === "videoinput") {
            // Tidak bisa stop device langsung, hanya bisa stop track dari stream
            // Pastikan tidak ada stream tersisa
          }
        });
      });
    }
    setIsCameraOn(false);
    setIsDetecting(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Kirim status kamera nonaktif ke backend
    updateCameraStatus({ groupId, isActive: false }).catch(() => {})

    // Kirim distribusi emosi terakhir ke backend
    const history = detectionHistoryRef.current;
    if (history.length > 0) {
      const emotionCounts: Record<string, number> = {
        neutral: 0, happy: 0, sad: 0, angry: 0, surprised: 0, disgusted: 0
      };
      history.forEach((d) => {
        if (emotionCounts[d.expression] !== undefined) {
          emotionCounts[d.expression] += 1;
        }
      });
      const total = history.length;
      const emotionPercents: Record<string, number> = {};
      Object.keys(emotionCounts).forEach((k) => {
        emotionPercents[k] = total > 0 ? Math.round((emotionCounts[k] / total) * 100) : 0;
      });
      createDetection({ groupId, emotions: emotionPercents }).catch(() => {});
      setDetectionHistory([]); // Reset setelah kirim
    }

    // Notifikasi jika sesi sudah diakhiri (otomatis)
    if (sessionActive === false) {
      setShowSessionEndedModal(true);
    }
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

        // Draw only landmark points (anti-flicker, hanya titik, tidak garis)
        if (resizedDetections[0] && resizedDetections[0].landmarks) {
          const landmarks = resizedDetections[0].landmarks
          let points = null
          if (landmarks.positions) {
            points = landmarks.positions
          } else if (landmarks._positions) {
            points = landmarks._positions
          } else if (landmarks.points) {
            points = landmarks.points
          }
          ctx.save()
          ctx.globalAlpha = 0.85
          // --- ANTI FLICKER: gambar landmark di atas frame video, JANGAN clearRect canvas (biarkan background tetap) ---
          if (points && Array.isArray(points)) {
            // Gambar titik landmark
            points.forEach((p) => {
              ctx.beginPath()
              ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI)
              ctx.fillStyle = '#00FF00'
              ctx.shadowColor = '#00FF00'
              ctx.shadowBlur = 4
              ctx.fill()
              ctx.shadowBlur = 0
            })
          }
          ctx.restore()
        }

        // Extract and store detection results
        const newDetections = (detections as unknown[]).map((det: unknown) => ({
          expression: (det as any).expressions.asSortedArray()[0]?.expression || "neutral",
          probability: (det as any).expressions.asSortedArray()[0]?.probability || 0
        }))

        setDetectionResults(newDetections)

        // Update all detections state
        setAllDetections(prev => [...prev, ...newDetections])
      } else {
        setDetectionResults([])
      }
    } catch (err) {
      console.error("Error during detection:", err)
    }

    // Retry detection after a short delay
    if (isDetecting) {
      setTimeout(() => detectEmotions(), 100)
    }
  }

  // Helper untuk rata-rata emosi
  function calculateAverageEmotion(detections: Detection[]) {
    if (!detections.length) return null;
    const counts: Record<string, number> = {};
    detections.forEach((d) => {
      counts[d.expression] = (counts[d.expression] || 0) + 1;
    });
    let max = 0;
    let expression = "neutral";
    Object.entries(counts).forEach(([emo, count]) => {
      if (count > max) {
        max = count;
        expression = emo;
      }
    });
    return { expression, count: max };
  }

  // Helper: Screenshot
  function captureScreenshot() {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `emotion-detection-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // Initial State: Kamera belum aktif
  if (!isCameraActive) {
    // Render modal sesi berakhir jika sessionActive === false atau showSessionEndedModal true
    if (sessionActive === false || showSessionEndedModal) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-xl w-full flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Sesi Telah Diakhiri</h2>
            <p className="text-gray-700 text-center">Sesi deteksi emosi pada grup ini telah diakhiri oleh ketua grup. Silakan hubungi ketua untuk memulai sesi baru.</p>
            <Button className="mt-4 px-6 py-2" onClick={() => window.location.href = '/dashboard'}>Kembali ke Dashboard</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl p-10 gap-6">
          <Camera className="w-24 h-24 text-gray-300 mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Deteksi Emosi Wajah</h1>
          <p className="text-gray-500 text-lg text-center mb-4">Aktifkan kamera untuk mulai analisis ekspresi wajah secara real-time.</p>
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-bold"
            onClick={() => setIsCameraActive(true)}
          >
            Aktifkan Kamera
          </Button>
        </div>
      </div>
    )
  }

  // Render modal sesi berakhir jika sessionActive === false atau showSessionEndedModal true
  if (sessionActive === false || showSessionEndedModal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-xl w-full flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Sesi Telah Diakhiri</h2>
          <p className="text-gray-700 text-center">Sesi deteksi emosi pada grup ini telah diakhiri oleh ketua grup. Silakan hubungi ketua untuk memulai sesi baru.</p>
          <Button className="mt-4 px-6 py-2" onClick={() => window.location.href = '/dashboard'}>Kembali ke Dashboard</Button>
        </div>
      </div>
    );
  }

  // Kamera aktif: tampilkan layout dua kartu
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-4 px-1 sm:px-2 md:px-0">
      {cameraStatusError && (
        <div className="mb-4 text-red-600 font-semibold text-center text-sm sm:text-base">{cameraStatusError}</div>
      )}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Kartu Kamera & Deteksi */}
        <Card className="shadow-xl border-2 border-primary/10 flex flex-col items-center p-0 w-full">
          <CardHeader className="w-full pb-2 flex flex-col items-center justify-center">
            <CardTitle className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight text-center w-full">Kamera & Deteksi</CardTitle>
            <CardDescription className="text-gray-500 text-center w-full mt-1 text-xs sm:text-sm">Pastikan wajah Anda terlihat jelas di kamera.</CardDescription>
          </CardHeader>
          <CardContent className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-xs sm:max-w-md aspect-video bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-200 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-2xl border-4 border-primary/30 shadow-lg transition-all duration-300"
                autoPlay
                playsInline
                muted
                style={{ background: '#e5e7eb' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 animate-fade-in">
                  <Camera className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4" />
                  <span className="text-gray-400 text-base sm:text-lg font-semibold">Kamera belum aktif</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-center mt-2">
              <Button
                variant="destructive"
                onClick={() => {
                  setIsCameraActive(false);
                  stopVideo();
                }}
                className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold rounded-xl shadow"
              >
                Hentikan Kamera
              </Button>
              <Button
                variant="outline"
                onClick={captureScreenshot}
                className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base font-semibold rounded-xl shadow"
                disabled={!isCameraOn}
              >
                <Download className="mr-2" />
                Ambil Screenshot
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Kartu Hasil Deteksi Emosi */}
        <Card className="shadow-xl border-2 border-primary/10 flex flex-col items-center p-0 w-full">
          <CardHeader className="w-full pb-2 flex flex-col items-center justify-center">
            <CardTitle className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight text-center w-full">Hasil Deteksi Emosi</CardTitle>
            <CardDescription className="text-gray-500 text-center w-full mt-1 text-xs sm:text-sm">Visualisasi emosi utama & probabilitas.</CardDescription>
          </CardHeader>
          <CardContent className="w-full flex flex-col items-center min-h-[220px] sm:min-h-[320px] justify-center">
            {detectionResults.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] sm:min-h-[180px] animate-fade-in">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin mb-2" />
                <div className="text-gray-400 text-sm sm:text-base font-medium">Mendeteksi wajah dan emosi...</div>
              </div>
            )}
            {detectionResults.length > 0 && (
              <div className="w-full flex flex-col gap-4 sm:gap-6 items-center animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full justify-center">
                  {detectionResults.slice(0, 2).map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-md border bg-white min-w-[100px] sm:min-w-[140px] max-w-[140px] sm:max-w-[180px] transition-all duration-200`}
                    >
                      <div className="text-2xl sm:text-3xl font-extrabold capitalize mb-1 drop-shadow-sm tracking-wide text-gray-800 text-center">
                        {result.expression}
                      </div>
                      <div className="text-base sm:text-lg text-gray-700 font-semibold text-center">
                        {Math.round(result.probability * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
                  {detectionResults.slice(2, 6).map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl shadow border bg-white transition-all duration-200`}
                    >
                      <div className="text-xs sm:text-base font-bold capitalize mb-1 text-gray-700 text-center">
                        {result.expression}
                      </div>
                      <div className="text-xs text-gray-500 font-semibold text-center">
                        {Math.round(result.probability * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modal sesi berakhir */}
      {showSessionEndedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center gap-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Sesi Telah Diakhiri</h2>
            <p className="text-gray-700 text-center">Sesi deteksi emosi pada grup ini telah diakhiri oleh ketua grup. Silakan hubungi ketua untuk memulai sesi baru.</p>
            <Button className="mt-4 px-6 py-2" onClick={() => window.location.href = '/dashboard'}>Kembali ke Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  )
}
