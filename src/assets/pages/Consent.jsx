import React, { useState, useEffect } from "react";

const Consent = ({ user_id }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending requests from backend
  const fetchPendingRequests = async () => {
    try {
      // Validate user_id before making the request
      if (!user_id) {
        throw new Error('User ID not available. Please log in again.');
      }

      console.log(`📋 Fetching pending requests for owner: ${user_id}`);
      
      const response = await fetch(`http://localhost:9000/api/block/data/pending-requests/${user_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to match frontend structure
        const transformedNotifications = data.pendingRequests.map(request => ({
          id: request.id,
          title: `User ${request.requester_id} requests access`,
          type: getRecordType(request.data_value),
          status: "Pending",
          timestamp: new Date(request.requested_at).toLocaleString(),
          // Store backend data for API calls
          backendData: {
            requestId: request.id,
            ownerId: request.owner_id,
            requesterId: request.requester_id,
            dataHash: request.data_hash
          }
        }));
        
        setNotifications(transformedNotifications);
        console.log(`✅ Loaded ${transformedNotifications.length} pending requests`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract record type from data_value
  const getRecordType = (dataValue) => {
    try {
      const record = JSON.parse(dataValue);
      return record.recordType || 'Medical Data';
    } catch {
      return 'Medical Data';
    }
  };

  // Handle approve action
  const handleApprove = async (notification) => {
    try {
      if (!user_id) {
        throw new Error('User ID not available');
      }

      const response = await fetch('http://localhost:9000/api/block/data/grant-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: notification.backendData.ownerId, 
          requestId: notification.backendData.requestId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      if (data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id
              ? { 
                  ...notif, 
                  status: "Approved",
                  title: `Access granted to User ${notification.backendData.requesterId}`
                }
              : notif
          )
        );
        
        console.log('✅ Consent granted successfully:', data);
      }
    } catch (err) {
      console.error('❌ Error approving request:', err);
      alert('Error approving request: ' + err.message);
    }
  };

  // Handle decline action
  const handleDecline = async (notification) => {
    try {
      if (!user_id) {
        throw new Error('User ID not available');
      }

      const response = await fetch('http://localhost:9000/api/block/data/decline-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: notification.backendData.requestId,
          ownerId: notification.backendData.ownerId // Use the current user_id from props
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline request');
      }

      if (data.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id
              ? { ...notif, status: "Declined" }
              : notif
          )
        );
        console.log('✅ Consent declined successfully');
      }
    } catch (err) {
      console.error('❌ Error declining request:', err);
      alert('Error declining request: ' + err.message);
    }
  };

  // Load pending requests when component mounts or user_id changes
  useEffect(() => {
    if (user_id) {
      fetchPendingRequests();
    } else {
      setError("User ID not available. Please log in again.");
      setLoading(false);
    }
  }, []); // Add user_id as dependency

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading consent requests...</div>
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
            onClick={fetchPendingRequests}
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Consent Requests</h1>
            <p className="text-gray-400 mt-2">Manage access to your data (User ID: {user_id})</p>
          </div>
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 px-4 py-2 rounded transition flex items-center gap-2"
          >
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No pending consent requests.</div>
            <p className="text-gray-500">When researchers request access to your data, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 rounded-xl shadow-md transition-all hover:shadow-lg border ${
                  notif.status === "Pending"
                    ? "border-yellow-500/30 bg-gray-800"
                    : notif.status === "Approved"
                    ? "border-green-500/30 bg-gray-800"
                    : "border-red-500/30 bg-gray-900"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{notif.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notif.status === "Pending" ? "bg-yellow-500" :
                        notif.status === "Approved" ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {notif.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-1">Data Type: {notif.type}</p>
                    <p className="text-gray-400 text-sm">Requested by: User {notif.backendData.requesterId}</p>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                    {notif.timestamp}
                  </span>
                </div>

                {notif.status === "Pending" && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Request ID: {notif.backendData.requestId}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(notif)}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Access
                      </button>
                      <button
                        onClick={() => handleDecline(notif)}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Consent;