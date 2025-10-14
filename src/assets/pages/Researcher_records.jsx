import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const Researcher_records = ({user_id}) => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // Fetch real data from backend
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:9000/api/records');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched records:', data); // Debug log
        
        // Transform the data to match your UI structure
        const transformedRecords = data.map(record => ({
          id: record.id,
          patient: `Patient ${record.patientId}`,
          type: getRecordType(record.data), // You might want to extract this from your data
          date: record.timestamp,
          files: 1, // Default since we don't have file count
          notes: record.data || "No additional information available",
          fileNames: [`record_${record.id}.txt`], // Default file name
          patientId: record.patientId,
          researcherId: record.researcherId,
          originalData: record.data
        }));
        
        setRecords(transformedRecords);
        setError(null);
      } catch (err) {
        console.error('Error fetching records:', err);
        setError('Failed to load records. Please try again later.');
        // Fallback to dummy data if API fails
        setRecords(getFallbackData());
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

  // Helper function to determine record type from data
  const getRecordType = (data) => {
    if (!data) return "Medical Record";
    
    const dataStr = data.toString().toLowerCase();
    if (dataStr.includes('mri') || dataStr.includes('scan')) return "MRI Scan";
    if (dataStr.includes('xray') || dataStr.includes('x-ray')) return "X-ray";
    if (dataStr.includes('prescription') || dataStr.includes('medication')) return "Prescription";
    if (dataStr.includes('lab') || dataStr.includes('test')) return "Lab Test";
    if (dataStr.includes('ultrasound')) return "Ultrasound";
    
    return "Medical Report";
  };

  // Fallback data in case API fails
  const getFallbackData = () => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      patient: `Patient ${i + 1}`,
      type: ["Medical Report", "MRI Scan", "X-ray", "Prescription", "Lab Test", "Ultrasound"][i % 6],
      date: new Date(Date.now() - i * 86400000).toISOString(),
      files: Math.floor(Math.random() * 5) + 1,
      notes: `Medical record containing diagnostic information and treatment details for patient ${i + 1}.`,
      fileNames: Array.from({ length: Math.floor(Math.random() * 4) + 2 }).map(
        (__, j) => `medical_file_${j + 1}.${["pdf", "png", "dcm", "doc"][j % 4]}`
      ),
      patientId: i + 1,
      researcherId: Math.floor(Math.random() * 5) + 1,
      originalData: `Sample medical data for patient ${i + 1}`
    }));
  };

  const filteredRecords = records.filter(
    (r) =>
      r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRequestPurchase = async (record) => {
    try {
      // You'll need to implement the consent request logic here
      console.log('Requesting purchase for record:', record);
      
      // Example API call to request consent
      const response = await fetch('http://localhost:3000/api/consent/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: record.originalData || record.notes,
          requesterUserId: 2, // This should be the actual researcher's user ID
          ownerUserId: record.patientId // This should be the patient's user ID
        })
      });

      if (response.ok) {
        alert('Consent request sent successfully!');
      } else {
        alert('Failed to send consent request.');
      }
    } catch (err) {
      console.error('Error requesting purchase:', err);
      alert('Error requesting purchase. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading medical records...</p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-xl text-red-400 mb-2">Error Loading Records</p>
          <p className="text-gray-400">{error}</p>
          <p className="text-gray-500 mt-2">Showing sample data instead</p>
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
            {error && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg max-w-2xl mx-auto">
                <p className="text-yellow-300">
                  ⚠️ {error} Showing {records.length} records
                </p>
              </div>
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
                          <p className="text-blue-200 text-lg">Detailed View</p>
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
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                          <h5 className="text-white font-semibold text-lg mb-3">Attached Files ({record.fileNames.length})</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {record.fileNames.map((name, i) => (
                              <div
                                key={i}
                                className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors flex items-center"
                              >
                                <div className="w-6 h-6 mr-3 text-white/80 flex-shrink-0">
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-sm truncate" title={name}>
                                    {name}
                                  </p>
                                  <p className="text-blue-300 text-xs">
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