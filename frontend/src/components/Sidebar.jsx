import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  Clock, 
  BarChart3, 
  Layers, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { cn } from "../lib/utils";

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: "AI Chat", path: "/chat", icon: MessageSquare },
    { name: "Recent Files", path: "/recent", icon: Clock, isMock: true },
    { name: "Analytics", path: "/analytics", icon: BarChart3, isMock: true },
    { name: "Templates", path: "/templates", icon: Layers, isMock: true },
  ];

  const bottomItems = [
    { name: "Settings", path: "/settings", icon: Settings, isMock: true },
    { name: "Help Center", path: "/help", icon: HelpCircle, isMock: true },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "glass h-screen flex flex-col fixed md:sticky top-0 z-50 border-r border-slate-200/50 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Toggle Collapse Button (Desktop Only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm z-50 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight truncate">
                DocuMind AI
              </span>
            )}
          </div>
        </div>

        {/* Workspace Switcher (Mocked) */}
        {!isCollapsed && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                  W
                </div>
                <span className="text-xs font-semibold text-slate-700 truncate">Personal Workspace</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.isMock ? "#" : item.path}
                onClick={() => isMobileOpen && setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-sm",
                  isActive 
                    ? "text-blue-600 bg-blue-50/80 font-medium shadow-sm shadow-blue-500/5" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                )}
                <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Utility Items */}
        <div className="px-3 py-4 border-t border-slate-100 space-y-1.5">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to="#"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all text-sm group"
            >
              <item.icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 shadow-sm shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-xs text-blue-600">
                BB
              </div>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">Bhargav Bhat</p>
                <p className="text-[10px] text-slate-400 truncate">bhargav@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
