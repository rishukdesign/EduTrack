import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ReportFilters = ({ filters, onFilterChange, onApply, reportType }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {reportType === 'student_performance' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            value={filters.program || ''}
                            onChange={(e) => onFilterChange('program', e.target.value)}
                        >
                            <option value="">All Programs</option>
                            <option value="BCA">BCA</option>
                            <option value="MCA">MCA</option>
                            <option value="B.Tech CS">B.Tech CS</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            value={filters.year || ''}
                            onChange={(e) => onFilterChange('year', e.target.value)}
                        >
                            <option value="">All Years</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                </>
            )}

            {reportType === 'training_status' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            value={filters.status || ''}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </>
            )}

            <div className="flex items-end">
                <Button onClick={onApply} className="w-full">Apply Filters</Button>
            </div>
        </div>
    );
};

export default ReportFilters;
