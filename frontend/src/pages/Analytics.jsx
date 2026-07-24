import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart3, 
  Database, 
  Sparkles, 
  FileText, 
  Clock, 
  TrendingUp, 
  Loader2,
  PieChart
} from "lucide-react";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics');
      setData(response.data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  const uploadTrendKeys = Object.keys(data?.uploadTrends || {});
  const uploadTrendValues = Object.values(data?.uploadTrends || {});
  const maxTrendVal = Math.max(...uploadTrendValues, 1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Analytics</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Detailed metrics showing document inventory, vector database size, and AI assistant query volumes.
        </p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Storage Used</span>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{formatBytes(data?.totalStorageBytes || 0)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Operations Run</span>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{data?.aiQueriesCount || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Count</span>
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{data?.totalDocuments || 0}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Activity Trends */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Upload Trends By Date</h3>
              <p className="text-xs text-slate-400 mt-0.5">Frequency of new documents added to the database</p>
            </div>
            <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
          </div>

          {uploadTrendKeys.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              No upload trends recorded yet.
            </div>
          ) : (
            <div className="h-48 flex items-end justify-between pt-6 px-4 border-b border-slate-100">
              {uploadTrendKeys.map((key, i) => {
                const val = uploadTrendValues[i];
                const pct = (val / maxTrendVal) * 80 + 10; // offset so at least small bar renders
                return (
                  <div key={key} className="flex flex-col items-center gap-2 group w-full">
                    <div 
                      className="w-6 bg-gradient-to-t from-blue-500/80 to-blue-500 rounded-t group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300 relative"
                      style={{ height: `${pct}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold z-10">
                        {val}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase truncate max-w-[40px]" title={key}>
                      {key.substring(5)} {/* show MM-DD */}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Format Distribution */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Document Formats Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Breakdown of uploaded file types</p>
            </div>
            <PieChart className="w-4.5 h-4.5 text-purple-500" />
          </div>

          <div className="flex flex-col justify-center h-48 space-y-3">
            {Object.keys(data?.formats || {}).length === 0 ? (
              <p className="text-center text-slate-400 text-xs">No formats records found.</p>
            ) : (
              Object.entries(data.formats).map(([ext, count], idx) => {
                const total = uploadTrendValues.reduce((a, b) => a + b, 0) || 1;
                const percent = Math.round((count / data.totalDocuments) * 100);
                const colors = ["bg-red-500", "bg-blue-500", "bg-amber-500"];
                const color = colors[idx % colors.length];
                return (
                  <div key={ext} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        {ext} Files
                      </span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Most Accessed Documents */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Most Analyzed Documents</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-slate-600">
            <thead className="bg-slate-50 font-semibold text-slate-400 text-left uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Last Access Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data?.mostAnalyzed?.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-slate-400">
                    No documents found.
                  </td>
                </tr>
              ) : (
                data?.mostAnalyzed?.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2 font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-blue-500" />
                      {doc.name}
                    </td>
                    <td className="px-6 py-4">{formatBytes(doc.size)}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(doc.lastOpened).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
