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
import Researcher_consent from "./assets/pages/Researcher_consent";
import Researcher_records from "./assets/pages/Researcher_records";
import { useState } from "react";

function Layout({ children, role }) {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup", "/profile"];
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
  return (
    <BrowserRouter>
      <Layout role={role}>
        <Routes>
          <Route path="/" element={<Home />} />

          
          <Route path="/researcher_consent" element={<Researcher_consent />} />
          <Route path="/researcher_records" element={<Researcher_records />} />
          <Route path="/records" element={<Records role={role}/>} />
          <Route path="/research" element={<Research role={role} />} />
          <Route path="/consent" element={<Consent role={role} />} />
          <Route path="/signup" element={<Signup setrole = {setrole}/>} />
          <Route path="/login" element={<Login setrole = {setrole}/>} />
          <Route path="/profile" element={<Profile role={role}/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
