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

function Layout({ children }) {
  const location = useLocation();

  // Pages where Navbar should be hidden
  const hideNavbar = ["/login", "/signup", "/profile"];
  // Pages where Footer should be hidden
  const hideFooter = ["/login", "/signup"];

  return (
    <>
      {!hideNavbar.includes(location.pathname) && <Navbar />}
      <main>{children}</main>
      {!hideFooter.includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/records" element={<Records />} />
          <Route path="/research" element={<Research />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
