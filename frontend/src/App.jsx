import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import RecentFiles from "./pages/RecentFiles";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="chat" element={<Chat />} />
          <Route path="recent" element={<RecentFiles />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="templates" element={<Templates />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
