import React, { useState, useRef, useEffect } from "react";
import {gsap} from "gsap";

const Records = () => {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "",
    files: 0,
    rate: "",
    notes: "",
    filesData: [],
    fileNames: [],
  });

  const cardsRef = useRef([]);
  useEffect(() => {
    if (records.length > 0) {
      const lastCard = cardsRef.current[cardsRef.current.length - 1];
      if (lastCard) {
        gsap.fromTo(
          lastCard,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
        );
      }
    }
  }, [records]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map((file) => file.name);
    setNewRecord({
      ...newRecord,
      filesData: files,
      files: files.length,
      fileNames,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newRecord.files === 0) {
      alert("Please upload at least one file.");
      return;
    }
    const recordToAdd = {
      ...newRecord,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
    };
    setRecords([...records, recordToAdd]);
    setNewRecord({
      type: "",
      files: 0,
      rate: "",
      notes: "",
      filesData: [],
      fileNames: [],
    });
    setShowModal(false);
  };
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white z-40 shadow-md flex items-center px-6">
        <h1 className="text-xl font-bold">Patient Portal</h1>
      </nav>
      <div
        className={`pt-24 max-w-5xl mx-auto p-6 transition-all ${
          showModal ? "blur-sm" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Your Records</h2>
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            + New Record
          </button>
        </div>
        {records.length === 0 ? (
          <p className="text-gray-400 text-center mt-20 text-lg">
            No health data uploaded
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record, index) => (
              <div
                key={record.id}
                ref={(el) => (cardsRef.current[index] = el)}
                className="group relative bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
              >
                <p className="text-gray-400 text-sm">
                  <strong>Date:</strong>{" "}
                  {new Date(record.date).toLocaleDateString()}
                </p>
                <p className="text-white font-semibold">{record.type}</p>
                <p className="text-gray-400">
                  <strong>Files:</strong> {record.files}
                </p>
                <p className="text-gray-400">
                  <strong>Rate:</strong> ₹{record.rate}
                </p>
                <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-start text-center p-4 rounded-xl opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 z-10 overflow-auto max-h-96">
                  {record.fileNames.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4 w-full">
                      {record.filesData.map((file, i) => (
                        <img
                          key={i}
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-32 object-contain rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-white font-bold">{record.type}</p>
                    <p className="text-gray-400">
                      <strong>Files:</strong> {record.files}
                    </p>
                    <p className="text-gray-400">
                      <strong>Rate:</strong> ₹{record.rate}
                    </p>
                    {record.notes && (
                      <p className="text-gray-400 mt-1">{record.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative bg-gray-900 rounded-2xl p-8 w-full max-w-md text-white z-50">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4">Add New Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Type of Record</label>
                <select
                  name="type"
                  value={newRecord.type}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Report">Report</option>
                  <option value="Scan">Scan</option>
                  <option value="X-ray">X-ray</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-white"
                />
                {newRecord.fileNames.length > 0 && (
                  <ul className="mt-2 text-gray-400 list-disc list-inside">
                    {newRecord.fileNames.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block mb-1">Rate (₹)</label>
                <input
                  type="text"
                  name="rate"
                  value={newRecord.rate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setNewRecord({ ...newRecord, rate: val });
                    }
                  }}
                  placeholder="Enter rate in numbers"
                  required
                  className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={newRecord.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any extra info..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Add Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
