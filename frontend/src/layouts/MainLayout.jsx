import React, { useState } from 'react';
import {
    LayoutDashboard, Users, FileText, BookOpen, Building2,
    GraduationCap, User, BarChart2, Settings, LogOut, Menu, X, Bell
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Card from '../components/ui/Card';

const ROLES = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };

const MainLayout = ({ children, user, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Assignment Updated', body: 'Your progress was updated by mentor.', isRead: false }
    ]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
        { id: 'students', label: 'Students', icon: Users, roles: [ROLES.ADMIN, ROLES.FACULTY] },
        { id: 'assignments', label: 'Assignments', icon: FileText, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
        { id: 'trainings', label: 'Trainings', icon: BookOpen, roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT] },
        { id: 'companies', label: 'Companies', icon: Building2, roles: [ROLES.ADMIN] },
        { id: 'mentors', label: 'Mentors', icon: GraduationCap, roles: [ROLES.ADMIN] },
        { id: 'users', label: 'User Mgmt', icon: User, roles: [ROLES.ADMIN] },
        { id: 'reports', label: 'Reports', icon: BarChart2, roles: [ROLES.ADMIN, ROLES.FACULTY] },
        { id: 'admin', label: 'Admin Tools', icon: Settings, roles: [ROLES.ADMIN] },
    ];

    const studentProfileItem = { id: 'student-profile', label: 'My Profile', icon: Users, roles: [ROLES.STUDENT] };

    const visibleMenuItems = user.role === ROLES.STUDENT
        ? [menuItems[0], studentProfileItem, menuItems[2], menuItems[3]]
        : menuItems.filter(m => m.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-app-bg font-sans text-text-text-primary flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-border transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
                <div className="h-16 flex items-center px-6 border-b border-border justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl text-text-text-primary">
                        <div className="w-8 h-8 bg-primary rounded text-white flex items-center justify-center">E</div>
                        EduTrack
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X /></button>
                </div>
                <nav className="p-4 space-y-1">
                    {visibleMenuItems.map(item => (
                        <NavLink
                            key={item.id}
                            to={`/${item.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-primary' : 'text-textSecondary hover:bg-gray-50'}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-border">
                    <button onClick={onLogout} className="w-full flex items-center gap-2 text-error hover:bg-red-50 p-2 rounded text-sm">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu /></button>
                    <div className="hidden md:block text-sm text-textSecondary">Academic Year 2023-2024</div>
                    <div className="relative">
                        <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 hover:bg-gray-100 rounded-full">
                            <Bell size={20} className="text-textSecondary" />
                            {notifications.some(n => !n.isRead) && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>}
                        </button>
                        {isNotifOpen && (
                            <Card className="absolute right-0 mt-2 w-80 z-50 p-0 overflow-hidden animate-fade-in border-blue-100 shadow-xl">
                                <div className="p-3 border-b bg-gray-50 font-bold text-sm flex justify-between">
                                    <span>Notifications</span>
                                    <span className="text-xs text-info cursor-pointer" onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}>Mark all read</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? <div className="p-4 text-sm text-textSecondary">No notifications</div> : notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                                            <div className="flex justify-between"><p className="text-sm font-medium">{n.title}</p>{!n.isRead && <div className="w-2 h-2 bg-info rounded-full"></div>}</div>
                                            <p className="text-xs text-textSecondary">{n.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
