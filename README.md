# ArchPilot

**AI Business Intelligence Platform that transforms raw business data into intelligent insights.**

ArchPilot lets businesses upload their data (CSV/Excel) and talk to it in natural language — asking questions, uncovering trends, detecting anomalies, forecasting future performance, and generating executive-ready reports. A proactive AI Copilot surfaces risks and opportunities automatically, without waiting to be asked.

## Status
🚧 In active development.

## Tech Stack

**Backend:** FastAPI · SQLAlchemy · Alembic · PostgreSQL (Neon) · Pandas · NumPy · Scikit-learn · LangChain · LangGraph · Google Gemini (free tier) · Ollama (fallback)

**Frontend:** React · TypeScript · Tailwind CSS · Shadcn UI · Framer Motion · React Query

**Infra:** Docker · Docker Compose · Vercel (frontend) · Render (backend) · Neon (database)

## Project Structure
\`\`\`
backend/    FastAPI application
frontend/   React + TypeScript application
docs/       Architecture and design docs
tests/      Backend and frontend test suites
scripts/    Utility and dev scripts
sample-data/  Example datasets for demos
assets/     Screenshots and branding assets
\`\`\`

## Getting Started

See \`.env.example\` for required environment variables. Local development instructions will be added as the backend and frontend are scaffolded.

## License

MIT — see [LICENSE](./LICENSE).