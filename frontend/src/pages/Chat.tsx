import { useEffect, useRef, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Send, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import { ChatMessage } from "@/components/ChatMessage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface Dataset {
  id: string
  name: string
}

export default function Chat() {
  const [searchParams] = useSearchParams()
  const datasetId = searchParams.get("dataset")
  const [input, setInput] = useState("")
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: datasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => (await api.get<Dataset[]>("/datasets")).data,
  })

  const { data: history, isLoading } = useQuery({
    queryKey: ["chat-history", datasetId],
    queryFn: async () => (await api.get<Message[]>(`/datasets/${datasetId}/chat/history`)).data,
    enabled: !!datasetId,
  })

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      setPendingMessage(message)
      return api.post(`/datasets/${datasetId}/chat`, { message })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history", datasetId] })
      setPendingMessage(null)
    },
    onError: () => setPendingMessage(null),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history, pendingMessage])

  const handleSend = () => {
    if (!input.trim() || !datasetId) return
    sendMutation.mutate(input.trim())
    setInput("")
  }

  if (!datasetId) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Chat with your data</h1>
        <p className="mt-3 text-sm text-graphite">Select a dataset to start a conversation.</p>
        <div className="mt-6 space-y-2">
          {datasets?.map((d) => (
            <Link
              key={d.id}
              to={`/chat?dataset=${d.id}`}
              className="block rounded-md border border-line px-4 py-3 text-sm hover:border-blueprint dark:border-white/10"
            >
              {d.name}
            </Link>
          ))}
          {datasets?.length === 0 && (
            <p className="font-mono text-xs text-graphite">No datasets yet — upload one first.</p>
          )}
        </div>
      </div>
    )
  }

  const currentDataset = datasets?.find((d) => d.id === datasetId)

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-line px-6 py-4 dark:border-white/10">
        <Link to="/chat" className="text-graphite hover:text-ink dark:hover:text-paper">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="font-display text-sm font-semibold">{currentDataset?.name || "Chat"}</p>
          <p className="font-mono text-xs text-graphite">Ask anything about this dataset</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {isLoading && <p className="font-mono text-xs text-graphite">Loading conversation...</p>}

        {history?.length === 0 && !pendingMessage && (
          <p className="font-mono text-xs text-graphite">
            No messages yet. Try: "What trends should I care about?"
          </p>
        )}

        {history?.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role as "user" | "assistant"} content={msg.content} />
        ))}

        {pendingMessage && (
          <>
            <ChatMessage role="user" content={pendingMessage} />
            <ChatMessage role="assistant" content="Thinking..." />
          </>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line p-4 dark:border-white/10">
        <div className="flex items-center gap-2 rounded-md border border-line px-3 py-2 dark:border-white/10">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about this dataset..."
            className="w-full bg-transparent text-sm outline-none"
            disabled={sendMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={sendMutation.isPending || !input.trim()}
            className="text-blueprint disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}