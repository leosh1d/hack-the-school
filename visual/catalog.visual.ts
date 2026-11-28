import { expect, test, type Page } from '@playwright/test'

const next = (page: Page) => page.getByRole('button', { name: 'Дальше' }).click()
const choose = (page: Page, name: string) => page.getByRole('radio', { name, exact: true }).check()
const check = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true }).check()

async function chooseSql(page: Page) {
  await choose(page, 'Навыки')
  await next(page)
  await check(page, 'SQL')
  await next(page)
}

async function skipAcademicProfile(page: Page) {
  await choose(page, 'Пропустить профиль')
  await page.getByRole('button', { name: 'Показать подборку' }).click()
}

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
  await expect(page.getByRole('heading', { name: 'По чему подобрать факультативы?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Дальше' })).toBeInViewport()
  await expectScreen(page, '01-profile.png')
})

test('подборка с объяснениями', async ({ page }) => {
  await choose(page, 'Оба направления')
  await next(page)
  await check(page, 'Бизнес-аналитика')
  await next(page)
  await check(page, 'SQL')
  await next(page)
  await choose(page, 'Уточнить условия')
  await next(page)
  await next(page)
  await choose(page, 'До 3 ч')
  await next(page)
  await next(page)
  await next(page)
  await next(page)
  await skipAcademicProfile(page)

  await expect(page.getByRole('heading', { name: 'Ваша подборка' })).toBeVisible()
  const dataCourse = page.getByRole('article', { name: 'Данные для бизнеса' })
  await expect(dataCourse.getByText('Навык — SQL')).toBeVisible()
  await expect(page.getByRole('article', { name: 'Маркетинговые решения на данных' })).toBeVisible()
  await expectScreen(page, '02-recommendations.png')
})

test('поиск без совпадений', async ({ page }) => {
  await chooseSql(page)
  await choose(page, 'Уточнить условия')
  await next(page)
  await next(page)
  await next(page)
  await choose(page, 'Очно')
  await next(page)
  await next(page)
  await next(page)
  await skipAcademicProfile(page)
  await expect(page.getByRole('heading', { name: 'Подходящих курсов пока нет' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Запрос по каталогу' }).fill('кристаллография')
  await page.getByRole('button', { name: 'Найти' }).click()
  await expect(page.getByRole('status')).toContainText('По запросу «кристаллография» курсы не найдены')
  await expectScreen(page, '03-empty-search.png')
})

test('разбор ответа в самопроверке', async ({ page }) => {
  await chooseSql(page)
  await choose(page, 'Пропустить условия')
  await next(page)
  await skipAcademicProfile(page)
  const course = page.getByRole('article', { name: 'Данные для бизнеса' })

  await course.getByText('Проверить себя', { exact: true }).click()
  await course.getByRole('radio', { name: 'Чтобы сгруппировать строки для расчёта показателей' }).check()
  await course.getByRole('button', { name: 'Проверить ответ' }).click()
  await expect(course.getByRole('status')).toContainText('GROUP BY объединяет строки')
  await expectScreen(page, '04-course-quiz.png')
})

test('промежуточный вопрос о навыках', async ({ page }) => {
  await choose(page, 'Оба направления')
  await next(page)
  await check(page, 'Бизнес-аналитика')
  await next(page)
  await check(page, 'SQL')

  await expect(page.getByText('Шаг 3', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Какие навыки хотите развить?' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Бизнес-аналитика' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Назад' })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Дальше' })).toBeInViewport()
  await expectScreen(page, '05-survey-skills.png')
})
