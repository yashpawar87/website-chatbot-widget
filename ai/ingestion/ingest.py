import logging
from ai.ingestion.wordpress_loader import load_pages, load_posts
from ai.ingestion.document_builder import build_documents
from ai.rag.chunker import chunk_documents
from ai.rag.vector_store import get_vector_store, reset_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_ingestion_pipeline():
    logger.info("Starting ingestion pipeline...")
    
    # 1. Fetch Pages and Posts
    logger.info("Fetching pages from WordPress...")
    pages_data = load_pages()
    logger.info(f"Fetched {len(pages_data)} pages.")
    
    logger.info("Fetching posts from WordPress...")
    posts_data = load_posts()
    logger.info(f"Fetched {len(posts_data)} posts.")
    
    all_data = pages_data + posts_data
    
    if not all_data:
        logger.warning("No data fetched from WordPress.")
        return
        
    # 2. Build Documents
    logger.info("Building documents...")
    documents = build_documents(all_data)
    logger.info(f"Built {len(documents)} documents.")
    
    # 3. Chunk Documents
    logger.info("Chunking documents...")
    chunks = chunk_documents(documents)
    logger.info(f"Created {len(chunks)} chunks.")
    
    # 4 & 5. Generate Embeddings & Store in Qdrant
    logger.info("Resetting collection to prevent duplicates...")
    reset_collection()
    
    logger.info("Storing chunks in Qdrant...")
    vector_store = get_vector_store()
    vector_store.add_documents(chunks)
    logger.info("Ingestion pipeline completed successfully.")

if __name__ == "__main__":
    run_ingestion_pipeline()
