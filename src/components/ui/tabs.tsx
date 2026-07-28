import { cn } from '@/utils/cn'
import { type HTMLAttributes, forwardRef, useState } from 'react'

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const currentValue = value !== undefined ? value : internalValue

    const handleChange = (val: string) => {
      if (onValueChange) onValueChange(val)
      setInternalValue(val)
    }

    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {typeof children === 'function'
          ? (children as any)({ value: currentValue, onValueChange: handleChange })
          : children}
      </div>
    )
  }
)
Tabs.displayName = 'Tabs'

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 gap-1',
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string
  active?: boolean
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, active, children, ...props }, ref) => (
    <button
      ref={ref}
      role="tab"
      aria-selected={active}
      data-value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-white text-primary shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
TabsTrigger.displayName = 'TabsTrigger'

export { Tabs, TabsList, TabsTrigger }
