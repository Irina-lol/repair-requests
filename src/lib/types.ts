export type UserRole = 'dispatcher' | 'master'

export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'done' | 'canceled'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Request {
  id: number
  clientName: string
  phone: string
  address: string
  problemText: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  assignedToId: number | null
  assignedTo?: User | null
}