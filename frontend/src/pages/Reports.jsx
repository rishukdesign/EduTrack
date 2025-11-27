import React, { useState, useEffect } from 'react';
import { Download, FileText, Loader, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ReportFilters from '../components/reports/ReportFilters';
import StudentProfileModal from '../components/reports/StudentProfileModal';
import TrainingStudentsModal from '../components/reports/TrainingStudentsModal';
import { getStudentReport, getTrainingReport } from '../services/api';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const Reports = () => {
    const [reportType, setReportType] = useState('student_performance');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});

    // Modal State
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    const [selectedTrainingId, setSelectedTrainingId] = useState(null);
    const [selectedTrainingTitle, setSelectedTrainingTitle] = useState('');
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            let response;
            if (reportType === 'student_performance') {
                response = await getStudentReport(filters);
            } else if (reportType === 'training_status') {
                response = await getTrainingReport(filters);
            }
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [reportType]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        fetchReports();
    };

    const handleExport = (format) => {
        if (format === 'pdf') {
            exportToPDF(reportType, reportData, filters);
        } else {
            exportToExcel(reportType, reportData);
        }
    };

    const handleViewStudentProfile = (studentId) => {
        setSelectedStudentId(studentId);
        setIsStudentModalOpen(true);
    };

    const handleViewTrainingDetails = (trainingId, title) => {
        setSelectedTrainingId(trainingId);
        setSelectedTrainingTitle(title);
        setIsTrainingModalOpen(true);
    };

    // Handle viewing student from training modal
    const handleViewStudentFromTraining = (studentId) => {
        // Close training modal and open student modal (Swap)
        setIsTrainingModalOpen(false);
        setSelectedStudentId(studentId);
        setIsStudentModalOpen(true);
    };

    const handleBackToTraining = () => {
        // Close student modal and re-open training modal
        setIsStudentModalOpen(false);
        setIsTrainingModalOpen(true);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-text-text-primary">Reports & Analytics</h2>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={FileText} onClick={() => handleExport('pdf')}>Export PDF</Button>
                    <Button variant="secondary" icon={Download} onClick={() => handleExport('excel')}>Export Excel</Button>
                </div>
            </div>

            <Card className="p-6 mb-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-textSecondary mb-1">Report Type</label>
                    <select
                        className="w-full md:w-1/3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        value={reportType}
                        onChange={(e) => {
                            setReportType(e.target.value);
                            setFilters({});
                            setReportData([]); // Clear data on switch
                        }}
                    >
                        <option value="student_performance">Student Performance Report</option>
                        <option value="training_status">Training Program Status</option>
                    </select>
                </div>

                <ReportFilters
                    reportType={reportType}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApply={handleApplyFilters}
                />

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {reportType === 'student_performance' ? (
                                        <>
                                            <th className="p-4 text-sm font-semibold">Roll No</th>
                                            <th className="p-4 text-sm font-semibold">Student Name</th>
                                            <th className="p-4 text-sm font-semibold">Program</th>
                                            <th className="p-4 text-sm font-semibold">Assignments</th>
                                            <th className="p-4 text-sm font-semibold">Completed</th>
                                            <th className="p-4 text-sm font-semibold">Avg Progress</th>
                                            <th className="p-4 text-sm font-semibold">Score</th>
                                            <th className="p-4 text-sm font-semibold">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4 text-sm font-semibold">Training Title</th>
                                            <th className="p-4 text-sm font-semibold">Status</th>
                                            <th className="p-4 text-sm font-semibold">Start Date</th>
                                            <th className="p-4 text-sm font-semibold">Enrolled</th>
                                            <th className="p-4 text-sm font-semibold">Active</th>
                                            <th className="p-4 text-sm font-semibold">Pending</th>
                                            <th className="p-4 text-sm font-semibold">Completed</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    reportData.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${reportType === 'training_status' ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                                            onClick={() => reportType === 'training_status' && handleViewTrainingDetails(row.id, row.title)}
                                        >
                                            {reportType === 'student_performance' ? (
                                                <>
                                                    <td className="p-4 text-sm text-gray-500">{row.rollNo}</td>
                                                    <td className="p-4 text-sm font-medium text-gray-900">{row.firstName} {row.lastName}</td>
                                                    <td className="p-4 text-sm">{row.program} ({row.year} Year)</td>
                                                    <td className="p-4 text-sm">{row.totalAssignments}</td>
                                                    <td className="p-4 text-sm text-green-600 font-medium">{row.completedAssignments}</td>
                                                    <td className="p-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div className="bg-primary h-2 rounded-full" style={{ width: `${row.averageProgress}%` }}></div>
                                                            </div>
                                                            {row.averageProgress}%
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm font-bold">{row.totalScore}</td>
                                                    <td className="p-4 text-sm">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleViewStudentProfile(row.id); }}
                                                            className="text-primary hover:text-primary-dark flex items-center gap-1 text-xs font-medium"
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-4 text-sm font-medium text-primary">{row.title}</td>
                                                    <td className="p-4 text-sm"><Badge status={row.status} /></td>
                                                    <td className="p-4 text-sm text-gray-500">{row.startDate}</td>
                                                    <td className="p-4 text-sm">{row.totalEnrolled}</td>
                                                    <td className="p-4 text-sm text-blue-600">{row.active}</td>
                                                    <td className="p-4 text-sm text-amber-600">{row.pendingEvaluation}</td>
                                                    <td className="p-4 text-sm text-green-600">{row.completed}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="p-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText size={32} className="text-gray-300" />
                                                <p>No data found for the selected filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <TrainingStudentsModal
                isOpen={isTrainingModalOpen}
                onClose={() => setIsTrainingModalOpen(false)}
                trainingId={selectedTrainingId}
                trainingTitle={selectedTrainingTitle}
                onViewStudent={handleViewStudentFromTraining}
            />

            <StudentProfileModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                studentId={selectedStudentId}
                onBack={selectedTrainingId ? handleBackToTraining : null}
            />
        </div>
    );
};

export default Reports;

