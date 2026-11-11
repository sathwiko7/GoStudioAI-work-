# GoStudio AI — Intelligent Creative Studio

An AI-assisted creative workspace for generating, editing, organising, and comparing visual content through a single web application. GoStudio AI combines a React interface with a Python FastAPI backend, prompt understanding, image-processing utilities, reusable creative templates, and a media library.

> **Project status:** Actively developed. This repository contains a working full-stack prototype. Some integrations and operational features are still being improved; see [Current implementation and limitations](#current-implementation-and-limitations) for details.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Using the Application](#using-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Current Implementation and Limitations](#current-implementation-and-limitations)
- [Roadmap](#roadmap)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

---

## Overview

Creating marketing visuals and product creatives often involves switching between several tools for image generation, background editing, layout design, and asset management. This project explores how an intelligent creative workspace can bring common tasks together behind a natural-language interface.

A user can describe the creative output they need. The application analyses the request, creates a structured task plan, and routes the request to the relevant generation or image-editing workflow. Users can then work with the result in the editor, explore templates, and manage generated assets in their media library.

## Problem Statement

Creating consistent, high-quality visual content can require design experience, multiple applications, and repetitive manual work. The goal of GoStudio AI is to simplify this workflow by providing a unified workspace where users can describe a task, generate or edit visual assets, and organise their creative work.

## Key Features

### 1. Intelligent Studio and Prompt Understanding
- Accepts creative requests written in natural language.
- Extracts task type, subject, background, style, and aspect ratio into a structured plan.
- Enhances prompts with additional visual and photography-oriented details.
- Uses an OpenAI-compatible prompt-analysis request when an OpenAI API key is configured; otherwise, a rule-based prompt analyser is used.

### 2. AI-Assisted Image Generation
- Text-to-image generation workflow.
- Supports configurable aspect ratios and visual styles.
- Records generation details such as prompt, selected model identifier, processing time, and estimated cost.
- Saves generated assets for access through the media library.

### 3. Creative Image Editor
- Uploads images for editing.
- Includes background removal and background replacement workflows.
- Provides image adjustment and creative text-overlay utilities.
- Supports moving an image from other workspaces into the editor.

### 4. Model Arena
- Displays a catalogue of model options and their configured metadata.
- Provides a side-by-side comparison workflow for selected model identifiers.
- Shows generated results and comparison information in one workspace.

### 5. Creative Template Gallery
- Provides reusable layouts for common creative and promotional content.
- Supports template-based poster and social-content workflows.
- Helps users start from a layout instead of building every design from scratch.

### 6. Media Library and Projects
- Stores references to generated media and user projects.
- Supports browsing and managing creative assets.
- Includes media actions such as favourites and deletion where available in the interface.

### 7. User Authentication
- Registration and login endpoints.
- JWT-based authentication.
- Password hashing on the backend.

### 8. Analytics Workspace
- Includes an admin-oriented analytics interface and API endpoints for usage information.
- Tracks generation-related records and usage metadata.

### 9. API and Live Status Interface
- FastAPI endpoints are organised by feature area.
- A WebSocket endpoint is included for generation-status updates.
- Static upload and generated-media directories are served by the backend.

---

## How It Works

A typical creative workflow is:

1. **Describe:** The user enters a request in the Intelligent Studio.
2. **Understand:** The backend analyses the prompt and builds a structured task plan.
3. **Route:** The agent workflow selects the relevant operation, such as image generation, editing, or template creation.
4. **Process:** The backend runs the applicable generation or image-processing service.
5. **Review:** The user views the result and can continue editing it.
6. **Organise:** Media and project information can be accessed from the library and project views.

### High-Level Architecture

```text
                     ┌──────────────────────────────┐
                     │        React Frontend        │
                     │  Studio • Editor • Templates │
                     │  Model Arena • Media Library │
                     └──────────────┬───────────────┘
                                    │ HTTP / WebSocket
                                    ▼
                     ┌──────────────────────────────┐
                     │       FastAPI Backend        │
                     │ Auth • Agent • Generation    │
                     │ Editing • Projects • Media   │
                     │ Templates • Analytics        │
                     └──────────────┬───────────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               ▼                    ▼                    ▼
      ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
      │ Prompt Analysis │  │ Image Services  │  │ SQLAlchemy ORM  │
      │ & Agent Routing │  │ Generation and  │  │ SQLite by       │
      │                 │  │ Image Processing│  │ default         │
      └─────────────────┘  └─────────────────┘  └─────────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
      ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
      │ OpenAI API      │  │ Online image    │  │ Local media     │
      │ (optional)      │  │ endpoint / local│  │ and database    │
      │                 │  │ fallback        │  │ storage         │
      └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Lucide React |
| Backend | Python, FastAPI, Uvicorn |
| Database / ORM | SQLite (default), SQLAlchemy |
| Authentication | JWT, bcrypt password hashing |
| Validation / Settings | Pydantic, Pydantic Settings |
| AI prompt analysis | OpenAI API (optional), rule-based fallback |
| Image generation | Pollinations online image endpoint with local procedural fallback |
| Image processing | Pillow, NumPy |
| HTTP client | HTTPX |
| API testing | FastAPI interactive docs, pytest test scripts |
| Realtime interface | WebSocket |

---

## Project Structure

```text
GoStudioAI2.0/
│
├── backend/
│   ├── api/
│   │   ├── auth.py                 # Registration, login and user endpoints
│   │   ├── agent.py                # Prompt understanding and agent endpoints
│   │   ├── generation.py           # Image generation endpoint
│   │   ├── editing.py              # Image upload and editing endpoints
│   │   ├── models_comparison.py    # Model catalogue and comparison
│   │   ├── templates.py            # Creative template endpoints
│   │   ├── media.py                # Media library endpoints
│   │   ├── projects.py             # Project management endpoints
│   │   └── analytics.py            # Analytics endpoints
│   │
│   ├── core/
│   │   ├── config.py               # Application and provider configuration
│   │   ├── database.py             # Database engine and session setup
│   │   └── security.py             # Password and JWT utilities
│   │
│   ├── models/
│   │   ├── db_models.py            # SQLAlchemy database models
│   │   └── schemas.py              # Pydantic request/response schemas
│   │
│   ├── services/
│   │   ├── agent_service.py        # Agent workflow and tool routing
│   │   ├── generation_service.py   # Image generation service
│   │   ├── image_service.py        # Image processing utilities
│   │   ├── llm_service.py          # Prompt analysis and enhancement
│   │   └── templates_service.py    # Template rendering utilities
│   │
│   ├── static/
│   │   ├── uploads/                # Uploaded assets (created/used at runtime)
│   │   ├── generated/              # Generated assets (created at runtime)
│   │   └── templates/              # Template assets
│   │
│   └── main.py                     # FastAPI application entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Studio, editor, arena, gallery, library, etc.
│   │   ├── context/                # Authentication context
│   │   ├── services/               # Frontend API client
│   │   ├── App.jsx                 # Main application component
│   │   └── main.jsx                # Frontend entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── tests/                          # API and module test scripts
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following before running the application:

- Python 3.10 or later
- Node.js 18 or later
- npm
- Git

### Backend Setup

Run these commands from the repository root.

**1. Create and activate a virtual environment**

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**2. Install backend dependencies**

```bash
pip install fastapi "uvicorn[standard]" sqlalchemy pydantic pydantic-settings python-jose bcrypt email-validator python-multipart httpx pillow numpy pytest
```

**3. Configure environment variables**

The current settings module reads configuration from the process environment. Set the variables in the terminal before starting the backend.

Windows PowerShell:

```powershell
$env:SECRET_KEY="replace_with_a_long_random_secret"
$env:DATABASE_URL="sqlite:///./backend/gostudio.db"
$env:OPENAI_API_KEY=""
$env:SKIP_ONLINE_FETCH="false"
```

macOS / Linux:

```bash
export SECRET_KEY="replace_with_a_long_random_secret"
export DATABASE_URL="sqlite:///./backend/gostudio.db"
export OPENAI_API_KEY=""
export SKIP_ONLINE_FETCH="false"
```

Other optional/reserved provider variables are listed in the [Environment Variables](#environment-variables) table. `OPENAI_API_KEY` is optional. Without it, prompt understanding uses the built-in rule-based analyser. Do not commit `.env` files or real API credentials to GitHub. (Automatic `.env` loading is not configured in the current code.)

**4. Start the backend**

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at:

- API root: `http://127.0.0.1:8000/`
- Interactive Swagger documentation: `http://127.0.0.1:8000/docs`
- ReDoc documentation: `http://127.0.0.1:8000/redoc`

The application creates the SQLite database and its tables during startup if they do not already exist.

### Frontend Setup

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. By default, it is:

```text
http://localhost:5173
```

The Vite development server is configured to proxy `/api`, `/static`, and `/ws` requests to the backend at port `8000`. Keep the backend running while using the frontend.

### Environment Variables

| Variable | Purpose | Required? |
|---|---|---|
| `SECRET_KEY` | Signs JWT access tokens | Set a strong value for every non-local environment |
| `DATABASE_URL` | SQLAlchemy database connection string | No; SQLite is the default |
| `OPENAI_API_KEY` | Enables OpenAI-based prompt analysis | Optional |
| `GEMINI_API_KEY` | Reserved provider configuration | Not currently used by the prompt-analysis service |
| `STABILITY_API_KEY` | Reserved image-provider configuration | Not currently wired as a generation provider |
| `REPLICATE_API_TOKEN` | Reserved image-provider configuration | Not currently wired as a generation provider |
| `SKIP_ONLINE_FETCH` | Set to `true` to skip the online image fetch and use the local fallback | No |

---

## Using the Application

Once both servers are running, explore the main workspaces:

1. **Intelligent Studio** — enter a natural-language creative request and review the analysed task.
2. **Model Arena** — select model entries and try the comparison workflow.
3. **Creative Editor** — upload an image and try the available editing tools.
4. **Template Gallery** — browse and use the available creative layouts.
5. **Media Library** — view and manage generated or uploaded assets.
6. **Analytics** — view the analytics interface (access and data depend on the current user role and implementation).

For the exact request formats and available endpoints, use the interactive API documentation at `/docs`.

---

## API Documentation

The backend groups endpoints by feature. The exact routes and request schemas are available in Swagger UI at `http://127.0.0.1:8000/docs` after starting the server.

| API module | Responsibility |
|---|---|
| Authentication | User registration, login, and current-user details |
| Agent | Prompt analysis and agent workflow execution |
| Generation | Image generation requests |
| Editing | Image upload and image-editing operations |
| Models | Model catalogue and comparison workflow |
| Templates | Listing and applying creative templates |
| Media | Media library operations |
| Projects | Project creation and management |
| Analytics | Usage and administrative analytics |

---

## Testing

The repository includes test scripts under `tests/`:

```text
tests/
├── smoke_test.py
├── test_all_modules.py
├── test_async.py
└── verify_modules_direct.py
```

Install `pytest` and any test-specific dependencies, start the backend if a test requires a running API, and run the relevant test file. For example:

```bash
pytest tests/ -v
```

Test results may depend on environment variables, network availability, and whether the backend is running. Do not describe the project as fully tested unless the tests have been run successfully in your own environment.

---

## Current Implementation and Limitations

This repository is an evolving prototype. The following distinctions are important when evaluating or extending it:

- **Prompt analysis:** OpenAI prompt analysis is optional. The application falls back to deterministic, rule-based prompt analysis when no OpenAI key is configured or the request fails.
- **Image generation:** The current generation service attempts to fetch an image from an online Pollinations endpoint and falls back to a locally generated Pillow/NumPy composition if that request is unavailable. The local fallback is a procedural composition, not a generative AI model.
- **Model catalogue:** The interface contains several model entries, but listing a model does not by itself mean that a dedicated provider integration exists for it. Provider-specific adapters and verified model-to-provider routing are ongoing work.
- **Background jobs:** The backend includes a WebSocket status endpoint, but a production job queue such as Redis and Celery is not currently part of this codebase.
- **Analytics:** Analytics views and endpoints are present. Validate each metric against persisted database records before using the figures as production usage or billing data.
- **Production readiness:** Review authentication defaults, role assignment, secret management, file validation, CORS policy, and access controls before deploying publicly.

These are active development areas, not claims that the corresponding production-grade capabilities are complete.

---

## Roadmap

Planned improvements include:

- [ ] Strengthen authentication, role management, and authorization.
- [ ] Add dedicated integrations for multiple real image-generation providers.
- [ ] Make model selection dispatch requests to the selected provider.
- [ ] Expand the agent to plan and execute multi-step editing workflows.
- [ ] Add reliable asynchronous generation jobs and persistent job status.
- [ ] Calculate analytics from verified database records.
- [ ] Add generation feedback and image ratings.
- [ ] Add before-and-after image comparison.
- [ ] Improve prompt and upload moderation, validation, and rate limiting.
- [ ] Add broader automated tests and deployment documentation.

---

## Security Notes

Before making this repository public or deploying it:

1. Do not commit `.env`, API keys, access tokens, passwords, or private configuration.
2. Replace the development JWT secret with a strong secret supplied through the environment.
3. Review and remove or change any seeded demo accounts and passwords in the backend startup code.
4. Ensure users cannot assign themselves privileged roles during registration.
5. Require authentication and authorisation for private media, project, and analytics operations.
6. Validate uploaded file type, size, and content; do not trust a filename or browser-provided MIME type alone.
7. Restrict CORS origins for production instead of allowing every origin.
8. Avoid committing local database files, uploaded user content, generated files, caches, or dependency folders.

---

## Contributing

Contributions, bug reports, and suggestions are welcome. If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Run the relevant tests and frontend build.
5. Open a pull request describing the change and how it was tested.

---

## Disclaimer

GoStudio AI is an independent portfolio and learning project. It is not an official GoStudio AI product, and it is not affiliated with, endorsed by, or developed on behalf of GoStudio AI or any of the third-party AI model providers mentioned in the application. Product names and trademarks belong to their respective owners.

---

**Built as an ongoing full-stack project exploring AI-assisted creative workflows, agent-based tool routing, image processing, and product engineering.**
