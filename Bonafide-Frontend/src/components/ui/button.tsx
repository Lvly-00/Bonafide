import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md active:scale-[0.97]',
        destructive: 'bg-danger text-white hover:bg-red-600 shadow-sm active:scale-[0.97]',
        outline: 'border border-border bg-white hover:bg-gray-50 text-gray-700 active:scale-[0.97]',
        secondary: 'bg-primary-light text-primary hover:bg-blue-200 active:scale-[0.97]',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-success text-white hover:bg-green-600 shadow-sm active:scale-[0.97]',
      },
      size: {
        sm: 'h-9 rounded-md px-3 text-xs gap-1.5',
        default: 'h-10 rounded-lg px-4 py-2 gap-2',
        lg: 'h-12 rounded-lg px-6 text-base gap-2',
        xl: 'h-14 rounded-lg px-8 text-lg gap-2',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
