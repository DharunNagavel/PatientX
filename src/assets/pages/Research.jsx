import React from "react";
const researchersData = [
  {
    id: 1,
    name: "Dr. Alice Sharma",
    profilePic: "/alice.jpg",
    field: "Cardiology",
    institution: "Heart Care Hospital",
    ongoingResearch: [
      "AI-based heart disease prediction",
      "Blood pressure variability study",
    ],
    contact: "alice@example.com",
  },
  {
    id: 2,
    name: "Dr. Rajesh Kumar",
    profilePic: "/rajesh.jpg",
    field: "Neurology",
    institution: "Neuro Health Center",
    ongoingResearch: [
      "Brain scan pattern recognition",
      "Neurodegenerative disease monitoring",
    ],
    contact: "rajesh@example.com",
  },
  {
    id: 3,
    name: "Dr. Meera Nair",
    profilePic: "/meera.jpg",
    field: "Oncology",
    institution: "Cancer Care Institute",
    ongoingResearch: [
      "Early cancer detection using AI",
      "Chemotherapy outcome prediction",
    ],
    contact: "meera@example.com",
  },
];

const Research = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Researchers on our Platform</h1>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchersData.map((researcher) => (
            <div
              key={researcher.id}
              className="bg-gray-800 rounded-xl shadow-lg p-5 relative group overflow-hidden"
            >
              <div className="relative z-0 flex flex-col items-center">
                <img
                  src={researcher.profilePic}
                  alt={researcher.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h2 className="text-xl font-semibold text-center">{researcher.name}</h2>
                <p className="text-gray-400 text-center">{researcher.field}</p>
                <p className="text-gray-400 text-center mb-3">{researcher.institution}</p>
              </div>
              <div className="absolute inset-0 bg-gray-900 bg-opacity-95 p-4 rounded-xl opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col items-center justify-start overflow-auto max-h-96 z-10">
                <h3 className="font-bold text-lg mb-2">Ongoing Research</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm">
                  {researcher.ongoingResearch.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
                <p className="mt-4 text-gray-400 text-sm">
                  Contact: {researcher.contact}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Research;
