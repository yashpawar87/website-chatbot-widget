import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.ingestion.ingest import run_ingestion_pipeline

if __name__ == "__main__":
    print("Syncing latest WordPress content...")
    run_ingestion_pipeline()
