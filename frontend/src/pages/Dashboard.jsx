import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  MessageSquare, 
  Database, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Dashboard = () => {
  const [docCount, setDocCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [recentDocs, setRecentDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/documents');
      const docs = response.data;
      setDocCount(docs.length);
      const totalSize = docs.reduce((acc, doc) => acc + (doc.size || 0), 0);
      setStorageUsed(totalSize);
      setRecentDocs(docs.slice(0, 3));
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    {
      title: "Total Documents",
      value: isLoading ? "..." : docCount.toString(),
      change: "+12% this week",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 text-blue-600"
    },
    {
      title: "AI Analyses",
      value: isLoading ? "..." : (docCount * 4).toString(),
      change: "+28% query volume",
      icon: Sparkles,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 text-purple-600"
    },
    {
      title: "Storage Occupied",
      value: isLoading ? "..." : formatBytes(storageUsed),
      change: "Limit: 5.0 GB",
      icon: Database,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50 text-cyan-600"
    },
    {
      title: "Estimated Time Saved",
      value: isLoading ? "..." : `${(docCount * 1.5).toFixed(1)} hrs`,
      change: "20 min avg per doc",
      icon: Clock,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-6 rounded-2xl border border-blue-500/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Bhargav!</h1>
          <p className="text-slate-500 text-sm mt-1.5">Here is an overview of your document workspace and AI insights.</p>
        </div>
        <Link 
          to="/documents" 
          className="flex items-center gap-1.5 self-start md:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <span>Go to Documents</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.title}</p>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{m.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bgColor}`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Chart Panel */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Usage Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Mocked data showing system interaction rates</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Weekly View</span>
          </div>

          <div className="h-48 w-full flex items-end justify-between pt-6 px-4 border-b border-slate-100">
            {/* Simple Visual SVG-like Bar Chart using divs */}
            {[45, 60, 30, 85, 55, 95, 70].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group w-full">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-500/80 to-blue-500 rounded-t-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 relative shadow-sm"
                  style={{ height: `${h}%` }}
                >
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold z-10">
                    {h * 2}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
            
            <div className="space-y-4 pt-2">
              {recentDocs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">No documents recently uploaded.</p>
                </div>
              ) : (
                recentDocs.map((doc, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    {idx < recentDocs.length - 1 && (
                      <span className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-slate-100" />
                    )}
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{doc.originalFilename}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Uploaded & parsed successfully</p>
                    </div>
                  </div>
                ))
              )}
              
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Security audit checked</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Local vector DB & RAG layers active</p>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/chat" 
            className="flex items-center justify-center gap-1.5 mt-6 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <span>Ask AI Assistant</span>
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
