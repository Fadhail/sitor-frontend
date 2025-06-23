import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  name: string;
  email: string;
  isLoading: boolean;
  error: string;
  success: string;
  onChange: (field: "name" | "email", value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({ name, email, isLoading, error, success, onChange, onSubmit }: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">{success}</div>}
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => onChange("name", e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => onChange("email", e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Perbarui Profil"}
        </Button>
      </div>
    </form>
  );
}
