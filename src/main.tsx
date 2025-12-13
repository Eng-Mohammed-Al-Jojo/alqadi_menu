import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AdminPage from "./Admin";

import "./index.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* الصفحة الرئيسية (Menu) */}
        <Route path="/" element={<App />} />

        {/* صفحة الأدمن */}
        <Route path="/admin" element={<AdminPage />} />
       
       
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
