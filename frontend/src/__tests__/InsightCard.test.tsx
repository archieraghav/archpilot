import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { InsightCard } from "@/components/InsightCard"

describe("InsightCard", () => {
  it("renders title, description, and category", () => {
    render(
      <InsightCard
        id="1"
        category="trend"
        severity="info"
        title="Revenue Growth"
        description="Revenue has increased significantly."
      />
    )
    expect(screen.getByText("Revenue Growth")).toBeInTheDocument()
    expect(screen.getByText("Revenue has increased significantly.")).toBeInTheDocument()
    expect(screen.getByText("trend")).toBeInTheDocument()
  })

  it("shows the correct severity badge text", () => {
    render(
      <InsightCard
        id="2"
        category="anomaly"
        severity="warning"
        title="Outlier Detected"
        description="A value deviates from the norm."
      />
    )
    expect(screen.getByText("warning")).toBeInTheDocument()
  })
})