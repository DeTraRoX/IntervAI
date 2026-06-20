# 🤖 IntervAI — Your AI Powered Interview Coach

<p align="center">
  <img src="https://img.shields.io/badge/AI-Interview%20Platform-8B5CF6?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-black?style=for-the-badge&logo=socket.io" />
</p>

<p align="center">
  <b>An AI-powered mock interview platform that simulates real recruiter interviews.</b>
  <br/>
  Practice • Analyze • Improve • Get Interview Ready
</p>

---

# 📌 Overview

**IntervAI** is a production-level AI mock interview SaaS platform designed to help candidates prepare for technical and HR interviews.

It creates a realistic interview environment by combining:

* AI-generated interview questions
* Resume analysis
* Voice-based conversations
* Coding evaluations
* Performance analytics

IntervAI acts like a personal AI recruiter that evaluates your communication, technical knowledge, problem-solving ability, and interview confidence.

---

# 🚀 Core Features

---

# 🔐 Secure Authentication System

Complete user authentication:

* User registration
* Login system
* JWT-based authorization
* Protected routes
* Secure session management

Technology:

```text
JWT + Express Middleware + MongoDB
```

---

# 📄 AI Resume Analyzer

Upload your resume and get AI-powered insights.

Features:

* Drag & drop PDF upload
* Resume parsing
* Skill extraction
* Project analysis
* Experience evaluation
* Interview customization based on resume

Example:

```text
Upload Resume
        ↓
AI Analysis
        ↓
Personalized Interview
```

---

# 🎯 Smart Interview Setup Wizard

Before starting an interview:

Users can configure:

### Target Role

Examples:

* Frontend Developer
* Backend Developer
* Full Stack Developer
* Data Engineer

### Interview Type

* Technical Round
* HR Round
* Behavioral Round
* Coding Round

### Difficulty Level

* Beginner
* Intermediate
* Advanced

---

# 🎤 AI Recruiter Interview Room

A realistic recruiter simulation.

Features:

## AI Voice Interview

Using browser voice APIs:

* Text-to-Speech (AI speaks questions)
* Speech-to-Text (captures answers)

Flow:

```text
AI asks question
        ↓
Candidate answers
        ↓
AI evaluates response
        ↓
Next question generated
```

---

## 👁️ Camera Attention Tracking

Optional camera mode:

* Live visual monitoring
* Attention feedback
* Interview confidence insights

---

# 💻 AI Coding Interview Lab

Powered by:

```text
Monaco Code Editor
```

Supports:

Languages:

* JavaScript
* Python
* Java
* C++

Features:

* Code writing environment
* Syntax highlighting
* Problem solving evaluation
* Mock compiler testing

---

# 📊 Interview Analytics & Scorecard

After completing an interview:

Receive detailed analysis:

* Overall score
* Technical performance
* Communication rating
* Strength analysis
* Improvement suggestions
* Skill graphs

Includes:

* Circular score indicators
* Competency charts
* Downloadable reports

---

# 🤖 AI Engine

Supports:

## OpenAI Integration

Uses:

* GPT powered question generation
* AI response evaluation
* Resume analysis

## Offline Mock AI Mode

No API key?

No problem.

IntervAI includes a fallback engine:

* Simulated questions
* Resume analysis
* Interview scoring

Perfect for testing.

---

# 🏗️ Technical Architecture

## Frontend

Built using:

* React
* Vite
* Tailwind CSS
* Zustand
* Framer Motion
* Monaco Editor

Responsibilities:

* UI rendering
* Interview flow
* State management
* Voice interaction
* Code editor experience

---

## Backend

Built using:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Socket.io

Responsibilities:

* Authentication
* Resume processing
* AI communication
* Interview management
* Real-time events

---

# 🛠 Technology Stack

## Frontend

| Technology          | Purpose                 |
| ------------------- | ----------------------- |
| ⚛️ React            | UI Framework            |
| ⚡ Vite              | Build Tool              |
| 🎨 Tailwind CSS     | Styling                 |
| 🗃 Zustand          | State Management        |
| 🎞 Framer Motion    | Animations              |
| 💻 Monaco Editor    | Coding Environment      |
| 🔌 Socket.io Client | Real-time communication |

---

## Backend

| Technology    | Purpose              |
| ------------- | -------------------- |
| 🟢 Node.js    | Runtime              |
| 🚂 Express.js | API Framework        |
| 🍃 MongoDB    | Database             |
| 🧬 Mongoose   | ODM                  |
| 🔐 JWT        | Authentication       |
| 📂 Multer     | File Upload Handling |
| ⚡ Socket.io   | Real-time Events     |

---

## AI & Voice

| Technology            | Purpose             |
| --------------------- | ------------------- |
| 🤖 OpenAI API         | AI Interview Engine |
| 🎙 Speech Recognition | Voice Input         |
| 🔊 Speech Synthesis   | AI Voice Output     |
| 📄 PDF Parser         | Resume Extraction   |

---

# 📂 Project Structure

```bash
intervai/

│
├── server/
│
│   ├── config/
│   │   └── Database configuration
│
│   ├── controllers/
│   │   └── Authentication,
│   │       Interview & AI logic
│
│   ├── middleware/
│   │   └── JWT verification,
│   │       Upload validation
│
│   ├── models/
│   │   └── User,
│   │       Resume,
│   │       Interview schemas
│
│   ├── routes/
│   │   └── API endpoints
│
│   ├── services/
│   │   └── AI + PDF processing
│
│   └── server.js
│
│
└── client/

    └── src/

        ├── components/
        │   └── Editor,
        │       Voice UI,
        │       Glass panels

        ├── pages/
        │   └── Dashboard,
        │       Interview Room,
        │       Profile

        └── store/

            └── Zustand states
```

---

# ⚙️ Installation & Setup

## Requirements

Install:

* Node.js 18+
* MongoDB

---

# Clone Repository

```bash
git clone https://github.com/yourusername/intervai.git

cd intervai
```

---

# Backend Setup

```bash
cd server

npm install
```

Create:

```text
.env
```

Add:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/intervai

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173

OPENAI_API_KEY=your_openai_key
```

---

# Start Backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd client

npm install

npm run dev
```

Application:

```text
http://localhost:5173
```

---

# 🔄 Interview Workflow

```text
Register
   ↓
Upload Resume
   ↓
Choose Interview Type
   ↓
AI Generates Questions
   ↓
Voice Interview Session
   ↓
Coding Evaluation
   ↓
Performance Report
```

---

# 🌟 Future Roadmap

Planned features:

* [ ] AI personality analysis
* [ ] Real-time facial emotion insights
* [ ] Company-specific interview modes
* [ ] Resume improvement suggestions
* [ ] Interview history dashboard
* [ ] Mobile application
* [ ] Multi-language interviews

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature-name

git commit -m "Added feature"

git push origin feature-name
```

Create a Pull Request.

---

# 📜 License

Licensed under ISC License.

---

<p align="center">
Built with ❤️ using MERN + AI
</p>

<p align="center">
⭐ Star this repository if you like IntervAI
</p>
