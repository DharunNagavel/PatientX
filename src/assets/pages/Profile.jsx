import React, { useState } from "react";
import { FaUserCircle, FaFileMedical, FaWallet, FaCog, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const userData = {
    name: "User",
    email: "pranitha@example.com",
    patientId: "PX-203948",
    recordsUploaded: 12,
    lastUpload: "Oct 10, 2025",
    tokensEarned: 430,
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const settingsOptions = [
    "Update Name & Email",
    "Change Password",
    "Two-Factor Authentication (2FA)",
    "Login Activity",
    "Email Notifications",
    "Language Preferences",
    "Delete Account",
    "Deactivate Account",
    "Download Data",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2647] via-[#144272] to-[#205295] text-white flex">
      <aside className="w-64 bg-black/30 backdrop-blur-lg p-6 hidden md:flex flex-col border-r border-gray-600">
        <div className="flex flex-col items-center mb-10">
          <FaUserCircle size={80} className="text-white mb-3" />
          <h2 className="text-xl font-semibold">{userData.name}</h2>
          <p className="text-gray-300 text-sm">{userData.email}</p>
        </div>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "overview" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            <FaUserCircle /> Overview
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "records" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            <FaFileMedical /> Records
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "wallet" ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            <FaWallet /> Wallet
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "settings" ? "bg-blue-600" : "hover:bg-gray-700"}`}
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
      </aside>
      <motion.main
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex-1 p-6 md:p-8"
      >
        {activeTab === "overview" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/40 p-6 rounded-xl text-center border border-gray-600">
                <h3 className="text-lg font-semibold">Patient ID</h3>
                <p className="text-2xl mt-2">{userData.patientId}</p>
              </div>
              <div className="bg-black/40 p-6 rounded-xl text-center border border-gray-600">
                <h3 className="text-lg font-semibold">Records Uploaded</h3>
                <p className="text-2xl mt-2">{userData.recordsUploaded}</p>
              </div>
              <div className="bg-black/40 p-6 rounded-xl text-center border border-gray-600">
                <h3 className="text-lg font-semibold">Tokens Earned</h3>
                <p className="text-2xl mt-2">{userData.tokensEarned}</p>
              </div>
            </div>
          </section>
        )}
        {activeTab === "records" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Uploaded Records</h2>
            <p className="text-gray-300">Last uploaded: {userData.lastUpload}</p>
          </section>
        )}
        {activeTab === "wallet" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Wallet</h2>
            <p className="text-gray-300">
              You’ve earned <span className="text-green-400">{userData.tokensEarned}</span> tokens.
            </p>
          </section>
        )}
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
