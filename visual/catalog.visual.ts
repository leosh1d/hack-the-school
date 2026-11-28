import { expect, test, type Page } from '@playwright/test'

const next = (page: Page) => page.getByRole('button', { name: 'Дальше' }).click()
const check = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true }).check()

async function chooseCoding(page: Page) {
  await check(page, 'Навыки')
  await next(page)
  await check(page, 'Программирование')
  await next(page)
}

const hoursWheel = (page: Page) => page.getByRole('listbox', { name: 'Сколько контактных часов вы готовы выделить?' })
const showResults = (page: Page) => page.getByRole('button', { name: 'Показать подборку' }).click()

async function expectScreen(page: Page, name: string, options?: { threshold: number }) {
  await page.mouse.move(0, 0)
  const screenshot = await page.screenshot({
    animations: 'disabled', caret: 'hide', fullPage: true, scale: 'css',
  })

  // Comparing a captured buffer retains the actual PNG when a reference is missing in strict mode.
  expect(screenshot).toMatchSnapshot(name, options)
}

async function expectNextNearBottom(page: Page) {
  const button = page.getByRole('button', { name: 'Дальше' })
  await expect(button).toBeInViewport({ ratio: 1 })
  const box = await button.boundingBox()
  const inset = page.viewportSize()!.height - (box!.y + box!.height)
  expect(inset).toBeGreaterThanOrEqual(8)
  expect(inset).toBeLessThanOrEqual(36)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'По чему подобрать факультативы?', level: 1 })).toBeVisible()
})

