'use client';

import { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (toastId?: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = {
    success: (message: string) => {
      toast.success(message, {
        duration: 4000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10b981',
        },
      });
    },

    error: (message: string) => {
      toast.error(message, {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      });
    },

    info: (message: string) => {
      toast(message, {
        duration: 4000,
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      });
    },

    warning: (message: string) => {
      toast(message, {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
    },

    loading: (message: string) => {
      return toast.loading(message);
    },

    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
