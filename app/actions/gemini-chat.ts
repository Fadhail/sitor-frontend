"use server"

import { google, createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"
import { predictSVMEmotion } from "@/service/api"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const geminiProvider = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })

export async function getEmotionRecommendation(emotion: string, context?: string) {
  try {
    const { text } = await generateText({
      model: geminiProvider("gemini-2.0-flash"),
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
  } catch (err) {
    console.error("Gemini error:", err)
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
    // Prediksi emosi dari input user menggunakan SVM API
    let svmResult = null;
    try {
      svmResult = await predictSVMEmotion(message); // hanya prediksi text user
    } catch (svmErr) {
      console.error("SVM API error:", svmErr);
    }

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
      model: geminiProvider("gemini-2.0-flash"),
      prompt: `${message} and if you need current emotion, use "${currentEmotion }" as the current emotion. If no need dont use that`
    })

    return { success: true, response: text, svm: svmResult }
  } catch (err) {
    console.error("Gemini error:", err)
    return {
      success: false,
      response: "Saya mengalami kendala dalam merespons saat ini, tetapi saya siap membantu Anda. Silakan coba lagi nanti.",
    }
  }
}
