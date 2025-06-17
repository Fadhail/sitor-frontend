import { api } from "./api";

export async function getGroupMembers(groupId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.get(`/groups/${groupId}/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
