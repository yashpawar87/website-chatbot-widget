from bs4 import BeautifulSoup
from langchain_core.documents import Document

def build_documents(items: list[dict]) -> list[Document]:
    documents = []
    
    for item in items:
        # Clean HTML content
        text = BeautifulSoup(item["content"], "html.parser").get_text(separator=" ", strip=True)
        
        if text:
            doc = Document(
                page_content=text,
                metadata={
                    "title": item["title"],
                    "url": item["url"],
                    "type": item["type"],
                    "date": item["date"]
                }
            )
            documents.append(doc)
            
    return documents
