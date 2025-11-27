import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = ({ onLogin, onRegister }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [errors, setErrors] = useState({});
    const toast = useToast();

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const newErrors = {};

        try {
            if (isRegistering) {
                if (!username) newErrors.username = 'Username is required';
                if (!password) newErrors.password = 'Password is required';
                if (!email) newErrors.email = 'Email is required';
                else if (!validateEmail(email)) newErrors.email = 'Invalid email address';
                if (!fullName) newErrors.fullName = 'Full Name is required';

                if (password && password.length < 6) {
                    newErrors.password = 'Password must be at least 6 characters long';
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }

                await onRegister({ username, password, email, name: fullName, role: 'Student', phone });
                toast.success('Registration successful! You can now log in.');
                setIsRegistering(false);
                setUsername(''); setPassword(''); setEmail(''); setPhone('');
            } else {
                if (!username) newErrors.username = 'Username/Email is required';
                if (!password) newErrors.password = 'Password is required';

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }

                await onLogin({ username, password });
                toast.success('Login successful');
            }
        } catch (err) {
            console.error("Auth error:", err);
            toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
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

                <form onSubmit={handleSubmit}>
                    {isRegistering && <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />}
                    <Input label={isRegistering ? "Username" : "Username or Email"} value={username} onChange={(e) => setUsername(e.target.value)} error={errors.username} />
                    {isRegistering && <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />}
                    {isRegistering && <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />}
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
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
