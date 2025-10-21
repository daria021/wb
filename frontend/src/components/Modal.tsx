import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string; // например, 'max-w-xl'
}

const modalRoot = document.getElementById('modal-root')!;

const Modal: React.FC<ModalProps> = ({ onClose, children, maxWidthClass = 'max-w-lg' }) => {
  // создаём контейнер для портала один раз, чтобы не дробился caret в input/textarea
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) {
    elRef.current = document.createElement('div');
  }

  useEffect(() => {
    const el = elRef.current!;
    modalRoot.appendChild(el);
    return () => {
      modalRoot.removeChild(el);
    };
  }, []);

  // рендерим оверлей + тело модалки внутрь нашего div-портала
  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className={`modal-body ${maxWidthClass}`}>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-2xl leading-none"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </>,
    elRef.current!
  );
};

export default Modal;
