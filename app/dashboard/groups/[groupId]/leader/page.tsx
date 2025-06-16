"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Detection {
  user: string;
  timestamp: number;
  emotion: string;
  probability: number;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "bg-green-500",
  sad: "bg-blue-500",
  angry: "bg-red-500",
  fearful: "bg-purple-500",
  disgusted: "bg-yellow-500",
  surprised: "bg-pink-500",
  neutral: "bg-gray-400",
};

export default function LeaderDashboardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const unwrappedParams = React.use(params);
  const groupId = unwrappedParams.groupId;
  const [data, setData] = useState<Detection[]>([]);
  const [emotionSummary, setEmotionSummary] = useState<Record<string, number>>({});

  // Ambil data dari localStorage dan update realtime
  useEffect(() => {
    const groupKey = `group-detections-${groupId}`;
    const fetchData = () => {
      try {
        const raw = localStorage.getItem(groupKey) || "[]";
        const arr: Detection[] = JSON.parse(raw);
        setData(arr);
        // Hitung summary
        const summary: Record<string, number> = {};
        arr.forEach((d) => {
          summary[d.emotion] = (summary[d.emotion] || 0) + 1;
        });
        setEmotionSummary(summary);
      } catch {
        setData([]);
        setEmotionSummary({});
      }
    };
    fetchData();
    window.addEventListener("storage", fetchData);
    return () => window.removeEventListener("storage", fetchData);
  }, [groupId]);

  const total = Object.values(emotionSummary).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" /> Dashboard Ketua Grup
      </h1>
      <p className="mb-4">Hasil deteksi wajah anggota grup: <b>{groupId}</b></p>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statistik Emosi Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="text-center text-gray-500">Belum ada deteksi dari anggota.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(emotionSummary).map(([emotion, count]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}></div>
                  <span className="capitalize w-24">{emotion}</span>
                  <div className="flex-1 bg-gray-200 rounded h-3 mx-2">
                    <div
                      className={`h-3 rounded ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}
                      style={{ width: `${(count / total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{count}</span>
                  <span className="text-xs text-gray-500">({((count / total) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statistik Emosi per Anggota</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada deteksi dari anggota.</div>
          ) : (
            <div className="space-y-3">
              {data.map((d, i) => (
                <div key={d.user + i} className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded w-28 truncate">{d.user}</span>
                  <span className="capitalize w-20 font-semibold">{d.emotion}</span>
                  <div className="flex-1 bg-gray-200 rounded h-3 mx-2">
                    <div
                      className={`h-3 rounded ${EMOTION_COLORS[d.emotion] || 'bg-gray-300'}`}
                      style={{ width: `${(d.probability * 100).toFixed(1)}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{(d.probability * 100).toFixed(1)}%</span>
                  <span className="text-xs text-gray-400">{new Date(d.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
