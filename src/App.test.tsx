import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import App from './App.tsx'
import { CourseCard } from './CourseCard.tsx'
import { courses } from './catalog.ts'
import { renderWithChakra } from './test/render.tsx'

const writing = 'Творческое письмо: история, теория, практика'
const venture = 'Венчурный капитал'
const geography = 'Региональная география России'
const linguistics = 'Лингвистика в задачах'

beforeEach(() => localStorage.clear())

test('открывает витрину с четырьмя курсами и показывает другие направления', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)
  expect(screen.getByRole('heading', { level: 1, name: 'Что хочется попробовать?' })).toBeVisible()
  expect(await screen.findAllByRole('article')).toHaveLength(4)
  expect(screen.getAllByRole('button', { name: 'Что внутри' })).toHaveLength(4)
  expect(screen.getAllByRole('button', { name: 'Отложить' })).toHaveLength(4)
  expect(screen.getByRole('searchbox', { name: 'Поиск по курсам' })).toBeVisible()
  for (const title of [writing, venture, geography, linguistics]) {
    expect(screen.getByRole('article', { name: title })).toBeVisible()
  }

  await user.click(screen.getByRole('button', { name: 'Показать другие направления' }))
  expect(screen.getByRole('article', { name: 'Психология инновационного мышления' })).toBeVisible()
  expect(screen.queryByRole('article', { name: writing })).not.toBeInTheDocument()
})

test('ищет по части названия, показывает порции каталога и фильтрует по модулям и языку', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)
  await user.click(await screen.findByRole('button', { name: 'Смотреть все курсы' }))
  expect(screen.getAllByRole('article')).toHaveLength(6)
  await user.click(screen.getByRole('button', { name: 'Показать ещё' }))
  expect(screen.getAllByRole('article')).toHaveLength(12)

  const search = screen.getByRole('searchbox', { name: 'Поиск по курсам' })
  await user.type(search, 'анализ дан инфограф{Enter}')
  expect(screen.getByRole('article', { name: 'Анализ данных и инфографика в корпоративных системах управления' })).toBeVisible()
  await user.clear(search)
  await user.type(search, 'поиск аудитории{Enter}')
  expect(within(screen.getByRole('article', { name: 'Бизнес-акселератор ВШЭ' }))
    .getByText('Проверка бизнес-идеи, поиск аудитории и сборка первого прототипа.')).toBeVisible()
  await user.clear(search)
  await user.click(screen.getByRole('button', { name: 'Фильтры' }))
  await user.click(screen.getByRole('button', { name: 'Английский' }))
  expect(screen.getByRole('article', { name: /Высокопроизводительные вычислительные методы/ })).toBeVisible()
  await user.click(screen.getByRole('button', { name: '2-й модуль' }))
  expect(screen.getByRole('article', { name: 'Философия искусственного интеллекта' })).toBeVisible()
  expect(screen.queryByRole('article', { name: /Высокопроизводительные вычислительные методы/ })).not.toBeInTheDocument()
})

