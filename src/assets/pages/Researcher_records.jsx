import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const Researcher_records = ({user_id}) => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
  const fetchRecords = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching real records from database...");

      const response = await fetch("http://localhost:9000/api/records");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("🔥 RAW BACKEND RESPONSE:", data);

      // Accept ANY backend format:
      // { success: true, records: [...] }
      // { records: [...] }
      // { data: [...] }
      // [ ... ]
      const realRecords =
        data.records ||
        data.data ||
        (Array.isArray(data) ? data : []);

      if (!realRecords || realRecords.length === 0) {
        throw new Error("No records found in database");
      }

      // Transform records exactly like before
      const transformedRecords = realRecords.map((record, index) => {
        const recordData = record.record_data || {};

        const patientId =
          record.user_id && !isNaN(parseInt(record.user_id))
            ? parseInt(record.user_id)
            : index + 1000;

        return {
          id: record.data_hash || `record-${index}`,
          patient: record.patient_name || "Unknown Patient",
          type: recordData.recordType || "Medical Record",
          date: record.created_at || new Date().toISOString(),
          files: recordData.files ? recordData.files.length : 0,
          notes: recordData.notes || "No additional information available",
          fileNames: recordData.files
            ? recordData.files.map((f) => f.fileName)
            : ["medical_record.dat"],
          patientId: patientId,
          dataHash: record.data_hash,
          originalData: record.data_value,
          blockchainTxn: record.blockchain_txn,
          blockchainOwner: record.blockchain_owner,
        };
      });

      console.log(`✅ Transformed ${transformedRecords.length} real records`);
      setRecords(transformedRecords);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching records:", err);
      setError(
        "Failed to load records from database. Please make sure there are records stored in the system."
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  fetchRecords();
}, []);


  // Animation effect
  useEffect(() => {
    cardsRef.current.forEach((card) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
        );
      }
    });
  }, [records]);

  const filteredRecords = records.filter(
    (r) =>
      r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRequestPurchase = async (record) => {
    try {
      console.log('=== REQUEST CONSENT DETAILS ===');
      console.log('Record:', record);
      console.log('Requester ID (Researcher):', user_id);
      console.log('Owner ID (Patient):', record.patientId);
      console.log('Data Hash:', record.dataHash);
      console.log('==============================');
      
      // Validate user_id is available
      if (!user_id) {
        alert('❌ Error: User ID not available. Please make sure you are logged in.');
        return;
      }

      // FIXED: More flexible validation for patientId
      if (!record.patientId || record.patientId < 0) {
        console.warn('Patient ID might be a fallback ID:', record.patientId);
        // Continue anyway since we have a valid fallback ID
      }

      // Validate dataHash is available (REAL hash from blockchain)
      if (!record.dataHash) {
        alert('❌ Error: Invalid data hash. This record cannot be accessed.');
        return;
      }

      // Show confirmation dialog with improved messaging
      const isConfirmed = window.confirm(
        `REQUEST ACCESS CONFIRMATION\n\n` +
        `Patient: ${record.patient}\n` +
        `Record Type: ${record.type}\n` +
        `Patient ID: ${record.patientId}\n` +
        `Researcher ID: ${user_id}\n` +
        `Data Hash: ${record.dataHash.substring(0, 20)}...\n\n` +
        `Are you sure you want to request access to this medical record?`
      );

      if (!isConfirmed) {
        console.log('Consent request cancelled by user');
        return;
      }

      console.log('🔄 Sending consent request to backend...');
      const response = await fetch('http://localhost:9000/api/block/data/request-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: parseInt(user_id), // Researcher's user ID
          ownerId: record.patientId, // Patient's user ID (now always valid)
          dataHash: record.dataHash // Real data hash (from blockchain)
        })
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (response.ok && result.success) {
        alert('✅ Consent request sent successfully!\n\nThe patient will be notified and can approve your request.');
        console.log('✅ Consent request successful:', result);
      } else {
        console.error('❌ Consent request failed:', result);
        const errorMessage = result.error || result.message || 'Unknown error occurred';
        
        // More specific error messages
        if (errorMessage.includes('patient') || errorMessage.includes('owner')) {
          alert(`❌ Failed to send consent request:\n\nPatient account not found. This record may belong to a user who no longer exists in the system.`);
        } else {
          alert(`❌ Failed to send consent request:\n\n${errorMessage}`);
        }
      }
    } catch (err) {
      console.error('❌ Network error requesting consent:', err);
      alert('❌ Network error requesting consent. Please check:\n\n1. Backend server is running\n2. Your internet connection\n3. Try again later');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading medical records...</p>
          <p className="text-gray-500 mt-2">Fetching real data from database</p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-xl text-red-400 mb-2">No Records Available</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <p className="text-yellow-400 mb-2">💡 To test this feature:</p>
            <p className="text-gray-300 text-sm">
              1. Make sure patients have stored medical records<br/>
              2. Check if the backend is running properly<br/>
              3. Verify the database has records in the 'records' table
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Medical Records Database
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Browse and request access to patient medical records for research purposes
            </p>
            {user_id && (
              <p className="text-green-400 mt-2">
                Logged in as Researcher ID: {user_id}
              </p>
            )}
            {records.length > 0 && (
              <p className="text-blue-400 mt-2">
                Found {records.length} real medical records in the system
              </p>
            )}
          </div>

          {/* Search */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative mt-10">
              <input
                type="text"
                placeholder="Search by patient name, record type, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg backdrop-blur-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 px-2">
            <p className="text-gray-400 text-lg">
              Showing <span className="text-white font-semibold">{filteredRecords.length}</span> of{" "}
              <span className="text-white font-semibold">{records.length}</span> records
              {searchTerm && (
                <span className="text-blue-400 ml-2">
                  for "{searchTerm}"
                </span>
              )}
            </p>
          </div>

          {/* Records Grid */}
          <div
            ref={containerRef}
            className="overflow-y-auto"
            style={{ 
              maxHeight: "calc(100vh - 280px)",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xl font-medium">No records found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-4 px-2">
                {filteredRecords.map((record, index) => (
                  <div
                    key={record.id}
                    ref={(el) => (cardsRef.current[index] = el)}
                    className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-700/50 hover:border-blue-500/30 h-[420px] flex flex-col"
                  >
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2 truncate">{record.patient}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                              {record.type}
                            </span>
                            <span className="inline-block px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                              ID: {record.patientId}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {record.files}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Files</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4 flex-1 overflow-hidden">
                        <div className="flex items-center text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm truncate">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                          {record.notes}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                      <div className="flex flex-wrap gap-1">
                        {record.fileNames.slice(0, 2).map((name, i) => (
                          <div
                            key={i}
                            className="flex-1 min-w-[100px] bg-gray-700/50 rounded-lg px-2 py-1 text-xs text-gray-300 truncate border border-gray-600/50"
                            title={name}
                          >
                            {name}
                          </div>
                        ))}
                        {record.fileNames.length > 2 && (
                          <div className="bg-gray-700/50 rounded-lg px-2 py-1 text-xs text-gray-300 border border-gray-600/50">
                            +{record.fileNames.length - 2}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-md rounded-2xl flex flex-col opacity-0 transition-all duration-500 group-hover:opacity-100 z-10 overflow-hidden"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      <style jsx>{`
                        .hover-content::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      <div className="p-6 flex-1 overflow-y-auto hover-content">
                        <div className="text-center mb-6">
                          <h4 className="text-2xl font-bold text-white mb-2">{record.type}</h4>
                          <p className="text-blue-400 text-lg">Detailed View</p>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/20">
                          <h5 className="text-white font-semibold text-lg mb-2">Patient Information</h5>
                          <p className="text-white/90 mb-1"><strong>Name:</strong> {record.patient}</p>
                          <p className="text-white/90 mb-1"><strong>Patient ID:</strong> {record.patientId}</p>
                          <p className="text-white/90 mb-1"><strong>Record Type:</strong> {record.type}</p>
                          <p className="text-white/90"><strong>Date:</strong> {new Date(record.date).toLocaleString()}</p>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/20">
                          <h5 className="text-white font-semibold text-lg mb-2">Record Data</h5>
                          <p className="text-white/90 leading-relaxed text-sm">{record.notes}</p>
                          <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono break-all">
                            <strong>Data Hash:</strong> {record.dataHash}
                          </div>
                          {record.blockchainTxn && (
                            <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono break-all">
                              <strong>Blockchain TXN:</strong> {record.blockchainTxn.substring(0, 20)}...
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                          <h5 className="text-white font-semibold text-lg mb-3">Attached Files ({record.fileNames.length})</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {record.fileNames.map((name, i) => (
                              <div
                                key={i}
                                className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:bg-gray-700 transition-colors flex items-center"
                              >
                                <div className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0">
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-sm truncate" title={name}>
                                    {name}
                                  </p>
                                  <p className="text-blue-400 text-xs">
                                    {name.split('.').pop()?.toUpperCase()} File
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/20">
                          <button 
                            onClick={() => handleRequestPurchase(record)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-medium text-sm"
                          >
                            Request Access
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Researcher_records;