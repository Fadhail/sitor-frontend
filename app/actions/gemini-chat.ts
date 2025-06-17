"use server"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function getEmotionRecommendation(emotion: string, context?: string) {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `Anda adalah SITOR, asisten AI berempati yang mengkhususkan diri dalam deteksi emosi dan dukungan kesehatan mental.

Deteksi yang terdeteksi: ${emotion}
${context ? `Konteks tambahan: ${context}` : ""} 

Sebagai SITOR, berikan rekomendasi awal yang mendukung dan berempati untuk membantu pengguna dengan kondisi emosional mereka saat ini.

Pedoman:
- Gunakan nada yang hangat dan penuh perhatian
- Berikan saran yang praktis dan dapat ditindaklanjuti
- Pastikan responsnya singkat tetapi bermakna
- Akui emosi mereka sebagai hal yang valid
- Tanggapi dalam bahasa Indonesia jika konteksnya menunjukkan pengguna lebih suka bahasa Indonesia, jika tidak gunakan bahasa Inggris
- Perkenalkan diri Anda secara singkat sebagai SITOR dalam interaksi pertama

Tanggapi sebagai SITOR:`,
    })

    return { success: true, recommendation: text }
  } catch (error) {
    console.error("Error getting recommendation:", error)
    return {
      success: false,
      recommendation:
        "Saya SITOR, dan saya di sini untuk membantu Anda. Meskipun sedang ada masalah koneksi, ingatlah bahwa semua emosi itu valid dan bersifat sementara. Tarik napas dalam-dalam dan bersikap baik pada diri sendiri.",
    }
  }
}

export async function chatWithGemini(
  message: string,
  emotionHistory: string[],
  chatHistory?: Array<{ content: string, sender: "user" | "ai" }>,
  currentEmotion?: string
) {
  try {
    const recentEmotions = emotionHistory.slice(-5).join(", ")

    // Build conversation context
    let conversationContext = ""
    if (chatHistory && chatHistory.length > 0) {
      const recentChat = chatHistory.slice(-10) // Last 10 messages for context
      conversationContext = recentChat
        .map(msg => `${msg.sender === "user" ? "User" : "SITOR"}: ${msg.content}`)
        .join("\n")
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `Anda adalah SITOR, asisten AI berempati yang mengkhususkan diri dalam deteksi emosi dan dukungan kesehatan mental.

${conversationContext ? `Konteks percakapan sebelumnya:\n${conversationContext}\n\n` : ""}

Emosi pengguna saat ini: ${currentEmotion || "tidak diketahui"}
Sejarah emosi terkini: ${recentEmotions || "tidak ada"}

Pesan pengguna saat ini: ${message}

Petunjuk:
- Lanjutkan percakapan secara wajar, dengan merujuk pada konteks sebelumnya jika relevan
- Berikan tanggapan yang berempati dan mendukung
- Berikan saran praktis terkait kondisi emosional pengguna
- Buat tanggapan yang ringkas tetapi penuh perhatian
- Tanggapi dalam bahasa yang sama dengan yang digunakan pengguna
- Ingat topik sebelumnya yang dibahas dalam percakapan ini

Tanggapi sebagai SITOR:`,
    })

    return { success: true, response: text }
  } catch (error) {
    console.error("Error:", error)
    return {
      success: false,
      response: "Saya mengalami kendala dalam merespons saat ini, tetapi saya siap membantu Anda. Silakan coba lagi nanti.",
    }
  }
}
