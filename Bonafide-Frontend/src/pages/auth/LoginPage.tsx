import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data.email, data.password)
      if (user.role === 'parent') navigate(ROUTES.PARENT_DASHBOARD)
      else if (user.role === 'teacher') navigate(ROUTES.TEACHER_DASHBOARD)
      else navigate(ROUTES.ADMIN_DASHBOARD)
    } catch {
      // toast handled in useAuth
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-0 shadow-xl shadow-gray-200/50">
          <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-blue-400" />
          <CardHeader className="text-center pb-4 pt-7">
         
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your Bonafide account</CardDescription>
          </CardHeader>
          <CardContent className="pb-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                type="email"
                placeholder="you@example.com"
                label="Email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                label="Password"
                error={errors.password?.message}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register('password')}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none w-fit group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      {...register('rememberMe')}
                    />
                    <div className="h-4 w-4 rounded border border-gray-300 bg-white transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1" />
                    <svg
                      className="absolute hidden peer-checked:block h-3 w-3 text-white pointer-events-none"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-shadow" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
