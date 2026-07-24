import { useState } from "react";
import axios from "axios";
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Bug, 
  Send, 
  CheckCircle, 
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const HelpCenter = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Feedback Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("question");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const faqs = [
    {
      q: "What file types are supported?",
      a: "Currently, you can upload PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files. Support for other formats is in development."
    },
    {
      q: "How does the AI assistant answer queries?",
      a: "When you upload a file, the system chunks it and indexes it into ChromaDB vector database. When you chat, the system pulls the most relevant text passages to form the AI response context."
    },
    {
      q: "Is my document data secure?",
      a: "Yes, all parsing and vector embeddings are stored locally within the application's workspace environment."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    const payload = {
      name,
      email,
      category,
      message
    };

    try {
      await axios.post('/api/feedback', payload);
      setName("");
      setEmail("");
      setMessage("");
      setSuccessMsg("Support request submitted successfully! We'll reply soon.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      console.error("Error submitting support form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-slate-500 text-sm">
          Get help with your documents, read FAQs, check developer documentation, or submit bug reports.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-700 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FAQ & Documentation column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documentation Links */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-blue-500" />
              Developer Documentation
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a 
                href="https://github.com/bhargavbhat18/AI-Documnet-Analyzer" 
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl transition-all"
              >
                <h4 className="font-bold text-xs text-slate-700">GitHub Repository</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Explore source code and pipeline config</p>
              </a>
              
              <a 
                href="/health" 
                target="_blank"
                className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-xl transition-all"
              >
                <h4 className="font-bold text-xs text-slate-700">Backend API Health</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Check Spring Boot health diagnostics status</p>
              </a>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-purple-500" />
              Frequently Asked Questions (FAQ)
            </h3>
            
            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-left text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {activeFaq === idx && (
                    <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support & Bug Form */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-amber-500" />
              Submit Ticket / Bug
            </h3>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Your Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-9 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full h-9 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Ticket Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-white"
              >
                <option value="question">Question</option>
                <option value="support">Support Request</option>
                <option value="bug">Report a Bug</option>
                <option value="feedback">General Feedback</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Detailed Message</label>
              <textarea 
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or feedback..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-1.5 h-9 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
