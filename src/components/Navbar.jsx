import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo.png";
import { gsap } from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Records", path: "/records" },
    { name: "Research", path: "/research" },
    { name: "Consent", path: "/consent" },
    { name: "Signup", path: "/signup" },
  ];

  return (
    <nav className="fixed left-0 w-full z-50 bg-blue-500 text-white border-b-2 rounded-4xl top-1 shadow-lg transition-all duration-500">
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
                className="transition-colors duration-300 hover:text-black"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <button
          className="lg:hidden p-2 rounded-lg text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      <div
        ref={mobileMenuRef}
        className="lg:hidden px-4 overflow-hidden h-0 opacity-0 bg-blue-500 text-white"
      >
        <ul className="flex flex-col gap-3 py-3 text-base font-medium">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block transition-colors duration-300 hover:text-black"
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
