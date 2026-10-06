import math
import re
import requests
from typing import Dict, Any, List

def get_ddgs_instance():
    try:
        from ddgs import DDGS
        return DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS
            return DDGS
        except ImportError:
            return None

def execute_calculator(expression: str) -> Dict[str, Any]:
    """Safely evaluates a mathematical expression."""
    try:
        # Clean expression
        expr = expression.strip()
        expr = expr.replace('^', '**').replace('×', '*').replace('÷', '/')
        
        # Allowed names in math domain
        allowed_names = {
            'abs': abs, 'round': round, 'min': min, 'max': max,
            'pow': pow, 'sqrt': math.sqrt, 'sin': math.sin, 'cos': math.cos,
            'tan': math.tan, 'pi': math.pi, 'e': math.e, 'log': math.log,
            'log10': math.log10, 'ceil': math.ceil, 'floor': math.floor
        }
        
        # Security check: disallow dunder or malicious tokens
        if re.search(r'__|[a-zA-Z_][a-zA-Z0-9_]*\s*\(', expr):
            # Check if all function calls match allowed names
            funcs = re.findall(r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', expr)
            for f in funcs:
                if f not in allowed_names:
                    return {"success": False, "error": f"Function '{f}' is not allowed for security."}

        # Evaluate expression safely
        result = eval(expr, {"__builtins__": None}, allowed_names)
        return {"success": True, "expression": expression, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

def execute_web_search(query: str, max_results: int = 4) -> Dict[str, Any]:
    """Performs a live web search using DuckDuckGo with fallback."""
    results = []
    
    # 1. Primary: Use ddgs / duckduckgo_search
    DDGSClass = get_ddgs_instance()
    if DDGSClass:
        try:
            with DDGSClass() as ddgs:
                ddg_results = ddgs.text(query, max_results=max_results)
                for item in ddg_results:
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("body", ""),
                        "url": item.get("href", "")
                    })
        except Exception as e:
            print(f"[DDGS SEARCH WARNING] {e}")

    # 2. Fallback: Wikipedia Search API if DDGS returned 0 results
    if not results:
        try:
            wiki_res = requests.get(
                "https://en.wikipedia.org/w/api.php",
                params={
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "format": "json",
                    "utf8": 1
                },
                timeout=6
            )
            if wiki_res.status_code == 200:
                search_data = wiki_res.json().get("query", {}).get("search", [])
                for item in search_data[:max_results]:
                    clean_snippet = re.sub(r'<[^>]+>', '', item.get("snippet", ""))
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": clean_snippet,
                        "url": f"https://en.wikipedia.org/wiki/{item.get('title', '').replace(' ', '_')}"
                    })
        except Exception as e:
            print(f"[WIKI SEARCH FALLBACK WARNING] {e}")

    if not results:
        return {"success": False, "message": "No relevant search results found.", "results": []}
        
    return {"success": True, "query": query, "results": results}
