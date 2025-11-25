import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, User, Calendar, CheckCircle, Clock, AlertCircle, Plus, Award, ArrowLeft, Building, Mail, Phone, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAssignments, getTrainings, getCompanies, getMentors, getTrainingProgress, createTrainingProgress, updateAssignment, getStudents, getUsers } from '../services/api';

const ROLES = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };

const AssignmentDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [assignment, setAssignment] = useState(null);
    const [training, setTraining] = useState(null);
    const [company, setCompany] = useState(null);
    const [mentor, setMentor] = useState(null);
    const [student, setStudent] = useState(null);
    const [faculty, setFaculty] = useState(null);
    const [progressHistory, setProgressHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Modal States
    const [isProgressModalOpen, setProgressModalOpen] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [progressForm, setProgressForm] = useState({ percent: '', status: 'OnTrack', feedback: '' });
    const [evalForm, setEvalForm] = useState({ score: '', remarks: '' });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [assignRes, trainRes, compRes, mentRes, progRes, studRes, usersRes] = await Promise.all([
                getAssignments(),
                getTrainings(),
                getCompanies(),
                getMentors(),
                getTrainingProgress(),
                getStudents(),
                getUsers()
            ]);

            const currentAssignment = assignRes.data.find(a => a.id.toString() === id);

            if (currentAssignment) {
                setAssignment(currentAssignment);
                setTraining(trainRes.data.find(t => t.id === currentAssignment.trainingId));
                setCompany(compRes.data.find(c => c.id === currentAssignment.companyId));
                setMentor(mentRes.data.find(m => m.id === currentAssignment.mentorId));
                setStudent(studRes.data.find(s => s.id === currentAssignment.studentId));
                setProgressHistory(progRes.data.filter(p => p.assignmentId === currentAssignment.id));

                // Find a faculty member (mock logic as assignment doesn't store creator)
                // In a real app, we'd use assignment.createdBy or training.facultyId
                const facultyMember = usersRes.data.find(u => u.role === ROLES.FACULTY);
                setFaculty(facultyMember);
            }
        } catch (error) {
            console.error("Failed to fetch assignment details", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProgressSubmit = async () => {
        if (!assignment) return;
        try {
            const progressData = {
                ...progressForm,
                assignmentId: assignment.id,
                date: new Date().toISOString().split('T')[0]
            };

            await createTrainingProgress(progressData);

            const newStatus = parseInt(progressForm.percent) === 100 ? 'PendingEvaluation' : 'InProgress';
            await updateAssignment(assignment.id, { ...assignment, progress: progressForm.percent, status: newStatus });

            setProgressModalOpen(false);
            setProgressForm({ percent: '', status: 'OnTrack', feedback: '' });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to update progress", error);
            alert("Failed to update progress");
        }
    };

    const handleEvalSubmit = async () => {
        if (!assignment || !evalForm.score) return;
        try {
            await updateAssignment(assignment.id, {
                ...assignment,
                status: 'Completed',
                score: evalForm.score,
                remarks: evalForm.remarks || assignment.remarks
            });
            setIsEvalModalOpen(false);
            setEvalForm({ score: '', remarks: '' });
            fetchData();
        } catch (error) {
            console.error("Failed to evaluate", error);
            alert("Failed to submit evaluation");
        }
    };

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!assignment) return <div className="p-8 text-center">Assignment not found</div>;

    const isStudent = user.role?.toLowerCase() === ROLES.STUDENT.toLowerCase();
    const canUpdateProgress = isStudent || user.role?.toLowerCase() === ROLES.ADMIN.toLowerCase() || user.role?.toLowerCase() === ROLES.FACULTY.toLowerCase();
    const canEvaluate = user.role?.toLowerCase() === ROLES.ADMIN.toLowerCase() || user.role?.toLowerCase() === ROLES.FACULTY.toLowerCase();

    return (
        <div className="animate-fade-in max-w-5xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-textSecondary hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Back
            </button>

            {/* Header Section */}
            <Card className="p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-text-text-primary">{assignment.title || "Assignment Details"}</h1>
                            <Badge status={assignment.status} />
                        </div>
                        <div className="flex items-center gap-6 text-sm text-textSecondary">
                            <span className="flex items-center gap-2">
                                <BookOpen size={18} className="text-primary" />
                                <span className="font-medium text-gray-700">{training?.title}</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar size={18} className="text-gray-400" />
                                <span>Assigned: {assignment.assignedDate?.split('T')[0]}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
                    <div className="flex-1 w-full">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Progress</span>
                            <span className="font-bold text-primary">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${assignment.progress}%` }}></div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {canUpdateProgress && assignment.status !== 'Completed' && (
                            <Button size="sm" onClick={() => setProgressModalOpen(true)} icon={Plus} className="whitespace-nowrap">Update Progress</Button>
                        )}
                        {canEvaluate && assignment.status === 'PendingEvaluation' && (
                            <Button size="sm" onClick={() => setIsEvalModalOpen(true)} icon={Award} className="whitespace-nowrap">Evaluate</Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-6">
                {['Overview', 'Details'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors px-2 ${activeTab === tab.toLowerCase()
                            ? 'border-primary text-primary'
                            : 'border-transparent text-textSecondary hover:text-text-text-primary'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4">Description</h3>
                            <p className="text-gray-600 leading-relaxed">{assignment.description || training?.description || "No description provided."}</p>

                            {assignment.remarks && (
                                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-bold text-blue-900 mb-1">Remarks</h4>
                                    <p className="text-sm text-blue-800">{assignment.remarks}</p>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4">Progress History</h3>
                            <div className="space-y-6 pl-2">
                                {progressHistory.length > 0 ? progressHistory.map((p, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-gray-200 last:border-transparent pb-1">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-sm"></div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-gray-800 text-sm">{p.percent}%</span>
                                                <span className="text-xs text-gray-400">{p.date?.split('T')[0]}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{p.feedback}</p>
                                            <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${p.status === 'OnTrack' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.status === 'OnTrack' ? 'On Track' : 'Delayed'}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-textSecondary italic">No updates yet.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Building size={20} className="text-gray-400" /> Company Details</h3>
                            {company ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Company Name</p>
                                        <p className="font-medium text-gray-900">{company.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                                        <p className="font-medium text-gray-900">{company.contactPerson}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <a href={`mailto:${company.email}`} className="text-primary hover:underline">{company.email}</a>
                                    </div>
                                </div>
                            ) : <p className="text-textSecondary italic">No company details available.</p>}
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20} className="text-gray-400" /> Mentor Details</h3>
                            {mentor ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Mentor Name</p>
                                        <p className="font-medium text-gray-900">{mentor.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Designation</p>
                                        <p className="font-medium text-gray-900">{mentor.designation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email</p>
                                        <a href={`mailto:${mentor.email}`} className="text-primary hover:underline">{mentor.email}</a>
                                    </div>
                                </div>
                            ) : <p className="text-textSecondary italic">No mentor assigned.</p>}
                        </Card>

                        {/* Assigned By Section - Only visible to Students */}
                        {isStudent && faculty && (
                            <Card className="p-6 md:col-span-2">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award size={20} className="text-gray-400" /> Assigned By</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                        {faculty.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{faculty.name}</p>
                                        <p className="text-sm text-gray-500">Faculty / Project Coordinator</p>
                                        <a href={`mailto:${faculty.email}`} className="text-sm text-primary hover:underline mt-1 block">{faculty.email}</a>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isProgressModalOpen} onClose={() => setProgressModalOpen(false)} title="Update Progress">
                <Input label="Completion %" type="number" min="0" max="100" value={progressForm.percent} onChange={e => setProgressForm({ ...progressForm, percent: e.target.value })} />
                <Select label="Status" options={[{ value: 'OnTrack', label: 'On Track' }, { value: 'Delayed', label: 'Delayed' }]} value={progressForm.status} onChange={e => setProgressForm({ ...progressForm, status: e.target.value })} />
                <Input label="Feedback / Remarks" value={progressForm.feedback} onChange={e => setProgressForm({ ...progressForm, feedback: e.target.value })} />
                <Button onClick={handleProgressSubmit} className="w-full mt-4">Add Update</Button>
            </Modal>

            <Modal isOpen={isEvalModalOpen} onClose={() => setIsEvalModalOpen(false)} title="Final Project Evaluation">
                <p className="text-sm text-gray-600 mb-4">This student has completed 100% of the training. Please provide a final score to close the assignment.</p>
                <Input label="Final Score (0-100)" type="number" min="0" max="100" value={evalForm.score} onChange={e => setEvalForm({ ...evalForm, score: e.target.value })} />
                <Input label="Final Remarks" value={evalForm.remarks} onChange={e => setEvalForm({ ...evalForm, remarks: e.target.value })} />
                <Button onClick={handleEvalSubmit} className="w-full mt-4" icon={Award}>Submit Evaluation</Button>
            </Modal>
        </div>
    );
};

export default AssignmentDetail;
