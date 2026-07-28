import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
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
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your LearnLink AI account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              label="Email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 pr-10 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger" role="alert">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer w-fit">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                {...register('rememberMe')}
              />
              Remember me
            </label>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-500">Demo Accounts</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Parent</span>
                <span className="font-mono text-gray-500">sarah@example.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Teacher</span>
                <span className="font-mono text-gray-500">emma@example.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Teacher 2</span>
                <span className="font-mono text-gray-500">james@example.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Admin</span>
                <span className="font-mono text-gray-500">admin@learnlink.com</span>
              </div>
              <p className="mt-1 text-[10px] text-gray-400">Any password works</p>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
