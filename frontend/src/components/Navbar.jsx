import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
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
  ChevronRight 
} from "lucide-react";
import { cn } from "../lib/utils";

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Generate breadcrumb text based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return ["Dashboard", "Overview"];
    if (path === "/documents") return ["Workspace", "Documents"];
    if (path === "/chat") return ["AI Assistant", "Chat"];
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
          placeholder="Global search (docs, chats, stats)..."
          className="w-full h-9 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
        />
      </div>

      {/* Right side: Actions & User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Upload Button (links to documents) */}
        <Link 
          to="/documents"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer hover:shadow hover:-translate-y-0.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </Link>

        {/* Dark Mode Toggle (Mocked) */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
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
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 p-4">
              <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">Notifications</h4>
              <div className="py-2 space-y-2.5">
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-700">Document analyzed successfully</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">bhargav_resume.pdf • Just now</p>
                  </div>
                </div>
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
              BB
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl z-50 p-1.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-800">Bhargav Bhat</p>
                <p className="text-[10px] text-slate-400 truncate">bhargav@example.com</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full transition-colors">
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full transition-colors">
                <Settings className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors border-t border-slate-100 mt-1">
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
