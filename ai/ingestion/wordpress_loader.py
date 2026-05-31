import requests
from ai.config import ai_config

def load_items(endpoint: str, content_type: str) -> list[dict]:
    url = f"{ai_config.wordpress_url}/wp-json/wp/v2/{endpoint}"
    items = []
    page = 1
    
    while True:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        response = requests.get(url, params={"per_page": 100, "page": page}, headers=headers)
        if response.status_code != 200:
            break
        
        data = response.json()
        if not data:
            break
            
        for item in data:
            items.append({
                "title": item.get("title", {}).get("rendered", ""),
                "content": item.get("content", {}).get("rendered", ""),
                "url": item.get("link", ""),
                "type": content_type,
                "date": item.get("date", "")
            })
        page += 1
        
    return items

def load_pages() -> list[dict]:
    return load_items("pages", "page")

def load_posts() -> list[dict]:
    return load_items("posts", "post")
