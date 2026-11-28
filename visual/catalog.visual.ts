import { expect, test, type Page } from '@playwright/test'

const writing = 'Творческое письмо: история, теория, практика'
const venture = 'Венчурный капитал'
const linguistics = 'Лингвистика в задачах'

async function expectScreen(page: Page, name: string) {
  await page.mouse.move(0, 0)
  const screenshot = await page.screenshot({
    animations: 'disabled', caret: 'hide', fullPage: true, scale: 'css',
  })

  // Comparing a captured buffer retains the actual PNG when a reference is missing in strict mode.
  expect(screenshot).toMatchSnapshot(name)
}

async function saveCourses(page: Page, titles: readonly string[]) {
  for (const title of titles) {
    await page.getByRole('article', { name: title, exact: true }).getByRole('button', { name: 'Отложить' }).click()
  }
  await page.getByRole('button', { name: `Отложенные (${titles.length})`, exact: true }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Что хочется попробовать?', level: 1 })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(4)
})

test('витрина четырёх разных направлений', async ({ page }) => {
  await expect(page.getByRole('searchbox', { name: 'Поиск по курсам' })).toBeInViewport()
  for (const title of [writing, venture, 'Региональная география России', linguistics]) {
    await expect(page.getByRole('article', { name: title, exact: true })).toBeVisible()
  }
  await expectScreen(page, '01-showcase.png')
})

test('подбор после вопроса об интересах', async ({ page }) => {
  await page.getByRole('button', { name: 'Помоги нащупать интерес' }).click()
  await page.getByRole('checkbox', { name: 'Придумывать героев и сюжеты' }).check()
  await page.getByRole('button', { name: 'Показать варианты' }).click()

  await expect(page.getByText('Отмеченные темы — Культура и творчество')).toBeVisible()
  await expect(page.getByRole('article', { name: writing, exact: true }).getByText('По интересу — Культура и творчество')).toBeVisible()
  await expect(page.getByRole('article', { name: venture, exact: true }).getByText('Другое направление')).toBeVisible()
  await expectScreen(page, '02-interest.png')
})

test('детали курса и опубликованный пример', async ({ page }) => {
  await page.getByRole('article', { name: linguistics, exact: true }).getByRole('button', { name: 'Что внутри' }).click()
  await expect(page.getByRole('heading', { name: linguistics, level: 1 })).toBeFocused()
  await expect(page.getByRole('link', { name: 'Задача о числительных языка башкарик' }))
    .toHaveAttribute('href', 'https://www.hse.ru/edu/courses/1189299655#annotation')
  await expect(page.getByText('Подготовка по лингвистике не требуется.')).toBeVisible()
  await expectScreen(page, '03-course-details.png')
})

test('отложенные варианты готовы к сравнению', async ({ page }) => {
  await saveCourses(page, [writing, venture])
  await expect(page.getByRole('heading', { name: 'Отложенные курсы', level: 1 })).toBeFocused()
  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Сравнить', exact: true })).toBeEnabled()
  await expectScreen(page, '04-saved.png')
})

test('сопоставимые факты о двух курсах', async ({ page }) => {
  await saveCourses(page, [writing, linguistics])
  await page.getByRole('button', { name: 'Сравнить', exact: true }).click()
  const table = page.getByRole('table')
  await expect(table.getByRole('columnheader', { name: /Творческое письмо/ })).toBeVisible()
  await expect(table.getByRole('columnheader', { name: /Лингвистика в задачах/ })).toBeVisible()
  await expect(table.getByRole('rowheader', { name: 'Перед записью' })).toBeVisible()
  await expectScreen(page, '05-compare.png')
})

test('ответ справки по двум выбранным курсам', async ({ page }) => {
  await saveCourses(page, [writing, linguistics])
  await page.getByRole('button', { name: 'Сравнить', exact: true }).click()
  await page.getByRole('button', { name: 'Спросить о курсах' }).click()
  const dialog = page.getByRole('dialog', { name: 'Справка по курсам' })
  const field = dialog.getByRole('textbox', { name: 'Ваш вопрос' })
  await expect(field).toBeFocused()
  await field.fill('Какие требования?')
  await field.press('Enter')
  await expect(dialog.getByText('Подготовка по лингвистике не требуется.')).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Программа ВШЭ' })).toHaveCount(2)
  await expectScreen(page, '06-course-question.png')
})
