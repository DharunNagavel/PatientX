import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./assets/pages/Home";
import Records from "./assets/pages/Records";
import Research from "./assets/pages/Research";
import Consent from "./assets/pages/Consent";
import Signup from "./assets/pages/Signup";
import Login from "./assets/pages/Login";
import Profile from "./assets/pages/Profile";
import Chatbot from "./assets/pages/Chatbot";
import Researcher_consent from "./assets/pages/Researcher_consent";
import Researcher_records from "./assets/pages/Researcher_records";
import Researcher_profile from "./assets/pages/Researcher_profile";
import { useState, useEffect } from "react";

function Layout({ children, role }) {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup","/profile","/researcher_profile"].includes(location.pathname);
  const hideFooter = ["/login", "/signup"].includes(location.pathname);
  
  // Show chatbot on all pages except login/signup
  const showChatbot = !["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar role={role} />}
      <main>{children}</main>
      {!hideFooter && <Footer />}
      
      {/* Add Chatbot here - it will appear as floating button on all pages except login/signup */}
      {showChatbot && <Chatbot />}
    </>
  );
}

function App() {
  const [role, setRole] = useState(null); // Changed from "patient" to null
  const [user_id, setUser_id] = useState();  

  // Load user from localStorage on app start
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
      setUser_id(user.user_id);
    } else {
      setRole(null); // Explicitly set to null if no user
    }
  }, []);

  return (
    <BrowserRouter>
      <Layout role={role}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/researcher_consent" element={<Researcher_consent user_id={user_id} />} />
          <Route path="/researcher_records" element={<Researcher_records user_id={user_id} />} />
          <Route path="/researcher_profile" element={<Researcher_profile />} />
          <Route path="/records" element={<Records user_id={user_id} role={role} />} />
          <Route path="/research" element={<Research role={role} />} />
          <Route path="/consent" element={<Consent user_id={user_id} role={role} />} />
          <Route path="/signup" element={<Signup setrole={setRole} setuser_id={setUser_id} />} />
          <Route path="/login" element={<Login setrole={setRole} setuser_id={setUser_id} />} />
          <Route path="/profile" element={<Profile role={role} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
