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

  // State untuk status kamera
  const [cameraStatus, setCameraStatus] = useState<Record<string, boolean>>({});

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

  // Polling status kamera
  useEffect(() => {
    let isMounted = true;
    const fetchCameraStatus = () => {
      getCameraStatus(groupId)
        .then((res) => {
          if (!isMounted) return;
          // Map userId ke isActive
          const statusMap: Record<string, boolean> = {};
          (res.data.statuses || []).forEach((s: any) => {
            statusMap[s.userId] = s.isActive;
          });
          setCameraStatus(statusMap);
        })
        .catch(() => {
          if (!isMounted) return;
          setCameraStatus({});
        });
    };
    fetchCameraStatus();
    const interval = setInterval(fetchCameraStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [groupId]);

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
        <Button className="bg-[#018786] hover:bg-[#016e6e] text-white px-6 py-3 rounded-lg shadow font-semibold">
          Mulai Deteksi Baru
        </Button>
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
        {data.length === 0 ? (
          <div className="text-gray-500 text-center">Belum ada aktivitas deteksi.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.slice(-10).reverse().map((d, i) => {
              const dominant = Object.entries(d.emotions).reduce((a, b) => a[1] > b[1] ? a : b, ["neutral", 0])[0];
              const lastTime = new Date(d.timestamp);
              const now = new Date();
              const diff = (now.getTime() - lastTime.getTime()) / 1000;
              const isActive = cameraStatus[d.userId || ""] === true;
              return (
                <li key={i} className="flex items-center gap-4 py-3">
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} title={isActive ? 'Aktif' : 'Tidak Aktif'}></div>
                  <div className={`w-3 h-3 rounded-full ${EMOTION_COLORS[dominant]}`} title={dominant}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{d.userName || d.userId || "-"}</div>
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
        )}
      </div>
    </div>
  );
}
