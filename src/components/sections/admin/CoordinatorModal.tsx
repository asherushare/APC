'use client';

import React, { useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export interface CoordinatorData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  block: string;
}

interface CoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CoordinatorData | null;
}

// Available Blocks for selection (synced with the project block boundary definitions)
const BLOCKS = [
  'Bhamragad',
  'Etapalli',
  'Mulchera',
  'Aheri',
  'Sironcha',
  'Chamorshi',
  'Dhanora',
  'Kurkheda'
];

export function CoordinatorModal({ isOpen, onClose, onSuccess, initialData = null }: CoordinatorModalProps) {
  const isEditMode = !!initialData;

  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [block, setBlock] = useState(initialData?.block || '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return false;
    }
    if (!block) {
      setError('Assigned Block is required.');
      return false;
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return false;
    }

    if (!isEditMode) {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return false;
      }
      if (!password || password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return false;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#+^=])[A-Za-z\d@$!%*?&._\-#+^=]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode && initialData) {
        await apiRequest(`/users/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim() || null,
            block,
          }),
        });
      } else {
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            phoneNumber: phoneNumber.trim() || null,
            block,
          }),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof ApiError ? err.message : 'Failed to save coordinator account.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = 'w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200 disabled:opacity-60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="text-body-lg font-black text-primary">
            {isEditMode ? 'Edit Coordinator Profile' : 'Add New Block Coordinator'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-outline-variant/20 flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2.5 text-left animate-shake">
              <span className="text-xs shrink-0">⚠️</span>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-red-800 text-[11px] uppercase tracking-wider">Operation Failed</h5>
                <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              className={inputStyles}
              placeholder="e.g. Ramesh Madavi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email (Disabled in Edit Mode) */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={isSubmitting || isEditMode}
              className={cn(inputStyles, isEditMode && 'bg-surface-container-low border-transparent')}
              placeholder="e.g. ramesh@adivasiproducer.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password (Hidden in Edit Mode) */}
          {!isEditMode && (
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isSubmitting}
                  className={cn(inputStyles, "pr-10")}
                  placeholder="At least 8 chars (1 upper, 1 lower, 1 symbol)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors cursor-pointer select-none focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              maxLength={10}
              disabled={isSubmitting}
              className={inputStyles}
              placeholder="e.g. 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {/* Assigned Block Dropdown */}
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider">
              Assigned Block Region
            </label>
            <select
              required
              disabled={isSubmitting}
              className={inputStyles}
              value={block}
              onChange={(e) => setBlock(e.target.value)}
            >
              <option value="">-- Choose Geographical Block --</option>
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-outline hover:bg-surface-container-low text-on-surface font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer select-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary hover:bg-dark-green text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Account</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
