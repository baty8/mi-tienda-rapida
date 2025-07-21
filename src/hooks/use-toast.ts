
"use client"

// Inspired by react-hot-toast library
import * as React from "react"
import { toast as sonnerToast } from "sonner"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

type Toast = Omit<React.ComponentProps<typeof sonnerToast.message>, "id"> & {
    variant?: "default" | "destructive"
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}


const toast = ({ ...props }: Toast) => {
    const { variant, title, description, action, ...rest } = props;

    const toastId = sonnerToast.message(title, {
        description: description,
        action: action,
        ...rest,
        // Apply custom styling for destructive variant if needed
        style: variant === "destructive" ? {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
            borderColor: 'hsl(var(--destructive))'
        } : {},
    });

    return {
        id: toastId,
        dismiss: () => sonnerToast.dismiss(toastId),
        update: (props: Toast) => sonnerToast.message(props.title, { id: toastId, ...props }),
    }
}

// Deprecated useToast hook - kept for compatibility but now delegates to sonner
const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    toasts: [] // Legacy compatibility
  }
}

export { useToast, toast }
