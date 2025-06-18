import { api } from "./api";

export async function createDetection({ groupId, emotions }: { groupId: string; emotions: Record<string, number> }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.post("/detections", { groupId, emotions }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDetectionsByGroup(groupId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.get(`/detections/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
