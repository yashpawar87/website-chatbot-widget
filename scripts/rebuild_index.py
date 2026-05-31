import sys
import os

# Ensure the root directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.ingestion.ingest import run_ingestion_pipeline

if __name__ == "__main__":
    print("Starting full re-index...")
    run_ingestion_pipeline()
    print("Re-indexing complete.")
