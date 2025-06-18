"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users2, Smile, Clock, Activity } from "lucide-react";
import { getDetectionsByGroup } from "@/service/detections";
import { getGroups, getCameraStatus } from "@/service/api";

interface Detection {
  userName?: string;
  userId?: string;
  timestamp: string | number;
  emotions: Record<string, number>;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "bg-[#018786]",
  sad: "bg-blue-400",
  angry: "bg-red-400",
  fearful: "bg-purple-400",
  disgusted: "bg-yellow-400",
  surprised: "bg-pink-400",
  neutral: "bg-gray-400",
};

export default function LeaderDashboardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = React.use(params);
  const [data, setData] = useState<Detection[]>([]);
  const [isLeader, setIsLeader] = useState<boolean | null>(null);

  // State untuk status sesi grup
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const [cameraStatus, setCameraStatus] = useState<Record<string, boolean>>({});
  const [cameraStatusError, setCameraStatusError] = useState<string | null>(null);

  // Tambahkan state dan useEffect untuk riwayat sesi
  const [history, setHistory] = useState<any[]>([]);

  // State untuk modal konfirmasi end session
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  // State untuk modal konfirmasi start session
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);

  // Polling status kamera & status sesi dengan logika baru
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout | null = null;
    let pollingAllowed = sessionActive === true;

    const pollStatus = () => {
      if (!pollingAllowed) return;
      getCameraStatus(groupId)
        .then((res) => {
          if (!isMounted) return;
          const statusMap: Record<string, boolean> = {};
          (res.data.statuses || []).forEach((s: any) => {
            statusMap[s.userId] = s.isActive;
          });
          setCameraStatus(statusMap);
          setSessionActive(true);
          setCameraStatusError(null);
        })
        .catch((err) => {
          if (!isMounted) return;
          if (err?.response?.status === 410) {
            setSessionActive(false);
            setCameraStatus({});
            setCameraStatusError('Sesi grup telah diakhiri oleh ketua. Semua user disconnect.');
            pollingAllowed = false;
          } else {
            setCameraStatusError('Akses tidak valid. Silakan login ulang.');
          }
        });
    };

    // Reset state setiap groupId/sessionActive berubah
    setCameraStatus({});
    setCameraStatusError(null);

    if (sessionActive === true) {
      pollStatus();
      interval = setInterval(pollStatus, 5000);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [groupId, sessionActive]);

  // Handler tombol mulai sesi baru: trigger polling ulang dengan delay agar backend sempat update
  const handleStartSession = async () => {
    try {
      await import("@/service/api").then(api => api.startSession(groupId));
      setSessionActive(null); // Reset state agar polling tidak langsung jalan
      setCameraStatusError(null);
      setCameraStatus({});
      // Delay polling pertama 1000ms agar backend benar-benar siap
      setTimeout(() => {
        setSessionActive(true);
      }, 1000);
    } catch (err) {
      // alert('Gagal memulai sesi baru. Silakan coba lagi.');
    }
  };

  // Handler tombol akhiri sesi: polling tetap berjalan, state akan update otomatis
  const handleEndSession = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      if (!groupId) {
        // alert('Group ID tidak ditemukan.');
        return;
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/groups/${groupId}/end-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        // const errMsg = await res.text();
        // throw new Error(errMsg || 'Gagal mengakhiri sesi.');
      }
      // alert('Sesi grup telah diakhiri. Semua user akan disconnect.');
      // State akan otomatis update oleh polling
    } catch (err: any) {
      // alert('Gagal mengakhiri sesi. ' + (err?.message || 'Silakan coba lagi.'));
    }
  };

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  useEffect(() => {
    getGroups().then(res => {
      const group = (res.data.groups || []).find((g: any) => g.id === groupId);
      if (group && user && group.leaderId === user.id) {
        setIsLeader(true);
      } else {
        setIsLeader(false);
      }
    });
  }, [groupId, user]);

  useEffect(() => {
    let isMounted = true;
    const fetchDetections = () => {
      getDetectionsByGroup(groupId)
        .then((res) => {
          if (!isMounted) return;
          setData(res.data.detections || []);
        })
        .catch(() => {
          if (!isMounted) return;
          setData([]);
        });
    };
    fetchDetections();
    const interval = setInterval(fetchDetections, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [groupId]);

  // Ambil riwayat sesi
  useEffect(() => {
    let isMounted = true;
    import("@/service/api").then(api => {
      api.getDetectionHistory(groupId)
        .then(res => {
          if (!isMounted) return;
          setHistory(res.data.history || []);
        })
        .catch(() => {
          if (!isMounted) return;
          setHistory([]);
        });
    });
    return () => { isMounted = false; };
  }, [groupId]);

  // Reset error/notifikasi saat groupId atau sessionActive berubah ke true
  useEffect(() => {
    if (sessionActive === true) {
      setCameraStatusError(null);
    }
  }, [groupId, sessionActive]);

  // Redirect ketua ke dashboard home jika sesi diakhiri
  useEffect(() => {
    if (sessionActive === false) {
      window.location.href = '/dashboard';
    }
  }, [sessionActive]);

  // Statistik metrik utama
  const totalDeteksi = data.length;
  const anggotaUnik = Array.from(new Set(data.map(d => d.userId))).length;
  const deteksiTerakhir = data.length > 0 ? new Date(data[data.length-1].timestamp).toLocaleString() : "-";
  // Hitung mood rata-rata
  const moodCount: Record<string, number> = {};
  data.forEach(d => {
    const dominant = Object.entries(d.emotions).reduce((a, b) => a[1] > b[1] ? a : b, ["neutral", 0])[0];
    moodCount[dominant] = (moodCount[dominant] || 0) + 1;
  });
  const moodRata = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

  // Distribusi emosi global
  const emotionSums: Record<string, number> = {};
  data.forEach(d => {
    Object.entries(d.emotions).forEach(([emotion, value]) => {
      emotionSums[emotion] = (emotionSums[emotion] || 0) + value;
    });
  });
  const emotionTotal = Object.values(emotionSums).reduce((a, b) => a + b, 0) || 1;

  if (isLeader === false) {
    return <div className="text-center text-red-500 font-bold mt-10">Akses ditolak: Anda bukan ketua grup ini.</div>;
  }
  if (isLeader === null) {
    return <div className="text-center text-gray-500 mt-10">Memuat...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-[#018786]" /> Dashboard Ketua Grup
        </h1>
        <div className="flex flex-row gap-2">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow font-semibold"
            onClick={() => setShowEndSessionModal(true)}
          >
            Akhiri Sesi
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow font-semibold"
            onClick={() => setShowStartSessionModal(true)}
            disabled={sessionActive === true}
          >
            Mulai Sesi Baru
          </Button>
        </div>
      </div>
      {/* Kartu metrik utama */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 rounded-xl shadow-sm flex flex-col gap-2 bg-white">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#018786] bg-[#018786]/10 rounded-full p-1" />
            <span className="text-xs text-gray-500">Deteksi Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalDeteksi}</div>
        </Card>
        <Card className="p-6 rounded-xl shadow-sm flex flex-col gap-2 bg-white">
          <div className="flex items-center gap-3">
            <Smile className="w-7 h-7 text-[#0052CC] bg-[#0052CC]/10 rounded-full p-1" />
            <span className="text-xs text-gray-500">Mood Rata-rata</span>
          </div>
          <div className="text-2xl font-bold capitalize">{moodRata}</div>
        </Card>
        <Card className="p-6 rounded-xl shadow-sm flex flex-col gap-2 bg-white">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7 text-[#018786] bg-[#018786]/10 rounded-full p-1" />
            <span className="text-xs text-gray-500">Deteksi Terakhir</span>
          </div>
          <div className="text-2xl font-bold">{deteksiTerakhir}</div>
        </Card>
        <Card className="p-6 rounded-xl shadow-sm flex flex-col gap-2 bg-white">
          <div className="flex items-center gap-3">
            <Users2 className="w-7 h-7 text-[#0052CC] bg-[#0052CC]/10 rounded-full p-1" />
            <span className="text-xs text-gray-500">Anggota Aktif</span>
          </div>
          <div className="text-2xl font-bold">{anggotaUnik}</div>
        </Card>
      </div>
      {/* Chart distribusi emosi */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Distribusi Emosi Grup</h2>
        <div className="flex flex-col gap-4">
          {Object.keys(EMOTION_COLORS).map(emotion => (
            <div key={emotion} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${EMOTION_COLORS[emotion]}`}></div>
              <span className="capitalize w-24">{emotion}</span>
              <div className="flex-1 bg-gray-200 rounded h-3 mx-2">
                <div
                  className={`h-3 rounded ${EMOTION_COLORS[emotion]}`}
                  style={{ width: `${((emotionSums[emotion] || 0) / emotionTotal) * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold">{((emotionSums[emotion] || 0) / emotionTotal * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Aktivitas terkini dengan status dan emosi realtime */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Aktivitas Deteksi Terkini</h2>
        {/* Notifikasi status sesi dan anggota */}
        {sessionActive === false ? (
          <div className="mb-4 text-red-600 font-semibold text-center">Sesi grup telah diakhiri oleh ketua. Semua user disconnect.</div>
        ) : null}
        {sessionActive && Object.keys(cameraStatus).length === 0 ? (
          <div className="mb-4 text-yellow-600 font-semibold text-center">Belum ada anggota yang aktif. Menunggu anggota mengaktifkan kamera.</div>
        ) : null}
        {cameraStatusError && sessionActive !== false && Object.keys(cameraStatus).length > 0 ? (
          <div className="mb-4 text-red-600 font-semibold text-center">{cameraStatusError}</div>
        ) : null}
        {/* Render aktivitas deteksi hanya jika sessionActive === true */}
        {sessionActive === true ? (
          data.length === 0 ? (
            <div className="text-gray-500 text-center">Belum ada aktivitas deteksi.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.slice(-10).reverse().map((d, i) => {
                // Pastikan userId pada cameraStatus dan data deteksi sama format (string)
                const userId = d.userId ? String(d.userId) : "";
                const isActive = cameraStatus[userId] === true;
                const dominant = Object.entries(d.emotions).reduce((a, b) => a[1] > b[1] ? a : b, ["neutral", 0])[0];
                const lastTime = new Date(d.timestamp);
                return (
                  <li key={i} className="flex items-center gap-4 py-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} title={isActive ? 'Aktif' : 'Tidak Aktif'}></div>
                    <div className={`w-3 h-3 rounded-full ${EMOTION_COLORS[dominant]}`} title={dominant}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{d.userName || userId || "-"}</div>
                      <div className="text-xs text-gray-500 flex gap-2 items-center">
                        <span>Status: {isActive ? <span className="text-green-600 font-semibold">Aktif</span> : <span className="text-gray-400">Tidak Aktif</span>}</span>
                        <span>| Emosi: <span className="capitalize font-semibold">{dominant}</span></span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{lastTime.toLocaleString()}</div>
                  </li>
                );
              })}
            </ul>
          )
        ) : null}
      </div>
      {/* Tambahkan di bawah aktivitas deteksi terkini */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Riwayat Sesi & Hasil Deteksi</h2>
        {history.length === 0 ? (
          <div className="text-gray-500 text-center">Belum ada riwayat sesi sebelumnya.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map((h: any, idx: number) => (
              <li key={h._id || idx} className="py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900">Sesi #{history.length - idx}</div>
                    <div className="text-xs text-gray-500">Selesai: {h.endedAt ? new Date(h.endedAt).toLocaleString() : '-'}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    {/* Ringkasan emosi: hitung distribusi dari deteksi */}
                    {(() => {
                      const emotionCount: Record<string, number> = {};
                      (h.detections || []).forEach((d: any) => {
                        Object.entries(d.emotions || {}).forEach(([emo, val]) => {
                          emotionCount[emo] = (emotionCount[emo] || 0) + (typeof val === 'number' ? val : 0);
                        });
                      });
                      const total = Object.values(emotionCount).reduce((a, b) => a + b, 0) || 1;
                      return Object.keys(EMOTION_COLORS).map(emotion => (
                        <div key={emotion} className="flex items-center gap-1">
                          <span className={`w-3 h-3 rounded-full ${EMOTION_COLORS[emotion]}`}></span>
                          <span className="text-xs text-gray-700 capitalize">{emotion}</span>
                          <span className="text-xs text-gray-500">{Math.round((emotionCount[emotion] || 0) / total * 100)}%</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal konfirmasi end session */}
      {showEndSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center gap-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Konfirmasi Akhiri Sesi</h2>
            <p className="text-gray-700 text-center">Apakah Anda yakin ingin mengakhiri sesi grup? Semua anggota akan disconnect dan Anda akan keluar dari dashboard ketua.</p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowEndSessionModal(false)} className="px-6 py-2">Batal</Button>
              <Button variant="destructive" onClick={async () => {
                setShowEndSessionModal(false);
                await handleEndSession();
                window.location.href = '/dashboard';
              }} className="px-6 py-2">Akhiri Sesi</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal konfirmasi start session */}
      {showStartSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center gap-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Konfirmasi Mulai Sesi Baru</h2>
            <p className="text-gray-700 text-center">Apakah Anda yakin ingin memulai sesi baru? Semua anggota harus mengaktifkan kamera ulang untuk deteksi emosi.</p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowStartSessionModal(false)} className="px-6 py-2">Batal</Button>
              <Button variant="default" onClick={async () => {
                setShowStartSessionModal(false);
                await handleStartSession();
              }} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white">Mulai Sesi Baru</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
