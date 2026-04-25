# Codespace Backend Documentation

Welcome to the backend documentation for **Codespace**, a gamified coding platform. This document provides an overview of the architecture, folder structure, core modules, and real-time event mechanisms used in the backend.

## 1. Architectural Overview & Tech Stack

The backend is built with a modern Node.js stack using TypeScript. It leverages a combination of RESTful APIs and real-time WebSockets to deliver a responsive, interactive coding experience.

- **Framework:** Express.js (Node.js) with TypeScript.
- **Database:** MongoDB via Mongoose.
- **Caching & Message Queue:** Redis & BullMQ (used extensively for background code execution).
- **Real-Time Communication:** Socket.io (used for Matchmaking, Chat, and real-time execution results).
- **Authentication:** Passport.js with JWT strategies.
- **External Integrations:** 
  - Azure Storage Blob (for handling images, profile pictures, and blog media).
  - Hugging Face / Google Generative AI (Gemini) for AI-driven insights and code analysis.
  - Nodemailer for email communications.

## 2. Directory Structure

The project follows a modular monolithic approach. The root directory contains several key folders:

```text
/
├── App.ts                 # Application entry point (Express setup, Socket.io initialization, Worker initialization).
├── Config/                # Configuration files for Database (Mongoose), Redis, and WebSockets.
├── Controllers/           # Route controllers housing the business logic (Auth, Blogs, Challenge, Events, Questions, User, Validators).
├── Interfaces/            # TypeScript interfaces defining object shapes across the application.
├── Middlewares/           # Express middlewares (Authentication, validation, error handling).
├── Models/                # Mongoose schema definitions (Users, Challenges, Blogs, Events, MatchMaking, Questions).
├── Routes/                # Express route definitions pointing to specific controllers.
├── Services/              # Reusable logic services (AuthServices, ChallengeServices, emailServices).
├── Utility/               # Helper and utility functions.
└── Workers/               # Background workers, primarily using BullMQ for code execution.
```

## 3. Core Modules & Workflows

### Authentication
- Located in `Controllers/Authentication/` and `Routes/Auth/`.
- Uses **Passport.js** and **jsonwebtoken**.
- Responsible for user registration, login, and token generation/verification.

### Challenges & Matchmaking
- A core feature allowing users to compete in coding matches.
- **Matchmaking Service (`Services/ChallengeServices/matchmakingService.ts`)**: Handles queueing users based on criteria.
- Uses **Socket.io** to notify clients when a match is found (`queued`, `match_found` events).

### Code Execution Worker (BullMQ)
- When a user submits code, a job is pushed to a **BullMQ** queue (`code-execution`).
- `Workers/Challenges/CodeWorker.ts` picks up the job.
- It leverages `CodeCompilerServices.runSingleTestCase` to compile and run the submitted code securely.
- Real-time updates on execution progress and results are sent back via Socket.io (`code_result` event).

### Content & Profiles
- **Blogs**: Complete CRUD implementation for platform articles/blogs.
- **Events/Contests**: Management of coding contests (`Contest.ts`, `ContestRound.ts`, `ContestMatch.ts`).
- **Users**: Detailed profile management, user statistics (`UserStats.ts`), and pending user flows (`PendingUsers.ts`).

## 4. Database Models

The models are divided into distinct domains:

- **Users (`Models/Users`)**: `Users.ts`, `UserProfile.ts`, `UserStats.ts`, `PendingUsers.ts`.
- **Challenges (`Models/Challenges`)**: `Question.ts` (coding problems), `MatchMaking.ts` (queue state), `User-Challenges.ts`.
- **Events (`Models/Events/Contest`)**: `Contest.ts`, `ContestMatch.ts`, `ContestRound.ts`, `ContestMatchSubmission.ts`.
- **Blog (`Models/Blog`)**: `Blog.ts`.

## 5. API Routes Overview

Defined in `Routes/index.ts`, all routes are prefixed with `/api`.

| Route Prefix | Description |
| :--- | :--- |
| `/api/auth` | Authentication endpoints (Login, Register, Password Reset). |
| `/api/users` | Profile retrieval, user statistics, avatar updates. |
| `/api/challenge` | Submitting code, retrieving challenges, challenge history. |
| `/api/questions` | CRUD and retrieval of coding problems/questions. |
| `/api/blogs` | Blog creation, reading, and comments. |
| `/api/events/contest` | Accessing active contests, rounds, and contest leaderboards. |
| `/api/extra` | Additional utilities and auxiliary routes. |

## 6. Real-Time Sockets (Socket.io)

Socket.io is initialized in `App.ts` and `Config/socket.ts`.

**Incoming Events (Client to Server):**
- `register`: Associates a user ID with a specific socket ID. A user can have multiple active sockets.
- `join_queue`: User attempts to find a match. Triggers `MatchmakingService.joinMatchmaking()`.
- `disconnect`: Cleans up active socket tracking and removes user from the matchmaking queue.

**Outgoing Events (Server to Client):**
- `queued`: Notifies the client they are searching for a match.
- `code_result`: Emitted by `CodeWorker.ts` to deliver the output of submitted code execution.
- `error_message`: Standardized error emission for socket interactions.

## 7. Environment Variables

Below are the required environment variables found in `.env`:

```env
MONGO_URL=                 # MongoDB Connection String
REACT_APP_BASE_URL=        # Allowed CORS Origin for Frontend
JWT_SECRET=                # Secret key for signing JWTs
NODE_ENV=                  # development | production
PORT=                      # Server Port (default: 8080)

# Email Configuration
EMAIL_USER=                # Nodemailer Sender Email
EMAIL_PASS=                # Nodemailer App Password

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_BLOG_CONTAINER_NAME=
AZURE_STORAGE_PROFILE_CONTAINER_NAME=

# AI Integrations
GEMINI_API_KEY=            # Google Generative AI API Key
HF_TOKEN=                  # Hugging Face Access Token
```

## Running Locally

1. Install dependencies: `npm install`
2. Ensure you have **MongoDB** and **Redis** running locally (or use cloud instances and set your `.env` appropriately).
3. Start the application:
   - Development: `npm run dev`
   - Production: `npm start`
