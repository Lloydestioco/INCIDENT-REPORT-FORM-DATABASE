// INCIDENT REPORT WEB APP (Full Stack - React + Node.js + Firebase)

// 📁 Structure:
// - Frontend: React + TailwindCSS + React Router + Context API
// - Backend: Node.js (Express) or Firebase Functions
// - Database: Firebase Firestore
// - Hosting: Vercel (Frontend), Firebase (Backend + Auth + DB)

// === FRONTEND ===

// 1. App.jsx (Routing + Auth Wrapper)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UnitDashboard from "./pages/UnitDashboard";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unit/:unitName" element={<UnitDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// 2. Firebase.js (Firebase Config)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 3. UnitDashboard.jsx (View Reports by Unit)
import { useParams } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";

export default function UnitDashboard() {
  const { unitName } = useParams();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "incidentReports"),
      where("unit", "==", unitName)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [unitName]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{unitName} Dashboard</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Date</th><th>Code</th><th>Description</th><th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="border-t">
              <td>{r.date}</td>
              <td>{r.code}</td>
              <td>{r.description}</td>
              <td>{r.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 4. Login.jsx (Simple Email Login)
// For demonstration, can be expanded to role-based login.
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2" />
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 px-4 rounded">Login</button>
    </div>
  );
}

// Backend (Firebase Firestore is used as backend)
// You can optionally create Cloud Functions for report handling, emailing, PDF generation, etc.
