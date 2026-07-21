import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-ink text-paper dark:bg-blueprint" : "bg-blueprint/10 text-blueprint"
        )}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2.5 text-sm",
          isUser
            ? "bg-ink text-paper dark:bg-blueprint"
            : "border border-line dark:border-white/10"
        )}
      >
        {content}
      </div>
    </div>
  )
}