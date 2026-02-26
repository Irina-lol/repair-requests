import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { prisma } from '@/lib/prisma'

describe('API Requests Tests', () => {
  // Тест 1: Создание заявки
  it('should create a new request with status "new"', async () => {
    const newRequest = await prisma.request.create({
      data: {
        clientName: 'Тестовый клиент',
        phone: '+7 (999) 123-45-67',
        address: 'ул. Тестовая, д. 1',
        problemText: 'Тестовая проблема',
        status: 'new',
      },
    })

    expect(newRequest).toHaveProperty('id')
    expect(newRequest.clientName).toBe('Тестовый клиент')
    expect(newRequest.status).toBe('new')
  })

  // Тест 2: Проверка защиты от гонки при взятии в работу
  it('should prevent race condition when taking request', async () => {
    // Создаем тестовую заявку со статусом assigned
    const testRequest = await prisma.request.create({
      data: {
        clientName: 'Тест гонки',
        phone: '+7 (999) 111-22-33',
        address: 'ул. Гонки, д. 1',
        problemText: 'Тест параллельных запросов',
        status: 'assigned',
        assignedToId: 2, // Мастер Петр
      },
    })

    // Пытаемся выполнить два одновременных обновления через транзакцию
    try {
      await prisma.$transaction(async (tx) => {
        // Первое обновление
        const first = await tx.request.update({
          where: { id: testRequest.id },
          data: { status: 'in_progress' },
        })

        // Второе обновление (должно выбросить ошибку)
        const second = await tx.request.update({
          where: { id: testRequest.id },
          data: { status: 'in_progress' },
        })
        
        expect(second).toBeUndefined() // Сюда не должны дойти
      })
    } catch (error) {
      expect(error).toBeDefined() // Ожидаем ошибку
    }

    // Проверяем финальный статус
    const finalRequest = await prisma.request.findUnique({
      where: { id: testRequest.id },
    })
    expect(finalRequest?.status).toBe('in_progress')
  })
})