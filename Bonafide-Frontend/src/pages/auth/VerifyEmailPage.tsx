import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/constants'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleResend = async () => {
    setResending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setResending(false)
    toast.success('Verification email resent!')
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md animate-slide-up">
        <CardContent className="pt-8 text-center space-y-6">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transition-all duration-500 ${
              showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
          >
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Verify your email</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              We've sent a verification link to your email address.
              Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            disabled={resending}
            onClick={handleResend}
          >
            <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending...' : 'Resend verification'}
          </Button>

          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
