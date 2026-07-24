import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Copy, 
  RotateCcw,
  Check,
  BookOpen,
  HelpCircle,
  Clock
} from "lucide-react";

const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: "bot", 
      content: "Hello! I'm your document analysis assistant. Ask me anything about your uploaded documents.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input.trim();
    if (!queryText) return;

    const userMessage = { 
      id: Date.now(), 
      type: "user", 
      content: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chat", { query: queryText });
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: "bot", 
        content: "Sorry, I encountered an error while analyzing the documents.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsLoading(true);
    const userMessage = { 
      id: Date.now(), 
      type: "user", 
      content: "Please summarize my documents.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await axios.post("/api/chat/summarize", {});
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: "bot", 
        content: response.data.summary,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("Summarize error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: "bot", 
        content: "Sorry, I couldn't generate a summary.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    // Find last user message
    const userMessages = messages.filter(m => m.type === "user");
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1].content;
      handleSend(lastUserMsg);
    }
  };

  const suggestions = [
    { title: "Summarize resume", prompt: "Can you summarize the professional experience on my resume?" },
    { title: "Key achievements", prompt: "What are the key technical projects highlighted in the documents?" },
    { title: "List skills", prompt: "Can you extract the technical skills listed in the uploaded files?" }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Assistant</h1>
          <p className="text-slate-500 text-sm mt-1.5">Chat and query your document knowledge base in real-time.</p>
        </div>
        <button 
          onClick={handleSummarize}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Summarize Workspace</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden relative border border-slate-200/60 bg-white/70 backdrop-blur-md">
        
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 max-w-3xl group ${msg.type === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.type === "user" 
                  ? "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white" 
                  : "bg-slate-100 border border-slate-200 text-slate-600"
              }`}>
                {msg.type === "user" ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
              </div>
              
              {/* Message Bubble Container */}
              <div className="space-y-1">
                <div className={`px-5 py-3.5 rounded-2xl relative ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm shadow-sm"
                    : "bg-slate-50 border border-slate-200/50 text-slate-800 rounded-tl-sm"
                }`}>
                  {/* Message Content */}
                  <div className="leading-relaxed text-sm max-w-none space-y-2">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className="m-0">{line}</p>
                    ))}
                  </div>

                  {/* Copy Button (Bot Only, Hover triggered) */}
                  {msg.type === "bot" && (
                    <button 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded bg-white border border-slate-200/60 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Timestamp & Actions */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${msg.type === "user" ? "justify-end" : ""}`}>
                  <span>{msg.time}</span>
                  {msg.type === "bot" && messages.length > 1 && (
                    <>
                      <span>•</span>
                      <button 
                        onClick={handleRegenerate}
                        className="hover:text-slate-600 flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Regenerate</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 shadow-sm flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/50 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4.5 h-4.5 text-blue-500 animate-spin" />
                <span className="text-slate-400 text-xs font-medium">DocuMind AI is writing...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (when no queries exist yet) */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/20">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Suggested Prompts</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestions.map((sug, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSend(sug.prompt)}
                  className="p-3 bg-white border border-slate-200/60 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all duration-200 cursor-pointer text-left"
                >
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    {sug.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{sug.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat Input Field */}
        <div className="p-4 border-t border-slate-200/50 bg-white/50 backdrop-blur-md">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="relative flex items-center max-w-4xl mx-auto"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full pl-6 pr-14 py-3.5 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs text-slate-700"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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
