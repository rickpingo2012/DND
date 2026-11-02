'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { generateRoomCode } from '../../../src/backend/room.ts'

export default function CreatePage() {
  const router = useRouter()

  useEffect(() => {
    const code = generateRoomCode()

    router.push(`/room/${code}`)
  })

  return <div>Loading ...</div>
}