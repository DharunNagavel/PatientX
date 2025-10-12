import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./assets/pages/Home";
import Records from "./assets/pages/Records";
import Research from "./assets/pages/Research";
import Consent from "./assets/pages/Consent";
import Wallet from "./assets/pages/Wallet";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/records" element={<Records />} />
        <Route path="/research" element={<Research />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
