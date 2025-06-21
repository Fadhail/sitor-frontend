import { api } from "./api";

export async function getChatHistory() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const res = await api.get("/chat-history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.messages;
}

export async function addChatMessage(message: { sender: string; message: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return api.post(
    "/chat-history",
    message,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
