import React from 'react';

const STATUS_COLORS = {
    Assigned: 'bg-gray-100 text-gray-700',
    InProgress: 'bg-blue-100 text-blue-700',
    PendingEvaluation: 'bg-amber-100 text-amber-700',
    Completed: 'bg-green-100 text-green-700',
    Dropped: 'bg-red-100 text-red-700',
    Upcoming: 'bg-purple-100 text-purple-700',
    Ongoing: 'bg-blue-100 text-blue-700',
    Closed: 'bg-gray-100 text-gray-500',
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-red-100 text-red-700',
};

const Badge = ({ status }) => {
    const statusKey = status.replace(/\s/g, '');
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[statusKey] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

export default Badge;
