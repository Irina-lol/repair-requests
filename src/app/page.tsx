'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Ошибка загрузки пользователей:', err)
        setLoading(false)
      })
  }, [])

  const handleSelectUser = (user: User) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user))

    if (user.role === 'dispatcher') {
      router.push('/dispatcher')
    } else {
      router.push('/master')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-sm text-gray-800 font-bold text-center mb-8">
          Система заявок в ремонтную службу
        </h1>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-sm text-gray-800">Выберите пользователя</h2>

          <div className="space-y-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-900">
                  {user.role === 'dispatcher' ? 'Диспетчер' : 'Мастер'} • {user.email}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Демо-режим: выберите пользователя для входа</p>
            <p className="mt-1">Диспетчер: управление всеми заявками</p>
            <p className="mt-1">Мастер: работа с назначенными заявками</p>
          </div>
        </div>
      </div>
    </div>
  )
}