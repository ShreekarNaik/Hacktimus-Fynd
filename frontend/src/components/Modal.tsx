import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    overflowHidden?: boolean;
    className?: string; // For the inner container
}

const Modal: React.FC<ModalProps> = ({ children, isOpen, overflowHidden = true, className = "" }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-bounce-in relative ${overflowHidden ? 'overflow-hidden' : 'overflow-visible'} ${className}`}>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
