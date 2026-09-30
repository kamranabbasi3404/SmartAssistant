import math
import re
import requests
from typing import Dict, Any, List
from duckduckgo_search import DDGS

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
    """Performs a live web search using DuckDuckGo."""
    try:
        results = []
        with DDGS() as ddgs:
            ddg_results = ddgs.text(query, max_results=max_results)
            for item in ddg_results:
                results.append({
                    "title": item.get("title", ""),
                    "snippet": item.get("body", ""),
                    "url": item.get("href", "")
                })
        
        if not results:
            return {"success": False, "message": "No search results found.", "results": []}
            
        return {"success": True, "query": query, "results": results}
    except Exception as e:
        return {"success": False, "error": str(e), "results": []}
