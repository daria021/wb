import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const modalRoot = document.getElementById('modal-root')!;

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  // каждый раз создаём отдельный div для портала
  const el = document.createElement('div');

  useEffect(() => {
    // при монтировании – добавляем контейнер в modalRoot
    modalRoot.appendChild(el);
    return () => {
      // при размонтировании – убираем
      modalRoot.removeChild(el);
    };
  }, [el]);

  // рендерим оверлей + тело модалки внутрь нашего div-портала
  return ReactDOM.createPortal(
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
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
    el
  );
};

export default Modal;
