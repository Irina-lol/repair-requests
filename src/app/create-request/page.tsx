'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/auth'

export default function CreateRequestPage() {
  const router = useRouter()
  const { user, loading } = useUser()

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    address: '',
    problemText: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  if (!user) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при создании заявки')
      }

      const newRequest = await response.json()

      if (user.role === 'dispatcher') {
        router.push('/dispatcher')
      } else {
        router.push('/master')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href={user.role === 'dispatcher' ? '/dispatcher' : '/master'} className="text-blue-600 hover:underline">
            ← Назад к панели
          </Link>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Создание новой заявки</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Имя клиента *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: ООО Ромашка"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Адрес *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ул. Ленина, д. 10, кв. 5"
              />
            </div>

            <div>
              <label htmlFor="problemText" className="block text-sm font-medium text-gray-700 mb-1">
                Описание проблемы *
              </label>
              <textarea
                id="problemText"
                name="problemText"
                required
                rows={4}
                value={formData.problemText}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Опишите проблему..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isSubmitting ? 'Создание...' : 'Создать заявку'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}