import { BrowserRouter, Routes, Route } from "react-router-dom";
import {useState } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CustomerPage from "./pages/CustomerPage";
import NotFound from "./pages/NotFound";
import DriverManifest from "./pages/DriverManifest";
import Sidebar from "./components/Sidebar";
import { items } from "./components/Sidebar";

function App() {
  const [expand, setExpand] = useState(false);
  return (
  
    <BrowserRouter>
      <div className="flex">
        <Sidebar items={items}  expand={expand} setExpand={setExpand} />
        <div className={`flex-1 p-6  transition-all ${expand? "ml-64":"ml-20"}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customer-page" element={<CustomerPage />} />
            <Route path="/driver-manifest" element={<DriverManifest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
