'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

interface CountryCode {
  code: string
  name: string
  flag: string
  minLength: number
  maxLength: number
}

const countries: CountryCode[] = [
  { code: '+91', name: 'India', flag: '🇮🇳', minLength: 10, maxLength: 10 },
  { code: '+1', name: 'USA', flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: '+44', name: 'UK', flag: '🇬🇧', minLength: 10, maxLength: 10 },
  { code: '+971', name: 'UAE', flag: '🇦🇪', minLength: 9, maxLength: 9 },
  { code: '+61', name: 'Australia', flag: '🇦🇺', minLength: 9, maxLength: 9 },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', minLength: 8, maxLength: 8 },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', minLength: 10, maxLength: 10 },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', minLength: 9, maxLength: 9 },
]

interface PhoneInputProps {
  value: string
  onChange: (phone: string) => void
  onSubmit: () => void
  disabled?: boolean
  error?: string
  isValid?: boolean
}

export default function PhoneInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  error,
  isValid
}: PhoneInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.maxLength)
    onChange(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      onSubmit()
    }
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-slate-300">Phone Number</label>

      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowDropdown(!showDropdown)}
            disabled={disabled}
            className={cn(
              'h-12 px-3 rounded-xl flex items-center gap-2',
              'bg-slate-800/50 border-2 border-r-0 rounded-r-none',
              'transition-all duration-200',
              'hover:bg-slate-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isFocused ? 'border-blue-500' : 'border-slate-700',
              error ? 'border-red-500' : ''
            )}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-white hidden sm:inline">{selectedCountry.code}</span>
            <motion.div
              animate={{ rotate: showDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-56 max-h-64 overflow-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50"
              >
                <div className="p-1">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country)
                        onChange('')
                        setShowDropdown(false)
                        inputRef.current?.focus()
                      }}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg flex items-center gap-3',
                        'hover:bg-slate-800 transition-colors',
                        selectedCountry.code === country.code ? 'bg-blue-500/10' : ''
                      )}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white">{country.name}</p>
                        <p className="text-xs text-slate-400">{country.code}</p>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            placeholder={`Enter ${selectedCountry.maxLength}-digit number`}
            value={value}
            onChange={handlePhoneChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={cn(
              'w-full h-12 px-4 rounded-xl rounded-l-none',
              'bg-slate-800/50 border-2 border-slate-700',
              'text-white placeholder:text-slate-500',
              'transition-all duration-200 outline-none',
              'focus:ring-2 focus:ring-blue-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-base sm:text-lg font-medium tracking-wide',
              isFocused ? 'border-blue-500' : '',
              error ? 'border-red-500 focus:border-red-500' : '',
              isValid ? 'border-green-500/50' : ''
            )}
          />

          {/* Validation indicator */}
          <AnimatePresence>
            {isValid && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-slate-500">
        We'll send you an OTP to verify your number
      </p>
    </div>
  )
}