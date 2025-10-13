import React, { useState, useEffect } from "react";

const Consent = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending requests from backend
  const fetchPendingRequests = async () => {
    try {
      // Replace '1' with the actual ownerId (you might get this from authentication)
      const ownerId = 1; // This should be dynamic based on logged-in user
      
      const response = await fetch(`http://localhost:9000/api/block/data/pending-requests/${ownerId}`);
      
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
      // Since your backend doesn't have a decline endpoint, we'll update the status in the database
      const response = await fetch('http://localhost:9000/api/block/data/decline-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: notification.backendData.requestId,
          ownerId: notification.backendData.ownerId
        }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notification.id
              ? { ...notif, status: "Declined" }
              : notif
          )
        );
      } else {
        throw new Error('Failed to decline request');
      }
    } catch (err) {
      console.error('❌ Error declining request:', err);
      // Even if backend fails, update UI
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notification.id
            ? { ...notif, status: "Declined" }
            : notif
        )
      );
    }
  };

  // Add this decline endpoint to your backend
  const handleDeclineWithFallback = async (notification) => {
    try {
      // First try the decline endpoint
      await handleDecline(notification);
    } catch (err) {
      // If decline endpoint doesn't exist, just update UI
      console.log('Using fallback decline (UI only)');
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notification.id
            ? { ...notif, status: "Declined" }
            : notif
        )
      );
    }
  };

  // Load pending requests on component mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading consent requests...</div>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Consent Requests</h1>
          <button
            onClick={fetchPendingRequests}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            Refresh
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No pending consent requests.</p>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl shadow-md transition-all hover:shadow-lg
                  ${
                    notif.status === "Pending"
                      ? "bg-gray-700"
                      : notif.status === "Approved"
                      ? "bg-gray-800"
                      : "bg-gray-900 line-through"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{notif.title}</p>
                  <span className="text-sm text-gray-400">{notif.timestamp}</span>
                </div>
                <p className="text-gray-300 text-sm mt-1">Type: {notif.type}</p>
                <p className="text-gray-300 text-sm mt-1">Status: {notif.status}</p>

                {notif.status === "Pending" && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleApprove(notif)}
                      className="bg-green-500 hover:bg-green-600 px-4 py-1 rounded transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeclineWithFallback(notif)}
                      className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded transition"
                    >
                      Decline
                    </button>
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