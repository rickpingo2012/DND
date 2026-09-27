'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Notification } from '../components/Notification'

interface NotificationContextType {
  showNotification: (message: string) => void
  hideNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  const showNotification = (text: string) => {
    setMessage(text)
    setVisible(true)

    setTimeout(() => {
      setVisible(false)
    }, 3000)
  }

  const hideNotification = () => {
    setVisible(false)
  }

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {visible && <Notification message={message} />}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
