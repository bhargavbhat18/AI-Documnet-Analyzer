import { FileText, MessageSquare, Database } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Total Documents</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">0</p>
        </div>
        
        <div className="glass-card p-6">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Chat Sessions</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">0</p>
        </div>

        <div className="glass-card p-6 border border-dashed border-slate-300 bg-white/30 flex flex-col items-center justify-center text-center">
          <Database className="w-8 h-8 text-slate-400 mb-2" />
          <h3 className="text-lg font-medium text-slate-700">Upload New</h3>
          <Link to="/documents" className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
            Go to Documents
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
