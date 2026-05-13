'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface SuccessStateProps {
  title?: string
  message?: string
  onComplete?: () => void
}

export default function SuccessState({
  title = 'Welcome!',
  message = 'Authentication successful. Redirecting...',
  onComplete
}: SuccessStateProps) {
  const [showCheckmark, setShowCheckmark] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCheckmark(true)
    }, 200)

    const redirectTimer = setTimeout(() => {
      onComplete?.()
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(redirectTimer)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-6">
      {/* Animated Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
        className="relative"
      >
        {/* Background Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
        />

        {/* Circle */}
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30"
        >
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-2"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>
        <p className="text-sm sm:text-base text-slate-400">{message}</p>
      </motion.div>

      {/* Loading Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 rounded-full bg-blue-400"
          />
        ))}
      </motion.div>
    </div>
  )
}