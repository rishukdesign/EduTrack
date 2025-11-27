import React, { useEffect, useState } from 'react';
import { Users, Eye, Download } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getAssignments, getStudents } from '../../services/api';
import { exportTrainingStudentsToPDF } from '../../utils/exportUtils';

const TrainingStudentsModal = ({ isOpen, onClose, trainingId, trainingTitle, onViewStudent }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && trainingId) {
            fetchData();
        }
    }, [isOpen, trainingId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignmentsRes, studentsRes] = await Promise.all([
                getAssignments(),
                getStudents()
            ]);

            const assignments = assignmentsRes.data.filter(a => a.trainingId === trainingId);
            const allStudents = studentsRes.data;

            const enrolledStudents = assignments.map(assign => {
                const student = allStudents.find(s => s.id === assign.studentId);
                return {
                    ...assign,
                    studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                    rollNo: student?.rollNo || 'N/A'
                };
            });

            setStudents(enrolledStudents);
        } catch (error) {
            console.error("Error fetching training details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (students.length > 0) {
            exportTrainingStudentsToPDF(trainingTitle, students);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-6xl"
            title={
                <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-xl">
                        <Users className="text-primary" /> {trainingTitle} - Enrolled Students
                    </span>
                    {students.length > 0 && (
                        <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadPDF} className="mr-8">
                            Download PDF
                        </Button>
                    )}
                </div>
            }
        >
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : students.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-600">Roll No</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Student Name</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Progress</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Score</th>
                                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => (
                                <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                    <td className="p-3 text-sm text-gray-600">{student.rollNo}</td>
                                    <td className="p-3 text-sm font-medium text-gray-900">{student.studentName}</td>
                                    <td className="p-3 text-sm"><Badge status={student.status} /></td>
                                    <td className="p-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs">{student.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm font-bold">{student.score ?? '-'}</td>
                                    <td className="p-3 text-sm text-right">
                                        <button
                                            onClick={() => onViewStudent(student.studentId)}
                                            className="text-primary hover:text-primary-dark flex items-center gap-1 text-xs font-medium ml-auto"
                                        >
                                            <Eye size={14} /> View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
                    No students enrolled in this training program.
                </div>
            )}
            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default TrainingStudentsModal;
