import React, { useEffect, useRef } from 'react';

/**
 * Accessible modal dialog: closes on Escape or a backdrop click, moves focus
 * into the dialog and returns it to the previously focused element on close.
 */
export default function Modal({ labelledBy, className, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
