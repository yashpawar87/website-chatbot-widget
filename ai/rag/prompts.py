from langchain_core.prompts import PromptTemplate

QA_PROMPT_TEMPLATE = """You are a helpful, professional assistant for this website.
Your goal is to answer the user's question accurately using ONLY the provided context.

Rules:
1. Rely strictly on the facts mentioned in the context below. Do NOT assume, extrapolate, or bring in outside knowledge.
2. If the context does not contain the answer, politely state: "I'm sorry, but I couldn't find information about that on the website."
3. Keep your response concise, structured, and helpful. Use markdown lists if appropriate.
4. Do not mention "Based on the context" or "According to the provided text", just answer the question naturally.

Context:
{context}

Question: {question}

Answer:"""

QA_PROMPT = PromptTemplate(
    template=QA_PROMPT_TEMPLATE,
    input_variables=["context", "question"]
)

CONDENSE_QUESTION_TEMPLATE = """Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:"""

CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(CONDENSE_QUESTION_TEMPLATE)

