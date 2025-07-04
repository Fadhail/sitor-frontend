"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, X, Minimize2 } from "lucide-react"
import { getEmotionRecommendation, chatWithGemini } from "@/app/actions/gemini-chat"
import { getChatHistory, addChatMessage } from "@/service/chatHistory"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  svmResult?: { emotion: string; confidence: number } // Tambahan untuk hasil SVM
}

interface EmotionChatProps {
  currentEmotion?: string
  emotionHistory?: string[]
  isOpen: boolean
  onClose: () => void
}

export function EmotionChat({ currentEmotion, emotionHistory = [], isOpen, onClose }: EmotionChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastProcessedEmotion, setLastProcessedEmotion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isProcessingRef = useRef(false)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [messages])

  // Show initial recommendation when emotion is detected
  useEffect(() => {
    if (
      currentEmotion &&
      isOpen &&
      currentEmotion !== lastProcessedEmotion &&
      !isProcessingRef.current
    ) {
      isProcessingRef.current = true
      setLastProcessedEmotion(currentEmotion)
      handleEmotionRecommendation(currentEmotion)
    }
  }, [currentEmotion, isOpen, lastProcessedEmotion])

  // Reset processing flag when chat is closed
  useEffect(() => {
    if (!isOpen) {
      isProcessingRef.current = false
    }
  }, [isOpen])

  // Fetch chat history from backend on open
  useEffect(() => {
    if (isOpen) {
      getChatHistory().then((msgs) => {
        setMessages(
          msgs.map((m: any, idx: number) => ({
            id: idx + "",
            content: m.message,
            sender: m.sender === "assistant" ? "ai" : "user",
            timestamp: new Date(m.created_at),
          }))
        )
      })
    }
  }, [isOpen])

  const handleEmotionRecommendation = async (emotion: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getEmotionRecommendation(emotion)

      if (result.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: result.recommendation,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        setError("Unable to get recommendation. Please check your API configuration.")
      }
    } catch {
      setError("An error occurred while getting recommendation.")
    } finally {
      setIsLoading(false)
      isProcessingRef.current = false
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    let svmResult: { emotion: string; confidence: number } | undefined = undefined
    try {
      const result = await chatWithGemini(
        inputMessage,
        emotionHistory,
        [...messages, { id: Date.now().toString(), content: inputMessage, sender: "user", timestamp: new Date() }],
        currentEmotion
      )
      svmResult = result.svm
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: "user",
        timestamp: new Date(),
        svmResult: svmResult ? { emotion: svmResult.emotion, confidence: svmResult.confidence } : undefined
      }
      setMessages((prev) => [...prev, userMessage])
      await addChatMessage({ sender: "user", message: inputMessage })
      setInputMessage("")
      if (result.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.response,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        await addChatMessage({ sender: "assistant", message: result.response })
      } else {
        setError("Unable to send message. Please check your API configuration.")
      }
    } catch {
      setError("An error occurred while sending message.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-4 right-4 w-[450px] max-w-[90vw] h-[600px] max-h-[85vh] flex flex-col shadow-lg z-50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>SITOR Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Dapatkan rekomendasi yang dipersonalisasi berdasarkan emosi Anda
          {currentEmotion && (
            <span className="block mt-1 text-sm font-medium">
              Emosi Terkini: <span className="capitalize text-primary">{currentEmotion}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {error && (
          <div className="mx-4 mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4 min-h-0">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Hi! I&apos;m SITOR, your emotional wellness assistant.</p>
                  <p className="text-sm mt-1">I&apos;ll provide recommendations based on your detected emotions.</p>
                </div>
              )}

              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] ${message.sender === "user" ? "order-1" : ""}`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                        }`}
                    >
                      {message.sender === "user" ? (
                        typeof message.content === "string" ? message.content : String(message.content)
                      ) : (
                        <div className="prose prose-sm max-w-none"><ReactMarkdown>{String(message.content)}</ReactMarkdown></div>
                      )}
                    </div>
                    {/* Tampilkan hasil prediksi SVM di bawah pesan user */}
                    {message.sender === "user" && message.svmResult && (
                      <div className="text-xs mt-1 text-right text-blue-600">
                        SVM Prediction: <span className="font-semibold">{message.svmResult.emotion}</span> ({(message.svmResult.confidence * 100).toFixed(1)}%)
                      </div>
                    )}
                    <div
                      className={`text-xs text-muted-foreground mt-1 ${message.sender === "user" ? "text-right" : "text-left"
                        }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>

                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>SITOR is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t p-4 bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Tanyakan apa saja tentang emosi Anda..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
