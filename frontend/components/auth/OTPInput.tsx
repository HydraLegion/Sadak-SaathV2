'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  disabled?: boolean
  error?: string
  onChange?: (otp: string) => void
}

export interface OTPInputRef {
  clear: () => void
  focus: () => void
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({
  length = 6,
  onComplete,
  disabled = false,
  error,
  onChange
}, ref) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useImperativeHandle(ref, () => ({
    clear: () => {
      setOtp(Array(length).fill(''))
      setActiveIndex(0)
      inputRefs.current[0]?.focus()
    },
    focus: () => {
      inputRefs.current[0]?.focus()
    }
  }))

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    const newValue = newOtp.join('')
    onChange?.(newValue)

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }

    if (newValue.length === length) {
      onComplete(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange?.(newOtp.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

    if (pastedData) {
      const newOtp = [...otp]
      pastedData.split('').forEach((char, i) => {
        if (i < length) newOtp[i] = char
      })
      setOtp(newOtp)
      onChange?.(newOtp.join(''))

      const lastFilledIndex = Math.min(pastedData.length, length) - 1
      inputRefs.current[lastFilledIndex]?.focus()
      setActiveIndex(lastFilledIndex)

      if (pastedData.length === length) {
        onComplete(pastedData)
      }
    }
  }

  return (
    <div className="relative">
      <div className="flex gap-2 sm:gap-3 justify-center">
        {Array.from({ length }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <input
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled}
              className={cn(
                'w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold',
                'bg-slate-800/50 border-2 rounded-xl',
                'transition-all duration-200 outline-none',
                'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                activeIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-700 hover:border-slate-600',
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : '',
                otp[index] ? 'border-blue-500/70 bg-blue-500/5' : ''
              )}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-6 left-0 right-0 text-center"
          >
            <p className="text-red-400 text-xs sm:text-sm flex items-center justify-center gap-1">
              <X className="w-3 h-3" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

OTPInput.displayName = 'OTPInput'

export default OTPInput