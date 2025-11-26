import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "../assets/logo.png";
import { gsap } from "gsap";

const Navbar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Get user from localStorage for persistence
  const user = JSON.parse(localStorage.getItem('user'));
  const currentRole = user?.role || role;
  const isLoggedIn = !!currentRole; // Check if user is logged in
  
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate("/");
    window.location.reload(); // Refresh to reset state
  };

  // Patient menu items
  const patientMenuItems = [
    { name: "Home", path: "/" },
    { name: "Records", path: "/records" },
    { name: "Research", path: "/research" },
    { name: "Consent", path: "/consent" },
    { name: "Profile", path: "/profile" },
  ];

  // Researcher menu items
  const researcherMenuItems = [
    { name: "Home", path: "/" },
    { name: "Records", path: "/researcher_records" },
    { name: "Consent", path: "/researcher_consent" },
    { name: "Profile", path: "/researcher_profile" },
  ];

  // Default menu (when not logged in) - Only Signup, no Login
  const defaultMenuItems = [
    { name: "Home", path: "/" },
    { name: "Records", path: "/records" },
    { name: "Researcher", path: "/research" },
    ...(role === "Researcher"
      ? [{ name: "Consent", path: "/researcher_consent" }]
      : [{ name: "Consent", path: "/consent" }]), 
    { name: "Signup", path: "/signup" },
    // Login removed - users can navigate to login from signup page if needed
  ];

  // Determine which menu to show based on login status and role
  const getMenuItems = () => {
    if (!isLoggedIn) {
      return defaultMenuItems;
    } else if (currentRole === 'Patient') {
      return patientMenuItems;
    } else if (currentRole === 'Researcher') {
      return researcherMenuItems;
    }
    return defaultMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="fixed left-0 w-full z-50 bg-blue-500 text-white rounded-4xl top-1 shadow-lg transition-all duration-500">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
        <div className="flex items-center gap-3">
          <img
            src={Logo}
            alt="Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full bg-white p-1"
          />
          <h1 className="text-lg sm:text-2xl font-bold">PatientX</h1>
          {/* Show current role badge only when logged in */}
          {isLoggedIn && (
            <span className="text-xs bg-white text-blue-500 px-2 py-1 rounded-full font-semibold">
              {currentRole}
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
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
          
          {/* Logout button only for logged-in users */}
          {isLoggedIn ? (
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white transition text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </li>
          ) : (
            // Show nothing extra when not logged in (Signup is already in menuItems)
            null
          )}
        </ul>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
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
          
          {/* Mobile logout button only for logged-in users */}
          {isLoggedIn && (
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white transition text-sm mt-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;