import { Button } from "@/components/ui/button";

interface PasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string;
  success: string;
  onChange: (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  isLoading,
  error,
  success,
  onChange,
  onSubmit,
}: PasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}
      <div>
        <label className="block text-sm font-medium">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => onChange("currentPassword", e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => onChange("newPassword", e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => onChange("confirmPassword", e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Changing..." : "Ubah Password"}
        </Button>
      </div>
    </form>
  );
}
