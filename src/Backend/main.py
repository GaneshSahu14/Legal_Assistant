# D:\Legal_Assistant\src\Backend\main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from pathlib import Path
import shutil
import logging

# Suppress TensorFlow logs and warnings
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
logging.getLogger("tensorflow").setLevel(logging.ERROR)

# Patch for NumPy 2.0 compatibility
import numpy as np
if not hasattr(np, 'complex_'):
    np.complex_ = np.complex128

# Patch for TensorFlow/tf_keras compatibility (optional, but kept for safety)
try:
    import tensorflow as tf
    if hasattr(tf, "__internal__") and not hasattr(tf.__internal__, "register_load_context_function"):
        tf.__internal__.register_load_context_function = lambda x: x
except ImportError:
    pass

# ──────────────────────────────────────────────────────────────
# UPDATED IMPORTS: Use langchain_huggingface for embeddings
# ──────────────────────────────────────────────────────────────
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings   # ← NEW
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Database Setup for Google Login
SQLALCHEMY_DATABASE_URL = "sqlite:///./legal_assistant.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    google_id = Column(String, unique=True, index=True)
    profile_picture = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="Legal RAG API")

app.add_middleware(SessionMiddleware, secret_key="replace_this_with_a_secure_random_secret")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploaded_docs"
INDEX_DIR = Path(__file__).parent / "faiss_index"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(INDEX_DIR, exist_ok=True)

vectorstore = None
rag_chain = None
llm = OllamaLLM(model="llama3.2:3b", temperature=0.1)

def build_rag_chain():
    global vectorstore, rag_chain
    # UPDATED: Use HuggingFaceEmbeddings from langchain_huggingface
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    if os.path.exists(INDEX_DIR) and os.listdir(INDEX_DIR):
        vectorstore = FAISS.load_local(INDEX_DIR, embeddings, allow_dangerous_deserialization=True)
    else:
        print(f"DEBUG: Index directory '{INDEX_DIR}' is empty or missing.")
        vectorstore = None
        return False

    retriever = vectorstore.as_retriever(search_kwargs={"k": 7})

    # Enhanced legal-assistant prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
You are an experienced, neutral, and practical legal advisor with 15+ years of experience in contract law, NDAs, employment agreements, commercial deals, and privacy policies.

Your goal: Help the user understand the document, spot risks/benefits, and make informed decisions.

Rules:
1. Base EVERY answer ONLY on the provided document context. Do NOT invent facts or laws.
2. Use clear, simple language — explain legal terms.
3. Be balanced: show both sides when appropriate.
4. When relevant, include:
   - Key protections/benefits for the user
   - Potential risks or unfavorable terms
   - Ambiguities that could cause disputes
   - Practical negotiation or improvement suggestions
5. Never say "This is legal/illegal" — use "This appears to be..." or "In many jurisdictions..."
6. End with a short "Key Takeaways" section (2–4 bullets).

Context:
{context}

