import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import App from './App.tsx'
import { renderWithChakra } from './test/render.tsx'

type User = ReturnType<typeof userEvent.setup>

const next = (user: User) => user.click(screen.getByRole('button', { name: 'Дальше' }))
const back = (user: User) => user.click(screen.getByRole('button', { name: 'Назад' }))
const radio = (user: User, name: string) => user.click(screen.getByRole('radio', { name }))
const checkbox = (user: User, name: string) => user.click(screen.getByRole('checkbox', { name }))

async function chooseSql(user: User) {
  await radio(user, 'Навыки')
  await next(user)
  await checkbox(user, 'SQL')
  await next(user)
}

const showResults = (user: User) => user.click(screen.getByRole('button', { name: 'Показать подборку' }))

test('задаёт только вопросы выбранной ветки и просит выбрать интерес', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  const next = () => user.click(screen.getByRole('button', { name: 'Дальше' }))
  expect(screen.getByRole('heading', { name: 'По чему подобрать факультативы?' })).toBeVisible()
  expect(screen.queryByRole('checkbox', { name: 'SQL' })).not.toBeInTheDocument()
  await next()
  expect(screen.getByRole('alert')).toHaveTextContent('Выберите, по чему подобрать курсы')
  await user.click(screen.getByRole('radio', { name: 'Карьерные интересы' }))
  await next()

  const question = screen.getByRole('heading', { name: 'Какие направления вам интересны?' })
  expect(question).toHaveFocus()
  expect(screen.getByText('Шаг 2')).toBeVisible()
  expect(screen.queryByRole('checkbox', { name: 'SQL' })).not.toBeInTheDocument()
  await next()
  expect(screen.getByRole('alert')).toHaveTextContent('Выберите хотя бы одно направление')
  await user.click(screen.getByRole('checkbox', { name: 'Маркетинг' }))
  await next()

  expect(screen.getByRole('heading', { name: 'Уточнить условия обучения?' })).toBeVisible()
  expect(screen.queryByRole('checkbox', { name: 'Маркетинг' })).not.toBeInTheDocument()
})

test('подбирает факультатив по выбранному навыку и объясняет рекомендацию', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  expect(screen.getByRole('heading', { level: 1, name: 'Факультативы ВШБ' })).toBeVisible()
  await chooseSql(user)
  await radio(user, 'Пропустить условия')
  await next(user)
  expect(screen.getByRole('heading', { name: 'Учесть ваш учебный профиль?' })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Какой у вас уровень подготовки?' })).not.toBeInTheDocument()
  await next(user)
  expect(screen.getByRole('alert')).toHaveTextContent('Выберите, учитывать ли учебный профиль')
  await radio(user, 'Пропустить профиль')
  await showResults(user)

  expect(screen.getByRole('heading', { name: 'Ваша подборка' })).toBeVisible()
  expect(screen.getByRole('heading', { name: 'Данные для бизнеса' })).toBeVisible()
  expect(screen.getByText('Навык — SQL')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Открыть Smart Way' })).toHaveAttribute('href', 'https://smartway.hse.ru/')
})

test('сохраняет ответы при возврате и исключает скрытые интересы и условия при смене ветки', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  await radio(user, 'Оба направления')
  await next(user)
  await checkbox(user, 'Финансы')
  await next(user)
  expect(screen.getByRole('heading', { name: 'Какие навыки хотите развить?' })).toBeVisible()
  expect(screen.queryByRole('checkbox', { name: 'Финансы' })).not.toBeInTheDocument()
  await checkbox(user, 'SQL')
  await back(user)
  expect(screen.getByRole('checkbox', { name: 'Финансы' })).toBeChecked()
  await back(user)
  await radio(user, 'Навыки')
  await next(user)
  expect(screen.getByRole('checkbox', { name: 'SQL' })).toBeChecked()
  await next(user)

  await radio(user, 'Уточнить условия')
  await next(user)
  await next(user)
  await next(user)
  await radio(user, 'Очно')
  await back(user)
  await back(user)
  await back(user)
  await radio(user, 'Пропустить условия')
  await next(user)
  await radio(user, 'Пропустить профиль')
  await showResults(user)

  expect(screen.getByRole('heading', { name: 'Данные для бизнеса' })).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Финансовая модель проекта' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Изменить ответы' }))
  expect(screen.getByRole('radio', { name: 'Навыки' })).toBeChecked()
  await next(user)
  expect(screen.getByRole('checkbox', { name: 'SQL' })).toBeChecked()
})

test('показывает вопросы учебного профиля по отдельности и учитывает ответы', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  await radio(user, 'Навыки')
  await next(user)
  await checkbox(user, 'A/B-тесты')
  await next(user)
  await radio(user, 'Пропустить условия')
  await next(user)
  await radio(user, 'Заполнить учебный профиль')
  await next(user)
  await radio(user, 'Бизнес-информатика')
  expect(screen.queryByRole('radio', { name: '2 курс' })).not.toBeInTheDocument()
  await next(user)
  await radio(user, '2 курс')
  expect(screen.queryByRole('checkbox', { name: 'Статистика' })).not.toBeInTheDocument()
  await next(user)
  await checkbox(user, 'Статистика')
  await showResults(user)
  const card = within(screen.getByRole('article', { name: 'Эксперименты в продукте' }))
  expect(card.getByText('Вы уже изучали: Статистика')).toBeVisible()
  expect(card.getByText('Дополняет программу «Бизнес-информатика»')).toBeVisible()
})

test('уточняет пустую подборку запросом и сообщает, когда совпадений нет', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  await chooseSql(user)
  await radio(user, 'Уточнить условия')
  await next(user)
  await next(user)
  await next(user)
  await radio(user, 'Очно')
  await next(user)
  await next(user)
  await next(user)
  await radio(user, 'Пропустить профиль')
  await showResults(user)
  expect(screen.getByRole('heading', { name: 'Подходящих курсов пока нет' })).toBeVisible()

  const query = screen.getByRole('searchbox', { name: 'Запрос по каталогу' })
  await user.type(query, 'интервью')
  await user.click(screen.getByRole('button', { name: 'Найти' }))
  expect(screen.getByRole('heading', { name: 'Интервью с клиентами' })).toBeVisible()

  await user.clear(query)
  await user.type(query, 'кристаллография')
  await user.click(screen.getByRole('button', { name: 'Найти' }))
  expect(screen.getByText(/По запросу «кристаллография» курсы не найдены/)).toBeVisible()
  expect(screen.queryByRole('heading', { name: 'Интервью с клиентами' })).not.toBeInTheDocument()
})

test('даёт пройти самопроверку в карточке курса и объясняет ответ', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)
  await user.click(screen.getByRole('button', { name: 'Каталог' }))

  const card = within(screen.getByRole('article', { name: 'Данные для бизнеса' }))
  await user.click(card.getByText('Проверить себя'))
  const submit = card.getByRole('button', { name: 'Проверить ответ' })
  expect(submit).toBeDisabled()
  await user.click(card.getByRole('radio', { name: 'Чтобы поменять порядок колонок' }))
  await user.click(submit)
  expect(card.getByRole('status')).toHaveTextContent('Ответ пока неверный')
  expect(card.getByRole('status')).toHaveTextContent('GROUP BY объединяет строки')

  await user.click(card.getByRole('radio', { name: 'Чтобы сгруппировать строки для расчёта показателей' }))
  await user.click(submit)
  expect(card.getByRole('status')).toHaveTextContent('Верно')
})
