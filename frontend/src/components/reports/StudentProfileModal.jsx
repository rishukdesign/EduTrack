import React, { useEffect, useState } from 'react';
import { User, BookOpen, Briefcase, Download, ArrowLeft } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getStudentProfile } from '../../services/api';
import { exportStudentProfileToPDF } from '../../utils/exportUtils';

const StudentProfileModal = ({ isOpen, onClose, studentId, onBack }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [isOpen, studentId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getStudentProfile(studentId);
            setProfile(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (profile) {
            exportStudentProfileToPDF(profile);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-6xl"
            title={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                title="Back to List"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <span className="flex items-center gap-2 text-xl">
                            <User className="text-primary" /> Student Profile
                        </span>
                    </div>
                    {profile && (
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
            ) : profile ? (
                <div className="space-y-8">
                    {/* Personal Information */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User size={20} /> Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-900">{profile.personal?.firstName} {profile.personal?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Roll No</p>
                                <p className="font-medium text-gray-900">{profile.personal?.rollNo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{profile.personal?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{profile.personal?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Program</p>
                                <p className="font-medium text-gray-900">{profile.personal?.program}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Year</p>
                                <p className="font-medium text-gray-900">{profile.personal?.year} Year</p>
                            </div>
                        </div>
                    </section>

                    {/* Academic Records */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BookOpen size={20} /> Academic Records
                        </h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Qualification</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Institution</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Year</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profile.academic?.map((rec, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                            <td className="p-3 text-sm">{rec.qualification}</td>
                                            <td className="p-3 text-sm">{rec.institution}</td>
                                            <td className="p-3 text-sm">{rec.year}</td>
                                            <td className="p-3 text-sm font-medium">
                                                {rec.obtainedScore} / {rec.totalScore} ({((rec.obtainedScore / rec.totalScore) * 100).toFixed(1)}%)
                                            </td>
                                        </tr>
                                    ))}
                                    {(!profile.academic || profile.academic.length === 0) && (
                                        <tr><td colSpan="4" className="p-4 text-center text-gray-500">No academic records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Training Details */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Briefcase size={20} /> Training & Projects
                        </h3>
                        <div className="space-y-4">
                            {profile.training?.map((train, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-primary">{train.trainingTitle}</h4>
                                            <p className="text-sm text-gray-600">{train.companyName} • Mentor: {train.mentorName}</p>
                                        </div>
                                        <Badge status={train.status} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Progress</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${train.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs font-medium">{train.progress}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Score</p>
                                            <p className="font-bold text-gray-900">{train.score ?? 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Assigned Date</p>
                                            <p className="text-sm text-gray-900">{train.assignedDate}</p>
                                        </div>
                                    </div>
                                    {train.remarks && (
                                        <div className="mt-3 bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
                                            <strong>Feedback:</strong> {train.remarks}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(!profile.training || profile.training.length === 0) && (
                                <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No training assignments found.</p>
                            )}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="text-center text-red-500 p-8">Failed to load profile data.</div>
            )}
            <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default StudentProfileModal;
