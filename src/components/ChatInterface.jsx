"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import axios from "axios"


export default function ChatInterface({ videoId }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const { data: session } = useSession()

  useEffect(() => {
    // Fetch existing messages for this video
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chat/${videoId}`)
        setMessages(response.data)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
  }, [videoId])

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "" && session?.user) {
      const newMessage = {
        id: Date.now(),
        user: session.user.name || "Anonymous",
        text: inputMessage.trim(),
      }

      try {
        await axios.post(`/api/chat/${videoId}`, newMessage)
        setMessages([...messages, newMessage])
        setInputMessage("")
      } catch (error) {
        console.error("Error sending message:", error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-800 rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Live Chat</h2>
      </div>
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-semibold">{message.user}: </span>
            <span>{message.text}</span>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t flex">
        <Input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-grow mr-2"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  )
}

