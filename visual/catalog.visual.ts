import { expect, test, type Page } from '@playwright/test'

async function expectScreen(page: Page, name: string) {
  await page.mouse.move(0, 0)
  const screenshot = await page.screenshot({
    animations: 'disabled', caret: 'hide', fullPage: true, scale: 'css',
  })

  // Comparing a captured buffer retains the actual PNG when a reference is missing in strict mode.
  expect(screenshot).toMatchSnapshot(name)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Факультативы ВШБ', level: 1 })).toBeVisible()
})

test('анкета подбора', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Что хотите изучить?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Подобрать факультативы' })).toBeVisible()
  await expectScreen(page, '01-profile.png')
})

test('подборка с объяснениями', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Бизнес-аналитика' }).check()
  await page.getByRole('checkbox', { name: 'SQL', exact: true }).check()
  await page.getByRole('combobox', { name: 'Время в неделю' }).selectOption('3')
  await page.getByRole('button', { name: 'Подобрать факультативы' }).click()

  await expect(page.getByRole('heading', { name: 'Ваша подборка' })).toBeVisible()
  const dataCourse = page.getByRole('article', { name: 'Данные для бизнеса' })
  await expect(dataCourse.getByText('Навык — SQL')).toBeVisible()
  await expect(page.getByRole('article', { name: 'Маркетинговые решения на данных' })).toBeVisible()
  await expectScreen(page, '02-recommendations.png')
})

test('поиск без совпадений', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'SQL', exact: true }).check()
  await page.getByRole('combobox', { name: 'Формат', exact: true }).selectOption('campus')
  await page.getByRole('button', { name: 'Подобрать факультативы' }).click()
  await expect(page.getByRole('heading', { name: 'Подходящих курсов пока нет' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Запрос по каталогу' }).fill('кристаллография')
  await page.getByRole('button', { name: 'Найти' }).click()
  await expect(page.getByRole('status')).toContainText('По запросу «кристаллография» курсы не найдены')
  await expectScreen(page, '03-empty-search.png')
})

test('разбор ответа в самопроверке', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'SQL', exact: true }).check()
  await page.getByRole('button', { name: 'Подобрать факультативы' }).click()
  const course = page.getByRole('article', { name: 'Данные для бизнеса' })

  await course.getByText('Проверить себя', { exact: true }).click()
  await course.getByRole('radio', { name: 'Чтобы сгруппировать строки для расчёта показателей' }).check()
  await course.getByRole('button', { name: 'Проверить ответ' }).click()
  await expect(course.getByRole('status')).toContainText('GROUP BY объединяет строки')
  await expectScreen(page, '04-course-quiz.png')
})
