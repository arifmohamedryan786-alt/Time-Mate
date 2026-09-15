import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Clock, Bell, CheckCircle2, AlertCircle, Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [wakeUpTime, setWakeUpTime] = useState(settings?.wake_up_time || '07:00');
  const [studyStartTime, setStudyStartTime] = useState(settings?.study_start_time || '09:00');
  const [defaultFocusDuration, setDefaultFocusDuration] = useState(settings?.default_focus_duration || 25);
  const [taskReminders, setTaskReminders] = useState(settings?.task_reminders ?? true);
  const [scheduleReminders, setScheduleReminders] = useState(settings?.schedule_reminders ?? true);
  const [focusReminders, setFocusReminders] = useState(settings?.focus_reminders ?? true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false);

  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) setName(user.name);
    if (settings) {
      setWakeUpTime(settings.wake_up_time);
      setStudyStartTime(settings.study_start_time);
      setDefaultFocusDuration(settings.default_focus_duration);
      setTaskReminders(settings.task_reminders);
      setScheduleReminders(settings.schedule_reminders);
      setFocusReminders(settings.focus_reminders);
    }
  }, [user, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateSettings({
        name,
        wake_up_time: wakeUpTime,
        study_start_time: studyStartTime,
        default_focus_duration: defaultFocusDuration,
        task_reminders: taskReminders,
        schedule_reminders: scheduleReminders,
        focus_reminders: focusReminders,
      });
      setSuccess('Settings updated successfully in SQLite database.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    try {
      setPwLoading(true);
      const res = await api.auth.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPwSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Account & Routine Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your student profile, security, and daily study preferences
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </div>
      </div>

      <form id="routine-settings-form" onSubmit={handleSubmit} className="space-y-6">
        
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-surface-border pb-3">
            <User className="w-4 h-4 text-warm-600" />
            <span>Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email address cannot be changed</span>
            </div>
          </div>
        </div>

        {/* Daily Preferences */}
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-surface-border pb-3">
            <Clock className="w-4 h-4 text-warm-600" />
            <span>Daily Routine Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Wake-Up Time</label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Study Start</label>
              <input
                type="time"
                value={studyStartTime}
                onChange={(e) => setStudyStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Focus Duration</label>
              <select
                value={defaultFocusDuration}
                onChange={(e) => setDefaultFocusDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes (Pomodoro)</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-surface-border pb-3">
            <Bell className="w-4 h-4 text-warm-600" />
            <span>Notification Preferences</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-surface-bg rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-medium text-slate-800">Task Due Reminders</span>
              <input
                type="checkbox"
                checked={taskReminders}
                onChange={(e) => setTaskReminders(e.target.checked)}
                className="w-4 h-4 text-warm-600 rounded focus:ring-warm-500 accent-warm-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-surface-bg rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-medium text-slate-800">Schedule & Class Reminders</span>
              <input
                type="checkbox"
                checked={scheduleReminders}
                onChange={(e) => setScheduleReminders(e.target.checked)}
                className="w-4 h-4 text-warm-600 rounded focus:ring-warm-500 accent-warm-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-surface-bg rounded-xl border border-slate-200 cursor-pointer">
              <span className="text-xs font-medium text-slate-800">Focus Session Completion Reminders</span>
              <input
                type="checkbox"
                checked={focusReminders}
                onChange={(e) => setFocusReminders(e.target.checked)}
                className="w-4 h-4 text-warm-600 rounded focus:ring-warm-500 accent-warm-600"
              />
            </label>
          </div>
        </div>

      </form>

      {/* Security & Change Password Card */}
      <div className="bg-surface-card p-6 rounded-2xl border border-surface-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-warm-600" />
            <span>Security & Change Password</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Update account password</span>
        </div>

        {pwSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{pwSuccess}</span>
          </div>
        )}

        {pwError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 pr-11 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 pr-11 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label={showNewPw ? 'Hide password' : 'Show password'}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmNewPw ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 pr-11 bg-surface-bg border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPw(!showConfirmNewPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  aria-label={showConfirmNewPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwLoading || !currentPassword || !newPassword || !confirmNewPassword}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 disabled:opacity-40 rounded-xl shadow-subtle transition-all flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{pwLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Page Actions (Save Settings) */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          form="routine-settings-form"
          disabled={loading}
          className="px-6 py-2.5 text-xs font-semibold text-white bg-warm-500 hover:bg-warm-600 rounded-xl shadow-subtle transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

    </div>
  );
};
