import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, props: Params) {
  try {
    const params = await props.params
    const id = parseInt(params.id)

    const requestItem = await prisma.request.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!requestItem) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(requestItem)
  } catch (error) {
    console.error('🔥 GET Error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заявки' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, props: Params) {
  try {
    const params = await props.params
    const id = parseInt(params.id)
    const body = await request.json()
    const { action, masterId } = body

    console.log('📝 PATCH request:', { id, action, masterId })

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    let updatedRequest

    switch (action) {
      case 'assign':
        if (existingRequest.status !== 'new') {
          return NextResponse.json(
            { error: 'Можно назначить мастера только на новую заявку' },
            { status: 400 }
          )
        }
        if (!masterId) {
          return NextResponse.json(
            { error: 'Не указан мастер' },
            { status: 400 }
          )
        }
        updatedRequest = await prisma.request.update({
          where: { id },
          data: {
            assignedToId: parseInt(masterId),
            status: 'assigned',
          },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        })
        break

      case 'cancel':
        if (existingRequest.status === 'done' || existingRequest.status === 'canceled') {
          return NextResponse.json(
            { error: 'Нельзя отменить завершенную или уже отмененную заявку' },
            { status: 400 }
          )
        }
        updatedRequest = await prisma.request.update({
          where: { id },
          data: {
            status: 'canceled',
          },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        })
        break

      case 'take':
        if (existingRequest.status !== 'assigned') {
          return NextResponse.json(
            { error: 'Можно взять в работу только заявки со статусом "assigned"' },
            { status: 400 }
          )
        }
        if (existingRequest.assignedToId !== parseInt(masterId)) {
          return NextResponse.json(
            { error: 'Эта заявка назначена другому мастеру' },
            { status: 400 }
          )
        }

        try {
          updatedRequest = await prisma.$transaction(async (tx) => {
            const currentRequest = await tx.request.findUnique({
              where: { id },
            })

            if (currentRequest?.status !== 'assigned') {
              throw new Error('Заявка уже взята в работу или изменена')
            }

            return tx.request.update({
              where: { id },
              data: {
                status: 'in_progress',
              },
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            })
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'Заявка уже была взята другим мастером' },
            { status: 409 }
          )
        }
        break

      case 'complete':
        if (existingRequest.status !== 'in_progress') {
          return NextResponse.json(
            { error: 'Можно завершить только заявки в работе' },
            { status: 400 }
          )
        }
        if (existingRequest.assignedToId !== parseInt(masterId)) {
          return NextResponse.json(
            { error: 'Вы не можете завершить чужую заявку' },
            { status: 400 }
          )
        }
        updatedRequest = await prisma.request.update({
          where: { id },
          data: {
            status: 'done',
          },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Неизвестное действие' },
          { status: 400 }
        )
    }

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('🔥🔥🔥 PATCH Error:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении заявки' },
      { status: 500 }
    )
  }
}