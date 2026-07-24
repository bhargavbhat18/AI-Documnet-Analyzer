import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Layers, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  X, 
  Loader2, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [formId, setFormId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Professional");
  const [formContent, setFormContent] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormId(null);
    setFormTitle("");
    setFormCategory("Professional");
    setFormContent("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl) => {
    setIsEditing(true);
    setFormId(tpl.id);
    setFormTitle(tpl.title);
    setFormCategory(tpl.category);
    setFormContent(tpl.content);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const payload = {
      title: formTitle,
      category: formCategory,
      content: formContent
    };

    try {
      if (isEditing) {
        await axios.put(`/api/templates/${formId}`, payload);
      } else {
        await axios.post('/api/templates', payload);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  // Filter categories
  const categories = ["All", "Professional", "Technical", "Management"];

  const filteredTemplates = templates.filter(tpl => {
    const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tpl.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Template Library</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Choose or design prompts templates to feed instructions to the AI assistant.
          </p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer hover:shadow hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Search and Categories bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-100/80 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="glass-card p-12 text-center border border-slate-200/50">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-slate-700">No templates found</h3>
          <p className="text-slate-400 text-xs mt-1">Create a custom prompt template to expand your list.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <div key={tpl.id} className="glass-card p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditModal(tpl)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(tpl.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-slate-800">{tpl.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{tpl.content}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-300" />
                  AI Template
                </span>
                
                <Link 
                  to="/chat"
                  state={{ promptTemplate: tpl.content }}
                  className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 hover:underline"
                >
                  <span>Use in Chat</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">{isEditing ? "Edit Template" : "New Template"}</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Template Title</label>
                <input 
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Contract Audit Assistant"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-white"
                >
                  <option value="Professional">Professional</option>
                  <option value="Technical">Technical</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions Prompt</label>
                <textarea 
                  required
                  rows="4"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write instructions for the AI assistant..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default Templates;
