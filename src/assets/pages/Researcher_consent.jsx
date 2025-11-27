import React, { useState, useEffect } from "react";
import axios from "axios";

const Researcher_consent = ({ user_id }) => {
  const [consentRequests, setConsentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  // Fetch consent requests made by researcher
  const fetchConsentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate user_id
      if (!user_id) {
        throw new Error('User ID not available. Please log in again.');
      }

      const researcherId = user_id;
      
      console.log(`🔍 Fetching consent requests for researcher: ${researcherId}`);
      
      const response = await fetch(`http://localhost:9000/api/block/data/researcher-requests/${researcherId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Found ${data.consentRequests?.length || 0} consent requests`);
        
        const transformedRequests = data.consentRequests.map(request => ({
          id: request.id,
          title: `Access request for ${request.record_type}`,
          owner: request.owner_name || `User ${request.owner_id}`,
          type: request.record_type,
          status: request.status || "pending",
          timestamp: new Date(request.requested_at).toLocaleString(),
          dataDescription: getDataDescription(request.data_value),
          backendData: {
            requestId: request.id,
            ownerId: request.owner_id,
            dataHash: request.data_hash,
            purpose: request.purpose || "Research analysis"
          }
        }));
        
        setConsentRequests(transformedRequests);
      } else {
        throw new Error(data.error || 'Failed to fetch requests');
      }
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching consent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract data description
  const getDataDescription = (dataValue) => {
    try {
      const record = JSON.parse(dataValue);
      return record.notes || `Health data for research purposes`;
    } catch {
      return 'Encrypted health data';
    }
  };

  // Handle cancel request
  const handleCancel = async (request) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:9000/api/block/data/cancel-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.backendData.requestId,
          researcherId: user_id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel request');
      }

      if (data.success) {
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

  const handlePay = async (request) => {
  try {
    console.log("🟦 Handle Pay Started", request);

    const ownerId = request.backendData.ownerId;
    const requesterId = user_id;
    const dataHash = request.backendData.dataHash;

    console.log("🟩 Sending order create request...");

    const orderRes = await axios.post("http://localhost:9000/api/payment/create-order", {
      ownerId,
      requesterId,
      dataHash
    });

    console.log("🟩 Order Created:", orderRes.data);

    const { order } = orderRes.data;

    const options = {
      key: "rzp_test_RkToOcKUrHAgk3",
      amount: order.amount,
      currency: order.currency,
      name: "PatientX",
      description: "Data Purchase",
      order_id: order.id,
      handler: async function (response) {
        try {
          console.log("🟩 Razorpay Success Response:", response);

          const verifyRes = await axios.post("http://localhost:9000/api/payment/verify-payment", {
            ...response,
            ownerId,
            requesterId,
            dataHash
          });

          console.log("🟩 Verification Success:", verifyRes.data);
          alert("Payment successful!");
        } catch (err) {
          console.error("❌ Verification Error:", err);
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
  console.error("❌ PAYMENT FAILED:", response.error.description);
  alert("Oops! Something went wrong.\nPayment Failed");
});
    rzp1.open();
  } catch (err) {
    console.error("❌ MAIN PAYMENT ERROR:", err);
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

  // Load consent requests when component mounts or user_id changes
  useEffect(() => {
    if (user_id) {
      fetchConsentRequests();
    } else {
      setError("User ID not available. Please log in again.");
      setLoading(false);
    }
  }, [user_id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading your consent requests...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={fetchConsentRequests}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="pt-24 px-6 md:px-12 lg:px-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Research Consent Requests</h1>
            <p className="text-gray-400 mt-2">Manage your data access requests (User ID: {user_id})</p>
          </div>
          <button
            onClick={fetchConsentRequests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 px-4 py-2 rounded transition flex items-center gap-2"
          >
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "approved", "declined", "cancelled", "withdrawn"].map((filterType) => (
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
                      <>
                        {/* <button
                          onClick={() => handleWithdraw(request)}
                          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Withdraw Access
                        </button> */}

                        <button onClick={() => handlePay(request)}
                          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-indian-rupee-icon lucide-indian-rupee"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
                          Pay
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Researcher_consent;