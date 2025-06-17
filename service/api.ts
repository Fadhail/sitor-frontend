import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
});

export async function register({ name, email, password }: { name: string; email: string; password: string }) {
  return api.post("/register", { name, email, password });
}

export async function login({ email, password }: { email: string; password: string }) {
  return api.post("/login", { email, password });
}

export async function getMe(token: string) {
  return api.get("/me", { headers: { Authorization: token } });
}

export async function getGroups() {
  return api.get("/groups");
}

export async function joinGroup({ groupId, securityCode }: { groupId: string; securityCode: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  // Validasi groupId harus 24 karakter hex
  if (!groupId || typeof groupId !== "string" || groupId.length !== 24) {
    throw new Error("Group ID tidak valid. Silakan pilih grup dari daftar.");
  }
  // Kirim request ke endpoint backend sesuai kebutuhan
  return api.post(
    "/groups/join",
    {
      groupId: groupId.trim(), // string, case-sensitive
      securityCode,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function createGroup({ name, description, securityCode }: { name: string; description: string; securityCode: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.post("/groups", { name, description, securityCode }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function updateProfile({ name, email }: { name: string; email: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.patch(
    "/me",
    { name, email },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function updatePassword({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.patch(
    "/me/password",
    { currentPassword: oldPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function getUserDetections() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.get("/detections", { headers: { Authorization: `Bearer ${token}` } });
}

export async function getDashboardSummary() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.get("/me/summary", { headers: { Authorization: `Bearer ${token}` } });
}

export async function deleteGroup(groupId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.delete(`/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function leaveGroup(groupId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.post(`/groups/${groupId}/leave`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateCameraStatus({ groupId, isActive }: { groupId: string; isActive: boolean }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.post(`/groups/${groupId}/camera-status`, { isActive }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getCameraStatus(groupId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.get(`/groups/${groupId}/camera-status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Tidak perlu parameter role pada register/login, semua user netral
