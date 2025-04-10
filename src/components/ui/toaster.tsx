
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2 } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isSuccessNotification = 
          title?.toString().toLowerCase().includes("completado") || 
          title?.toString().toLowerCase().includes("análisis") || 
          description?.toString().toLowerCase().includes("análisis");
          
        return (
          <Toast key={id} {...props} className={isSuccessNotification ? "border-flow-electric" : ""}>
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="flex items-center">
                  {isSuccessNotification && <CheckCircle2 className="h-4 w-4 mr-2 text-flow-electric" />}
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
