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
import { useState } from "react";
import { i } from "framer-motion/client";


function Layout({ children, role }) {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup", "/profile", "/researcher_profile"];
  const hideFooter = ["/login", "/signup"];

  return (
    <>
      {!hideNavbar.includes(location.pathname) && <Navbar role={role}/>}
      <main>{children}</main>
      {!hideFooter.includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  const [role,setrole] = useState("patient");
  const [user_id,setuser_id] = useState();  
  return (
    <BrowserRouter>
      <Layout role={role}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/researcher_consent" element={<Researcher_consent />} />
          <Route path="/researcher_records" element={<Researcher_records />} />
          <Route path="/researcher_profile" element={<Researcher_profile />} />
          <Route pathe="/chatbot" element={<Chatbot />} />
          <Route path="/records" element={<Records user_id={user_id} role={role}/>} />
          <Route path="/research" element={<Research role={role} />} />
          <Route path="/consent" element={<Consent user_id={user_id} role={role} />} />
          <Route path="/signup" element={<Signup setrole = {setrole} setuser_id={setuser_id}/>} />
          <Route path="/login" element={<Login setrole = {setrole} setuser_id={setuser_id}/>} />
          <Route path="/profile" element={<Profile role={role}/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;