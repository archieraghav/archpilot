import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ChatMessage } from "@/components/ChatMessage"

describe("ChatMessage", () => {
  it("renders user message content", () => {
    render(<ChatMessage role="user" content="What is the average revenue?" />)
    expect(screen.getByText("What is the average revenue?")).toBeInTheDocument()
  })

  it("renders assistant message content", () => {
    render(<ChatMessage role="assistant" content="The average is 1500." />)
    expect(screen.getByText("The average is 1500.")).toBeInTheDocument()
  })
})