"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/solid";
import "./Modal.css";

/**
 * Reusable Modal component
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string
 * - children: ReactNode
 * - className: additional classes applied to outer container
 * - contentClassName: additional classes applied to content area
 * - footer: optional footer content rendered outside scroll area
 * - footerClassName: additional classes applied to footer container
 * - size: one of 'sm','md','lg','xl','2xl','3xl','4xl','full' (maps to Tailwind max-w- classes). Default '4xl' to preserve previous behavior.
 * - closeOnOverlayClick: boolean (default true)
 */
const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-none",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  footer = null,
  footerClassName = "",
  size = "2xl",
  closeOnOverlayClick = true,
  showHeader = true,
}) => {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousActiveEl = useRef(null);
  const hasAutoFocused = useRef(false);
  const titleId = useId();
  const contentRef = useRef(null);

  // Mouse drag to scroll state
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const [isDraggingState, setIsDraggingState] = React.useState(false);

  useEffect(() => {
    if (!isOpen) {
      hasAutoFocused.current = false;
      return;
    }

    // Save active element and move focus into modal (only first time)
    if (!hasAutoFocused.current) {
      previousActiveEl.current = document.activeElement;
      hasAutoFocused.current = true;
    }

    // Manage stacked modals: use a global counter so that when multiple modals
    // are open we only restore scrolling when the last modal closes. This
    // prevents leaving `overflow: hidden` on body/html when an inner modal
    // closes but an outer modal was opened before it.
    if (typeof window !== "undefined") {
      window.__modalOpenCount = (window.__modalOpenCount || 0) + 1;
      if (window.__modalOpenCount === 1) {
        // Save original values only for the first modal
        window.__originalBodyOverflow = document.body.style.overflow;
        window.__originalHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      }
    }

    // focus the close button if present, otherwise the modal container (only on first open)
    let timer;
    if (
      !previousActiveEl.current ||
      previousActiveEl.current === document.body
    ) {
      timer = setTimeout(() => {
        if (closeBtnRef.current && document.activeElement === document.body) {
          closeBtnRef.current.focus();
        } else if (
          modalRef.current &&
          document.activeElement === document.body
        ) {
          modalRef.current.focus();
        }
      }, 0);
    }

    const onKey = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }

      const activeEl = document.activeElement;

      // Arrow key scrolling
      if (
        (e.key === "ArrowDown" || e.key === "ArrowUp") &&
        contentRef.current
      ) {
        // Only scroll if not inside an input/textarea/select
        const isInputField =
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.tagName === "SELECT");

        if (!isInputField) {
          e.preventDefault();
          const scrollAmount = 40; // pixels per keypress
          if (e.key === "ArrowDown") {
            contentRef.current.scrollTop += scrollAmount;
          } else if (e.key === "ArrowUp") {
            contentRef.current.scrollTop -= scrollAmount;
          }
        }
      }

      // basic trap: keep focus inside modal
      if (e.key === "Tab" && modalRef.current) {
        // Don't interfere if user is typing in an input/textarea
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")
        ) {
          // Allow natural tab behavior within the modal
          const focusable = modalRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
          );
          const focusableArray = Array.from(focusable);
          if (!focusableArray.includes(activeEl)) return;
        }

        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("keydown", onKey);

      // Decrement global modal counter and restore body/html overflow only
      // when the last modal closes.
      if (typeof window !== "undefined") {
        window.__modalOpenCount = Math.max(
          0,
          (window.__modalOpenCount || 1) - 1,
        );
        if (window.__modalOpenCount === 0) {
          try {
            document.body.style.overflow = window.__originalBodyOverflow || "";
            document.documentElement.style.overflow =
              window.__originalHtmlOverflow || "";
          } catch (err) {
            console.error(err);
          }
          // clean up globals
          try {
            delete window.__originalBodyOverflow;
            delete window.__originalHtmlOverflow;
            delete window.__modalOpenCount;
          } catch (err) {
            console.error(err);
          }
        }
      }

      // Restore focus to the previously active element after modal closes.
      try {
        if (
          previousActiveEl.current &&
          typeof previousActiveEl.current.focus === "function"
        ) {
          previousActiveEl.current.focus();
        }
      } catch (err) {
        console.error(err);
      }
    };
  }, [isOpen, onClose]);

  // Mouse drag to scroll functionality
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const contentElement = contentRef.current;

    const handleMouseDown = (e) => {
      // Only start drag if not clicking on interactive elements
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT" ||
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "A" ||
        e.target.closest("button") ||
        e.target.closest("a")
      ) {
        return;
      }

      isDragging.current = true;
      setIsDraggingState(true);
      startY.current = e.pageY - contentElement.offsetTop;
      scrollTop.current = contentElement.scrollTop;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const y = e.pageY - contentElement.offsetTop;
      const walk = (y - startY.current) * 1.5; // Scroll speed multiplier
      contentElement.scrollTop = scrollTop.current - walk;
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsDraggingState(false);
      }
    };

    const handleMouseLeave = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsDraggingState(false);
      }
    };

    // Set initial cursor via CSS class
    contentElement.addEventListener("mousedown", handleMouseDown);
    contentElement.addEventListener("mousemove", handleMouseMove);
    contentElement.addEventListener("mouseup", handleMouseUp);
    contentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      contentElement.removeEventListener("mousedown", handleMouseDown);
      contentElement.removeEventListener("mousemove", handleMouseMove);
      contentElement.removeEventListener("mouseup", handleMouseUp);
      contentElement.removeEventListener("mouseleave", handleMouseLeave);
      setIsDraggingState(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stop = (e) => e.stopPropagation();

  const sizeClass = sizeMap[size] || sizeMap["4xl"];

  const modalContent = (
    <div
      className="fixed inset-0 z-99999 flex items-end justify-center bg-black/70 p-2 backdrop-blur-sm sm:items-center sm:p-4 md:p-6"
      onClick={() => closeOnOverlayClick && onClose && onClose()}
      aria-hidden={isOpen ? "false" : "true"}
    >
      {/* Modern Modal Container with enhanced styling */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full flex flex-col ${size === "full" ? "h-full" : ""} ${sizeClass} ${className}`}
        onClick={stop}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={{
          maxHeight: size === "full" ? "100dvh" : "calc(100dvh - 1.5rem)",
        }}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:rounded-3xl">
          {showHeader ? (
            <div className="relative flex shrink-0 items-start justify-between gap-4 overflow-hidden bg-linear-to-r from-orange-500 via-orange-500 to-amber-500 px-5 py-4 text-white sm:px-6">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-0" />
              <div className="pointer-events-none absolute right-16 top-2 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-6 -bottom-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 max-w-[calc(100%-3rem)] pt-0.5">
                <div className="flex items-center gap-3">
                  {React.isValidElement(title) ? (
                    React.cloneElement(title, { id: titleId })
                  ) : (
                    <h3
                      id={titleId}
                      className="text-lg font-bold leading-tight tracking-tight text-white sm:text-xl"
                    >
                      {title || ""}
                    </h3>
                  )}
                </div>
                {description && (
                  <p className="mt-1 text-sm leading-5 text-white/90">
                    {description}
                  </p>
                )}
              </div>

              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="relative z-10 rounded-full p-2 text-white/90 transition hover:bg-white/15 hover:text-white"
                aria-label="Tutup"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          {/* Floating close button when no header */}
          {!showHeader && (
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-4 top-4 z-50 rounded-full border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}

          {/* Content area with improved scrollbar */}
          <div
            ref={contentRef}
            className={`flex-1 overflow-y-auto bg-white px-4 py-5 text-sm text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 sm:px-6 sm:py-6 md:px-8 modal-content-area draggable ${isDraggingState ? "dragging" : ""} ${contentClassName}`}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={`shrink-0 border-t border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6 md:px-8 ${footerClassName}`}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export default Modal;
