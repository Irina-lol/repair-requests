'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

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

interface RequestCardProps {
  request: Request
  currentUserRole: 'dispatcher' | 'master'
  currentUserId?: number
  masters?: User[]
  onAction: (requestId: number, action: string, masterId?: number) => void
}

const statusColors = {
  new: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  canceled: 'bg-stone-100 text-stone-900'
}

const statusLabels = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  done: 'Выполнена',
  canceled: 'Отменена'
}

export default function RequestCard({ request, currentUserRole, currentUserId, masters = [], onAction }: RequestCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: ru })
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{request.clientName}</h3>
          <p className="text-sm text-gray-600">{request.phone}</p>
          <p className="text-sm text-gray-600">{request.address}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
          {statusLabels[request.status]}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700">{request.problemText}</p>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Создана: {formatDate(request.createdAt)}
      </div>

      {request.assignedTo && (
        <div className="mb-3 text-sm">
          <span className="font-medium">Мастер: </span>
          {request.assignedTo.name}
        </div>
      )}

      {/* Кнопки действий в зависимости от роли и статуса */}
      <div className="flex gap-2 mt-3">
        {currentUserRole === 'dispatcher' && (
          <>
            {request.status === 'new' && (
              <>
                <select
                  onChange={(e) => {
                    console.log('📤 Отправляем PATCH запрос с masterId:', e.target.value)
                    onAction(request.id, 'assign', Number(e.target.value))
                  }}
                  className="text-sm border rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="" disabled>Назначить мастера</option>
                  {masters.map(master => (
                    <option key={master.id} value={master.id}>{master.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => onAction(request.id, 'cancel')}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Отменить
                </button>
              </>
            )}
            {request.status === 'assigned' && (
              <button
                onClick={() => onAction(request.id, 'cancel')}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Отменить
              </button>
            )}
          </>
        )}

        {currentUserRole === 'master' && request.assignedTo?.id === currentUserId && (
          <>
            {request.status === 'assigned' && (
              <button
                onClick={() => onAction(request.id, 'take')}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Взять в работу
              </button>
            )}
            {request.status === 'in_progress' && (
              <button
                onClick={() => onAction(request.id, 'complete', currentUserId)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Завершить
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}