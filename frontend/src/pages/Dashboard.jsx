import React from 'react';
import { Users, Briefcase, ClipboardCheck, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const ROLES = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };

const Dashboard = ({ user, students, assignments, trainings }) => {
    const studentAssignments = user.role === ROLES.STUDENT ? assignments.filter(a => a.studentId === user.studentId) : [];
    const pendingEvaluations = user.role !== ROLES.STUDENT ? assignments.filter(a => a.status === 'PendingEvaluation').length : 0;

    const stats = [
        { label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', show: user.role !== ROLES.STUDENT },
        { label: 'Active Assignments', value: user.role === ROLES.STUDENT ? studentAssignments.filter(a => a.status === 'InProgress').length : assignments.filter(a => a.status === 'InProgress').length, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', show: true },
        { label: 'Pending Evaluation', value: user.role === ROLES.STUDENT ? studentAssignments.filter(a => a.status === 'PendingEvaluation').length : pendingEvaluations, icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-50', show: true },
        { label: 'Active Trainings', value: trainings.filter(p => p.status === 'Ongoing').length, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', show: true },
    ];

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-text-text-primary mb-6">Welcome, {user.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.filter(s => s.show).map((stat, idx) => (
                    <Card key={idx} className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bg}`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                        <div><p className="text-sm text-text-text-secondary font-medium">{stat.label}</p><p className="text-2xl font-bold text-text-text-primary">{stat.value}</p></div>
                    </Card>
                ))}
            </div>
            {user.role === ROLES.STUDENT && (
                <Card className="p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4 text-text-text-primary">My Active Tasks</h3>
                    {studentAssignments.filter(a => ['Assigned', 'InProgress', 'PendingEvaluation'].includes(a.status)).length > 0 ? (
                        <div className="space-y-3">
                            {studentAssignments.filter(a => ['Assigned', 'InProgress', 'PendingEvaluation'].includes(a.status)).map(assign => {
                                const train = trainings.find(t => t.id === assign.trainingId);
                                return (
                                    <div key={assign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-12 rounded-full ${assign.status === 'InProgress' ? 'bg-blue-500' : assign.status === 'PendingEvaluation' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                                            <div><p className="font-bold text-gray-800">{train?.title}</p><p className="text-sm text-gray-500">{assign.status} • {assign.progress}% Complete</p></div>
                                        </div>
                                        <Badge status={assign.status} />
                                    </div>
                                )
                            })}
                        </div>
                    ) : <p className="text-text-text-secondary italic">No active assignments. Good job!</p>}
                </Card>
            )}
            {user.role === ROLES.ADMIN && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6"><h3 className="font-bold mb-4">System Status</h3><div className="flex items-center gap-2 text-sm text-success"><div className="w-2 h-2 bg-success rounded-full"></div> All Systems Operational</div></Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
