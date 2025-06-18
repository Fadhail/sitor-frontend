import { Button } from "@/components/ui/button";

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (securityCode: string) => void;
  isLoading: boolean;
  error: string;
  securityCode: string;
  setSecurityCode: (v: string) => void;
}

export function JoinGroupModal({ open, onClose, onSubmit, isLoading, error, securityCode, setSecurityCode }: JoinGroupModalProps) {
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
        <h2 className="text-lg font-bold mb-2">Masukkan Kode Keamanan</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit(securityCode);
          }}
          className="space-y-4"
        >
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block mb-1 font-medium">Kode Keamanan</label>
            <input
              className="w-full border rounded p-2"
              type="password"
              placeholder="Kode Keamanan"
              value={securityCode}
              onChange={e => setSecurityCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
