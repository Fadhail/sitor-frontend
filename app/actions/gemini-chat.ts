"use server"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function getEmotionRecommendation(emotion: string, context?: string) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are SITOR, an empathetic AI assistant that provides helpful recommendations based on detected emotions.

Current detected emotion: ${emotion}
${context ? `Additional context: ${context}` : ""}

Please provide a supportive and actionable recommendation for someone experiencing this emotion. Keep your response:
- Warm and understanding
- Practical and actionable
- Between 2-4 sentences
- Focused on immediate steps they can take

Respond as if you're having a caring conversation with the user.`,
    })

    return { success: true, recommendation: text }
  } catch (error) {
    console.error("Error getting recommendation:", error)
    return {
      success: false,
      recommendation:
        "I'm having trouble connecting right now, but remember that all emotions are valid and temporary. Take a deep breath and be kind to yourself.",
    }
  }
}

export async function chatWithGemini(message: string, emotionHistory: string[]) {
  try {
    const recentEmotions = emotionHistory.slice(-5).join(", ")

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are SITOR, an empathetic AI assistant specializing in emotional wellness and support.

Recent detected emotions: ${recentEmotions}
User message: ${message}

Provide a helpful, supportive response that:
- Acknowledges their emotions and feelings
- Offers practical advice or coping strategies
- Is warm and understanding
- Relates to their emotional state when relevant
- Keeps responses conversational and not too long

Remember, you're here to support their emotional wellbeing.`,
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
