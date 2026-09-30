import io
from typing import Dict, Any
from pypdf import PdfReader
from docx import Document

def extract_text_from_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Extracts text content and metadata from PDF, DOCX, or TXT files."""
    ext = filename.split('.')[-1].lower()
    text = ""
    pages = 1
    
    try:
        if ext == 'pdf':
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            pages = len(reader.pages)
            extracted_pages = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                extracted_pages.append(f"--- Page {idx + 1} ---\n{page_text}")
            text = "\n\n".join(extracted_pages)
            
        elif ext in ['docx', 'doc']:
            docx_file = io.BytesIO(file_bytes)
            doc = Document(docx_file)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n\n".join(paragraphs)
            pages = max(1, len(text) // 2000)
            
        elif ext in ['txt', 'md', 'json', 'csv']:
            text = file_bytes.decode('utf-8', errors='ignore')
            pages = max(1, len(text) // 2000)
            
        else:
            raise ValueError(f"Unsupported file format: .{ext}")

        word_count = len(text.split())
        char_count = len(text)

        return {
            "success": True,
            "filename": filename,
            "ext": ext,
            "text": text,
            "pages": pages,
            "word_count": word_count,
            "char_count": char_count
        }

    except Exception as e:
        return {
            "success": False,
            "filename": filename,
            "error": str(e)
        }
