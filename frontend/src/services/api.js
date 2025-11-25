import axios from 'axios';

const API_URL = 'http://localhost:5156/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getStudents = () => api.get('/students');
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (student) => api.post('/students', student);
export const updateStudent = (id, student) => api.put(`/students/${id}`, student);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

export const getAssignments = () => api.get('/assignments');
export const createAssignment = (assignment) => api.post('/assignments', assignment);
export const updateAssignment = (id, assignment) => api.put(`/assignments/${id}`, assignment);
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`);

export const getTrainings = () => api.get('/trainings');
export const createTraining = (training) => api.post('/trainings', training);
export const updateTraining = (id, training) => api.put(`/trainings/${id}`, training);
export const deleteTraining = (id) => api.delete(`/trainings/${id}`);

export const getCompanies = () => api.get('/companies');
export const createCompany = (company) => api.post('/companies', company);
export const updateCompany = (id, company) => api.put(`/companies/${id}`, company);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);

export const getMentors = () => api.get('/mentors');
export const createMentor = (mentor) => api.post('/mentors', mentor);
export const updateMentor = (id, mentor) => api.put(`/mentors/${id}`, mentor);
export const deleteMentor = (id) => api.delete(`/mentors/${id}`);

export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;
