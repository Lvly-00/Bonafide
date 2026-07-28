import { cn } from '@/utils/cn'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  description?: string
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onChange, label, description, id, ...props }, ref) => {
    const switchId = id || `switch-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="flex items-center justify-between">
        {(label || description) && (
          <div className="flex-1">
            {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </div>
        )}
        <button
          ref={ref}
          id={switchId}
          role="switch"
          aria-checked={checked}
          onClick={() => onChange?.(!checked)}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            checked ? 'bg-primary' : 'bg-gray-300',
            className
          )}
          {...props}
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
