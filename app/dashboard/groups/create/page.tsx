"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGroup } from "@/service/api";

export default function CreateGroupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await createGroup({ name, description, securityCode });
      if (res.data && res.data.success) {
        router.push("/dashboard/groups");
      } else {
        setError(res.data.message || "Gagal membuat grup");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat grup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Buat Grup Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div>
              <label className="block mb-1 font-medium">Nama Grup</label>
              <input
                className="w-full border rounded p-2"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Deskripsi</label>
              <input
                className="w-full border rounded p-2"
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Kode Keamanan</label>
              <input
                className="w-full border rounded p-2"
                type="password"
                value={securityCode}
                onChange={e => setSecurityCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Membuat..." : "Buat Grup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
