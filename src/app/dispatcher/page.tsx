'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/auth'
import RequestCard from '@/components/RequestCard'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface Request {
  id: number
  clientName: string
  phone: string
  address: string
  problemText: string
  status: 'new' | 'assigned' | 'in_progress' | 'done' | 'canceled'
  createdAt: string
  assignedTo: User | null
}

export default function DispatcherPage() {
  const router = useRouter()
  const { user, loading } = useUser()

  const [requests, setRequests] = useState<Request[]>([])
  const [masters, setMasters] = useState<User[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Проверка авторизации - добавим логирование
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (user.role !== 'dispatcher') {
        router.push('/')
      } else {
      }
    }
  }, [user, loading, router])

  // Загрузка мастеров
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setMasters(data.filter((u: User) => u.role === 'master'))
      })
      .catch(err => console.error('❌ Ошибка загрузки мастеров:', err))
  }, [])

  // Загрузка заявок
  const loadRequests = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const url = filterStatus === 'all'
        ? '/api/requests'
        : `/api/requests?status=${filterStatus}`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Ошибка загрузки')

      const data = await response.json()
      setRequests(data)
    } catch (err) {
      setError('Не удалось загрузить заявки')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, user])

  useEffect(() => {
    if (user) {
      loadRequests()
    } else {
    }
  }, [user, loadRequests])

  const handleAction = async (requestId: number, action: string, masterId?: number) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          masterId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка')
      }

      const data = await response.json()
      loadRequests()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading || !user) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Панель диспетчера</h1>
          <div className="flex gap-4">
            <Link
              href="/create-request"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Новая заявка
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem('currentUser')
                router.push('/')
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="mr-2 text-gray-800">Фильтр по статусу:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-gray-800"
          >
            <option value="all">Все заявки</option>
            <option value="new">Новые</option>
            <option value="assigned">Назначенные</option>
            <option value="in_progress">В работе</option>
            <option value="done">Выполненные</option>
            <option value="canceled">Отмененные</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-800">Загрузка заявок...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Нет заявок
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-gray-800">
            {requests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                currentUserRole="dispatcher"
                masters={masters}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}