test('анкета подбора', async ({ page, isMobile }) => {
  const nav = page.getByRole('navigation', { name: 'Разделы' })
  const halfWidth = page.viewportSize()!.width / 2
  await expect(page.getByRole('button', { name: /^Факультативы/ })).toHaveCount(0)
  await expect(nav.getByRole('button')).toHaveCount(2)
  expect(await nav.getByRole('button', { name: 'Подбор' }).boundingBox()).toMatchObject({ x: 0, width: halfWidth })
  expect(await nav.getByRole('button', { name: 'Каталог' }).boundingBox()).toMatchObject({ x: halfWidth, width: halfWidth })
  await expect(page.getByRole('checkbox', { name: 'Интересы' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Навыки' })).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'Ход анкеты' })).toHaveAttribute('aria-valuetext', /^Шаг 1, \d+%$/)
  await expect(page.getByRole('button', { name: 'Дальше' })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Расскажу в чате' })).toBeInViewport()
  if (isMobile) await expectNextNearBottom(page)
  await expectScreen(page, '01-profile.png', { threshold: 0 })
})

test('подборка с объяснениями', async ({ page }) => {
  await check(page, 'Интересы')
  await check(page, 'Навыки')
  await next(page)
  await check(page, 'Технологии и ИИ')
  await next(page)
  await check(page, 'Создание продуктов и проектов')
  await next(page)
  await hoursWheel(page).press('Home')
  await hoursWheel(page).press('ArrowDown')
  await next(page)
  await check(page, '1-й модуль')
  await check(page, '2-й модуль')
  await next(page)
  await check(page, 'Русский')
  await showResults(page)

  await expect(page.getByRole('heading', { name: 'Ваша подборка' })).toBeVisible()
  const course = page.getByRole('article', { name: /Вайб-кодинг/ })
  await expect(course.getByText('Интерес — Технологии и ИИ')).toBeVisible()
  await expect(course.getByText('Навык — Создание продуктов и проектов')).toBeVisible()
  await expect(page.getByRole('article', { name: /Автоматизация сложных процессов/ })).toBeVisible()
  await expectScreen(page, '02-recommendations.png')
})

test('поиск без совпадений', async ({ page }) => {
  await chooseCoding(page)
  await next(page)
  await check(page, '2-й модуль')
  await next(page)
  await check(page, 'Английский')
  await showResults(page)
  await expect(page.getByRole('heading', { name: 'Подходящих курсов пока нет' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Запрос по каталогу' }).fill('кристаллография')
  await page.getByRole('button', { name: 'Найти' }).click()
  await expect(page.getByRole('status')).toContainText('По запросу «кристаллография» курсы не найдены')
  await expectScreen(page, '03-empty-search.png')
})

test('разбор ответа в самопроверке', async ({ page }) => {
  await page.getByRole('button', { name: 'Каталог', exact: true }).click()
  const query = page.getByRole('searchbox', { name: 'Запрос по каталогу' })
  await query.fill('данные бизнеса')
  await query.press('Enter')
  const course = page.getByRole('article', { name: 'Данные для бизнеса' })

  await course.getByText('Проверить себя', { exact: true }).click()
  await course.getByRole('radio', { name: 'Чтобы сгруппировать строки для расчёта показателей' }).check()
  await course.getByRole('button', { name: 'Проверить ответ' }).click()
  await expect(course.getByRole('status')).toContainText('GROUP BY объединяет строки')
  await expectScreen(page, '04-course-quiz.png')
})

test('промежуточный вопрос о навыках', async ({ page, isMobile }) => {
  await check(page, 'Интересы')
  await check(page, 'Навыки')
  await next(page)
  await check(page, 'Данные и математика')
  await next(page)
  await check(page, 'Программирование')

  await expect(page.getByText('Шаг 3', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Какие навыки хотите развить?' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Данные и математика' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Назад' })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Дальше' })).toBeInViewport()
  if (isMobile) await expectNextNearBottom(page)
  await expectScreen(page, '05-survey-skills.png')
})

test('ответ чата до заполнения анкеты', async ({ page }) => {
  await page.getByRole('button', { name: 'Расскажу в чате' }).click()
  const dialog = page.getByRole('dialog', { name: 'Чат по факультативам' })
  const input = dialog.getByRole('textbox', { name: 'Запрос по каталогу' })
  await expect(input).toBeFocused()
  await input.fill('интервью с клиентами')
  await input.press('Enter')

  const replies = dialog.getByRole('log')
  await expect(replies.getByText('интервью с клиентами', { exact: true })).toBeVisible()
  await expect(replies.getByText('Интервью с клиентами', { exact: true })).toBeVisible()
  await expect(replies.getByText('Ищем по каталогу ВШЭ…')).toHaveCount(0)
  await expectScreen(page, '06-course-chat.png', { threshold: 0 })
})

test('выбор темы в ветке интересов', async ({ page }) => {
  await check(page, 'Интересы')
  await next(page)
  await expect(page.getByRole('heading', { name: 'Какие темы вам интересны?', level: 1 })).toBeFocused()
  await check(page, 'Данные и математика')
  await expect(page.getByRole('checkbox', { name: 'Данные и математика' })).toBeChecked()
  await expectScreen(page, '07-survey-interests.png')
})

test('управление нагрузкой и её сохранение после возврата', async ({ page, isMobile }) => {
  await chooseCoding(page)
  const wheel = hoursWheel(page)
  const selected = wheel.getByRole('option', { selected: true })
  await expect(selected).toHaveText('Без ограничений')
  await expect(page.getByRole('progressbar', { name: 'Ход анкеты' })).toHaveAttribute('aria-valuetext', /^Шаг 3, \d+%$/)
  await wheel.press('Home')
  await expect(selected).toHaveText('До 30 ч')
  await wheel.press('End')
  await expect(selected).toHaveText('Без ограничений')
  await wheel.hover()
  await page.mouse.wheel(0, -100)
  await expect(selected).toHaveText('До 60 ч')
  await wheel.press('End')
  const box = (await wheel.boundingBox())!
  const x = box.x + box.width / 2
  await page.mouse.move(x, box.y + 12)
  await page.mouse.down()
  await page.mouse.move(x, box.y + 108, { steps: 8 })
  await page.mouse.up()
  await expect(selected).toHaveText('До 60 ч')
  await next(page)
  await page.getByRole('button', { name: 'Назад' }).click()
  await expect(selected).toHaveText('До 60 ч')
  await expect(selected).toBeInViewport({ ratio: 1 })
  if (isMobile) await expectNextNearBottom(page)
  await expectScreen(page, '08-survey-hours.png')
})

test('выбранные модули после возврата', async ({ page }) => {
  await chooseCoding(page)
  await next(page)
  await check(page, '3-й модуль')
  await check(page, '4-й модуль')
  await next(page)
  await page.getByRole('button', { name: 'Назад' }).click()
  await expect(page.getByRole('checkbox', { name: '3-й модуль' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: '4-й модуль' })).toBeChecked()
  await expectScreen(page, '09-survey-modules.png')
})

test('выбор языка курса', async ({ page }) => {
  await chooseCoding(page)
  await next(page)
  await next(page)
  await check(page, 'Английский')
  await expect(page.getByRole('checkbox', { name: 'Английский' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Русский' })).not.toBeChecked()
  await expectScreen(page, '11-survey-language.png')
})

test('поиск по официальному каталогу ВШЭ', async ({ page }) => {
  await page.getByRole('button', { name: 'Каталог', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Курсы ВШЭ' })).toBeVisible()
  const query = page.getByRole('searchbox', { name: 'Запрос по каталогу' })
  await query.fill('анализ дан инфограф')
  await query.press('Enter')

  const official = page.getByRole('article', { name: 'Анализ данных и инфографика в корпоративных системах управления' })
  await expect(official.getByRole('link', { name: 'Открыть на сайте ВШЭ' })).toHaveAttribute('href', 'https://www.hse.ru/edu/courses/1189299392')
  await expect(official.getByText('Контактные часы')).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Совпадений по запросу «анализ дан инфограф»: 1')
  await expectScreen(page, '13-official-catalog.png')
})
