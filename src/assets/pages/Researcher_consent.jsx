import React, { useState, useEffect } from "react";

const Researcher_consent = () => {
  const [consentRequests, setConsentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all", "pending", "approved", "declined"

  // Fetch consent requests made by researcher
  const fetchConsentRequests = async () => {
    try {
      // Replace '1' with the actual researcherId from authentication
      const researcherId = 1; // This should be dynamic based on logged-in researcher
      
      const response = await fetch(`http://localhost:9000/api/block/data/researcher-requests/${researcherId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch consent requests');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to match frontend structure
        const transformedRequests = data.consentRequests.map(request => ({
          id: request.id,
          title: `Access request for ${getRecordType(request.data_value)}`,
          owner: `User ${request.owner_id}`,
          type: getRecordType(request.data_value),
          status: request.status || "pending", // pending, approved, declined
          timestamp: new Date(request.requested_at).toLocaleString(),
          dataDescription: getDataDescription(request.data_value),
          // Store backend data for API calls
          backendData: {
            requestId: request.id,
            ownerId: request.owner_id,
            dataHash: request.data_hash,
            purpose: request.purpose || "Research analysis"
          }
        }));
        
        setConsentRequests(transformedRequests);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching consent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract record type from data_value
  const getRecordType = (dataValue) => {
    try {
      const record = JSON.parse(dataValue);
      return record.recordType || 'Medical Record';
    } catch {
      return 'Medical Data';
    }
  };

  // Extract data description
  const getDataDescription = (dataValue) => {
    try {
      const record = JSON.parse(dataValue);
      return record.description || 'Health data for research purposes';
    } catch {
      return 'Encrypted health data';
    }
  };

  // Handle cancel request
  const handleCancel = async (request) => {
    try {
      const response = await fetch('http://localhost:9000/api/block/data/cancel-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.backendData.requestId,
          researcherId: 1 // Replace with actual researcher ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel request');
      }

      if (data.success) {
        // Update local state
        setConsentRequests(prev =>
          prev.map(req =>
            req.id === request.id
              ? { ...req, status: "cancelled" }
              : req
          )
        );
        console.log('✅ Request cancelled successfully');
      }
    } catch (err) {
      console.error('❌ Error cancelling request:', err);
      alert('Error cancelling request: ' + err.message);
    }
  };

  // Handle withdraw access (for approved requests)
  const handleWithdraw = async (request) => {
    try {
      const response = await fetch('http://localhost:9000/api/block/data/withdraw-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.backendData.requestId,
          ownerId: request.backendData.ownerId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to withdraw access');
      }

      if (data.success) {
        // Update local state
        setConsentRequests(prev =>
          prev.map(req =>
            req.id === request.id
              ? { ...req, status: "withdrawn" }
              : req
          )
        );
        console.log('✅ Access withdrawn successfully');
      }
    } catch (err) {
      console.error('❌ Error withdrawing access:', err);
      alert('Error withdrawing access: ' + err.message);
    }
  };

  // Filter requests based on status
  const filteredRequests = consentRequests.filter(request => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "declined":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "withdrawn":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending Review";
      case "declined":
        return "Declined";
      case "cancelled":
        return "Cancelled";
      case "withdrawn":
        return "Access Withdrawn";
      default:
        return status;
    }
  };

  // Load consent requests on component mount
  useEffect(() => {
    fetchConsentRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading your consent requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="pt-24 px-6 md:px-12 lg:px-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Research Consent Requests</h1>
            <p className="text-gray-400 mt-2">Manage your data access requests</p>
          </div>
          <button
            onClick={fetchConsentRequests}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition flex items-center gap-2"
          >
            <span>Refresh</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "approved", "declined"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                filter === filterType
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)} 
              {filterType !== "all" && (
                <span className="ml-2 bg-gray-700 px-2 py-1 rounded text-xs">
                  {consentRequests.filter(req => req.status === filterType).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {filter === "all" 
                ? "No consent requests made yet."
                : `No ${filter} requests found.`}
            </div>
            <p className="text-gray-500">
              {filter === "all" 
                ? "Start by requesting access to data for your research."
                : "Try changing the filter to see other requests."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`p-6 rounded-xl shadow-md transition-all hover:shadow-lg border ${
                  request.status === "approved"
                    ? "border-green-500/30 bg-gray-800"
                    : request.status === "pending"
                    ? "border-yellow-500/30 bg-gray-800"
                    : "border-gray-600/30 bg-gray-900"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-1">Data Owner: {request.owner}</p>
                    <p className="text-gray-400 text-sm mb-2">{request.dataDescription}</p>
                    <p className="text-gray-400 text-sm">Research Purpose: {request.backendData.purpose}</p>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                    {request.timestamp}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Request ID: {request.backendData.requestId}
                  </div>
                  
                  <div className="flex gap-2">
                    {request.status === "pending" && (
                      <button
                        onClick={() => handleCancel(request)}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Request
                      </button>
                    )}
                    
                    {request.status === "approved" && (
                      <button
                        onClick={() => handleWithdraw(request)}
                        className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Withdraw Access
                      </button>
                    )}

                    {/* View Data Button (when approved) */}
                    {request.status === "approved" && (
                      <button
                        onClick={() => {/* Add view data functionality */}}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Data
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">{consentRequests.length}</div>
            <div className="text-gray-400 text-sm">Total Requests</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {consentRequests.filter(req => req.status === "pending").length}
            </div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {consentRequests.filter(req => req.status === "approved").length}
            </div>
            <div className="text-gray-400 text-sm">Approved</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-400">
              {consentRequests.filter(req => req.status === "declined").length}
            </div>
            <div className="text-gray-400 text-sm">Declined</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Researcher_consent;