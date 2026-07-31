import React from 'react';

export default function MyComponent() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Workspace Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Your component is live and styled with Tailwind CSS!
        </p>
        <button 
          onClick={() => alert('Button Clicked!')} 
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Interactive Action
        </button>
      </div>
    </div>
  );
}
