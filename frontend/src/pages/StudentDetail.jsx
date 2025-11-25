import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight, Briefcase, UserCheck, Edit2, GraduationCap as GradIcon,
    Trash2, Plus, Award
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';

const ROLES = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };

const StudentDetail = ({
    student, students, onBack, assignments, academics, progress,
    onAddAcademic, onDeleteAcademic, onAddProgress, onEvaluate,
    trainings, companies, mentors, userRole, currentUserEmail,
    onEditProfile, initialTab = 'overview'
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.initialTab || initialTab);
    const [isAcademicModalOpen, setAcademicModalOpen] = useState(false);
    const [isProgressModalOpen, setProgressModalOpen] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    const currentStudent = student || (students && id ? students.find(s => s.id.toString() === id) : null);

    if (!currentStudent) return <div className="p-6 text-center text-textSecondary">Student not found</div>;

    const isOwnProfile = userRole === ROLES.STUDENT && currentUserEmail === currentStudent.email;
    const canEditAcademics = userRole === ROLES.ADMIN || isOwnProfile;
    const canUpdateProgress = userRole === ROLES.ADMIN || userRole === ROLES.FACULTY || isOwnProfile;
    const canEvaluate = userRole === ROLES.ADMIN || userRole === ROLES.FACULTY;

    const [academicForm, setAcademicForm] = useState({ qualification: '', institution: '', year: '', totalScore: '', obtainedScore: '' });
    const [progressForm, setProgressForm] = useState({ percent: '', status: 'OnTrack', feedback: '' });
    const [evalForm, setEvalForm] = useState({ score: '', remarks: '' });

    const studentAssignments = assignments.filter(a => a.studentId === currentStudent.id);
    const studentAcademics = academics.filter(a => a.studentId === currentStudent.id);

    const handleAcademicSubmit = () => {
        if (!academicForm.qualification || !academicForm.year) return;
        onAddAcademic({ ...academicForm, studentId: currentStudent.id });
        setAcademicModalOpen(false);
        setAcademicForm({ qualification: '', institution: '', year: '', totalScore: '', obtainedScore: '' });
    };

    // ... (keep other handlers)

    // ... (inside return)
    const handleProgressSubmit = () => {
        if (!selectedAssignmentId) return;
        onAddProgress({ ...progressForm, assignmentId: selectedAssignmentId });
        setProgressModalOpen(false);
        setProgressForm({ percent: '', status: 'OnTrack', feedback: '' });
    };

    const handleEvalSubmit = () => {
        if (!selectedAssignmentId || !evalForm.score) return;
        onEvaluate(selectedAssignmentId, evalForm.score, evalForm.remarks);
        setIsEvalModalOpen(false);
        setEvalForm({ score: '', remarks: '' });
    };

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={handleBack} className="text-textSecondary hover:text-primary flex items-center gap-1 text-sm">
                    <ChevronRight className="rotate-180 w-4 h-4" /> Back
                </button>
            </div>

            <Card className="p-6 mb-6 flex flex-col md:flex-row gap-6 items-center relative">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-text-text-primary">{currentStudent.firstName} {currentStudent.lastName}</h1>
                    <div className="flex gap-4 text-sm text-textSecondary mt-2">
                        <span className="flex items-center gap-1"><Briefcase size={14} /> {currentStudent.program}</span>
                        <span className="flex items-center gap-1"><UserCheck size={14} /> {currentStudent.rollNo}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${currentStudent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {currentStudent.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                {isOwnProfile && <Button variant="secondary" size="sm" onClick={() => onEditProfile(currentStudent)} icon={Edit2}>Edit Profile</Button>}
            </Card>

            <div className="flex gap-6 border-b border-gray-200 mb-6">
                {['Overview', 'Academics', 'Assignments'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`pb-3 text-sm font-medium border-b-2 ${activeTab === tab.toLowerCase() ? 'border-primary text-primary' : 'border-transparent text-textSecondary'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Contact Information</h3>
                            {isOwnProfile && <span className="text-xs text-info cursor-pointer hover:underline" onClick={() => onEditProfile(currentStudent)}>Edit</span>}
                        </div>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p><span className="font-medium text-text-text-primary">Email:</span> {currentStudent.email}</p>
                            <p><span className="font-medium text-text-text-primary">Phone:</span> {currentStudent.phone}</p>
                            <p><span className="font-medium text-text-text-primary">Year:</span> {currentStudent.year}</p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Academic Background</h3>
                            <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab('academics')}>Manage</Button>
                        </div>
                        {studentAcademics.length > 0 ? (
                            <div className="space-y-2">
                                {studentAcademics.map(rec => (
                                    <div key={rec.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                        <GradIcon size={16} className="text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-text-text-primary">{rec.qualification}</p>
                                            <p className="text-xs text-textSecondary">{rec.institution} • {rec.year}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-primary block">{rec.obtainedScore}/{rec.totalScore}</span>
                                            <span className="text-[10px] text-gray-500">{((rec.obtainedScore / rec.totalScore) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-textSecondary mb-2">No academic records found.</p>
                                {canEditAcademics && <Button size="sm" variant="secondary" onClick={() => setAcademicModalOpen(true)}>Add Record</Button>}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'academics' && (
                <Card>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold">Academic History</h3>
                        {canEditAcademics && <Button variant="secondary" onClick={() => setAcademicModalOpen(true)} icon={Plus}>Add Record</Button>}
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr><th className="p-4 text-sm">Qualification</th><th className="p-4 text-sm">Institution</th><th className="p-4 text-sm">Year</th><th className="p-4 text-sm">Score</th>{canEditAcademics && <th className="p-4"></th>}</tr>
                        </thead>
                        <tbody>
                            {studentAcademics.map(rec => (
                                <tr key={rec.id} className="border-t border-gray-100">
                                    <td className="p-4 text-sm">{rec.qualification}</td>
                                    <td className="p-4 text-sm text-gray-600">{rec.institution}</td>
                                    <td className="p-4 text-sm text-gray-600">{rec.year}</td>
                                    <td className="p-4 text-sm font-bold text-primary">{rec.obtainedScore}/{rec.totalScore} <span className="text-xs font-normal text-gray-500">({((rec.obtainedScore / rec.totalScore) * 100).toFixed(1)}%)</span></td>
                                    {canEditAcademics && <td className="p-4 text-right"><button onClick={() => onDeleteAcademic(rec.id)} className="text-error"><Trash2 size={14} /></button></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'assignments' && (
                <div className="space-y-6">
                    {studentAssignments.map(assign => (
                        <Card key={assign.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/assignments/${assign.id}`)}>
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-text-text-primary">{trainings.find(t => t.id === assign.trainingId)?.title}</h3>
                                    <p className="text-sm text-textSecondary mt-1">{companies.find(c => c.id === assign.companyId)?.name}</p>
                                </div>
                                <div className="text-right">
                                    <Badge status={assign.status} />
                                    {assign.score && <div className="text-sm font-bold text-success mt-1">Score: {assign.score}/100</div>}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Progress Timeline</h4>
                                    <span className="text-xs text-primary font-medium">Click to view details</span>
                                </div>
                                <div className="space-y-6 pl-2">
                                    {progress.filter(p => p.assignmentId === assign.id).slice(0, 3).map((p, idx) => (
                                        <div key={idx} className="relative pl-6 border-l-2 border-gray-300 last:border-transparent">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-text-text-primary">{p.percent}% - {p.status}</p>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{p.feedback}</p>
                                                </div>
                                                <span className="text-xs text-gray-400">{p.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={isAcademicModalOpen} onClose={() => setAcademicModalOpen(false)} title="Add Academic Record">
                <Input label="Qualification (e.g., Class 10, BCA)" value={academicForm.qualification} onChange={e => setAcademicForm({ ...academicForm, qualification: e.target.value })} />
                <Input label="Institution/Board" value={academicForm.institution} onChange={e => setAcademicForm({ ...academicForm, institution: e.target.value })} />
                <div className="grid grid-cols-3 gap-4">
                    <Input label="Year" type="number" value={academicForm.year} onChange={e => setAcademicForm({ ...academicForm, year: e.target.value })} />
                    <Input label="Total Score" type="number" value={academicForm.totalScore} onChange={e => setAcademicForm({ ...academicForm, totalScore: e.target.value })} />
                    <Input label="Obtained" type="number" value={academicForm.obtainedScore} onChange={e => setAcademicForm({ ...academicForm, obtainedScore: e.target.value })} />
                </div>
                <Button onClick={handleAcademicSubmit} className="w-full mt-4">Save Record</Button>
            </Modal>

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

export default StudentDetail;
