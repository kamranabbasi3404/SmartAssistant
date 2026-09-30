import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.document_service import extract_text_from_file
from services.gemini_service import (
    generate_chat_response,
    analyze_document,
    generate_content
)
from services.tools_service import execute_calculator, execute_web_search
from config import GEMINI_API_KEY

app = FastAPI(
    title="AI-Powered Smart Assistant API",
    description="FastAPI Backend for AI Productivity Assistant",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    use_tools: Optional[bool] = True

class DocAnalyzeRequest(BaseModel):
    document_text: str
    action: str  # "summarize", "qa", "key_topics", "extract_info"
    question: Optional[str] = None

class ContentGenRequest(BaseModel):
    content_type: str  # "email", "summary", "social", "report", "meeting_notes"
    user_prompt: str
    tone: Optional[str] = "Professional"
    format_style: Optional[str] = "Markdown"

class ToolCalcRequest(BaseModel):
    expression: str

class ToolSearchRequest(BaseModel):
    query: str


@app.get("/api/health")
def health_check(x_api_key: Optional[str] = Header(None)):
    active_key = x_api_key or GEMINI_API_KEY
    has_key = bool(active_key and active_key != "your_gemini_api_key_here")
    return {
        "status": "online",
        "has_api_key": has_key,
        "api_key_configured": has_key,
        "message": "AI Smart Assistant Backend is running smoothly."
    }

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest, x_api_key: Optional[str] = Header(None)):
    key = x_api_key or GEMINI_API_KEY
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    result = generate_chat_response(messages_dict, api_key=key, use_tools=request.use_tools)
    if "error" in result and not result.get("response"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.post("/api/document/upload")
async def upload_document(file: UploadFile = File(...)):
    contents = await file.read()
    res = extract_text_from_file(contents, file.filename)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to parse document."))
    return res

@app.post("/api/document/analyze")
def doc_analyze_endpoint(request: DocAnalyzeRequest, x_api_key: Optional[str] = Header(None)):
    key = x_api_key or GEMINI_API_KEY
    res = analyze_document(
        document_text=request.document_text,
        action=request.action,
        question=request.question,
        api_key=key
    )
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Analysis failed."))
    return res

@app.post("/api/content/generate")
def content_generate_endpoint(request: ContentGenRequest, x_api_key: Optional[str] = Header(None)):
    key = x_api_key or GEMINI_API_KEY
    res = generate_content(
        content_type=request.content_type,
        user_prompt=request.user_prompt,
        tone=request.tone,
        format_style=request.format_style,
        api_key=key
    )
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error", "Generation failed."))
    return res

@app.post("/api/tools/calculator")
def tool_calculator_endpoint(request: ToolCalcRequest):
    return execute_calculator(request.expression)

@app.post("/api/tools/web-search")
def tool_web_search_endpoint(request: ToolSearchRequest):
    return execute_web_search(request.query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
