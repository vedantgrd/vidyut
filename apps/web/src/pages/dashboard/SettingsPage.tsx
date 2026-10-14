import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { PageSpinner } from '@/components/ui/Spinner'
import { Bell, Shield, Key } from 'lucide-react'

interface Settings {
  emailDeadlineReminders: boolean
  emailApplicationUpdates: boolean
  emailNewMatches: boolean
  pushNotifications: boolean
}

function Toggle({
  label,
  desc,
  checked,
  onChange
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
          {desc}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? 'var(--primary)' : 'var(--border-subtle)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background var(--transition-fast)',
          flexShrink: 0
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#ffffff',
            transition: 'left var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)'
          }}
        />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { data, isLoading } = useApi(() => api.get<{ settings: Settings }>('/settings'))
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.settings) setSettings(data.settings)
  }, [data])

  const set = (k: keyof Settings, v: boolean) => setSettings((p) => (p ? { ...p, [k]: v } : p))

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await api.patch('/settings', settings)
      toast('Preferences saved successfully', 'success')
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Failed to update preferences', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !settings) return <PageSpinner context="settings" />

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>
          Configure notification preferences, reminders, and security options.
        </p>
      </div>

      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 22 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 2px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: '-0.01em'
          }}
        >
          <Bell size={16} color="var(--primary)" /> Notification Channels
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
          Control how and when you receive critical application updates.
        </p>

        <Toggle
          label="Approaching Deadline Reminders"
          desc="Receive alerts 7 days and 48 hours before confirmed application deadlines."
          checked={settings.emailDeadlineReminders}
          onChange={(v) => set('emailDeadlineReminders', v)}
        />
        <Toggle
          label="Application Status Changes"
          desc="Immediate notifications when an administrator verifies a document or updates your dossier."
          checked={settings.emailApplicationUpdates}
          onChange={(v) => set('emailApplicationUpdates', v)}
        />
        <Toggle
          label="New Eligible Opportunities"
          desc="Alerts whenever a new scholarship matching your profile criteria is published."
          checked={settings.emailNewMatches}
          onChange={(v) => set('emailNewMatches', v)}
        />
        <Toggle
          label="In-App Banner Notifications"
          desc="Show badge counters and banner reminders inside your dashboard."
          checked={settings.pushNotifications}
          onChange={(v) => set('pushNotifications', v)}
        />

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={save} isLoading={saving} variant="primary">
            Save Preferences
          </Button>
        </div>
      </Card>

      <Card style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 22 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 2px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            letterSpacing: '-0.01em'
          }}
        >
          <Shield size={16} color="var(--primary)" /> Account Security & Password
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          Manage your password and active sessions.
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Key size={13} />}
          onClick={() => toast('Check your registered email for secure password reset instructions', 'info')}
        >
          Send Password Reset Link
        </Button>
      </Card>
    </div>
  )
}

export default SettingsPage
