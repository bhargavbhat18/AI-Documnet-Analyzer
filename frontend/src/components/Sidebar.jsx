import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, MessageSquare, Settings } from "lucide-react";
import { cn } from "../lib/utils";

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: "Chat", path: "/chat", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 glass h-screen flex flex-col hidden md:flex sticky top-0 z-40 border-r border-slate-200/50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
          A
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">
          Analyzer
        </span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "text-primary-700 bg-primary-50 font-medium" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-200/50">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
