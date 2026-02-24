import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
  console.log("Начинаем сидинг...")

  // Очищаем существующие данные (опционально, для чистоты)
  await prisma.request.deleteMany()
  await prisma.user.deleteMany()

  // Создаем диспетчера
  const dispatcher = await prisma.user.create({
    data: {
      name: 'Диспетчер Анна',
      email: 'dispatcher@example.com',
      password: '123456',
      role: 'dispatcher'
    },
  })
  console.log('Создан диспетчер')

  // Создаем 2 мастеров
  const master1 = await prisma.user.create({
    data: {
      name: 'Мастер Петр',
      email: 'petr@example.com',
      password: '123456',
      role: 'master'
    },
  })

  const master2 = await prisma.user.create({
    data: {
      name: 'Мастер Иван',
      email: 'ivan@example.com',
      password: '123456',
      role: 'master'
    },
  })
  console.log('Созданы мастера')

  // Создаем тестовые заявки
  await prisma.request.createMany({
    data: [
      {
        clientName: 'ООО Ромашка',
        phone: '+7 (999) 123-45-67',
        address: 'ул. Ленина, д. 10, кв. 5',
        problemText: 'Не работает разетка на кухне',
        status: 'new'
      },
      {
        clientName: 'ИП Иванов',
        phone: '+7 (999) 444-44-44',
        address: 'ул. Ленина, д. 55, кв. 10',
        problemText: 'Течет кран в туалете',
        status: 'assignad',
        assignedToId: master1.id
      }, {
        clientName: 'Петров С.И.',
        phone: '+7 (999) 555-55-55',
        address: 'ул. Ленина, д. 60, кв. 3',
        problemText: 'Сломалась стиральная машина',
        status: 'in_progress',
        assignedToId: master1.id
      },
      {
        clientName: 'Кафе "Уют"',
        phone: '+7 (999) 333-33-33',
        address: 'ул. Ленина, д. 26, кв. 7',
        problemText: 'Не горит свет в зале',
        status: 'done',
        assignedToId: master2.id
      },
      {
        clientName: 'Сидоров А.А.',
        phone: '+7 (999) 222-22-22',
        address: 'ул. Ленина, д. 31, кв. 90',
        problemText: 'Заменить смеситель',
        status: 'canceled'
      },
    ],
  })

  console.log('Созданы тестовые заявки')
  console.log('\n Сидинг завершен успешно!')
  console.log('\n Тестовые пользователи:')
  console.log('Диспетчер: dispathcer@example.com / 123456')
  console.log('Мастер Петр: petr@example.com / 123456')
  console.log('Мастер Иван: ivan@example.com / 123456')
}

main()
  .catch((e) => {
    console.error('Ошибка сидинга:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })