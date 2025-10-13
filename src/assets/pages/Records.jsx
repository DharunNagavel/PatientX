import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const Records = ({ user_id }) => {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({
    type: "",
    files: 0,
    rate: "",
    notes: "",
    filesData: [],
    fileNames: [],
  });

  const cardsRef = useRef([]);

  // Fetch user's records when component mounts or user_id changes
  useEffect(() => {
    if (user_id) {
      fetchUserRecords();
    }
  }, [user_id]);

  // Animation effect
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

  // Fetch user's records from backend
  const fetchUserRecords = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching records for user: ${user_id}`);
      
      const response = await fetch(`http://localhost:9000/api/block/data/user/${user_id}`);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
          // Transform backend data to match frontend format
          const transformedRecords = result.userData.map(record => ({
            id: record.data_hash, // Use data_hash as unique ID
            type: record.recordType,
            files: record.files.length,
            rate: record.rate,
            notes: record.notes,
            date: record.created_at || record.createdAt,
            blockchainHash: record.data_hash,
            fileNames: record.files.map(f => f.fileName),
          }));
          console.log('Transformed records:', transformedRecords);
          setRecords(transformedRecords);
        } else {
          console.error('API returned success: false', result);
          setRecords([]);
        }
      } else {
        console.error('HTTP Error:', response.status);
        // If endpoint doesn't exist yet, show empty state
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      // On network error, show empty state
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (newRecord.files === 0) {
        alert("Please upload at least one file.");
        return;
      }

      // Convert files to base64 for backend
      const filePromises = newRecord.filesData.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              fileName: file.name,
              content: reader.result.split(',')[1], // Remove data URL prefix
              mimeType: file.type,
              size: file.size
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const filesData = await Promise.all(filePromises);

      // Prepare data for backend
      const requestData = {
        userId: user_id, 
        type: newRecord.type,
        rate: newRecord.rate,
        notes: newRecord.notes,
        files: filesData
      };

      console.log('Sending data to backend:', { ...requestData, files: filesData.length });

      // Send to backend
      const response = await fetch('http://localhost:9000/api/block/data/storedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (response.ok) {
        // Success - show success message
        alert('✅ Medical record stored on blockchain successfully!');
        console.log('Blockchain Transaction:', result.txnHash);
        console.log('Data Hash:', result.dataHash);
        
        // Refresh records from backend to include the new one
        await fetchUserRecords();
        
        // Reset form
        setNewRecord({
          type: "",
          files: 0,
          rate: "",
          notes: "",
          filesData: [],
          fileNames: [],
        });
        setShowModal(false);
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error storing data:', error);
      alert('Failed to store medical record');
    }
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

        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-400">Loading your records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg mb-4">
              No health data uploaded
            </p>
            <p className="text-gray-500 text-sm">
              Click "+ New Record" to add your first medical record
            </p>
          </div>
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
                {record.blockchainHash && (
                  <p className="text-gray-500 text-xs mt-2">
                    <strong>Blockchain:</strong> {record.blockchainHash.substring(0, 10)}...
                  </p>
                )}
                <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-start text-center p-4 rounded-xl opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 z-10 overflow-auto max-h-96">
                  {record.fileNames.length > 0 && (
                    <div className="mb-4 w-full">
                      <p className="text-white font-bold mb-2">Files:</p>
                      <div className="space-y-1">
                        {record.fileNames.map((fileName, i) => (
                          <p key={i} className="text-gray-400 text-sm bg-gray-800 p-2 rounded">
                            📄 {fileName}
                          </p>
                        ))}
                      </div>
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
                    {record.blockchainHash && (
                      <p className="text-green-400 text-xs mt-2">
                        <strong>On Blockchain:</strong> ✓
                      </p>
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
                Add Record to Blockchain
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;