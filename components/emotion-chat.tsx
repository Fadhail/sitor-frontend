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

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
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
  const [hasShownRecommendation, setHasShownRecommendation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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
    if (currentEmotion && !hasShownRecommendation && isOpen) {
      handleEmotionRecommendation(currentEmotion)
      setHasShownRecommendation(true)
    }
  }, [currentEmotion, hasShownRecommendation, isOpen])

  // Reset recommendation flag when emotion changes
  useEffect(() => {
    setHasShownRecommendation(false)
  }, [currentEmotion])

  const handleEmotionRecommendation = async (emotion: string) => {
    setIsLoading(true)
    setError(null)

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

    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    const result = await chatWithGemini(inputMessage, emotionHistory)

    if (result.success) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } else {
      setError("Unable to send message. Please check your API configuration.")
    }

    setIsLoading(false)
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
          Get personalized recommendations based on your emotions
          {currentEmotion && (
            <span className="block mt-1 text-sm font-medium">
              Current emotion: <span className="capitalize text-primary">{currentEmotion}</span>
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

              {messages.map((message) => (
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
                      {message.content}
                    </div>
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
              placeholder="Ask me anything about your emotions..."
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
