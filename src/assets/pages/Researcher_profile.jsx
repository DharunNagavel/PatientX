import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaFlask,
  FaWallet,
  FaCog,
  FaChevronRight,
  FaDatabase,
  FaChartLine
} from "react-icons/fa";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Researcher_records from './Researcher_records';

const Researcher_profile = ({user_id}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [savedStudies, setSavedStudies] = useState([]);  
  const [openModal, setOpenModal] = useState(false);
  const [newStudy, setNewStudy] = useState({
    title: "",
    createdOn: "",
    datasetNeeded: "",
    type: "",
    status: ""
  });

  const handleStudyChange = (e) => {
    const { name, value } = e.target;
    setNewStudy((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
  fetchSavedStudies();
}, []);
const fetchSavedStudies = async () => {
  try {
    const res = await axios.get(`https://patientx.onrender.com/api/get-research/${user_id}`);
    setSavedStudies(res.data.research || []);
  } catch (err) {
    console.error("Failed to fetch studies", err);
  }
};



const handleStudySubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("https://patientx.onrender.com/api/add-research", {
      user_id: user_id,  // Must be passed as prop
      newStudy: newStudy,
    });

    alert("New study added successfully");
    fetchSavedStudies();

    // close modal and reset
    setOpenModal(false);
    setNewStudy({
      title: "",
      createdOn: "",
      datasetNeeded: "",
      type: "",
      status: "",
    });

  } catch (err) {
    alert("Failed to add study");
    console.error(err);
  }
};

  
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);

  const researcherData = {
    name: "Dr. Research",
    email: "researcher@example.com",
    studiesConducted: 8,
    datasetsAccessed: 24,
    currentProjects: 3,
    approvalRate: "92%",
  };

  const recentStudies = savedStudies.slice(0, 4); // only 4 studies for overview

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
    "Delete Research Account",
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
      </div>

      <nav className="flex flex-col gap-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaChartLine className="text-lg" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("studies")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "studies"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaFlask className="text-lg" /> Studies
        </button>
        <button
          onClick={() => setActiveTab("datasets")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "datasets"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaDatabase className="text-lg" /> Datasets
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "wallet"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 text-gray-300"
          }`}
        >
          <FaWallet className="text-lg" /> Transaction
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            activeTab === "settings"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 text-gray-300"
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
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-gray-900 p-6 hidden md:flex flex-col border-r border-gray-700">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile Sidebar */}
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

        {/* MAIN CONTENT */}
        <motion.main
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col min-h-screen md:ml-0"
        >
          {/* Mobile Menu Button */}
          <div className="p-6 md:p-8 pb-0">
            <button
              className="md:hidden mb-6 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-0">
        
            {activeTab === "overview" && (
              <section>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaFlask className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Studies Conducted</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">
                      {savedStudies.length}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaDatabase className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Datasets Accessed</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">
                      {/* {researcherData.datasetsAccessed} */}0
                    </p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaChartLine className="text-blue-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold">Approval Rate</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">
                      {/* {researcherData.approvalRate} */}0
                    </p>
                  </div>
                </div>

                {/* Recent studies */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Recent Studies</h3>
                  </div>

                  <div className="space-y-4">
                    {recentStudies.map((study) => (
                      <div
                        key={study.id}
                        className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{study.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{study.createdOn}</p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            study.status === "Completed"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {study.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "studies" && (
              <section>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-300">
                      Total studies conducted:{" "}
                      <span className="text-blue-400 font-semibold">
                        {savedStudies.length}
                      </span>
                    </p>

                    <button
                      onClick={() => setOpenModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition"
                    >
                      + New Study
                    </button>
                  </div>

                  <div className="space-y-4">
                   {savedStudies.map((study) => (
                      <div
                        key={study.id}
                        className="p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg text-white">{study.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              study.status === "Completed"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {study.status}
                          </span>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">Created: {study.createdOn}</p>

                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition text-sm"
                            onClick={() => {
                              setSelectedStudy(study);
                              setShowDetails(true);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "datasets" && (
              <section>
                <h2 className="text-3xl font-bold mb-6">Accessed Datasets</h2>
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-300">
                      Total datasets accessed:{" "}
                      <span className="text-blue-400 font-semibold">
                        {/* {researcherData.datasetsAccessed} */}0
                      </span>
                    </p>

                  </div>

                  <div className="text-center py-12 text-gray-400">
                    <FaDatabase size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No datasets accessed yet</p>
                    <p className="text-sm">
                      Start by browsing the data marketplace to find relevant medical datasets
                    </p>
                    <Link to={"/researcher_records"}>
                      <button className="mt-4 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white transition">Explore Marketplace</button>
                    </Link>
                  </div>
                </div>
              </section>
            )}

  {activeTab === "wallet" && (
  <section className="text-gray-200">
    <h2 className="text-3xl font-bold mb-6">Recent Transaction History</h2>

    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Transactions</h3>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">

        {/* Transaction Item */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xl">
              ₹
            </div>

            <div>
              <p className="font-medium">Sent to: <span className="text-blue-300">Riya Sharma</span></p>
              <p className="text-sm text-gray-400">
                Razorpay • 28 Nov, 2025 • 5:21 PM
              </p>
            </div>
          </div>

          <p className="text-red-400 font-semibold">- ₹850</p>
        </div>

        {/* Transaction Item */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xl">
              ₹
            </div>

            <div>
              <p className="font-medium">Sent to: <span className="text-blue-300">Arun Kumar</span></p>
              <p className="text-sm text-gray-400">
                Razorpay • 27 Nov, 2025 • 2:10 PM
              </p>
            </div>
          </div>

          <p className="text-red-400 font-semibold">- ₹600</p>
        </div>

        {/* Transaction Item */}
        <div className="flex items-center justify-between p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xl">
              ₹
            </div>

            <div>
              <p className="font-medium">Sent to: <span className="text-blue-300">Meera Devi</span></p>
              <p className="text-sm text-gray-400">
                Razorpay • 25 Nov, 2025 • 10:00 AM
              </p>
            </div>
          </div>

          <p className="text-red-400 font-semibold">- ₹1200</p>
        </div>

      </div>
    </div>
  </section>
)}



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
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setOpenModal(false)}
          ></div>

          <div
            className="relative bg-[#0F172A] border border-gray-700/40 shadow-2xl 
                       rounded-2xl p-8 w-full max-w-lg text-white z-50
                       animate-[fadeIn_0.2s_ease-out,scaleUp_0.25s_ease-out]"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              onClick={() => setOpenModal(false)}
            >
              ✕
            </button>

            <h3 className="text-3xl font-bold mb-6 text-center">Add New Research</h3>

            <form onSubmit={handleStudySubmit} className="space-y-5">
              <div>
                <label className="block mb-1 text-gray-300">Research Title</label>
                <input
                  type="text"
                  name="title"
                  value={newStudy.title}
                  onChange={handleStudyChange}
                  required
                  className="w-full border border-gray-700 rounded-xl px-4 py-3 bg-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Created On</label>
                <input
                  type="date"
                  name="createdOn"
                  value={newStudy.createdOn}
                  onChange={handleStudyChange}
                  required
                  className="w-full border border-gray-700 rounded-xl px-4 py-3 bg-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Datasets Needed</label>
                <textarea
                  name="datasetNeeded"
                  value={newStudy.datasetNeeded}
                  onChange={handleStudyChange}
                  placeholder="Eg: Bone dataset, Heart X-rays, MRI scans..."
                  className="w-full border border-gray-700 rounded-xl px-4 py-3 bg-gray-800 text-white"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Type Required</label>
                <select
                  name="type"
                  value={newStudy.type}
                  onChange={handleStudyChange}
                  required
                  className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white"
                >
                  <option value="">Select</option>
                  <option value="Report">Report</option>
                  <option value="Scan">Scan</option>
                  <option value="X-ray">X-ray</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Prescription">Prescription</option>
                </select>
              </div>
              <div>
              <label className="block mb-1 text-gray-300">Status</label>
              <label className="mr-4">
                <input
                  type="radio"
                  name="status"
                  value="Completed"
                  checked={newStudy.status === "Completed"}
                  onChange={handleStudyChange}
                /> Completed
              </label>

              <label>
                <input
                  type="radio"
                  name="status"
                  value="Inprogress"
                  checked={newStudy.status === "Inprogress"}
                  onChange={handleStudyChange}
                /> Inprogress
              </label>
             </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-lg"
              >
                Add Research
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedStudy && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-gray-900 w-full max-w-lg rounded-t-2xl p-6 animate-slideUp shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-3">{selectedStudy.title}</h2>

            <p className="text-gray-300 mb-2">
              <strong>Date:</strong> {selectedStudy.createdOn}
            </p>

            <p className="text-gray-300 mb-2">
              <strong>Type:</strong> {selectedStudy.type}
            </p>

            <p className="text-gray-300 mb-2">
              <strong>Dataset Needed:</strong>
              <br />
              {selectedStudy.datasetNeeded}
            </p>

            <button
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg py-2 mt-4"
              onClick={() => setShowDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Researcher_profile;
