import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "../assets/logo.png";
import { gsap } from "gsap";

const Navbar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const user = JSON.parse(localStorage.getItem("user"));
  const currentRole = user?.role || role;
  const isLoggedIn = !!currentRole;

  useEffect(() => {
    if (mobileMenuRef.current) {
      gsap.to(mobileMenuRef.current, {
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const getMenuItems = () => {
  if (!isLoggedIn) {
    // For non-logged in users, show all options including signup
    return [
      { name: "Home", path: "/" },
      { name: "Records", path: "/login" },
      { name: "Research", path: "/login" },
      { name: "Consent", path: "/login" },
      { name: "Signup", path: "/signup" },
    ];
  }
  
  if (currentRole === "Patient") {
    return [
      { name: "Home", path: "/" },
      { name: "Records", path: "/records" },
      { name: "Research", path: "/research" },
      { name: "Consent", path: "/consent" },
      // { name: "Profile", path: "/profile" },
    ];
  }
  
  if (currentRole === "Researcher") {
    return [
      { name: "Home", path: "/" },
      { name: "Records", path: "/researcher_records" },
      { name: "Consent", path: "/researcher_consent" },
      // { name: "Profile", path: "/researcher_profile" },
    ];
  }
  
  // Fallback
  return [];
};
  const menuItems = getMenuItems();

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${
        isHomePage
          ? "bg-white/5 backdrop-blur-xl border-b border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          : "bg-black border-b border-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">

        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Logo"
            className="h-10 w-10 object-cover rounded-full bg-white p-1"
          />
          <h1 className="text-xl font-bold text-blue-400 tracking-wide">
            PatientX
          </h1>
          {/* Show current role badge only when logged in */}
          {isLoggedIn && (
            <span className="text-xs bg-white text-blue-500 px-2 py-1 rounded-full font-semibold">
              {currentRole}
            </span>
          )}
        </div>

        <ul className="hidden lg:flex gap-8 items-center font-medium text-gray-300">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link
                to={item.path}
                className={`hover:text-blue-400 transition ${
                  location.pathname === item.path ? "text-blue-400" : ""
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}

          {isLoggedIn && (
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 
                bg-blue-600/20 hover:bg-blue-600/40 
                border border-blue-400/30 
                px-4 py-2 rounded-lg text-blue-300 
                transition text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </li>
          )}
        </ul>

        <button
          className="lg:hidden text-blue-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div
        ref={mobileMenuRef}
        className={`lg:hidden overflow-hidden h-0 opacity-0 
        ${
          isHomePage
            ? "bg-white/5 backdrop-blur-xl border-t border-blue-500/20"
            : "bg-black border-t border-gray-800"
        }`}
      >
        <ul className="flex flex-col gap-4 px-6 py-4 text-gray-300">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block hover:text-blue-400 transition"
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
