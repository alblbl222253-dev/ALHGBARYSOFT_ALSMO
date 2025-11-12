import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rel, setRel] = useState<{ x: number, y: number } | null>(null);

  // Center the modal when it opens for the first time
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const { offsetWidth, offsetHeight } = modalRef.current;
      const initialX = (window.innerWidth - offsetWidth) / 2;
      const initialY = (window.innerHeight - offsetHeight) / 2;
      setPosition({ x: initialX, y: Math.max(initialY, 20) }); // Ensure it's not too high
    }
  }, [isOpen]);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // only left mouse button
    if (modalRef.current) {
      const pos = modalRef.current.getBoundingClientRect();
      setIsDragging(true);
      setRel({
        x: e.pageX - pos.left,
        y: e.pageY - pos.top,
      });
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !rel) return;
    setPosition({
      x: e.pageX - rel.x,
      y: e.pageY - rel.y,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, rel]);


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 animate-fade-in-fast"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-[#1F1C2E] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10 absolute animate-slide-up"
        style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
        }}
      >
        <div
          className="flex justify-between items-center p-4 border-b border-gray-700 cursor-move"
          onMouseDown={onMouseDown}
        >
          <h2 id="modal-title" className="text-lg font-semibold text-white select-none">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 text-white max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
