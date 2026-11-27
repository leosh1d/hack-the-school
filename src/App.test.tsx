import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import App from './App.tsx'
import { renderWithChakra } from './test/render.tsx'

test('подбирает факультатив по выбранному навыку и объясняет рекомендацию', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  expect(screen.getByRole('heading', { level: 1, name: 'Факультативы ВШБ' })).toBeVisible()
  await user.click(screen.getByRole('checkbox', { name: 'SQL' }))
  await user.click(screen.getByRole('button', { name: 'Подобрать факультативы' }))

  expect(screen.getByRole('heading', { name: 'Ваша подборка' })).toBeVisible()
  expect(screen.getByRole('heading', { name: 'Данные для бизнеса' })).toBeVisible()
  expect(screen.getByText('Навык — SQL')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Открыть Smart Way' })).toHaveAttribute('href', 'https://smartway.hse.ru/')
})

test('уточняет пустую подборку запросом и сообщает, когда совпадений нет', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)

  await user.click(screen.getByRole('checkbox', { name: 'SQL' }))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Формат' }), 'campus')
  await user.click(screen.getByRole('button', { name: 'Подобрать факультативы' }))
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
