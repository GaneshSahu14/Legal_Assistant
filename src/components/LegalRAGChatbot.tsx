// src/components/LegalRAGChatbot.tsx (or wherever your component is)
import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, X, FileText, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  confidence?: number | null;
}

interface Document {
  name: string;
  chunks: number; // We don't know chunks from backend, so 0 is fine
}

const LegalRAGChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your legal document assistant. Upload your documents and ask me anything. I'll provide accurate answers with citations from your files.",
      citations: [],
      confidence: null
    }
  ]);
  const [input, setInput] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = "http://localhost:8000";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load existing documents on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/documents`)
      .then(res => res.json())
      .then(data => {
        if (data.documents) {
          setDocuments(data.documents.map((name: string) => ({ name, chunks: 0 })));
        }
      })
      .catch(() => console.log("Backend not ready yet"));
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const newDocs = Array.from(files).map(f => ({ name: f.name, chunks: 0 }));
      setDocuments(prev => [...prev.filter(d => !newDocs.some(nd => nd.name === d.name)), ...newDocs]);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Successfully processed ${files.length} document(s). You can now ask questions!`,
        citations: []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error uploading documents. Make sure the backend is running on http://localhost:8000",
        citations: []
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sending message
  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!res.ok) throw new Error("Failed to get answer");

      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || "No answer received.",
        citations: data.citations || [],
        confidence: null
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error: Could not connect to the RAG backend. Is it running on port 8000?",
        citations: []
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeDocument = async (docName: string) => {
    // Optional: Add delete endpoint later if needed
    // For now, just remove from UI (documents persist in backend until cleared)
    setDocuments(prev => prev.filter(d => d.name !== docName));
  };

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Document Library</h2>
          <p className="text-slate-400 text-sm">Upload and manage your legal documents</p>
        </div>

        <label className="mb-4 cursor-pointer">
          <div className={`bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload size={18} />
            Upload Documents
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
        </label>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-slate-300 font-semibold mb-3 text-sm">
            Uploaded Documents ({documents.length})
          </h3>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto text-slate-600 mb-2" size={40} />
              <p className="text-slate-500 text-sm">No documents yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="bg-slate-700/50 p-3 rounded-lg flex items-start justify-between group hover:bg-slate-700 transition-colors">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <FileText size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm truncate">{doc.name}</p>
                      <p className="text-slate-400 text-xs">Indexed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.name)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300 block mb-1">Real RAG Powered:</strong>
            Powered by Ollama + FAISS. All processing happens locally — your documents never leave your computer.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-slate-700 bg-slate-800/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Legal Document Assistant</h2>
              <p className="text-sm text-slate-400">Ask questions about your uploaded documents</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-blue-400" />
                  </div>
                )}
                
                <div className={`max-w-[80%] space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-100'}`}>
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                  
                  {message.citations && message.citations.length > 0 && (
                    <div className="space-y-1 px-1">
                      <p className="text-xs text-slate-400 font-medium">Citations:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.citations.map((citation, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-700/50 text-slate-300 border border-slate-600">
                            {citation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-600/50 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-400 animate-pulse" />
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-800/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              className="flex-1 bg-slate-700/50 text-white placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalRAGChatbot;