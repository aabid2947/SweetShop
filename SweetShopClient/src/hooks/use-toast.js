import { toast as hotToast } from 'react-hot-toast'

// Simple toast hook that uses react-hot-toast
export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }) => {
    if (variant === 'destructive') {
      hotToast.error(description || title)
    } else {
      hotToast.success(description || title)
    }
  }

  return { toast }
}
