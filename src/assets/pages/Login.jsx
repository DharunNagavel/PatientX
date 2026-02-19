import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = ({setrole,setuser_id}) => {
  const [formData, setFormData] = useState({
    mail: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:9000/api/auth/signin", formData);
    console.log("Login data:", res);
    
    // Handle string error responses
    if (res.data === "User does not exist") {
      alert("User does not exist. Please check your email or sign up.");
      return;
    }
    if (res.data === "Invalid password" || res.data === "Wrong password") {
      alert("Invalid password. Please try again.");
      return;
    }
    
    // Handle successful login (response should be an object with user data)
    alert("Login successful!");
    setFormData({
      mail: "",
      password: "",
    });
    setrole(res.data.role);
    setuser_id(res.data.user_id);
    navigate("/");
  } catch (err) {
    console.error("Login error:", err);
    alert(err.response?.data?.error || "Login failed!");
  }
};

  const goToSignup = () => {
    navigate("/signup");
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative">
            <label className="block mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition"
          >
            Login
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Don't have an account?{" "}
          <span
            onClick={goToSignup}
            className="text-blue-500 cursor-pointer hover:underline transition"
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
