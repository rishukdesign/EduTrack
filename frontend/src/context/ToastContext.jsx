import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ id, type, message, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const styles = {
        success: "bg-white border-l-4 border-green-500",
        error: "bg-white border-l-4 border-red-500",
        info: "bg-white border-l-4 border-blue-500"
    };

    return (
        <div className={`${styles[type]} shadow-lg rounded-r-lg p-4 mb-3 flex items-start gap-3 min-w-[300px] max-w-md animate-slide-in relative`}>
            <div className="mt-0.5">{icons[type]}</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{message}</p>
            </div>
            <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = (message) => addToast('success', message);
    const error = (message) => addToast('error', message);
    const info = (message) => addToast('info', message);

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <div className="fixed top-4 right-4 z-[10000] flex flex-col items-end pointer-events-none">
                <div className="pointer-events-auto">
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={removeToast} />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};
