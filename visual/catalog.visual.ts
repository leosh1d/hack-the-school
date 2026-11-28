import { expect, test, type Page } from '@playwright/test'

const next = (page: Page) => page.getByRole('button', { name: 'Дальше' }).click()
const choose = (page: Page, name: string) => page.getByRole('radio', { name, exact: true }).check()
const check = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true }).check()

async function chooseSql(page: Page) {
  await check(page, 'Навыки')
  await next(page)
  await check(page, 'SQL')
  await next(page)
}

const hoursWheel = (page: Page) => page.getByRole('listbox', { name: 'Сколько времени в неделю вы готовы уделять?' })

async function answerConditions(page: Page, { limitToThreeHours, format }: { limitToThreeHours?: boolean; format?: string } = {}) {
  await next(page)
  if (limitToThreeHours) {
    const wheel = hoursWheel(page)
    await wheel.press('Home')
    await wheel.press('ArrowDown')
    await expect(wheel.getByRole('option', { selected: true })).toHaveText('До 3 ч')
  }
  await next(page)
  if (format) await check(page, format)
  await next(page)
  await next(page)
  await next(page)
}

async function skipAcademicProfile(page: Page) {
  await choose(page, 'Пропустить профиль')
  await page.getByRole('button', { name: 'Показать подборку' }).click()
}

