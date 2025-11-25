import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = ({ onLogin, onRegister, mockUsers }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (isRegistering) {
            if (!username || !password || !email || !fullName) {
                setError('All fields are required');
                return;
            }
            onRegister({ username, password, email, name: fullName, role: 'Student' });
            setSuccessMsg('Registration successful! Confirmation email sent. Please log in.');
            setIsRegistering(false);
            setUsername(''); setPassword(''); setEmail('');
        } else {
            // Mock login logic - replace with API call later
            const user = mockUsers.find(u => (u.username === username || u.email === username) && u.password === password);
            if (user) {
                if (!user.isActive) {
                    setError('Account is deactivated. Contact Admin.');
                    return;
                }
                onLogin(user);
            } else {
                setError('Invalid credentials.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <BookOpen className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-text-primary">EduTrack</h1>
                    <p className="text-textSecondary">Student Information Management System</p>
                </div>
                {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2"><CheckCircle size={16} /> {successMsg}</div>}
                <form onSubmit={handleSubmit}>
                    {isRegistering && <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
                    <Input label="Username or Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                    {isRegistering && <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />}
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {error && <div className="mb-4 p-3 bg-red-50 text-error text-sm rounded-lg flex items-center gap-2"><XCircle size={16} /> {error}</div>}
                    <Button type="submit" className="w-full justify-center">{isRegistering ? 'Register' : 'Sign In'}</Button>
                </form>
                <div className="mt-6 text-center text-xs text-textSecondary">
                    {isRegistering ? (
                        <p>Already have an account? <button onClick={() => setIsRegistering(false)} className="text-primary font-bold hover:underline">Sign In</button></p>
                    ) : (
                        <>
                            <p>Don't have an account? <button onClick={() => setIsRegistering(true)} className="text-primary font-bold hover:underline">Register Now</button></p>
                            <div className="mt-4 pt-4 border-t border-gray-100">Demo: admin/password<br />faculty/password<br />student/password</div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Login;
