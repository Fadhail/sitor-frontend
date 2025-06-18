import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; securityCode: string }) => void;
  isLoading?: boolean;
  error?: string;
}

export function AddGroupModal({ open, onClose, onSubmit, isLoading, error }: AddGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSecurityCode("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, securityCode });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Tutup"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-2">Buat Grup Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block mb-1 font-medium">Nama Grup</label>
            <Input
              type="text"
              placeholder="Nama grup"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Deskripsi</label>
            <Input
              type="text"
              placeholder="Deskripsi grup (opsional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Kode Keamanan Grup</label>
            <Input
              type="text"
              placeholder="Kode keamanan (wajib)"
              value={securityCode}
              onChange={e => setSecurityCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Membuat..." : "Buat Grup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
