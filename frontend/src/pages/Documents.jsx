import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { UploadCloud, File, FileText, Trash2, Loader2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

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
      
      // Artificial delay to show 100% and success state nicely
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Document Library</h1>
        <p className="text-slate-500 mt-2">Upload and manage your documents for AI analysis.</p>
      </div>

      <div 
        className={`glass-card p-10 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden ${
          isDragging ? 'border-primary-500 bg-primary-50/50 scale-[1.01]' : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.docx"
          className="hidden" 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center max-w-md w-full">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Document...</h3>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-primary-500 transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">{uploadProgress}% Complete</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-primary-500/20 text-primary-500">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload a Document</h3>
            <p className="text-slate-500 max-w-md mb-8">
              Drag and drop your files here or click to browse. We support PDF and DOCX files up to 50MB.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Select File
            </button>
          </>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Uploaded Documents</h2>
        
        {documents.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700">No documents yet</h3>
            <p className="text-slate-500 mt-1">Upload your first document above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="glass-card p-5 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-400/20 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 truncate" title={doc.originalFilename}>
                      {doc.originalFilename}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <span>{formatBytes(doc.size)}</span>
                      <span>•</span>
                      <span>{format(new Date(doc.uploadDate), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Indexed
                  </span>
                  
                  <button className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
