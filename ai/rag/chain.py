import logging
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from ai.config import ai_config
from ai.rag.retriever import get_retriever
from ai.rag.prompts import QA_PROMPT, CONDENSE_QUESTION_PROMPT

logger = logging.getLogger(__name__)

# Initialize LLM globally to prevent re-initialization on every request
llm = ChatGroq(
    model=ai_config.llm_model,
    api_key=ai_config.groq_api_key,
    temperature=0
)

def format_docs(docs) -> str:
    return "\n\n".join(f"Source URL: {doc.metadata.get('url', 'Unknown')}\nContent: {doc.page_content}" for doc in docs)

def format_chat_history(history: list[dict]) -> str:
    if not history:
        return ""
    formatted = []
    for msg in history:
        role = "Human" if msg.get("role") == "user" else "Assistant"
        formatted.append(f"{role}: {msg.get('content')}")
    return "\n".join(formatted)

def answer_question(question: str, history: list[dict] = None) -> dict:
    if history is None:
        history = []
        
    logger.info(f"Answering question: {question}")
    
    # Condense question if history is provided
    if history:
        logger.info("Chat history found. Condensing question...")
        formatted_history = format_chat_history(history)
        condense_chain = CONDENSE_QUESTION_PROMPT | llm | StrOutputParser()
        search_query = condense_chain.invoke({
            "chat_history": formatted_history,
            "question": question
        })
        logger.info(f"Standalone search query: {search_query}")
    else:
        search_query = question

    retriever = get_retriever()
    
    # Retrieve documents using the standalone search query
    docs = retriever.invoke(search_query)
    
    logger.info(f"Retrieved {len(docs)} documents for query '{search_query}':")
    for idx, doc in enumerate(docs):
        logger.info(f"  Doc {idx+1}: URL={doc.metadata.get('url')} | Title={doc.metadata.get('title')} | Preview={doc.page_content[:100]}...")

    # Extract unique sources
    seen_urls = set()
    sources = []
    for doc in docs:
        url = doc.metadata.get("url", "Unknown")
        if url not in seen_urls:
            sources.append({
                "title": doc.metadata.get("title", "Unknown"),
                "url": url
            })
            seen_urls.add(url)
    
    # Create final answer chain expecting JSON
    chain = (
        {"context": lambda x: format_docs(docs), "question": RunnablePassthrough()}
        | QA_PROMPT
        | llm
        | JsonOutputParser()
    )
    
    try:
        # LLM returns a dictionary now
        response_data = chain.invoke(question)
        answer = response_data.get("answer", "I'm sorry, I couldn't process that response.")
        quick_replies = response_data.get("quick_replies", [])
    except Exception as e:
        logger.error(f"Failed to parse LLM JSON: {e}")
        # Fallback if LLM outputs invalid JSON or hallucinates
        answer = "I apologize, but I encountered an error formatting my response."
        quick_replies = []
        
    # Robust Fallback Quick Replies if LLM fails to generate them
    if not quick_replies or len(quick_replies) == 0:
        quick_replies = ["Can I speak to a human?", "What services do you offer?"]
        
    # Do not cite sources if the LLM could not find the answer in the context
    if "couldn't find information" in answer.lower() or "encountered an error" in answer.lower():
        sources = []
    
    return {
        "answer": answer,
        "sources": sources,
        "quick_replies": quick_replies
    }
