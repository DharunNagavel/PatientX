import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

const Researcher_records = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestedRecords, setRequestedRecords] = useState(new Set());
  const [pendingPaymentRecords, setPendingPaymentRecords] = useState(new Set());
  const [purchasedRecords, setPurchasedRecords] = useState(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // Generate dummy records
  useEffect(() => {
    const dummyRecords = Array.from({ length: 30 }).map((_, i) => ({
      id: i + 1,
      patient: `Patient ${i + 1}`,
      type: ["Medical Report", "MRI Scan", "X-ray", "Prescription", "Lab Test", "Ultrasound"][i % 6],
      date: new Date(Date.now() - i * 86400000).toISOString(),
      files: Math.floor(Math.random() * 5) + 1,
      notes: `Medical record containing diagnostic information and treatment details for patient ${i + 1}. This includes comprehensive health data, diagnostic results, and recommended treatments.`,
      fileNames: Array.from({ length: Math.floor(Math.random() * 4) + 2 }).map(
        (__, j) => `medical_file_${j + 1}.${["pdf", "png", "dcm", "doc"][j % 4]}`
      ),
      filesData: [],
      price: Math.floor(Math.random() * 50) + 10, // Random price between $10-$60
    }));
    setRecords(dummyRecords);
  }, []);

  // Animate cards with GSAP
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

  // Filter records by search term
  const filteredRecords = records.filter(
    (r) =>
      r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle request to purchase
  const handleRequestPurchase = (record) => {
    setRequestedRecords(prev => new Set([...prev, record.id]));
    
    // Simulate API call to send request to patient
    setTimeout(() => {
      // Simulate patient acceptance after 2 seconds
      setRequestedRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(record.id);
        return newSet;
      });
      setPendingPaymentRecords(prev => new Set([...prev, record.id]));
    }, 2000);
  };

  // Handle payment initiation
  const handleInitiatePayment = (record) => {
    setSelectedRecord(record);
    setPaymentAmount(record.price);
    setShowPaymentModal(true);
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    if (selectedRecord) {
      setPendingPaymentRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRecord.id);
        return newSet;
      });
      setPurchasedRecords(prev => new Set([...prev, selectedRecord.id]));
      setShowPaymentModal(false);
      setSelectedRecord(null);
      
      // Simulate successful payment and data access
      setTimeout(() => {
        alert(`Payment successful! You now have access to ${selectedRecord.patient}'s ${selectedRecord.type}`);
      }, 500);
    }
  };

  // Get status badge for a record
  const getStatusBadge = (record) => {
    if (requestedRecords.has(record.id)) {
      return (
        <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium border border-yellow-500/30">
          Request Sent
        </span>
      );
    }
    if (pendingPaymentRecords.has(record.id)) {
      return (
        <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
          Ready to Pay
        </span>
      );
    }
    if (purchasedRecords.has(record.id)) {
      return (
        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
          Purchased
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
        {record.type}
      </span>
    );
  };

  // Get action button for a record
  const getActionButton = (record) => {
    if (requestedRecords.has(record.id)) {
      return (
        <button 
          disabled
          className="flex-1 bg-gray-600 text-gray-400 py-3 px-4 rounded-lg font-medium text-sm cursor-not-allowed"
        >
          Request Pending...
        </button>
      );
    }
    if (pendingPaymentRecords.has(record.id)) {
      return (
        <button 
          onClick={() => handleInitiatePayment(record)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-green-500/25 hover:scale-105"
        >
          Pay ${record.price}
        </button>
      );
    }
    if (purchasedRecords.has(record.id)) {
      return (
        <button 
          onClick={() => alert(`Accessing ${record.patient}'s ${record.type}...`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-blue-500/25 hover:scale-105"
        >
          Access Data
        </button>
      );
    }
    return (
      <button 
        onClick={() => handleRequestPurchase(record)}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-blue-500/25 hover:scale-105"
      >
        Request To Purchase
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-2">Complete Payment</h3>
            <p className="text-gray-400 mb-6">
              Purchase {selectedRecord.patient}'s {selectedRecord.type}
            </p>
            
            <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Amount:</span>
                <span className="text-2xl font-bold text-white">${selectedRecord.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Record Type:</span>
                <span className="text-gray-300">{selectedRecord.type}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-400">Files Included:</span>
                <span className="text-gray-300">{selectedRecord.files}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                  <input type="radio" name="payment" className="text-blue-500" defaultChecked />
                  <span className="ml-3 text-gray-300">Credit/Debit Card</span>
                </label>
                <label className="flex items-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                  <input type="radio" name="payment" className="text-blue-500" />
                  <span className="ml-3 text-gray-300">Cryptocurrency</span>
                </label>
                <label className="flex items-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                  <input type="radio" name="payment" className="text-blue-500" />
                  <span className="ml-3 text-gray-300">Bank Transfer</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium shadow-lg hover:shadow-green-500/25"
              >
                Pay ${selectedRecord.price}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 w-full h-16 bg-gray-900/80 backdrop-blur-md text-white z-40 shadow-lg flex items-center px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Researcher Portal
        </h1>
      </nav>
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">{records.length}</div>
              <div className="text-gray-400 text-sm">Total Records</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{requestedRecords.size}</div>
              <div className="text-gray-400 text-sm">Pending Requests</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{pendingPaymentRecords.size}</div>
              <div className="text-gray-400 text-sm">Ready for Payment</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{purchasedRecords.size}</div>
              <div className="text-gray-400 text-sm">Purchased</div>
            </div>
          </div>

          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by patient name or record type..."
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

          <div className="mb-6 px-2">
            <p className="text-gray-400 text-lg">
              Showing <span className="text-white font-semibold">{filteredRecords.length}</span> of{" "}
              <span className="text-white font-semibold">{records.length}</span> records
            </p>
          </div>

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
                          {getStatusBadge(record)}
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {record.files}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Files</p>
                          {!purchasedRecords.has(record.id) && (
                            <p className="text-green-400 text-sm font-bold mt-1">${record.price}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4 flex-1 overflow-hidden">
                        <div className="flex items-center text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm truncate">{new Date(record.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
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
                      className="absolute inset-0 bg-gray-900/95 backdrop-blur-md rounded-2xl flex flex-col opacity-0 transition-all duration-500 group-hover:opacity-100 z-10 overflow-hidden border-2 border-blue-500/30"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none"
                      }}
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
                          {!purchasedRecords.has(record.id) && (
                            <div className="mt-2 bg-green-500/20 border border-green-500/30 rounded-lg py-2 px-4">
                              <p className="text-green-300 font-semibold">Price: ${record.price}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-800/80 rounded-xl p-4 mb-4 backdrop-blur-sm border border-gray-700">
                          <h5 className="text-white font-semibold text-lg mb-2">Patient Information</h5>
                          <p className="text-white/90 mb-1"><strong>Name:</strong> {record.patient}</p>
                          <p className="text-white/90 mb-1"><strong>Record Type:</strong> {record.type}</p>
                          <p className="text-white/90"><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                        </div>

                        <div className="bg-gray-800/80 rounded-xl p-4 mb-4 backdrop-blur-sm border border-gray-700">
                          <h5 className="text-white font-semibold text-lg mb-2">Clinical Notes</h5>
                          <p className="text-white/90 leading-relaxed text-sm">{record.notes}</p>
                        </div>

                        <div className="bg-gray-800/80 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
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

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                          {getActionButton(record)}
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