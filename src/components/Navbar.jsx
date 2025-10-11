import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo.png";
import { gsap } from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (mobileMenuRef.current) {
      gsap.to(mobileMenuRef.current, {
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => setIsScrolled(window.scrollY > 50);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [location]);

  const navbarClasses =
    location.pathname === "/"
      ? isScrolled
        ? "bg-blue-500 shadow-lg text-white"
        : "bg-white/30 backdrop-blur-md border border-white/20 shadow-lg text-black"
      : "bg-blue-500 shadow-lg text-white";

  const hoverColor =
    location.pathname === "/" && !isScrolled
      ? "hover:text-blue-500"
      : "hover:text-yellow-300"; 

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Records", path: "/records" },
    { name: "Research", path: "/research" },
    { name: "Consent", path: "/consent" },
    { name: "Wallet", path: "/wallet" },
  ];

  return (
    <nav
      className={`fixed top-2 left-0 w-full z-50 transition-all duration-500 rounded-3xl ${navbarClasses}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full bg-white p-1"
          />
          <h1 className="text-lg sm:text-2xl font-bold">PatientX</h1>
        </div>
        <ul className="hidden lg:flex gap-6 text-base sm:text-lg items-center font-medium">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link
                to={item.path}
                className={`transition-colors duration-300 ${hoverColor}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <button
          className={`lg:hidden p-2 rounded-lg ${
            isScrolled ? "text-white" : "text-black"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      <div
        ref={mobileMenuRef}
        className={`lg:hidden px-4 overflow-hidden h-0 opacity-0 ${
          isScrolled
            ? "bg-blue-500 text-white"
            : "bg-white/30 backdrop-blur-md text-black"
        }`}
      >
        <ul className="flex flex-col gap-3 py-3 text-base font-medium">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block ${hoverColor}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
