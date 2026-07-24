import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  UploadCloud, 
  File, 
  FileText, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  Download, 
  Share2, 
  Heart, 
  MoreVertical, 
  Sparkles,
  Info,
  Globe,
  HelpCircle,
  Table,
  Eye,
  FileCheck,
  BookOpen,
  X,
  Search,
  ArrowUpDown,
  Edit2
} from "lucide-react";
import { format } from "date-fns";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  
  const handleQuickAction = (title) => {
    if (title === "Analyze Content") {
      navigate("/chat", { state: { promptTemplate: "Please analyze the uploaded documents and provide key details." } });
    } else if (title === "Summarize") {
      navigate("/chat", { state: { promptTemplate: "Please summarize the main findings of my documents." } });
    } else if (title === "Translate") {
      navigate("/chat", { state: { promptTemplate: "Please translate the key sections of my documents into Spanish." } });
    } else if (title === "OCR Scan") {
      navigate("/chat", { state: { promptTemplate: "Can you extract all raw text and structural components from the documents?" } });
    }
  };
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [favorites, setFavorites] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Search, Filter, Sort and Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("uploadDate"); // name, size, uploadDate
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Rename states
  const [renameDocId, setRenameDocId] = useState(null);
  const [renameName, setRenameName] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setTimeout(() => {
        setIsUploading(false);
        fetchDocuments();
      }, 1000);
      
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      alert("Upload failed. Please try again.");
    }
  };

  const handleOpenDocDetails = async (doc) => {
    setSelectedDoc(doc);
    try {
      await axios.post(`/api/documents/${doc.id}/open`);
    } catch (error) {
      console.error("Error logging file opened status:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/documents/${id}`);
      setActiveMenuId(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleOpenRename = (doc) => {
    setRenameDocId(doc.id);
    setRenameName(doc.originalFilename.replace(/\.[^/.]+$/, "")); // remove extension for user convenience
    setActiveMenuId(null);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!renameName.trim()) return;

    try {
      await axios.put(`/api/documents/${renameDocId}/rename`, { name: renameName });
      setRenameDocId(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error renaming document:", error);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFileIconColor = (filename) => {
    if (filename?.toLowerCase().endsWith(".pdf")) return "bg-red-50 text-red-500 border-red-100";
    if (filename?.toLowerCase().endsWith(".docx")) return "bg-blue-50 text-blue-500 border-blue-100";
    return "bg-slate-50 text-slate-500 border-slate-100";
  };

  // Sort and Filter documents
  const filteredDocs = documents.filter(doc => 
    doc.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.originalFilename.localeCompare(b.originalFilename);
    } else if (sortBy === "size") {
      comparison = a.size - b.size;
    } else if (sortBy === "uploadDate") {
      comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = sortedDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedDocs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const quickActions = [
    { title: "Analyze Content", desc: "Retrieve deep insights", icon: Sparkles, color: "from-blue-500 to-indigo-500" },
    { title: "Summarize", desc: "Get condensed overview", icon: BookOpen, color: "from-purple-500 to-pink-500" },
    { title: "Translate", desc: "Convert to another language", icon: Globe, color: "from-emerald-500 to-teal-500" },
    { title: "OCR Scan", desc: "Extract text from images", icon: Eye, color: "from-orange-500 to-amber-500" },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Document Workspace</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Upload, analyze, summarize, and chat with your documents using advanced vector retrieval models.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <div 
            key={i} 
            onClick={() => handleQuickAction(action.title)}
            className="group p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${action.color} opacity-[0.04] group-hover:opacity-[0.08] rounded-bl-full transition-opacity`} />
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-700 transition-colors mb-3">
              <action.icon className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-semibold text-xs text-slate-800">{action.title}</h4>
            <p className="text-[10px] text-slate-400 mt-1">{action.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Upload Zone */}
      <div 
        className={`glass-card p-10 border border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${
          isDragging ? 'border-blue-500 bg-blue-50/20 scale-[1.01]' : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt"
          className="hidden" 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center max-w-md w-full">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Document...</h3>
            <p className="text-slate-500 text-xs mb-4">Uploading and indexing document chunks into vector database</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-2">{uploadProgress}% Complete</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 text-blue-500 border border-blue-100 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Upload a Document</h3>
            <p className="text-slate-400 text-xs max-w-sm mb-6">
              Drag and drop your PDF or DOCX here, or click to browse. Files up to 50MB supported.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer"
            >
              Select File
            </button>
          </>
        )}
      </div>

      {/* Uploaded Documents Library & Controls */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Document Library</h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {documents.length} Files
            </span>
          </div>

          {/* Search, Sort, Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg h-8 px-2 text-[10px] text-slate-500">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="focus:outline-none bg-transparent font-semibold text-slate-700 cursor-pointer"
              >
                <option value="uploadDate">Date Uploaded</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </div>

            {/* Sort Order Toggle */}
            <button 
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-750 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>
        
        {currentDocs.length === 0 ? (
          <div className="glass-card p-12 text-center border border-slate-200/50">
            <File className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-slate-700">No documents yet</h3>
            <p className="text-slate-400 text-xs mt-1">Upload your first document above to get started.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="glass-card p-5 group relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Header Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getFileIconColor(doc.originalFilename)}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 
                        className="font-bold text-sm text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                        title={doc.originalFilename}
                        onClick={() => handleOpenDocDetails(doc)}
                      >
                        {doc.originalFilename}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                        <span>{formatBytes(doc.size)}</span>
                        <span>•</span>
                        <span>{format(new Date(doc.uploadDate), 'MMM d, yyyy')}</span>
                      </p>
                    </div>

                    {/* Favorite / Menu Button */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => toggleFavorite(doc.id)}
                        className="p-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-300 hover:text-red-500 cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${favorites[doc.id] ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === doc.id ? null : doc.id)}
                        className="p-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Popover Action Menu */}
                      {activeMenuId === doc.id && (
                        <div className="absolute right-4 top-14 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 w-36">
                          <button 
                            onClick={() => handleOpenDocDetails(doc)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 w-full transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                          <button 
                            onClick={() => handleOpenRename(doc)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 w-full transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full transition-colors border-t border-slate-100 mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete File</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer Badges & Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Vector Indexed
                    </span>

                    <a 
                      href={`/api/documents/${doc.id}/download`}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === i + 1 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rename Dialog Modal */}
      {renameDocId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleRename}
            className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Rename Document</h3>
              <button 
                type="button"
                onClick={() => setRenameDocId(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Document Name</label>
                <input 
                  type="text"
                  required
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  placeholder="New document name"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                type="button"
                onClick={() => setRenameDocId(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${getFileIconColor(selectedDoc.originalFilename)}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm truncate max-w-md">{selectedDoc.originalFilename}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Uploaded on {format(new Date(selectedDoc.uploadDate), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">File Size</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">{formatBytes(selectedDoc.size)}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Language</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">English</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Page Count</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">1 Page</p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  AI Insights Summary
                </h4>
                <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl text-xs text-slate-600 leading-relaxed">
                  This document has been fully parsed, chunked, and stored in the vector database. 
                  You can query its contents, extract tables, translate sections, or summarize structural contents using the AI Chat panel.
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  Technical Metadata
                </h4>
                <table className="min-w-full text-xs text-slate-500 border border-slate-100 rounded-xl overflow-hidden">
                  <tbody>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-4 py-2 font-semibold text-slate-600 w-1/3">Storage Path</td>
                      <td className="px-4 py-2 font-mono text-[10px] truncate max-w-xs">{selectedDoc.filename}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-2 font-semibold text-slate-600">Content Type</td>
                      <td className="px-4 py-2">{selectedDoc.contentType}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link 
                to="/chat"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Start AI Chat
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
