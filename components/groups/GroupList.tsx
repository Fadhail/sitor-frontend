import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User2, Plus, Trash2, LogOut } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  leaderId: string;
}

interface GroupListProps {
  groups: Group[];
  userId: string;
  onJoin: (groupId: string) => void;
  onAccess: (groupId: string, isLeader: boolean) => void;
  onAddGroup: () => void;
  onDeleteGroup?: (groupId: string) => void;
  onLeaveGroup?: (groupId: string) => void;
}

export function GroupList({ groups, userId, onJoin, onAccess, onAddGroup, onDeleteGroup, onLeaveGroup }: GroupListProps) {
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<{ type: "delete" | "leave"; groupId: string } | null>(null);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  const myGroups = filteredGroups.filter((g) => g.members.includes(userId));
  const otherGroups = filteredGroups.filter((g) => !g.members.includes(userId));

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Sticky search bar only, no extra box */}
      <div className="flex justify-center px-4 py-3">
        <input
          type="text"
          placeholder="Cari grup..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sticky top-0 z-20 w-full sm:w-1/2 max-w-md rounded-md border px-4 py-2 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="pt-4">{/* Spacer agar konten tidak tertutup search bar */}
        <section className="mb-14">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-tight justify-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Grup Saya
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-start">
            {myGroups.length === 0 ? (
              <div className="text-muted-foreground italic mb-8 text-center col-span-full">Belum bergabung di grup manapun.</div>
            ) : (
              myGroups.map((g) => (
                <Card
                  key={g.id}
                  className="flex flex-col h-full border-2 border-green-500 shadow-md bg-green-50/40 hover:shadow-lg transition-shadow px-6 py-5 group min-h-[220px]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold flex-1 truncate">{g.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500 text-white">Bergabung</span>
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2 min-h-[2.5em]">{g.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 mt-auto">
                    <span className="flex items-center gap-1"><User2 className="w-4 h-4" /> {g.members.length} anggota</span>
                  </div>
                  <Button
                    onClick={() => onAccess(g.id, userId === g.leaderId)}
                    className="w-full mt-2 bg-green-500 hover:bg-green-600"
                  >
                    Akses Grup
                  </Button>
                  {userId === g.leaderId ? (
                    <Button
                      variant="destructive"
                      className="w-full mt-2 flex items-center gap-2"
                      onClick={() => setConfirming({ type: "delete", groupId: g.id })}
                    >
                      <Trash2 className="w-4 h-4" /> Hapus Grup
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full mt-2 flex items-center gap-2"
                      onClick={() => setConfirming({ type: "leave", groupId: g.id })}
                    >
                      <LogOut className="w-4 h-4" /> Keluar Grup
                    </Button>
                  )}
                </Card>
              ))
            )}
            {/* Card tambah grup di paling kanan */}
            <Card
              onClick={onAddGroup}
              className="flex flex-col items-center justify-center h-full min-h-[220px] border-2 border-dashed border-green-400 bg-green-50/40 hover:bg-green-100 cursor-pointer transition group"
              tabIndex={0}
              role="button"
              aria-label="Tambah Grup"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-green-100 p-4 mb-2 group-hover:bg-green-200 transition">
                  <Plus className="w-10 h-10 text-green-500" />
                </div>
                <span className="text-green-700 font-semibold">Tambah Grup</span>
              </div>
            </Card>
          </div>
          {/* Konfirmasi hapus/keluar grup */}
          {confirming && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                  onClick={() => setConfirming(null)}
                  aria-label="Tutup"
                >
                  ×
                </button>
                <h2 className="text-lg font-bold mb-2">{confirming.type === "delete" ? "Hapus Grup" : "Keluar Grup"}</h2>
                <p className="mb-4">
                  {confirming.type === "delete"
                    ? "Apakah Anda yakin ingin menghapus grup ini? Semua data grup akan hilang."
                    : "Apakah Anda yakin ingin keluar dari grup ini?"}
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => setConfirming(null)}>
                    Batal
                  </Button>
                  <Button
                    className="flex-1"
                    variant={confirming.type === "delete" ? "destructive" : "default"}
                    onClick={() => {
                      if (confirming.type === "delete" && onDeleteGroup) onDeleteGroup(confirming.groupId);
                      if (confirming.type === "leave" && onLeaveGroup) onLeaveGroup(confirming.groupId);
                      setConfirming(null);
                    }}
                  >
                    {confirming.type === "delete" ? "Hapus" : "Keluar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-tight justify-center">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400" /> Grup Lainnya
          </h2>
          {otherGroups.length === 0 ? (
            <div className="text-muted-foreground italic mb-8 text-center">Tidak ada grup lain yang tersedia.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-start">
              {otherGroups.map((g) => (
                <Card
                  key={g.id}
                  className="flex flex-col h-full border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow px-6 py-5 group min-h-[220px]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold flex-1 truncate">{g.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">Publik</span>
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2 min-h-[2.5em]">{g.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 mt-auto">
                    <span className="flex items-center gap-1"><User2 className="w-4 h-4" /> {g.members.length} anggota</span>
                  </div>
                  <Button
                    onClick={() => onJoin(g.id)}
                    className="w-full mt-2"
                  >
                    Masuk Grup
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