async function goToFormat(page: Page) {
  await chooseSql(page)
  await next(page)
  await next(page)
}

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
  await expect(page.getByRole('checkbox', { name: 'Карьерные интересы' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Навыки' })).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'Ход анкеты' })).toHaveAttribute('aria-valuetext', /^Шаг 1, \d+%$/)
  await expect(page.getByRole('button', { name: 'Дальше' })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Расскажу в чате' })).toBeInViewport()
  if (isMobile) await expectNextNearBottom(page)
  await expectScreen(page, '01-profile.png', { threshold: 0 })
})

test('подборка с объяснениями', async ({ page }) => {
  await check(page, 'Карьерные интересы')
  await check(page, 'Навыки')
  await next(page)
  await check(page, 'Бизнес-аналитика')
  await next(page)
  await check(page, 'SQL')
  await next(page)
  await answerConditions(page, { limitToThreeHours: true })
  await skipAcademicProfile(page)

  await expect(page.getByRole('heading', { name: 'Ваша подборка' })).toBeVisible()
  const dataCourse = page.getByRole('article', { name: 'Данные для бизнеса' })
  await expect(dataCourse.getByText('Навык — SQL')).toBeVisible()
  await expect(page.getByRole('article', { name: 'Маркетинговые решения на данных' })).toBeVisible()
  await expectScreen(page, '02-recommendations.png')
})

test('поиск без совпадений', async ({ page }) => {
  await chooseSql(page)
  await answerConditions(page, { format: 'Очно' })
  await skipAcademicProfile(page)
  await expect(page.getByRole('heading', { name: 'Подходящих курсов пока нет' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Запрос по каталогу' }).fill('кристаллография')
  await page.getByRole('button', { name: 'Найти' }).click()
  await expect(page.getByRole('status')).toContainText('По запросу «кристаллография» курсы не найдены')
  await expectScreen(page, '03-empty-search.png')
})

test('разбор ответа в самопроверке', async ({ page }) => {
  await chooseSql(page)
  await answerConditions(page)
  await skipAcademicProfile(page)
  const course = page.getByRole('article', { name: 'Данные для бизнеса' })

  await course.getByText('Проверить себя', { exact: true }).click()
  await course.getByRole('radio', { name: 'Чтобы сгруппировать строки для расчёта показателей' }).check()
  await course.getByRole('button', { name: 'Проверить ответ' }).click()
  await expect(course.getByRole('status')).toContainText('GROUP BY объединяет строки')
  await expectScreen(page, '04-course-quiz.png')
})

test('промежуточный вопрос о навыках', async ({ page, isMobile }) => {
  await check(page, 'Карьерные интересы')
  await check(page, 'Навыки')
  await next(page)
  await check(page, 'Бизнес-аналитика')
  await next(page)
  await check(page, 'SQL')

  await expect(page.getByText('Шаг 3', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Какие навыки хотите развить?' })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Бизнес-аналитика' })).toHaveCount(0)
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
  await expectScreen(page, '06-course-chat.png', { threshold: 0 })
})

test('вопрос об опыте в выбранных темах сразу после навыков', async ({ page }) => {
  await chooseSql(page)

  await expect(page.getByRole('heading', { name: 'Какой у вас опыт в выбранных темах?', level: 1 })).toBeFocused()
  await expect(page.getByText('Ваши темы — SQL.', { exact: true })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Решаю задачи по инструкции или с помощью' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Не указывать' })).toBeChecked()
  await expectScreen(page, '07-survey-level.png')
})

test('управление нагрузкой и её сохранение после возврата', async ({ page, isMobile }) => {
  await chooseSql(page)
  await next(page)
  const wheel = hoursWheel(page)
  const selected = wheel.getByRole('option', { selected: true })
  await expect(selected).toHaveText('Без ограничений')
  await expect(page.getByRole('progressbar', { name: 'Ход анкеты' })).toHaveAttribute('aria-valuetext', /^Шаг 4, \d+%$/)
  await wheel.press('Home')
  await expect(selected).toHaveText('До 2 ч')
  await wheel.press('End')
  await expect(selected).toHaveText('Без ограничений')
  await wheel.hover()
  await page.mouse.wheel(0, -100)
  await expect(selected).toHaveText('До 4 ч')
  await wheel.press('End')
  const box = (await wheel.boundingBox())!
  const x = box.x + box.width / 2
  await page.mouse.move(x, box.y + 12)
  await page.mouse.down()
  await page.mouse.move(x, box.y + 108, { steps: 8 })
  await page.mouse.up()
  await expect(selected).toHaveText('До 4 ч')
  await next(page)
  await page.getByRole('button', { name: 'Назад' }).click()
  await expect(selected).toHaveText('До 4 ч')
  await expect(selected).toBeInViewport({ ratio: 1 })
  if (isMobile) await expectNextNearBottom(page)
  await expectScreen(page, '08-survey-hours.png')
})

test('два формата занятий после возврата', async ({ page }) => {
  await goToFormat(page)
  await check(page, 'Онлайн')
  await check(page, 'Очно')
  await next(page)
  await page.getByRole('button', { name: 'Назад' }).click()
  await expect(page.getByRole('checkbox', { name: 'Онлайн' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Очно' })).toBeChecked()
  await expectScreen(page, '09-survey-format.png')
})

test('выбор вида занятий', async ({ page }) => {
  await goToFormat(page)
  await next(page)
  await check(page, 'Семинары')
  await expect(page.getByRole('checkbox', { name: 'Семинары' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Лекции' })).not.toBeChecked()
  await expectScreen(page, '10-survey-class-type.png')
})

test('выбор языка курса', async ({ page }) => {
  await goToFormat(page)
  await next(page)
  await next(page)
  await check(page, 'Английский')
  await expect(page.getByRole('checkbox', { name: 'Английский' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Русский' })).not.toBeChecked()
  await expectScreen(page, '11-survey-language.png')
})

test('поиск одноимённых программ в разных кампусах', async ({ page }) => {
  await chooseSql(page)
  await answerConditions(page)
  await choose(page, 'Заполнить учебный профиль')
  await next(page)

  const program = page.getByRole('combobox', { name: 'На какой программе вы учитесь?' })
  await program.fill('бизнес-информ')
  const moscow = page.getByRole('option', { name: /^Бизнес-информатика Москва · Бакалавриат$/ })
  await expect(moscow).toBeVisible()
  await expect(page.getByRole('option', { name: /^Бизнес-информатика Санкт-Петербург · Бакалавриат$/ })).toBeVisible()
  await expect(page.getByRole('option', { name: /^Управление бизнесом/ })).toHaveCount(0)
  await program.press('ArrowDown')
  await expect(moscow).toHaveAttribute('data-highlighted', '')
  await expectScreen(page, '12-survey-program.png')
})
