import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Lock,
  Moon,
  Bell,
  Shield,
  Trash2,
  Upload,
  Sun,
  Monitor,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { settingsService } from '@/services'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'delete', label: 'Delete Account', icon: Trash2 },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '',
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light')

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    push: true,
    sms: false,
    sessionReminders: true,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    shareProfileWithTeachers: true,
    showOnlineStatus: true,
    dataForImprovements: false,
    allowRecommendations: true,
  })

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await settingsService.updateProfile(profile)
      showMessage('success', 'Profile updated successfully')
    } catch {
      showMessage('error', 'Failed to update profile')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      showMessage('error', 'New passwords do not match')
      return
    }
    if (password.new.length < 6) {
      showMessage('error', 'Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      await settingsService.changePassword(password.current, password.new)
      showMessage('success', 'Password changed successfully')
      setPassword({ current: '', new: '', confirm: '' })
    } catch {
      showMessage('error', 'Failed to change password')
    }
    setSaving(false)
  }

  const handleSaveNotificationPrefs = async () => {
    setSaving(true)
    try {
      await settingsService.updateNotificationPreferences(notificationPrefs)
      showMessage('success', 'Notification preferences saved')
    } catch {
      showMessage('error', 'Failed to save preferences')
    }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setSaving(true)
    try {
      await settingsService.deleteAccount()
      showMessage('success', 'Account deleted successfully')
      setShowDeleteConfirm(false)
    } catch {
      showMessage('error', 'Failed to delete account')
    }
    setSaving(false)
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <Upload className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-lg font-semibold">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Change Photo
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        )

      case 'password':
        return (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Current Password</label>
              <Input type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
              <Input type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm New Password</label>
              <Input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={saving || !password.current || !password.new || !password.confirm}>
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </motion.div>
        )

      case 'appearance':
        return (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <p className="text-sm text-gray-500">Choose how LearnLink AI looks for you</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { id: 'light' as const, label: 'Light', icon: Sun, desc: 'Light mode' },
                { id: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Dark mode' },
                { id: 'system' as const, label: 'System', icon: Monitor, desc: 'Follow system' },
              ].map((option) => {
                const selected = appearance === option.id
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => setAppearance(option.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-gray-300'
                    }`}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 rounded-full bg-primary p-0.5 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    <Icon className={`h-8 w-8 ${selected ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.desc}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications in browser' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via text message' },
              { key: 'sessionReminders', label: 'Session Reminders', desc: 'Get reminded about upcoming sessions' },
              { key: 'marketing', label: 'Marketing Emails', desc: 'Receive updates about new features and offers' },
            ].map((item) => {
              const checked = notificationPrefs[item.key as keyof typeof notificationPrefs]
              return (
                <div key={item.key} className="rounded-xl border border-border px-4 py-3.5">
                  <Switch
                    checked={checked}
                    onChange={(val) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        [item.key]: val,
                      }))
                    }
                    label={item.label}
                    description={item.desc}
                  />
                </div>
              )
            })}
            <div className="flex justify-end">
              <Button onClick={handleSaveNotificationPrefs} disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </motion.div>
        )

      case 'privacy':
        return (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {[
              { key: 'shareProfileWithTeachers', label: 'Share Profile with Teachers', desc: 'Allow teachers to see your profile information' },
              { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Let others see when you are active' },
              { key: 'dataForImprovements', label: 'Share Data for Improvements', desc: 'Help us improve by sharing anonymous usage data' },
              { key: 'allowRecommendations', label: 'Allow Recommendations', desc: 'Receive personalized teacher recommendations' },
            ].map((item) => {
              const checked = privacy[item.key as keyof typeof privacy]
              return (
                <div key={item.key} className="rounded-xl border border-border px-4 py-3.5">
                  <Switch
                    checked={checked}
                    onChange={(val) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        [item.key]: val,
                      }))
                    }
                    label={item.label}
                    description={item.desc}
                  />
                </div>
              )
            })}
          </motion.div>
        )

      case 'delete':
        return (
          <motion.div
            key="delete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-red-100 p-2.5 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Danger Zone</h3>
                    <p className="mt-1 text-sm text-red-700">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete My Account
              </Button>
            ) : (
              <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Type <span className="font-bold">DELETE</span> to confirm
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="border-red-300 focus-visible:ring-red-400"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== 'DELETE' || saving}
                    onClick={handleDeleteAccount}
                  >
                    {saving ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="gap-1.5"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">{renderTab()}</AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
