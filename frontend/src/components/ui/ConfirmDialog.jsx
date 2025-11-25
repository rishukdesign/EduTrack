import React from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl z-10 max-w-md w-full mx-4 animate-fade-in">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-text-text-primary mb-2">{title}</h3>
                    <p className="text-sm text-textSecondary mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={() => { onConfirm(); onClose(); }} className="bg-error hover:bg-red-700">Delete</Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmDialog;
