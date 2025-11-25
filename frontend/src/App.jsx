import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Upload, Settings, Plus } from 'lucide-react';

// Layouts & Components
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDetail from './pages/StudentDetail';
import Reports from './pages/Reports';
import GenericList from './components/GenericList';
import Modal from './components/ui/Modal';
import ConfirmDialog from './components/ui/ConfirmDialog';
import Input from './components/ui/Input';
import Select from './components/ui/Select';
import Checkbox from './components/ui/Checkbox';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Card from './components/ui/Card';

// Constants
const ROLES = { ADMIN: 'Admin', FACULTY: 'Faculty', STUDENT: 'Student' };

import { getStudents, createStudent, updateStudent, deleteStudent, getAssignments, createAssignment, updateAssignment, deleteAssignment, getTrainings, createTraining, updateTraining, deleteTraining, getCompanies, createCompany, updateCompany, deleteCompany, getMentors, createMentor, updateMentor, deleteMentor, getUsers, createUser, updateUser, deleteUser, getAcademicRecords, createAcademicRecord, deleteAcademicRecord, getTrainingProgress, createTrainingProgress } from './services/api';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  // view, selectedStudent, detailInitialTab removed

  // Data State - All initialized empty, data fetched from backend
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [progress, setProgress] = useState([]);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ type: null, isOpen: false, mode: 'create', itemId: null });
  const [formData, setFormData] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const storedUser = localStorage.getItem('edutrack_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Fetch initial data
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentsRes = await getStudents();
      setStudents(studentsRes.data);
      const assignmentsRes = await getAssignments();
      setAssignments(assignmentsRes.data);
      const trainingsRes = await getTrainings();
      setTrainings(trainingsRes.data);
      const companiesRes = await getCompanies();
      setCompanies(companiesRes.data);
      const mentorsRes = await getMentors();
      setMentors(mentorsRes.data);
      const usersRes = await getUsers();
      setUsers(usersRes.data);
      const academicsRes = await getAcademicRecords();
      setAcademics(academicsRes.data);
      const progressRes = await getTrainingProgress();
      setProgress(progressRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('edutrack_user', JSON.stringify(u));
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edutrack_user');
    navigate('/login');
  };

  const handleRegister = async (newUser) => {
    try {
      // Create user first
      const userResponse = await createUser({
        username: newUser.email.split('@')[0],
        password: newUser.password,
        role: ROLES.STUDENT,
        name: newUser.name,
        email: newUser.email,
        isActive: true
      });

      // Create corresponding student record
      await createStudent({
        rollNo: `TEMP-${Date.now()}`,
        firstName: newUser.name.split(' ')[0],
        lastName: newUser.name.split(' ')[1] || '',
        email: newUser.email,
        program: 'Pending',
        year: 1,
        isActive: true
      });

      fetchData();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  // CRUD Operations
  const handleSave = async () => {
    // Validation logic...
    if (modalConfig.type === 'student' && !formData.email) return alert('Email required');
    if (modalConfig.type === 'training') {
      if (!formData.title) return alert('Training Title is required');
      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) return alert('Start Date must be before End Date');
    }
    if (modalConfig.type === 'assignment' && !formData.studentId) return alert('Student selection is required');
    if (modalConfig.type === 'assignment' && !formData.trainingId) return alert('Training selection is required');

    const id = modalConfig.mode === 'create' ? Date.now() : modalConfig.itemId;

    try {
      if (modalConfig.type === 'student') {
        const record = { isActive: true, ...formData }; // Backend handles ID
        if (modalConfig.mode === 'create') {
          await createStudent(record);
          // Optimistic update or refetch
          fetchData();
          if (!users.some(u => u.email === record.email)) {
            setUsers([...users, { id: id + 1, username: formData.email.split('@')[0], password: 'password', role: ROLES.STUDENT, name: `${formData.firstName} ${formData.lastName}`, email: formData.email, isActive: true }]);
          }
        } else {
          await updateStudent(modalConfig.itemId, record);
          fetchData();
        }
      } else if (modalConfig.type === 'user') {
        const record = { isActive: true, ...formData };
        if (modalConfig.mode === 'create') {
          await createUser(record);
        } else {
          await updateUser(modalConfig.itemId, record);
        }
        fetchData();
      } else if (modalConfig.type === 'company') {
        if (modalConfig.mode === 'create') {
          await createCompany(formData);
        } else {
          await updateCompany(modalConfig.itemId, formData);
        }
        fetchData();
      } else if (modalConfig.type === 'mentor') {
        if (modalConfig.mode === 'create') {
          await createMentor(formData);
        } else {
          await updateMentor(modalConfig.itemId, formData);
        }
        fetchData();
      } else if (modalConfig.type === 'training') {
        const safeFormData = { ...formData, startDate: formData.startDate || '', endDate: formData.endDate || '' };
        if (modalConfig.mode === 'create') {
          await createTraining(safeFormData);
        } else {
          await updateTraining(modalConfig.itemId, safeFormData);
        }
        fetchData();
      } else if (modalConfig.type === 'assignment') {
        const record = { status: 'Assigned', assignedDate: new Date().toISOString().split('T')[0], progress: 0, ...formData };
        if (modalConfig.mode === 'create') {
          await createAssignment(record);
        } else {
          await updateAssignment(modalConfig.itemId, formData);
        }
        fetchData();
      }
      setModalConfig({ type: null, isOpen: false, mode: 'create', itemId: null });
      setFormData({});
    } catch (error) {
      console.error("Save failed", error);
      alert("Operation failed");
    }
  };

  const handleDelete = async (type, id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      message: 'Are you sure? This action cannot be undone.',
      onConfirm: async () => {
        try {
          if (type === 'training' && assignments.some(a => a.trainingId === id)) {
            alert("Cannot delete Training: Linked assignments exist.");
            return;
          }
          if (type === 'student') {
            await deleteStudent(id);
            fetchData();
          }
          if (type === 'user') {
            await deleteUser(id);
            fetchData();
          }
          if (type === 'company') {
            await deleteCompany(id);
            fetchData();
          }
          if (type === 'mentor') {
            await deleteMentor(id);
            fetchData();
          }
          if (type === 'training') {
            await deleteTraining(id);
            fetchData();
          }
          if (type === 'assignment') {
            await deleteAssignment(id);
            fetchData();
          }
        } catch (error) {
          console.error("Delete failed", error);
          if (error.response && error.response.data && error.response.data.errors) {
            const messages = Object.values(error.response.data.errors).flat().join('\n');
            alert(`Validation Failed:\n${messages}`);
          } else if (error.response && error.response.data) {
            alert(`Error: ${JSON.stringify(error.response.data)}`);
          } else {
            alert("Operation failed. Please check your input.");
          }
        }
      }
    });
  };

  const openModal = (type, mode = 'create', item = null) => {
    setFormData(item || {});
    setModalConfig({ type, isOpen: true, mode, itemId: item?.id });
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(l => l.trim());
        let successCount = 0;

        for (const line of lines.slice(1)) {
          const [rollNo, firstName, lastName, email, program, year, phone] = line.split(',').map(s => s.trim());
          if (!rollNo || !email) continue;

          try {
            // Create student
            await createStudent({
              rollNo,
              firstName,
              lastName,
              email,
              program,
              year: parseInt(year),
              phone,
              isActive: true
            });

            // Create corresponding user
            await createUser({
              username: email.split('@')[0],
              password: 'password',
              role: ROLES.STUDENT,
              name: `${firstName} ${lastName}`,
              email,
              isActive: true
            });

            successCount++;
          } catch (err) {
            console.error(`Failed to import ${email}:`, err);
          }
        }

        await fetchData();
        alert(`Successfully imported ${successCount} students`);
      } catch (error) {
        console.error('CSV import failed:', error);
        alert('Failed to import CSV. Please check the file format.');
      }
    };

    reader.readAsText(file);
    e.target.value = null;
  };
  // Derived Data
  const enrichedAssignments = assignments.map(a => {
    const s = students.find(st => st.id === a.studentId);
    const t = trainings.find(tr => tr.id === a.trainingId);
    const c = companies.find(co => co.id === a.companyId);
    return { ...a, studentName: s ? `${s.firstName} ${s.lastName}` : 'Unknown', rollNo: s?.rollNo || '', trainingTitle: t?.title || '', companyName: c?.name || '' };
  });

  const isAdmin = user?.role === ROLES.ADMIN;
  const isFacultyOrAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.FACULTY;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} onRegister={handleRegister} mockUsers={users} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard user={user} students={students} assignments={assignments} trainings={trainings} />} />
        <Route path="/reports" element={<Reports students={students} trainings={trainings} assignments={assignments} />} />

        <Route path="/students" element={
          <GenericList
            title="Student Management"
            data={students}
            onAdd={isAdmin ? () => openModal('student') : undefined}
            onEdit={isAdmin ? (item) => openModal('student', 'edit', item) : undefined}
            onDelete={isAdmin ? (id) => handleDelete('student', id) : undefined}
            onRowClick={(s) => navigate(`/students/${s.id}`)}
            columns={[
              { header: 'Roll No', field: 'rollNo' },
              { header: 'Name', render: (s) => `${s.firstName} ${s.lastName}` },
              { header: 'Program', field: 'program' },
              { header: 'Status', render: (s) => <Badge status={s.isActive ? 'Active' : 'Inactive'} /> },
              { header: 'Action', render: (s) => <Button variant="ghost" className="h-auto p-1 text-info" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }}>View</Button> }
            ]}
          />
        } />

        <Route path="/students/:id" element={
          <StudentDetail
            students={students}
            onBack={() => navigate('/students')}
            assignments={assignments}
            academics={academics}
            progress={progress}
            trainings={trainings}
            companies={companies}
            mentors={mentors}
            onAddAcademic={async (rec) => { await createAcademicRecord(rec); fetchData(); }}
            onDeleteAcademic={async (id) => { await deleteAcademicRecord(id); fetchData(); }}
            onAddProgress={async (rec) => {
              const progressData = { ...rec, date: new Date().toISOString().split('T')[0] };
              await createTrainingProgress(progressData);
              const newStatus = parseInt(rec.percent) === 100 ? 'PendingEvaluation' : 'InProgress';
              const assignment = assignments.find(a => a.id === rec.assignmentId);
              if (assignment) {
                await updateAssignment(rec.assignmentId, { ...assignment, progress: rec.percent, status: newStatus });
              }
              fetchData();
            }}
            onEvaluate={async (assignmentId, score, remarks) => {
              const assignment = assignments.find(a => a.id === assignmentId);
              if (assignment) {
                await updateAssignment(assignmentId, { ...assignment, status: 'Completed', score, remarks: remarks || assignment.remarks });
                fetchData();
              }
            }}
            onEditProfile={(s) => openModal('student', 'edit', s)}
            userRole={user.role}
            currentUserEmail={user.email}
          />
        } />

        <Route path="/student-profile" element={
          <StudentDetail
            student={students.find(s => s.email === user.email)}
            onBack={() => navigate('/dashboard')}
            assignments={assignments}
            academics={academics}
            progress={progress}
            trainings={trainings}
            companies={companies}
            mentors={mentors}
            onAddAcademic={async (rec) => { await createAcademicRecord(rec); fetchData(); }}
            onDeleteAcademic={async (id) => { await deleteAcademicRecord(id); fetchData(); }}
            onAddProgress={async (rec) => {
              const progressData = { ...rec, date: new Date().toISOString().split('T')[0] };
              await createTrainingProgress(progressData);
              const newStatus = parseInt(rec.percent) === 100 ? 'PendingEvaluation' : 'InProgress';
              const assignment = assignments.find(a => a.id === rec.assignmentId);
              if (assignment) {
                await updateAssignment(rec.assignmentId, { ...assignment, progress: rec.percent, status: newStatus });
              }
              fetchData();
            }}
            onEvaluate={async (assignmentId, score, remarks) => {
              const assignment = assignments.find(a => a.id === assignmentId);
              if (assignment) {
                await updateAssignment(assignmentId, { ...assignment, status: 'Completed', score, remarks: remarks || assignment.remarks });
                fetchData();
              }
            }}
            onEditProfile={(s) => openModal('student', 'edit', s)}
            userRole={user.role}
            currentUserEmail={user.email}
          />
        } />

        <Route path="/users" element={
          <GenericList title="User Management" data={users} onAdd={isAdmin ? () => openModal('user') : undefined} onEdit={isAdmin ? (item) => openModal('user', 'edit', item) : undefined} onDelete={isAdmin ? (id) => handleDelete('user', id) : undefined} columns={[{ header: 'Username', field: 'username' }, { header: 'Name', field: 'name' }, { header: 'Role', field: 'role' }, { header: 'Status', render: (u) => <Badge status={u.isActive ? 'Active' : 'Inactive'} /> }]} />
        } />

        <Route path="/companies" element={
          <GenericList title="Companies" data={companies} onAdd={isAdmin ? () => openModal('company') : undefined} onEdit={isAdmin ? (item) => openModal('company', 'edit', item) : undefined} onDelete={isAdmin ? (id) => handleDelete('company', id) : undefined} columns={[{ header: 'Name', field: 'name' }, { header: 'Contact', field: 'contactPerson' }, { header: 'Email', field: 'email' }]} />
        } />

        <Route path="/mentors" element={
          <GenericList title="Mentors" data={mentors} onAdd={isAdmin ? () => openModal('mentor') : undefined} onEdit={isAdmin ? (item) => openModal('mentor', 'edit', item) : undefined} onDelete={isAdmin ? (id) => handleDelete('mentor', id) : undefined} columns={[{ header: 'Name', field: 'name' }, { header: 'Company', render: (m) => companies.find(c => c.id == m.companyId)?.name }, { header: 'Email', field: 'email' }]} />
        } />

        <Route path="/trainings" element={
          <GenericList title="Trainings" data={trainings} onAdd={isFacultyOrAdmin ? () => openModal('training') : undefined} onEdit={isFacultyOrAdmin ? (item) => openModal('training', 'edit', item) : undefined} onDelete={isFacultyOrAdmin ? (id) => handleDelete('training', id) : undefined} columns={[{ header: 'Title', field: 'title' }, { header: 'Duration', render: (p) => (p.startDate && p.endDate) ? `${p.startDate} to ${p.endDate}` : 'Flexible' }, { header: 'Status', render: (p) => <Badge status={p.status} /> }]} />
        } />

        <Route path="/assignments" element={
          <GenericList
            title={user.role === ROLES.STUDENT ? "My Assignments" : "All Assignments"}
            data={user.role === ROLES.STUDENT ? enrichedAssignments.filter(a => a.studentId === user.studentId) : enrichedAssignments}
            onAdd={isFacultyOrAdmin ? () => openModal('assignment') : undefined}
            onEdit={isFacultyOrAdmin ? (item) => openModal('assignment', 'edit', item) : undefined}
            onDelete={isFacultyOrAdmin ? (id) => handleDelete('assignment', id) : undefined}
            onRowClick={(a) => { const s = students.find(st => st.id == a.studentId); if (s) navigate(`/students/${s.id}`, { state: { initialTab: 'assignments' } }); }}
            columns={[
              ...(user.role !== ROLES.STUDENT ? [{ header: 'Student', field: 'studentName' }] : []),
              { header: 'Training', field: 'trainingTitle' },
              { header: 'Company', field: 'companyName' },
              { header: 'Status', render: (a) => <Badge status={a.status} /> },
              { header: 'Progress', render: (a) => `${a.progress}%` }
            ]}
          />
        } />

        <Route path="/admin" element={
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <Card className="p-6"><h3 className="font-bold mb-2">Data Seeding</h3><p className="text-sm text-textSecondary">Database is now managed via backend. Use backend seeding tools or Swagger API to manage data.</p></Card>
            <Card className="p-6">
              <h3 className="font-bold mb-2">Bulk Import</h3>
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center block cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                <Upload className="mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-info">Click to upload CSV</span>
                <p className="text-xs text-text-text-secondary mt-1">Format: RollNo,FirstName,LastName,Email,Program,Year,Phone</p>
              </label>
            </Card>
          </div>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Modal */}
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, mode: 'create', itemId: null })} title={`${modalConfig.mode === 'create' ? 'Create' : 'Edit'} ${modalConfig.type}`}>
        {modalConfig.type === 'student' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={formData.firstName || ''} onChange={e => setFormData({ ...formData, firstName: e.target.value })} disabled={user.role === ROLES.STUDENT} />
              <Input label="Last Name" value={formData.lastName || ''} onChange={e => setFormData({ ...formData, lastName: e.target.value })} disabled={user.role === ROLES.STUDENT} />
            </div>
            <Input label="Roll No" value={formData.rollNo || ''} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} disabled={user.role === ROLES.STUDENT} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Program" value={formData.program || ''} onChange={e => setFormData({ ...formData, program: e.target.value })} disabled={user.role === ROLES.STUDENT} />
              <Input label="Year" type="number" value={formData.year || ''} onChange={e => setFormData({ ...formData, year: e.target.value })} disabled={user.role === ROLES.STUDENT} />
            </div>
            <Input label="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Phone" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            {user.role !== ROLES.STUDENT && <Checkbox label="Is Active?" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />}
          </div>
        )}
        {modalConfig.type === 'user' && (
          <div className="space-y-3">
            <Input label="Full Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Username" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} />
            <Input label="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            {modalConfig.mode === 'create' && <Input label="Password" type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />}
            <Select label="Role" options={[{ value: ROLES.ADMIN, label: 'Admin' }, { value: ROLES.FACULTY, label: 'Faculty' }, { value: ROLES.STUDENT, label: 'Student' }]} value={formData.role || ROLES.FACULTY} onChange={e => setFormData({ ...formData, role: e.target.value })} />
            <Checkbox label="Account Active" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
          </div>
        )}
        {modalConfig.type === 'company' && (
          <div className="space-y-3">
            <Input label="Company Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Contact Person" value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
            <Input label="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
        )}
        {modalConfig.type === 'mentor' && (
          <div className="space-y-3">
            <Select label="Company" options={[{ value: '', label: 'Select Company' }, ...companies.map(c => ({ value: c.id, label: c.name }))]} value={formData.companyId || ''} onChange={e => setFormData({ ...formData, companyId: Number(e.target.value) })} />
            <Input label="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
        )}
        {modalConfig.type === 'training' && (
          <div className="space-y-3">
            <Input label="Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" value={formData.startDate || ''} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              <Input label="End Date" type="date" value={formData.endDate || ''} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
            <Select label="Status" options={[{ value: 'Upcoming', label: 'Upcoming' }, { value: 'Ongoing', label: 'Ongoing' }, { value: 'Closed', label: 'Closed' }]} value={formData.status || 'Upcoming'} onChange={e => setFormData({ ...formData, status: e.target.value })} />
          </div>
        )}
        {modalConfig.type === 'assignment' && (
          <div className="space-y-3">
            <Select label="Student" options={[{ value: '', label: 'Select Student' }, ...students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))]} value={formData.studentId || ''} onChange={e => setFormData({ ...formData, studentId: Number(e.target.value) })} />
            <Select label="Training" options={[{ value: '', label: 'Select Training' }, ...trainings.map(p => ({ value: p.id, label: p.title }))]} value={formData.trainingId || ''} onChange={e => setFormData({ ...formData, trainingId: Number(e.target.value) })} />
            <Select label="Company" options={[{ value: '', label: 'Select Company' }, ...companies.map(c => ({ value: c.id, label: c.name }))]} value={formData.companyId || ''} onChange={e => setFormData({ ...formData, companyId: Number(e.target.value) })} />
            <Select label="Mentor" options={[{ value: '', label: 'Select Mentor' }, ...mentors.filter(m => !formData.companyId || m.companyId === formData.companyId).map(m => ({ value: m.id, label: m.name }))]} value={formData.mentorId || ''} onChange={e => setFormData({ ...formData, mentorId: Number(e.target.value) })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Progress (%)" type="number" min="0" max="100" value={formData.progress || 0} onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })} />
              <Input label="Score" type="number" min="0" max="100" value={formData.score || ''} onChange={e => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <Input label="Remarks" value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
            {modalConfig.mode === 'edit' && <Select label="Status" options={[{ value: 'Assigned', label: 'Assigned' }, { value: 'InProgress', label: 'InProgress' }, { value: 'PendingEvaluation', label: 'Pending Evaluation' }, { value: 'Completed', label: 'Completed' }, { value: 'Dropped', label: 'Dropped' }]} value={formData.status || 'Assigned'} onChange={e => setFormData({ ...formData, status: e.target.value })} />}
          </div>
        )}
        <Button onClick={handleSave} className="w-full mt-6">{modalConfig.mode === 'create' ? 'Create Record' : 'Save Changes'}</Button>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </MainLayout>
  );
}

export default App;
