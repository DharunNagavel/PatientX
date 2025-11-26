import React, { useState } from "react";
import {
  FaUserCircle,
  FaFileMedical,
  FaWallet,
  FaCog,
  FaChevronRight
} from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const userData = {
    name: "User",
    email: "pranitha@example.com",
    recordsUploaded: 3,
    lastUpload: "Oct 10, 2025",
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const settingsOptions = [
    "Update Profile",
    "Change Password",
    "Login Activity",
    "Email Notifications",
    "Language Preferences",
    "Download My Data",
    "Delete Account",
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center mb-10">
        <FaUserCircle size={80} className="text-white mb-3" />
        <h2 className="text-xl font-semibold">{userData.name}</h2>
        <p className="text-gray-300 text-sm">{userData.email}</p>
      </div>

      <nav className="flex flex-col gap-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            activeTab === "overview" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          <FaUserCircle /> Overview
        </button>

        <button
          onClick={() => setActiveTab("records")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            activeTab === "records" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          <FaFileMedical /> Records
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            activeTab === "wallet" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          <FaWallet /> History
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            activeTab === "settings" ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          <FaCog /> Settings
        </button>
      </nav>

      <button
        onClick={() => navigate("/")}
        className="mt-auto bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded text-sm text-white transition"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar for large screens */}
      <aside className="w-64 bg-black/30 backdrop-blur-lg p-6 hidden md:flex flex-col border-r border-gray-600">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-black/90 backdrop-blur-lg p-6 md:hidden flex flex-col border-r border-gray-600"
      >
        <button
          className="self-end mb-4 text-white p-2 rounded-lg"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={24} />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Main Content */}
      <motion.main
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex-1 p-6 md:p-8"
      >
        {/* Mobile Menu Button */}
        <button
          className="md:hidden mb-4 p-2 rounded-lg bg-blue-600 text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 p-6 rounded-xl text-center border border-gray-600">
                <h3 className="text-lg font-semibold">Records Uploaded</h3>
                <p className="text-2xl mt-2">{userData.recordsUploaded}</p>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl text-center border border-gray-600">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-gray-300 mt-2">
                  Last upload: {userData.lastUpload}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* RECORDS */}
        {activeTab === "records" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">My Uploaded Records</h2>

            <div className="space-y-4">
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <h3 className="font-semibold text-lg">Blood Report - PDF</h3>
                <p className="text-gray-400 text-sm">Uploaded on 10 Oct 2025</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <h3 className="font-semibold text-lg">MRI Scan Report</h3>
                <p className="text-gray-400 text-sm">Uploaded on 15 Sep 2025</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <h3 className="font-semibold text-lg">X-Ray Chest Image</h3>
                <p className="text-gray-400 text-sm">Uploaded on 2 Sep 2025</p>
              </div>
            </div>
          </section>
        )}

        {/* WALLET HISTORY */}
        {activeTab === "wallet" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Activity History</h2>

            <div className="space-y-4">
              {/* ACCEPTED */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-gray-900 border border-gray-700">
                <div>
                  <p className="font-semibold text-green-400">
                    Dr. Riya Sharma
                  </p>
                  <p className="text-gray-400 text-sm">
                    10 Oct 2025 • 4:20 PM
                  </p>
                </div>
                <span className="text-green-400 font-semibold">Accepted</span>
              </div>

              {/* DECLINED */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-gray-900 border border-gray-700">
                <div>
                  <p className="font-semibold text-red-400">
                     Dr. Arun Kumar
                  </p>
                  <p className="text-gray-400 text-sm">
                    5 Oct 2025 • 11:00 AM
                  </p>
                </div>
                <span className="text-red-400 font-semibold">Declined</span>
              </div>

              {/* PAID */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-gray-900 border border-gray-700">
                <div>
                  <p className="font-semibold text-blue-400">
                    Paid by Dr. Meera Devi (Razorpay)
                  </p>
                  <p className="text-gray-400 text-sm">
                    28 Sep 2025 • 2:14 PM
                  </p>
                </div>
                <span className="text-blue-400 font-semibold">
                  ₹500 Received
                </span>
              </div>
            </div>
          </section>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Settings</h2>
            <div className="flex flex-col gap-3">
              {settingsOptions.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-gray-600 cursor-pointer hover:bg-gray-700 transition"
                >
                  <span>{option}</span>
                  <FaChevronRight />
                </div>
              ))}
            </div>
          </section>
        )}
      </motion.main>
    </div>
  );
};

export default Profile;
