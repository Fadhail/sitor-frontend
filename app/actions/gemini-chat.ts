"use server"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function getEmotionRecommendation(emotion: string, context?: string) {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `You are SITOR, an empathetic AI assistant specialized in emotion detection and mental wellness support.

Current detected emotion: ${emotion}
${context ? `Additional context: ${context}` : ""} 

As SITOR, provide a supportive and empathetic initial recommendation to help the user with their current emotional state. 

Guidelines:
- Use a warm, caring tone
- Provide practical, actionable advice
- Keep the response concise but meaningful
- Acknowledge their emotions as valid
- Respond in Indonesian if the context suggests the user prefers Indonesian, otherwise use English
- Introduce yourself briefly as SITOR in the first interaction

Respond as SITOR:`,
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
      prompt: `You are SITOR, an empathetic AI assistant specialized in emotion detection and mental wellness support.

${conversationContext ? `Previous conversation context:\n${conversationContext}\n\n` : ""}

Current user emotion: ${currentEmotion || "unknown"}
Recent emotion history: ${recentEmotions || "none"}

User's current message: ${message}

Instructions:
- Continue the conversation naturally, referring to previous context when relevant
- Provide empathetic and supportive responses
- Give practical advice related to the user's emotional state
- Keep responses concise but caring
- Respond in the same language the user is using
- Remember previous topics discussed in this conversation

Respond as SITOR:`,
    })

    return { success: true, response: text }
  } catch (error) {
    console.error("Error in chat:", error)
    return {
      success: false,
      response: "I'm having trouble responding right now, but I'm here to support you. Please try again in a moment.",
    }
  }
}
