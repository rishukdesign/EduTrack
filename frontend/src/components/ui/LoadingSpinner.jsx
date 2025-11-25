import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = true, message = '' }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-in fade-in zoom-in duration-200">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    {message && <p className="mt-4 text-gray-600 font-medium text-sm">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
            {message && <span className="text-gray-600">{message}</span>}
        </div>
    );
};

export default LoadingSpinner;