Answer the user's question thoughtfully:
"""),
        ("human", "{question}")
    ])

    def format_docs(docs):
        return "\n\n".join(f"[From {Path(doc.metadata['source']).name}, Page {doc.metadata.get('page', '?') + 1 if isinstance(doc.metadata.get('page'), int) else '?'}]\n{doc.page_content}" for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return True

class Query(BaseModel):
    question: str

@app.post("/upload")
async def upload_documents(files: list[UploadFile] = File(...)):
    global vectorstore, rag_chain
    docs = []

    for file in files:
        file_path = Path(UPLOAD_DIR) / file.filename
        contents = await file.read()
        file_path.write_bytes(contents)

        if file.filename.lower().endswith(".pdf"):
            loader = PyPDFLoader(str(file_path))
        elif file.filename.lower().endswith((".docx", ".doc")):
            loader = Docx2txtLoader(str(file_path))
        elif file.filename.lower().endswith(".txt"):
            loader = TextLoader(str(file_path), encoding="utf-8")
        else:
            continue
        docs.extend(loader.load())

    if not docs:
        raise HTTPException(status_code=400, detail="No valid documents")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)
    # UPDATED: Use the new embeddings import
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(INDEX_DIR)
    build_rag_chain()

    return {"message": f"Processed {len(files)} file(s)", "chunks": len(chunks)}
@app.post("/ask")
async def ask_question(query: Query):
    if rag_chain is None:
        if not build_rag_chain():
            raise HTTPException(status_code=400, detail="Note: First upload the doc and then chat.")

    answer = rag_chain.invoke(query.question)
    docs = vectorstore.as_retriever(search_kwargs={"k": 5}).invoke(query.question)

    citations = []
    for doc in docs:
        page = doc.metadata.get("page", "?")
        page_num = page + 1 if isinstance(page, int) else page
        filename = Path(doc.metadata["source"]).name
        citations.append(f"{filename} - Page {page_num}")

    return {
        "answer": answer.strip(),
        "citations": list(set(citations))
    }

@app.get("/documents")
async def get_documents():
    files = [f.name for f in Path(UPLOAD_DIR).iterdir() if f.is_file()]
    return {"documents": files}

@app.delete("/clear")
async def clear():
    global vectorstore, rag_chain
    shutil.rmtree(UPLOAD_DIR, ignore_errors=True)
    shutil.rmtree(INDEX_DIR, ignore_errors=True)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(INDEX_DIR, exist_ok=True)
    vectorstore = None
    rag_chain = None
    return {"message": "Cleared"}

@app.get("/document/{filename}")
async def get_document(filename: str):
    file_path = Path(UPLOAD_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    return FileResponse(
        path=file_path,
        media_type='application/pdf',
        filename=filename
    )

@app.get("/clauses/{filename}")
async def extract_clauses(filename: str):
    file_path = Path(UPLOAD_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")

    if filename.lower().endswith(".pdf"):
        loader = PyPDFLoader(str(file_path))
    elif filename.lower().endswith((".docx", ".doc")):
        loader = Docx2txtLoader(str(file_path))
    elif filename.lower().endswith(".txt"):
        loader = TextLoader(str(file_path), encoding="utf-8")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    docs = loader.load()

    clauses = []
    clause_types = ["confidentiality", "termination", "liability", "governing law", "indemnification"]

    for doc in docs:
        content = doc.page_content.lower()
        for clause_type in clause_types:
            if clause_type in content:
                start = content.find(clause_type)
                clause_end = start
                for i in range(start, min(start + 1000, len(content))):
                    if doc.page_content[i] in '.!?' and i > start + 50:
                        clause_end = i + 1
                        break
                else:
                    clause_end = min(start + 1000, len(content))

                snippet = doc.page_content[start:clause_end].strip()

                clauses.append({
                    "id": len(clauses) + 1,
                    "type": clause_type.title(),
                    "content": snippet,
                    "page": doc.metadata.get("page", 0) + 1,
                    "section": f"Section {len(clauses) + 1}",
                    "risk": "medium"
                })

    return {"clauses": clauses}

@app.post("/compare")
async def compare_documents(files: list[UploadFile] = File(...)):
    if len(files) != 2:
        raise HTTPException(status_code=400, detail="Exactly 2 documents required for comparison")

    docs1 = []
    docs2 = []
    temp_files = []

    try:
        for i, file in enumerate(files):
            temp_path = Path(UPLOAD_DIR) / f"temp_compare_{i}_{file.filename}"
            contents = await file.read()
            temp_path.write_bytes(contents)
            temp_files.append(temp_path)

            if file.filename.lower().endswith(".pdf"):
                loader = PyPDFLoader(str(temp_path))
            elif file.filename.lower().endswith((".docx", ".doc")):
                loader = Docx2txtLoader(str(temp_path))
            elif file.filename.lower().endswith(".txt"):
                loader = TextLoader(str(temp_path), encoding="utf-8")
            else:
                continue

            docs = loader.load()
            if i == 0:
                docs1 = docs
            else:
                docs2 = docs
    finally:
        for temp_file in temp_files:
            try:
                temp_file.unlink()
            except:
                pass

    differences = []
    content1 = " ".join([doc.page_content for doc in docs1])
    content2 = " ".join([doc.page_content for doc in docs2])

    len1, len2 = len(content1), len(content2)
    if abs(len1 - len2) > 100:
        differences.append({
            "type": "modified",
            "clause": "Document Length",
            "doc1Value": f"{len1} characters",
            "doc2Value": f"{len2} characters",
            "risk": "low"
        })

    legal_clauses = {
        "confidentiality": ["confidential", "non-disclosure", "secret"],
        "termination": ["terminate", "end", "cancellation"],
        "liability": ["liable", "responsibility", "damages"],
        "indemnification": ["indemnify", "hold harmless", "compensate"],
        "governing law": ["governing law", "jurisdiction", "applicable law"],
        "force majeure": ["force majeure", "act of god"],
        "assignment": ["assign", "transfer rights"],
        "severability": ["severable", "severability"]
    }

    for clause_name, keywords in legal_clauses.items():
        in_doc1 = any(keyword in content1.lower() for keyword in keywords)
        in_doc2 = any(keyword in content2.lower() for keyword in keywords)

        if in_doc1 and not in_doc2:
            differences.append({
                "type": "missing",
                "clause": f"{clause_name.title()} Clause",
                "doc1Value": "Present",
                "doc2Value": "Not found",
                "risk": "high"
            })
        elif not in_doc1 and in_doc2:
            differences.append({
                "type": "added",
                "clause": f"{clause_name.title()} Clause",
                "doc1Value": "Not found",
                "doc2Value": "Present",
                "risk": "medium"
            })

    import re
    money_pattern = r'\$[\d,]+(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD)'
    amounts1 = re.findall(money_pattern, content1, re.IGNORECASE)
    amounts2 = re.findall(money_pattern, content2, re.IGNORECASE)

    if amounts1 and not amounts2:
        differences.append({
            "type": "missing",
            "clause": "Monetary Terms",
            "doc1Value": f"Contains amounts: {', '.join(set(amounts1[:3]))}",
            "doc2Value": "No monetary amounts found",
            "risk": "medium"
        })
    elif not amounts1 and amounts2:
        differences.append({
            "type": "added",
            "clause": "Monetary Terms",
            "doc1Value": "No monetary amounts found",
            "doc2Value": f"Contains amounts: {', '.join(set(amounts2[:3]))}",
            "risk": "medium"
        })

    risk_score = sum(30 if d["risk"] == "high" else 15 if d["risk"] == "medium" else 5 for d in differences)
    risk_score = min(100, risk_score)

    return {
        "differences": differences,
        "risk_score": risk_score,
        "doc1_name": files[0].filename,
        "doc2_name": files[1].filename
    }