# LegalAssist – Private Offline Legal Document Assistant 🚀

**LegalAssist** is a fully offline, privacy-first AI-powered legal document assistant that helps users analyze, understand, and evaluate contracts, NDAs, employment agreements, privacy policies, and other legal documents — all without sending sensitive data to the cloud. 🔒

## Features ✨

- **100% Local & Private** 🔒: Runs entirely on your machine using Ollama and FAISS — no API keys, no internet required after setup.
- **Intelligent RAG Chatbot** 🤖: Upload PDFs, DOCX, or TXT files and ask questions in natural language. Get accurate answers grounded in your documents with page citations.
- **Real Legal Assistant Behavior** ⚖️: Goes beyond quoting text — provides balanced analysis, highlights risks and benefits, identifies ambiguities, and offers practical negotiation suggestions.
- **Modern UI** 🎨: Beautiful dark-themed React + Tailwind CSS interface with sidebar document library, chat history, and smooth interactions.
- **Document Tools** 📑:
  - Clause extraction 🔍
  - Two-document comparison with risk scoring ⚠️
  - Direct file preview 👀
- **FastAPI Backend** ⚡: Efficient document processing, semantic search with Hugging Face embeddings, and local LLM inference.

## Tech Stack 🛠️

- **Frontend**: React (Vite + TypeScript), Tailwind CSS, Lucide Icons
- **Backend**: FastAPI (Python)
- **AI Stack**:
  - LLM: Ollama (Llama 3.2 3B or Llama 3.1 8B recommended) 🧠
  - Embeddings: `all-MiniLM-L6-v2` (via Hugging Face)
  - Vector Store: FAISS
  - Framework: LangChain
- **Document Processing**: PyPDF2, python-docx, unstructured

## Prerequisites 📋

- Python 3.10+
- Node.js 18+ and npm/yarn/pnpm/bun
- Ollama installed and running [](https://ollama.com) 🐳

## Usage 📝

 - Upload your legal documents (PDF, DOCX, TXT) 📤
 - Wait for processing to complete ⏳
 - Start chatting! Ask questions like:
 - "Is this NDA balanced?" ⚖️
 - "What are the main risks for me?" ⚠️
 - "Should I sign this agreement?" 🤔
 - "Suggest improvements to the liability clause" 💡
-The assistant will respond with thoughtful analysis, citations, and key takeaways.

## Privacy & Security 🔐
 - All processing happens locally.
 - Documents never leave your machine.
 - No external API calls (except initial model download via Ollama).

## Contributing 🤝
 - Contributions are welcome! Feel free to open issues or submit pull requests.

## 👨‍💻 Author
  - Made by Ganesh Sahu♥️
