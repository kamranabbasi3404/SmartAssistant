# 🤖 AI-Powered Smart Assistant Application

An enterprise-grade **AI Productivity Assistant** built using **Python FastAPI** backend and **React (Vite) + CSS** frontend, powered by the **Google Gemini API**, autonomous agent function calling, document intelligence, and content generation tools.

---

## 🚀 Key Features

1. **💬 AI Chat Interface**:
   - Multi-turn conversation context retention.
   - Autonomous tool execution badges (Calculator, Live Web Search).
   - Prompt suggestions and auto-collapsible sidebar for maximum chat screen space.

2. **📄 Document Intelligence Studio**:
   - Multi-format document parser (**PDF**, **DOCX**, **TXT**).
   - Strict Context Q&A (answers strictly based on uploaded document).
   - Summarization, Key Topic Identification, and Information Extraction.

3. **✍️ AI Content Generation Studio**:
   - Multi-template copy generator (**Emails, Social Posts, Executive Reports, Meeting Notes, Summaries**).
   - Tone & format customization controls.
   - One-click copy to clipboard & download options.

4. **⚙️ AI Agent & Autonomous Tools**:
   - **Tool 1: Calculator & Math Engine**: Evaluates math expressions, square roots, trig, and power functions.
   - **Tool 2: Live Web Search**: Queries DuckDuckGo web search engine for real-time web results.
   - **Autonomous Function Routing**: AI decides when to call tools based on prompt context.

---

## 🛠️ Project Structure

```
AI-PoweredSmartAssistant/
├── backend/
│   ├── main.py                  # FastAPI application endpoints
│   ├── config.py                # Environment configuration
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variables template
│   └── services/
│       ├── gemini_service.py    # Google GenAI SDK integration
│       ├── document_service.py  # PDF, DOCX, TXT parsers
│       └── tools_service.py     # Calculator & Web Search tools
└── frontend/
    ├── package.json             # React dependencies
    ├── vite.config.js           # Vite configuration
    └── src/
        ├── App.jsx              # Main App component & sidebar state
        ├── index.css            # Dark mode & glassmorphism theme styling
        └── components/
            ├── Sidebar.jsx              # Collapsible navigation menu
            ├── Header.jsx               # Header & sidebar toggle button
            ├── ChatInterface.jsx        # Feature 1: AI Chat Interface
            ├── DocumentIntelligence.jsx # Feature 2: Document Intelligence
            ├── ContentGenerator.jsx     # Feature 3: Content Generator Studio
            ├── AgentTools.jsx           # Feature 4: Agent & Tools Tester
            └── ApiKeyModal.jsx          # Gemini API Key configuration modal
```

---

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/kamranabbasi3404/SmartAssistant.git
cd SmartAssistant
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
```

Start the FastAPI backend server:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser to start using the assistant!

---

## 📄 License
MIT License. Built with Google Gemini API & FastAPI.
