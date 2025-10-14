import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./assets/pages/Home";
import Records from "./assets/pages/Records";
import Research from "./assets/pages/Research";
import Consent from "./assets/pages/Consent";
import Signup from "./assets/pages/Signup";
import Login from "./assets/pages/Login";
import Profile from "./assets/pages/Profile";
import Chatbot from "./assets/pages/Chatbot"; // Changed path to components
import Researcher_consent from "./assets/pages/Researcher_consent";
import Researcher_records from "./assets/pages/Researcher_records";
import Researcher_profile from "./assets/pages/Researcher_profile";
import { useState, useEffect } from "react";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function Layout({ children, role }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const currentRole = user?.role || role;

  // Hide navbar on login/signup pages
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);
  // Hide footer on login/signup pages
  const hideFooter = ["/login", "/signup"].includes(location.pathname);
  // Show chatbot on all pages except login/signup
  const showChatbot = !["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar role={currentRole} />}
      <main className={hideNavbar ? "" : ""}>{children}</main>
      {!hideFooter && <Footer />}
      {showChatbot && <Chatbot />}
    </>
  );
}

function App() {
  const [role, setRole] = useState("patient");
  const [user_id, setUser_id] = useState();  

  // Load user from localStorage on app start
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
      setUser_id(user.user_id);
    }
  }, []);

  return (
    <BrowserRouter>
      <Layout role={role}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setrole={setRole} setuser_id={setUser_id} />} />
          <Route path="/signup" element={<Signup setrole={setRole} setuser_id={setUser_id} />} />

          {/* Patient-only routes */}
          <Route 
            path="/records" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Records user_id={user_id} role={role} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/research" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Research role={role} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/consent" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Consent user_id={user_id} role={role} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <Profile role={role} />
              </ProtectedRoute>
            } 
          />

          {/* Researcher-only routes */}
          <Route 
            path="/researcher_records" 
            element={
              <ProtectedRoute allowedRoles={['Researcher']}>
                <Researcher_records />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/researcher_consent" 
            element={
              <ProtectedRoute allowedRoles={['Researcher']}>
                <Researcher_consent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/researcher_profile" 
            element={
              <ProtectedRoute allowedRoles={['Researcher']}>
                <Researcher_profile />
              </ProtectedRoute>
            } 
          />

          {/* Redirect based on role */}
          <Route 
            path="/dashboard" 
            element={
              (() => {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.role === 'Patient') {
                  return <Navigate to="/records" replace />;
                } else if (user?.role === 'Researcher') {
                  return <Navigate to="/researcher_records" replace />;
                } else {
                  return <Navigate to="/login" replace />;
                }
              })()
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;