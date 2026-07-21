from typing import TypedDict

import pandas as pd
from langgraph.graph import StateGraph, END

from app.services.analytics.anomaly_detection import detect_column_anomalies, detect_categorical_concentration
from app.services.ai.llm_provider import generate_response


class CopilotState(TypedDict):
    df: pd.DataFrame
    dataset_name: str
    trends: list[str]
    anomalies: list[str]
    opportunities: list[str]
    insights: list[dict]


def analyze_trends_node(state: CopilotState) -> CopilotState:
    df = state["df"]
    trends = []
    numeric_cols = df.select_dtypes(include="number").columns

    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 3:
            continue
        first_half = series.iloc[: len(series) // 2].mean()
        second_half = series.iloc[len(series) // 2 :].mean()
        if first_half == 0:
            continue
        change = ((second_half - first_half) / abs(first_half)) * 100
        if abs(change) >= 10:
            direction = "increased" if change > 0 else "decreased"
            trends.append(f"'{col}' has {direction} by approximately {abs(round(change, 1))}% across the dataset.")

    state["trends"] = trends
    return state


def detect_anomalies_node(state: CopilotState) -> CopilotState:
    df = state["df"]
    anomaly_map = detect_column_anomalies(df)
    concentration_map = detect_categorical_concentration(df)

    anomalies = []
    for col, indices in anomaly_map.items():
        anomalies.append(f"'{col}' has {len(indices)} statistical outlier(s) that deviate sharply from the norm.")

    for col, info in concentration_map.items():
        anomalies.append(
            f"'{col}' is highly concentrated — '{info['top_value']}' accounts for "
            f"{int(info['share'] * 100)}% of all records."
        )

    state["anomalies"] = anomalies
    return state


def detect_opportunities_node(state: CopilotState) -> CopilotState:
    df = state["df"]
    opportunities = []
    numeric_cols = df.select_dtypes(include="number").columns

    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr(numeric_only=True)
        for i, col_a in enumerate(numeric_cols):
            for col_b in numeric_cols[i + 1 :]:
                value = corr.loc[col_a, col_b]
                if pd.notna(value) and abs(value) >= 0.7:
                    relation = "positively" if value > 0 else "negatively"
                    opportunities.append(
                        f"'{col_a}' and '{col_b}' are strongly {relation} correlated "
                        f"(r={round(float(value), 2)}) — worth investigating as a lever."
                    )

    state["opportunities"] = opportunities
    return state


def synthesize_insights_node(state: CopilotState) -> CopilotState:
    findings = state["trends"] + state["anomalies"] + state["opportunities"]

    if not findings:
        state["insights"] = [{
            "category": "summary",
            "severity": "info",
            "title": "No significant patterns detected",
            "description": "This dataset appears stable with no strong trends, anomalies, or correlations found.",
        }]
        return state

    system_prompt = """You are ArchPilot's Business Copilot. Given a list of raw
statistical findings about a business dataset, turn each one into a short,
board-ready insight. For each finding, respond with exactly one line in this
format, no extra commentary:
CATEGORY|SEVERITY|TITLE|DESCRIPTION

CATEGORY is one of: trend, anomaly, opportunity, risk
SEVERITY is one of: info, warning, critical
TITLE is under 8 words. DESCRIPTION is one business-focused sentence."""

    findings_text = "\n".join(f"- {f}" for f in findings)
    raw_output = generate_response(system_prompt, findings_text)

    insights = []
    for line in raw_output.strip().split("\n"):
        parts = line.split("|")
        if len(parts) == 4:
            category, severity, title, description = [p.strip() for p in parts]
            insights.append({
                "category": category.lower(),
                "severity": severity.lower(),
                "title": title,
                "description": description,
            })

    if not insights:
        insights = [{
            "category": "summary",
            "severity": "info",
            "title": "Analysis complete",
            "description": f"Found {len(findings)} notable pattern(s) in this dataset.",
        }]

    state["insights"] = insights
    return state


def build_copilot_graph():
    graph = StateGraph(CopilotState)
    graph.add_node("analyze_trends", analyze_trends_node)
    graph.add_node("detect_anomalies", detect_anomalies_node)
    graph.add_node("detect_opportunities", detect_opportunities_node)
    graph.add_node("synthesize_insights", synthesize_insights_node)

    graph.set_entry_point("analyze_trends")
    graph.add_edge("analyze_trends", "detect_anomalies")
    graph.add_edge("detect_anomalies", "detect_opportunities")
    graph.add_edge("detect_opportunities", "synthesize_insights")
    graph.add_edge("synthesize_insights", END)

    return graph.compile()


def run_copilot_analysis(df: pd.DataFrame, dataset_name: str) -> list[dict]:
    app = build_copilot_graph()
    result = app.invoke({
        "df": df,
        "dataset_name": dataset_name,
        "trends": [],
        "anomalies": [],
        "opportunities": [],
        "insights": [],
    })
    return result["insights"]