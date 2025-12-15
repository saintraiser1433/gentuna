"use client"

import { useState, useEffect, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration !== undefined ? toast.duration : 3000
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onClose(toast.id), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(toast.id), 300)
  }

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }

  const Icon = icons[toast.type]

  return (
    <div 
      className={`flex items-center gap-3 p-4 bg-background border rounded-lg shadow-lg min-w-[300px] max-w-md transition-all duration-300 ${
        isExiting 
          ? "opacity-0 translate-x-full" 
          : "opacity-100 translate-x-0 animate-in slide-in-from-top-5"
      }`}
    >
      <div className={`${colors[toast.type]} rounded-full p-1.5 shrink-0`}>
        <Icon className="size-4 text-white" />
      </div>
      <p className="flex-1 text-sm font-medium break-words">{toast.message}</p>
      <button
        onClick={handleClose}
        className="size-6 p-0 shrink-0 hover:bg-muted rounded-sm flex items-center justify-center cursor-pointer transition-colors"
        aria-label="Close toast"
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

let toastIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`
    const newToast: Toast = { id, message, type, duration }
    setToasts((prev) => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}
