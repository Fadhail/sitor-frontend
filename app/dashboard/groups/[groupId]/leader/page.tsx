"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { getDetectionsByGroup } from "@/service/detections";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getGroups } from "@/service/api";

interface Detection {
  userName?: string;
  userId?: string;
  timestamp: string | number;
  emotions: Record<string, number>;
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

// Perbaiki props agar groupId bertipe string
export default function LeaderDashboardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = React.use(params);
  const [data, setData] = useState<Detection[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLeader, setIsLeader] = useState<boolean | null>(null);

  // Ambil user dari localStorage
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  // Cek apakah user adalah leader grup
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

  // Ambil data deteksi dari backend
  useEffect(() => {
    let isMounted = true;
    const fetchDetections = () => {
      getDetectionsByGroup(groupId)
        .then((res) => {
          if (!isMounted) return;
          const arr: Detection[] = res.data.detections || [];
          setData(arr);
          // Hitung summary
        })
        .catch(() => {
          if (!isMounted) return;
          setData([]);
        });
    };
    fetchDetections();
    const interval = setInterval(fetchDetections, 5000); // polling setiap 5 detik
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [groupId]);

  // Hitung summary emosi per user
  const userEmotionSummary: Record<string, Record<string, number>> = {};
  data.forEach((d) => {
    const userKey = d.userName || d.userId || "-";
    if (!userEmotionSummary[userKey]) userEmotionSummary[userKey] = {};
    Object.entries(d.emotions || {}).forEach(([emotion, value]) => {
      userEmotionSummary[userKey][emotion] = (userEmotionSummary[userKey][emotion] || 0) + value;
    });
  });

  if (isLeader === false) {
    return <div className="text-center text-red-500 font-bold mt-10">Akses ditolak: Anda bukan ketua grup ini.</div>;
  }
  if (isLeader === null) {
    return <div className="text-center text-gray-500 mt-10">Memuat...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" /> Dashboard Ketua Grup
      </h1>
      <p className="mb-4">Hasil deteksi wajah anggota grup: <b>{groupId}</b></p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="summary">Statistik Harian</TabsTrigger>
          <TabsTrigger value="history">Riwayat Deteksi</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Statistik Emosi Grup (Global)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="text-center text-gray-500">Belum ada deteksi dari anggota.</div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    // Kelompokkan deteksi per user, ambil deteksi terakhir per user
                    const userLatest: Record<string, Detection> = {};
                    data.forEach((d) => {
                      const userKey = d.userName || d.userId || "-";
                      if (!userLatest[userKey] || new Date(d.timestamp).getTime() > new Date(userLatest[userKey].timestamp).getTime()) {
                        userLatest[userKey] = d;
                      }
                    });
                    // Hitung rata-rata distribusi emosi dari seluruh user
                    const emotionSums: Record<string, number> = {};
                    let userCount = 0;
                    Object.values(userLatest).forEach((d) => {
                      userCount++;
                      Object.entries(d.emotions || {}).forEach(([emotion, value]) => {
                        emotionSums[emotion] = (emotionSums[emotion] || 0) + value;
                      });
                    });
                    // Rata-rata per emosi
                    const emotionAverages: Record<string, number> = {};
                    Object.keys(EMOTION_COLORS).forEach((emotion) => {
                      emotionAverages[emotion] = userCount > 0 ? (emotionSums[emotion] || 0) / userCount : 0;
                    });
                    // Hitung jumlah user per emosi dominan
                    const dominantCount: Record<string, number> = {};
                    Object.values(userLatest).forEach((d) => {
                      let max = -Infinity;
                      let dominant = "neutral";
                      Object.entries(d.emotions || {}).forEach(([emotion, value]) => {
                        if (value > max) {
                          max = value;
                          dominant = emotion;
                        }
                      });
                      dominantCount[dominant] = (dominantCount[dominant] || 0) + 1;
                    });
                    return <>
                      {Object.entries(emotionAverages).map(([emotion, avg]) => (
                        <div key={emotion} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}></div>
                          <span className="capitalize w-24">{emotion}</span>
                          <div className="flex-1 bg-gray-200 rounded h-3 mx-2">
                            <div
                              className={`h-3 rounded ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}
                              style={{ width: `${avg}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold">{avg.toFixed(1)}%</span>
                        </div>
                      ))}
                      <div className="mt-4">
                        <div className="font-semibold mb-1">Jumlah user dominan per emosi:</div>
                        <div className="flex flex-wrap gap-3">
                          {Object.keys(EMOTION_COLORS).map(emotion => (
                            <div key={emotion} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}></div>
                              <span className="capitalize">{emotion}:</span>
                              <span className="font-bold">{dominantCount[emotion] || 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>;
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Statistik Emosi Real-time per Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(userEmotionSummary).length === 0 ? (
                <div className="text-center text-gray-500">Belum ada deteksi dari anggota.</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(userEmotionSummary).map(([user, summary], idx) => {
                    const total = Object.values(summary).reduce((a, b) => a + b, 0);
                    return (
                      <div key={user} className="mb-2">
                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded w-28 truncate mb-1">{user}</div>
                        <div className="space-y-1">
                          {Object.keys(EMOTION_COLORS)
                            .filter((emotion) => total > 0 && (summary[emotion] || 0) > 0)
                            .map((emotion) => (
                              <div key={emotion} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}></div>
                                <span className="capitalize w-24">{emotion}</span>
                                <div className="flex-1 bg-gray-200 rounded h-3 mx-2">
                                  <div
                                    className={`h-3 rounded ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}
                                    style={{ width: `${total > 0 ? ((summary[emotion] || 0) / total) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="font-semibold">{total > 0 ? (((summary[emotion] || 0) / total) * 100).toFixed(1) : '0.0'}%</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Distribusi Emosi Anggota</CardTitle>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="text-center text-gray-500">Belum ada deteksi dari anggota.</div>
              ) : (
                <div>
                  {/* Dropdown tanggal */}
                  {(() => {
                    // Ambil semua tanggal unik dari data
                    const dateSet = new Set<string>();
                    data.forEach((d) => {
                      if (d.timestamp) {
                        const t = typeof d.timestamp === 'string' ? new Date(d.timestamp) : new Date(Number(d.timestamp));
                        dateSet.add(t.toLocaleDateString());
                      }
                    });
                    const dateList = Array.from(dateSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                    return (
                      <div className="mb-4">
                        <label className="mr-2 font-semibold">Pilih Tanggal:</label>
                        <select
                          className="border rounded px-2 py-1"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                        >
                          <option value="">Semua</option>
                          {dateList.map(date => (
                            <option key={date} value={date}>{date}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {(() => {
                      // Kelompokkan data per user per hari
                      const grouped: Record<string, Record<string, { userName: string, emotions: Record<string, number>[] }>> = {};
                      data.forEach((d) => {
                        const userName = d.userName || d.userId || '-';
                        const t = typeof d.timestamp === 'string' ? new Date(d.timestamp) : new Date(Number(d.timestamp));
                        const date = t.toLocaleDateString();
                        if (!grouped[userName]) grouped[userName] = {};
                        if (!grouped[userName][date]) grouped[userName][date] = { userName, emotions: [] };
                        grouped[userName][date].emotions.push(d.emotions);
                      });
                      // Render hanya tanggal yang dipilih
                      return Object.entries(grouped).map(([userName, dates]) => {
                        // Filter tanggal
                        const filteredDates = selectedDate ? { [selectedDate]: dates[selectedDate] } : dates;
                        return (
                          <div key={userName} className="mb-4">
                            <div className="font-bold mb-2">{userName}</div>
                            <div className="space-y-2">
                              {Object.entries(filteredDates).map(([date, info], i) => {
                                if (!info) return null;
                                // Hitung distribusi rata-rata emosi untuk hari itu
                                const emotionSum: Record<string, number> = {};
                                let total = 0;
                                info.emotions.forEach(eObj => {
                                  Object.entries(eObj).forEach(([emotion, value]) => {
                                    emotionSum[emotion] = (emotionSum[emotion] || 0) + value;
                                    total += value;
                                  });
                                });
                                return (
                                  <div key={date + i} className="flex items-center gap-4 border-b pb-2">
                                    <span className="w-28 text-xs text-gray-600">{date}</span>
                                    <div className="flex-1 flex flex-col gap-1">
                                      {Object.keys(EMOTION_COLORS).map(emotion => (
                                        <div key={emotion} className="flex items-center gap-2">
                                          <span className="capitalize w-16">{emotion}</span>
                                          <div className="flex-1 bg-gray-200 rounded h-2 mx-2">
                                            <div
                                              className={`h-2 rounded ${EMOTION_COLORS[emotion] || 'bg-gray-300'}`}
                                              style={{ width: `${total > 0 ? ((emotionSum[emotion] || 0) / total) * 100 : 0}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs">{total > 0 ? (((emotionSum[emotion] || 0) / total) * 100).toFixed(1) : '0.0'}%</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
