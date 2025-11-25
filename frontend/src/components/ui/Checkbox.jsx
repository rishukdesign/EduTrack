import React from 'react';

const Checkbox = ({ label, ...props }) => (
    <div className="mb-4 flex items-center">
        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" {...props} />
        {label && <label className="ml-2 block text-sm text-gray-900">{label}</label>}
    </div>
);

export default Checkbox;
