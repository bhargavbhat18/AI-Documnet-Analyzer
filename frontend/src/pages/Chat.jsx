import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Sparkles, FileText } from "lucide-react";

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: "bot", content: "Hello! I'm your document analysis assistant. Ask me anything about your uploaded documents." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chat", { query: userMessage.content });
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.data.response
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: "bot", 
        content: "Sorry, I encountered an error while analyzing the documents." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now(), type: "user", content: "Please summarize my documents." }]);
    
    try {
      const response = await axios.post("/api/chat/summarize", {});
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: "bot", 
        content: response.data.summary 
      }]);
    } catch (error) {
      console.error("Summarize error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: "bot", 
        content: "Sorry, I couldn't generate a summary." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Chat</h1>
          <p className="text-slate-500 mt-2">Chat with your documents using RAG.</p>
        </div>
        <button 
          onClick={handleSummarize}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Summarize All
        </button>
      </div>

      <div className="glass-card flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 max-w-3xl ${msg.type === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                msg.type === "user" 
                  ? "bg-gradient-to-tr from-primary-500 to-indigo-500 text-white" 
                  : "bg-white border border-slate-200 text-slate-700"
              }`}>
                {msg.type === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`px-5 py-4 rounded-2xl ${
                msg.type === "user"
                  ? "bg-primary-600 text-white rounded-tr-sm shadow-md"
                  : "bg-white/80 border border-slate-200/60 text-slate-800 rounded-tl-sm shadow-sm"
              }`}>
                <div className="leading-relaxed prose prose-slate prose-p:my-1 max-w-none">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/80 border border-slate-200/60 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <span className="text-slate-500 text-sm">Analyzing documents...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-slate-200/50 bg-white/50 backdrop-blur-md">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full pl-6 pr-14 py-4 bg-white border border-slate-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-slate-700"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
