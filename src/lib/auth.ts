'use client'

import { useEffect, useState } from 'react'

export interface User {
  id: number
  name: string
  email: string
  role: 'dispatcher' | 'master'
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 [useUser] Монтирование хука')
    console.log('🔍 [useUser] sessionStorage:', sessionStorage)

    const storedUser = sessionStorage.getItem('currentUser')
    console.log('🔍 [useUser] storedUser raw:', storedUser)

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('✅ [useUser] Парсинг успешен:', parsedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('❌ [useUser] Ошибка парсинга:', e)
        sessionStorage.removeItem('currentUser')
      }
    } else {
      console.log('ℹ️ [useUser] Пользователь не найден в sessionStorage')
    }

    setLoading(false)
    console.log('🔍 [useUser] loading установлен в false')
  }, [])

  console.log('🔍 [useUser] Рендер, возвращаем:', { user, loading })

  return { user, loading }
}