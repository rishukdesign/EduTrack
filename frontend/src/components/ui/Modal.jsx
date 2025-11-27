import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Card from './Card';

const Modal = ({ isOpen, onClose, title, children, className = "", maxWidth = "max-w-lg" }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
            <Card className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scale-in ${className}`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </Card>
        </div>,
        document.body
    );
};

export default Modal;
