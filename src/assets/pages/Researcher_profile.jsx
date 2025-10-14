import React, { useState } from "react";
import { FaUserCircle, FaFlask, FaWallet, FaCog, FaChevronRight, FaDatabase, FaChartLine } from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Researcher_profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const researcherData = {
    name: "Dr. Research",
    email: "researcher@example.com",
    researcherId: "RS-203948",
    studiesConducted: 8,
    datasetsAccessed: 24,
    tokensSpent: 1200,
    tokensAvailable: 350,
    currentProjects: 3,
    approvalRate: "92%"
  };

  const recentStudies = [
    { id: 1, title: "Cardiovascular Disease Patterns", date: "Oct 15, 2025", status: "Completed" },
    { id: 2, title: "Diabetes Treatment Analysis", date: "Oct 12, 2025", status: "In Progress" },
    { id: 3, title: "Mental Health Trends", date: "Oct 8, 2025", status: "Completed" },
  ];

  const settingsOptions = [
    "Update Research Profile",
    "Change Password",
    "Two-Factor Authentication (2FA)",
    "Research Credentials",
    "Email Notifications",
    "Data Access Preferences",
    "Billing & Payments",
    "Research Institution Details",
    "Download Research Data",
    "Delete Research Account"
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center mb-10">
        <FaUserCircle size={80} className="text-white mb-3" />
        <h2 className="text-xl font-semibold">{researcherData.name}</h2>
        <p className="text-gray-300 text-sm">{researcherData.email}</p>
        <p className="text-blue-400 text-xs mt-1">Research ID: {researcherData.researcherId}</p>
      </div>

      <nav className="flex flex-col gap-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "overview" ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaChartLine className="text-lg" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("studies")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "studies" ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaFlask className="text-lg" /> Studies
        </button>
        <button
          onClick={() => setActiveTab("datasets")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "datasets" ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaDatabase className="text-lg" /> Datasets
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "wallet" ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaWallet className="text-lg" /> Wallet
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "settings" ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaCog className="text-lg" /> Settings
        </button>
      </nav>

      <button
        onClick={() => navigate("/")}
        className="mt-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition font-medium"
      >
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="w-64 bg-gray-900 p-6 hidden md:flex flex-col border-r border-gray-700">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile sidebar */}
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 p-6 md:hidden flex flex-col border-r border-gray-700"
        >
          <button
            className="self-end mb-4 text-white p-2 rounded-lg hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
          <SidebarContent />
        </motion.aside>

        {/* Main content */}
        <motion.main
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col min-h-screen md:ml-0"
        >
          {/* Mobile menu button */}
          <div className="p-6 md:p-8 pb-0">
            <button
              className="md:hidden mb-6 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Content area that can scroll */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">Research Dashboard</h2>
                  <div className="text-sm text-gray-400">
                    Researcher ID: <span className="text-blue-400">{researcherData.researcherId}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaFlask className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Studies Conducted</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{researcherData.studiesConducted}</p>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaDatabase className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Datasets Accessed</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{researcherData.datasetsAccessed}</p>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaWallet className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Tokens Available</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{researcherData.tokensAvailable}</p>
                  </div>
                  
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaChartLine className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Approval Rate</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{researcherData.approvalRate}</p>
                  </div>
                </div>

                {/* Recent Studies Section */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Recent Studies</h3>
                    <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition text-sm">
                      New Study
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentStudies.map(study => (
                      <div key={study.id} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{study.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{study.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          study.status === "Completed" 
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}>
                          {study.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Studies Tab */}
            {activeTab === "studies" && (
              <section>
                <h2 className="text-3xl font-bold mb-6">Research Studies</h2>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-300">Total studies conducted: <span className="text-blue-400 font-semibold">{researcherData.studiesConducted}</span></p>
                    <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition">
                      + New Study
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {recentStudies.map(study => (
                      <div key={study.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg text-white">{study.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            study.status === "Completed" 
                              ? "bg-blue-500/20 text-blue-400" 
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {study.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">Created: {study.date}</p>
                        <div className="flex gap-2">
                          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition text-sm">
                            View Details
                          </button>
                          <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white transition text-sm">
                            Export Data
                          </button>
                          <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white transition text-sm">
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Datasets Tab */}
            {activeTab === "datasets" && (
              <section>
                <h2 className="text-3xl font-bold mb-6">Accessed Datasets</h2>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-300">
                      Total datasets accessed: <span className="text-blue-400 font-semibold">{researcherData.datasetsAccessed}</span>
                    </p>
                    <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition">
                      Browse Datasets
                    </button>
                  </div>
                  
                  <div className="text-center py-12 text-gray-400">
                    <FaDatabase size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No datasets accessed yet</p>
                    <p className="text-sm">Start by browsing the data marketplace to find relevant medical datasets</p>
                    <button className="mt-4 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white transition">
                      Explore Marketplace
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <section>
                <h2 className="text-3xl font-bold mb-6">Wallet</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">Token Balance</h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-400 mb-2">{researcherData.tokensAvailable}</p>
                      <p className="text-gray-400">Available Tokens</p>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">Spending Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Spent:</span>
                        <span className="text-red-400 font-semibold">{researcherData.tokensSpent} tokens</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Datasets Accessed:</span>
                        <span className="text-white font-semibold">{researcherData.datasetsAccessed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Average Cost:</span>
                        <span className="text-white font-semibold">
                          {researcherData.datasetsAccessed > 0 
                            ? Math.round(researcherData.tokensSpent / researcherData.datasetsAccessed) 
                            : 0} tokens/dataset
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-xl font-semibold mb-4 text-white">Recent Transactions</h3>
                  <div className="text-center py-8 text-gray-400">
                    <FaWallet size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Your transaction history will appear here</p>
                    <p className="text-sm mt-2">All dataset purchases and token transactions will be logged</p>
                  </div>
                </div>
              </section>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <section>
                <h2 className="text-3xl font-bold mb-6"> Settings</h2>
                <div className="flex flex-col gap-3">
                  {settingsOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition group"
                    >
                      <span className="text-white group-hover:text-gray-200">{option}</span>
                      <FaChevronRight className="text-gray-400 group-hover:text-white" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Researcher_profile;