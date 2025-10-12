import React, { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    title: "Dr. Alice Sharma requests access",
    type: "Lab Reports",
    status: "Pending",
    timestamp: "2025-10-12 10:30",
  },
  {
    id: 2,
    title: "AI Analysis consent recorded",
    type: "AI Analysis",
    status: "Approved",
    timestamp: "2025-10-11 15:20",
  },
  {
    id: 3,
    title: "Dr. Rajesh Kumar requests access",
    type: "X-ray Scans",
    status: "Pending",
    timestamp: "2025-10-12 09:50",
  },
];

const Consent = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleAction = (id, action) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id
          ? { ...notif, status: action === "approve" ? "Approved" : "Declined" }
          : notif
      )
    );
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="pt-24 px-6 md:px-12 lg:px-24">
        {notifications.length === 0 ? (
          <p className="text-gray-400">No notifications at the moment.</p>
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
                      onClick={() => handleAction(notif.id, "approve")}
                      className="bg-green-500 hover:bg-green-600 px-4 py-1 rounded transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(notif.id, "decline")}
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
