import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { 
  Bell, 
  Search, 
  Menu, 
  Sun, 
  Moon, 
  Upload, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight,
  FileText,
  BookOpen,
  Trash2,
  CheckCircle,
  HelpCircle,
  BarChart3
} from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Real notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Global search states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allDocs, setAllDocs] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);

  // Profile preferences
  const [userName, setUserName] = useState("Bhargav Bhat");
  const [userEmail, setUserEmail] = useState("bhargav@example.com");

  useEffect(() => {
    fetchNotifications();
    fetchSearchData();
    fetchUserProfile();
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const fetchSearchData = async () => {
    try {
      const docsRes = await axios.get('/api/documents');
      setAllDocs(docsRes.data);
      
      const tplsRes = await axios.get('/api/templates');
      setAllTemplates(tplsRes.data);
    } catch (error) {
      console.error("Error fetching search indices:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/settings');
      setUserName(response.data.name);
      setUserEmail(response.data.email);
      setDarkMode(response.data.theme === "dark");
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleToggleTheme = async () => {
    const nextTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    try {
      await axios.put('/api/settings', {
        name: userName,
        email: userEmail,
        theme: nextTheme,
        emailNotifications: true,
        language: "English"
      });
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Filter search results
  const filteredDocs = searchQuery.trim() === "" ? [] : allDocs.filter(d => 
    d.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTemplates = searchQuery.trim() === "" ? [] : allTemplates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return ["Dashboard", "Overview"];
    if (path === "/documents") return ["Workspace", "Documents"];
    if (path === "/chat") return ["AI Assistant", "Chat"];
    if (path === "/recent") return ["Workspace", "Recent Files"];
    if (path === "/analytics") return ["Operations", "Analytics"];
    if (path === "/templates") return ["Knowledge Base", "Templates"];
    if (path === "/settings") return ["Account", "Settings"];
    if (path === "/help") return ["Support", "Help Center"];
    return ["Page", path.substring(1)];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 glass sticky top-0 z-30 flex items-center justify-between px-6 border-b border-slate-200/50 bg-white/70 backdrop-blur-md">
      {/* Left side: Mobile Menu Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100/50 md:hidden transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 min-w-0">
          <span className="hover:text-slate-700 cursor-pointer">{breadcrumbs[0]}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate">{breadcrumbs[1]}</span>
        </nav>
      </div>
      
      {/* Center: Global Search */}
      <div className="relative hidden md:block w-72 lg:w-96 mx-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          placeholder="Global search (docs, templates, chats)..."
          className="w-full h-9 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
        />

        {/* Global Search Results Overlay */}
        {showSearchResults && searchQuery.trim() !== "" && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase">Search Results</h4>
              <button 
                onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="space-y-4">
              {/* Document Results */}
              {filteredDocs.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-[9px] font-bold text-slate-400 uppercase">Documents</h5>
                  {filteredDocs.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery("");
                        navigate("/documents");
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-700 truncate">{doc.originalFilename}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Template Results */}
              {filteredTemplates.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-[9px] font-bold text-slate-400 uppercase">Templates</h5>
                  {filteredTemplates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery("");
                        navigate("/templates");
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-semibold text-slate-700 truncate">{tpl.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredDocs.length === 0 && filteredTemplates.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-3">No matching results found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Actions & User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Upload Button */}
        <Link 
          to="/documents"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer hover:shadow hover:-translate-y-0.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </Link>

        {/* Dark Mode Toggle */}
        <button 
          onClick={handleToggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer",
              showNotifications && "bg-slate-100"
            )}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white text-[7px] font-extrabold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/85 rounded-xl shadow-xl z-50 p-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800">Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="py-2 max-h-60 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-2.5 flex justify-between gap-2 group">
                      <div className="flex gap-2">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                          n.read ? "bg-slate-200" : "bg-blue-500"
                        )} />
                        <div>
                          <p className={cn("text-xs text-slate-700", !n.read && "font-bold")}>{n.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Profile Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 shadow-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-xs text-blue-600">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 p-1.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate("/settings"); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate("/settings"); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate("/help"); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Support Center</span>
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); alert("Logging out..."); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors border-t border-slate-100 mt-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
