import React from 'react';

const Input = ({ label, error, ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-200'}`} {...props} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default Input;
