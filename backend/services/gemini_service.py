import os
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, DEFAULT_MODEL
from services.tools_service import execute_calculator, execute_web_search

MODEL_CANDIDATES = [
    DEFAULT_MODEL,
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite"
]

def get_genai_client(api_key: Optional[str] = None) -> genai.Client:
    key = api_key or GEMINI_API_KEY
    if not key or key == "your_gemini_api_key_here":
        raise ValueError("Missing Gemini API Key. Please configure GEMINI_API_KEY in backend/.env or enter your key in UI Settings.")
    return genai.Client(api_key=key)

def safe_generate_content(client: genai.Client, contents: Any, config: Optional[types.GenerateContentConfig] = None):
    """Generates content with automatic fallback if a model experiences 503 capacity limit or 404 error."""
    last_exception = None
    # Deduplicate while preserving order
    seen = set()
    models_to_try = [m for m in MODEL_CANDIDATES if not (m in seen or seen.add(m))]

    for model in models_to_try:
        try:
            return client.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
        except Exception as e:
            err_str = str(e)
            if "503" in err_str or "UNAVAILABLE" in err_str or "404" in err_str or "NOT_FOUND" in err_str or "capacity" in err_str.lower():
                last_exception = e
                continue
            raise e
            
    if last_exception:
        raise last_exception


# Define Tool Functions for Gemini Function Calling
def tool_calculator(expression: str) -> str:
    """Evaluates mathematical expressions safely.
    
    Args:
        expression: A math expression string like '(45 * 12) / 3' or 'sqrt(144)'.
    """
    res = execute_calculator(expression)
    if res.get("success"):
        return f"Calculation Result: {res['result']}"
    return f"Calculation Error: {res.get('error')}"

def tool_web_search(query: str) -> str:
    """Searches the live web for real-time information, news, current facts, or live web data.
    
    Args:
        query: Search query string.
    """
    res = execute_web_search(query)
    if res.get("success") and res.get("results"):
        formatted = "\n\n".join([
            f"Result {i+1}:\nTitle: {r['title']}\nSnippet: {r['snippet']}\nURL: {r['url']}"
            for i, r in enumerate(res['results'])
        ])
        return formatted
    return f"No relevant web search results found for query: {query}"


def generate_chat_response(
    messages: List[Dict[str, str]],
    api_key: Optional[str] = None,
    use_tools: bool = True
) -> Dict[str, Any]:
    """Generates chat response with optional tool calling and automatic model fallback."""
    client = get_genai_client(api_key)
    
    system_instruction = (
        "You are an intelligent, friendly, and highly capable AI Productivity Assistant. "
        "Provide clear, accurate, and visually polished markdown responses. "
        "When asked mathematical or calculation questions, or live/current web search queries, "
        "use the provided tools when appropriate."
    )
    
    contents = []
    for msg in messages:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append(types.Content(
            role=role,
            parts=[types.Part.from_text(text=msg.get("content", ""))]
        ))
        
    tools_list = [tool_calculator, tool_web_search] if use_tools else None
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
        tools=tools_list
    )
    
    tools_used = []
    
    try:
        response = safe_generate_content(client, contents=contents, config=config)
        
        if response.function_calls:
            for call in response.function_calls:
                fn_name = call.name
                fn_args = call.args or {}
                tools_used.append({"tool": fn_name, "args": fn_args})
                
                tool_output = ""
                if fn_name == "tool_calculator":
                    tool_output = tool_calculator(fn_args.get("expression", ""))
                elif fn_name == "tool_web_search":
                    tool_output = tool_web_search(fn_args.get("query", ""))
                
                contents.append(types.Content(
                    role="model",
                    parts=[types.Part.from_function_call(name=fn_name, args=fn_args)]
                ))
                contents.append(types.Content(
                    role="user",
                    parts=[types.Part.from_function_response(name=fn_name, response={"result": tool_output})]
                ))
            
            final_response = safe_generate_content(
                client,
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=system_instruction)
            )
            return {
                "response": final_response.text or "Completed tool execution.",
                "tools_used": tools_used
            }

        return {
            "response": response.text or "No response generated.",
            "tools_used": tools_used
        }

    except Exception as e:
        return {
            "response": f"Error communicating with AI: {str(e)}",
            "tools_used": tools_used,
            "error": str(e)
        }


def analyze_document(
    document_text: str,
    action: str, # "summarize", "qa", "key_topics", "extract_info"
    question: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """Processes document contents strictly based on the document."""
    client = get_genai_client(api_key)
    
    system_instruction = (
        "You are a strict, authoritative Document Intelligence AI. "
        "Base your responses ONLY on the provided document text below. "
        "Do NOT use external knowledge or fabricate facts. If the document does not mention the answer, "
        "explicitly state: 'The provided document does not contain information about this.'"
    )
    
    if action == "summarize":
        prompt = f"Provide a comprehensive summary of the following document. Highlight main themes, executive key takeaways, and section breakdowns:\n\nDOCUMENT:\n{document_text}"
    elif action == "key_topics":
        prompt = f"Identify key topics, core concepts, and important entities from the document:\n\nDOCUMENT:\n{document_text}"
    elif action == "extract_info":
        prompt = f"Extract all important quantitative data, key statistics, dates, rules, action items, and structural takeaways from the document:\n\nDOCUMENT:\n{document_text}"
    elif action == "qa":
        prompt = f"Answer the user's question based strictly ONLY on the document context below.\n\nQUESTION: {question}\n\nDOCUMENT:\n{document_text}"
    else:
        prompt = f"Analyze the following document:\n\n{document_text}"

    try:
        response = safe_generate_content(
            client,
            contents=prompt,
            config=types.GenerateContentConfig(system_instruction=system_instruction, temperature=0.2)
        )
        return {"success": True, "result": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_content(
    content_type: str, # "email", "summary", "social", "report", "meeting_notes"
    user_prompt: str,
    tone: str = "Professional",
    format_style: str = "Markdown",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """Generates tailored copy with specified tone and format."""
    client = get_genai_client(api_key)
    
    system_instruction = (
        f"You are a professional content creator and copywriter. "
        f"Generate high-quality {content_type} based on the user's request. "
        f"Adhere strictly to the requested Tone: '{tone}' and Format: '{format_style}'."
    )
    
    prompt = f"Content Task: Generate a {content_type}\nTone: {tone}\nFormat Style: {format_style}\n\nDetails & Instructions:\n{user_prompt}"

    try:
        response = safe_generate_content(
            client,
            contents=prompt,
            config=types.GenerateContentConfig(system_instruction=system_instruction, temperature=0.7)
        )
        return {"success": True, "result": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}