test('задаёт необязательный вопрос, объясняет выбор и показывает другую тему', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)
  const help = screen.getByRole('button', { name: 'Помоги нащупать интерес' })
  await user.click(help)
  await user.click(screen.getByRole('button', { name: 'Показать другое' }))
  expect(screen.getByRole('checkbox', { name: 'Объяснять данные с помощью инфографики' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Вернуться к просмотру' }))
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  await user.click(help)
  await user.click(screen.getByRole('checkbox', { name: 'Придумывать героев и сюжеты' }))
  await user.click(screen.getByRole('button', { name: 'Показать варианты' }))

  const related = within(await screen.findByRole('article', { name: writing }))
  expect(related.getByText('По интересу — Культура и творчество')).toBeVisible()
  expect(within(screen.getByRole('article', { name: venture })).getByText('Другое направление')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Изменить интересы' }))
  expect(screen.getByRole('checkbox', { name: 'Придумывать героев и сюжеты' })).toBeChecked()
  await user.click(screen.getByRole('button', { name: 'Вернуться к просмотру' }))
  await user.click(screen.getByRole('button', { name: 'Очистить интересы' }))
  expect(screen.queryByText(/Отмеченные темы/)).not.toBeInTheDocument()
  expect(screen.getByRole('article', { name: geography })).toBeVisible()
})

test('открывает программу, опубликованное задание и локальную справку курса', async () => {
  const user = userEvent.setup()
  renderWithChakra(<App />)
  const card = within(await screen.findByRole('article', { name: linguistics }))
  await user.click(card.getByRole('button', { name: 'Что внутри' }))
  expect(screen.getByRole('heading', { level: 1, name: linguistics })).toHaveFocus()
  expect(screen.getByRole('heading', { name: 'Что происходит на занятиях' })).toBeVisible()
  expect(screen.getByText('Подготовка по лингвистике не требуется.')).toBeVisible()
  expect(screen.getByRole('link', { name: 'Задача о числительных языка башкарик' }))
    .toHaveAttribute('href', 'https://www.hse.ru/edu/courses/1189299655#annotation')
  expect(screen.getByRole('link', { name: 'Открыть программу ВШЭ' })).toHaveAttribute('href', 'https://www.hse.ru/edu/courses/1189299655')

  await user.click(screen.getByRole('button', { name: 'Спросить о курсе' }))
  const dialog = within(await screen.findByRole('dialog', { name: 'Справка по курсу' }))
  await user.type(dialog.getByRole('textbox', { name: 'Ваш вопрос' }), 'Нужно ли знать Python?{Enter}')
  expect(dialog.getByText(/В локальной справке нет сведений об обязательном знании Python/)).toBeVisible()
  expect(dialog.getByRole('link', { name: 'Программа ВШЭ' })).toHaveAttribute('href', 'https://www.hse.ru/edu/courses/1189299655')
  await user.click(dialog.getByRole('button', { name: 'Закрыть справку' }))
  await user.click(screen.getByRole('button', { name: 'Назад' }))
  expect(screen.getByRole('heading', { name: 'Что хочется попробовать?' })).toHaveFocus()
})

test('сохраняет отложенные курсы между открытиями и сравнивает от двух до трёх', async () => {
  const user = userEvent.setup()
  const app = renderWithChakra(<App />)
  await screen.findByRole('article', { name: writing })
  for (const title of [writing, venture, geography, linguistics]) {
    const card = within(screen.getByRole('article', { name: title }))
    await user.click(card.getByRole('button', { name: 'Отложить' }))
  }
  app.unmount()

  renderWithChakra(<App />)
  await user.click(screen.getByRole('button', { name: 'Отложенные (4)' }))
  await screen.findByRole('article', { name: writing })
  const fourth = screen.getByRole('checkbox', { name: `Включить в сравнение: ${linguistics}` })
  expect(fourth).toBeDisabled()
  await user.click(screen.getByRole('checkbox', { name: `Включить в сравнение: ${geography}` }))
  await user.click(screen.getByRole('checkbox', { name: `Включить в сравнение: ${venture}` }))
  const compare = screen.getByRole('button', { name: 'Сравнить' })
  expect(compare).toBeDisabled()
  await user.click(fourth)
  await user.click(compare)

  expect(screen.getByRole('heading', { name: 'Сравнение курсов' })).toHaveFocus()
  const table = within(screen.getByRole('table'))
  expect(table.getByRole('columnheader', { name: /Творческое письмо/ })).toBeVisible()
  expect(table.getByRole('columnheader', { name: /Лингвистика в задачах/ })).toBeVisible()
  expect(table.getByRole('rowheader', { name: 'Перед записью' })).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'Спросить о курсах' }))
  const dialog = within(await screen.findByRole('dialog', { name: 'Справка по курсам' }))
  await user.type(dialog.getByRole('textbox', { name: 'Ваш вопрос' }), 'Чем отличаются?{Enter}')
  expect(dialog.getByText(/Композиция и сюжет/)).toBeVisible()
  expect(dialog.getByText(/Системы счёта и письменности/)).toBeVisible()
  expect(dialog.getAllByRole('link', { name: 'Программа ВШЭ' })).toHaveLength(2)

  await user.click(dialog.getByRole('button', { name: 'Закрыть справку' }))
  await user.click(screen.getByRole('button', { name: 'К отложенным' }))
  expect(screen.getByRole('checkbox', { name: `Включить в сравнение: ${writing}` })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: `Включить в сравнение: ${linguistics}` })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: `Включить в сравнение: ${venture}` })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: `Включить в сравнение: ${geography}` })).not.toBeChecked()
  await user.click(within(screen.getByRole('article', { name: linguistics })).getByRole('button', { name: 'Отложено' }))
  expect(screen.getByRole('button', { name: 'Сравнить' })).toBeDisabled()
})

test('демонстрационная самопроверка объясняет ответ', async () => {
  const user = userEvent.setup()
  renderWithChakra(<CourseCard course={courses[0]} />)
  const card = within(screen.getByRole('article', { name: 'Данные для бизнеса' }))
  await user.click(card.getByText('Проверить себя'))
  await user.click(card.getByRole('radio', { name: 'Чтобы сгруппировать строки для расчёта показателей' }))
  await user.click(card.getByRole('button', { name: 'Проверить ответ' }))
  expect(card.getByRole('status')).toHaveTextContent('GROUP BY объединяет строки')
})
