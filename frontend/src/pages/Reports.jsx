import React, { useState } from 'react';
import { Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const Reports = ({ students, trainings, assignments }) => {
    const [reportType, setReportType] = useState('student_performance');

    const generateReportData = () => {
        if (reportType === 'student_performance') {
            return students.map(s => {
                const studentAssigns = assignments.filter(a => a.studentId === s.id);
                const completed = studentAssigns.filter(a => a.status === 'Completed').length;
                const avgProgress = studentAssigns.length > 0 ? (studentAssigns.reduce((acc, curr) => acc + parseInt(curr.progress), 0) / studentAssigns.length).toFixed(1) : 0;
                const finalScore = studentAssigns.length > 0 ? studentAssigns.reduce((acc, curr) => acc + (curr.score || 0), 0) : 0;
                return { ...s, total: studentAssigns.length, completed, avgProgress, finalScore };
            });
        } else if (reportType === 'training_status') {
            return trainings.map(t => {
                const linkedAssigns = assignments.filter(a => a.trainingId === t.id);
                const active = linkedAssigns.filter(a => a.status === 'InProgress').length;
                const pending = linkedAssigns.filter(a => a.status === 'PendingEvaluation').length;
                return { ...t, totalStudents: linkedAssigns.length, activeCount: active, pendingCount: pending };
            });
        }
        return [];
    };

    const reportData = generateReportData();

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-text-primary">Reports & Analytics</h2>
                <Button variant="secondary" icon={Download} onClick={() => alert("Downloading PDF Report...")}>Export PDF</Button>
            </div>
            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Report Type</label>
                        <select className="w-full px-3 py-2 border rounded-lg" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                            <option value="student_performance">Student Performance Report</option>
                            <option value="training_status">Training Program Status</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {reportType === 'student_performance' ? (
                                    <>
                                        <th className="p-4 text-sm font-semibold">Student Name</th>
                                        <th className="p-4 text-sm font-semibold">Roll No</th>
                                        <th className="p-4 text-sm font-semibold">Assignments</th>
                                        <th className="p-4 text-sm font-semibold">Completed</th>
                                        <th className="p-4 text-sm font-semibold">Avg Progress</th>
                                        <th className="p-4 text-sm font-semibold">Total Score</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="p-4 text-sm font-semibold">Training Title</th>
                                        <th className="p-4 text-sm font-semibold">Status</th>
                                        <th className="p-4 text-sm font-semibold">Total Enrolled</th>
                                        <th className="p-4 text-sm font-semibold">Active</th>
                                        <th className="p-4 text-sm font-semibold">Pending Eval</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    {reportType === 'student_performance' ? (
                                        <>
                                            <td className="p-4 text-sm">{row.firstName} {row.lastName}</td>
                                            <td className="p-4 text-sm text-gray-500">{row.rollNo}</td>
                                            <td className="p-4 text-sm">{row.total}</td>
                                            <td className="p-4 text-sm text-green-600 font-medium">{row.completed}</td>
                                            <td className="p-4 text-sm">{row.avgProgress}%</td>
                                            <td className="p-4 text-sm font-bold">{row.finalScore}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 text-sm font-medium">{row.title}</td>
                                            <td className="p-4 text-sm"><Badge status={row.status} /></td>
                                            <td className="p-4 text-sm">{row.totalStudents}</td>
                                            <td className="p-4 text-sm text-blue-600">{row.activeCount}</td>
                                            <td className="p-4 text-sm text-amber-600">{row.pendingCount}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
