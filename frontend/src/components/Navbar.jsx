import { Bell, Search, Menu } from "lucide-react";

const Navbar = () => {
  return (
    <header className="h-20 glass sticky top-0 z-30 flex items-center justify-between px-6 border-b border-slate-200/50">
      <div className="flex items-center gap-4">
        <button className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100/50 md:hidden transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden sm:block w-64 md:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search across documents..."
            className="w-full h-10 pl-11 pr-4 bg-slate-100/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100/50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-400 to-indigo-400 p-0.5 shadow-md cursor-pointer hover:scale-105 transition-transform">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-700">ME</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
