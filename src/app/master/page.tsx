'use client'

import { useEffect, useState, useCallback } from 'react'
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

export default function MasterPage() {
  const router = useRouter()
  const { user, loading } = useUser()

  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Проверка авторизации
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (user.role !== 'master') {
        router.push('/')
      } else {
      }
    }
  }, [user, loading, router])

  // Загрузка заявок мастера
  const loadRequests = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/requests?role=master&masterId=${user.id}`)
      if (!response.ok) throw new Error('Ошибка загрузки')

      const data = await response.json()
      setRequests(data)
    } catch (err) {
      setError('Не удалось загрузить заявки')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadRequests()
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
          masterId: user?.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) {
          throw new Error('Эта заявка уже взята другим мастером!')
        }
        throw new Error(data.error || 'Ошибка')
      }

      // Перезагружаем список заявок

      loadRequests()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading || !user) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  // Разделяем заявки по статусам
  const assignedRequests = requests.filter(r => r.status === 'assigned')
  const inProgressRequests = requests.filter(r => r.status === 'in_progress')
  const doneRequests = requests.filter(r => r.status === 'done')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Панель мастера</h1>
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
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Выйти
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-800">Загрузка заявок...</div>
        ) : (
          <div className="space-y-8">
            {/* Заявки, назначенные на мастера (ждут взятия в работу) */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Назначенные на вас (ожидают)</h2>
              {assignedRequests.length === 0 ? (
                <p className="text-gray-800">Нет назначенных заявок</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-gray-800">
                  {assignedRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      currentUserRole="master"
                      currentUserId={user.id}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Заявки в работе */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">В работе</h2>
              {inProgressRequests.length === 0 ? (
                <p className="text-gray-500">Нет заявок в работе</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-gray-800">
                  {inProgressRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      currentUserRole="master"
                      currentUserId={user.id}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Выполненные заявки */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Выполненные</h2>
              {doneRequests.length === 0 ? (
                <p className="text-gray-800">Нет выполненных заявок</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-gray-800">
                  {doneRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      currentUserRole="master"
                      currentUserId={user.id}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}