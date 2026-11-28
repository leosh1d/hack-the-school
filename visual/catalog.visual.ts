import { expect, test, type Page } from '@playwright/test'

const next = (page: Page) => page.getByRole('button', { name: 'Дальше', exact: true }).click()
const choice = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true })
const check = (page: Page, name: string) => choice(page, name).check()
const chatTrigger = (page: Page) => page.getByRole('link', { name: 'Расскажу в чате' })
const chatHeading = (page: Page) => page.getByRole('heading', { name: 'Чат по факультативам', level: 1 })
const chatInput = (page: Page) => page.getByRole('textbox', { name: 'Запрос по каталогу' })

async function openChat(page: Page) {
  await chatTrigger(page).click()
  await expect(page).toHaveURL(/#\/chat$/)
  await expect(chatHeading(page)).toBeFocused()
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
  await expect(page.getByRole('heading', { name: 'Что тебе интересно?', level: 1 })).toBeVisible()
})

test('направления и быстрый просмотр', async ({ page, isMobile }) => {
  const nav = page.getByRole('navigation', { name: 'Разделы' })
  const halfWidth = page.viewportSize()!.width / 2
  await expect(nav.getByRole('button')).toHaveCount(2)
  expect(await nav.getByRole('button', { name: 'Подбор' }).boundingBox()).toMatchObject({ x: 0, width: halfWidth })
  expect(await nav.getByRole('button', { name: 'Каталог' }).boundingBox()).toMatchObject({ x: halfWidth, width: halfWidth })
  await expect(page.getByRole('checkbox')).toHaveCount(6)
  const illustrations = page.locator('label > svg[aria-hidden="true"]')
  await expect(illustrations).toHaveCount(6)
  const outlines = await Promise.all((await illustrations.all()).map(async icon => {
    await expect(icon).toBeVisible()
    await expect(icon).toHaveAttribute('viewBox', '0 0 48 48')
    return icon.locator('path').first().getAttribute('d')
  }))
  expect(new Set(outlines).size).toBe(6)
  await expect(page.getByRole('progressbar', { name: 'Ход подбора' })).toHaveAttribute('aria-valuetext', /^Шаг 1, \d+%$/)

  const nextButton = page.getByRole('button', { name: 'Дальше', exact: true })
  const skip = page.getByRole('button', { name: 'Посмотреть разные темы' })
  await expect(nextButton).toBeInViewport({ ratio: 1 })
  await expect(skip).toBeInViewport({ ratio: 1 })
  if (isMobile) {
    const skipBox = (await skip.boundingBox())!
    const inset = page.viewportSize()!.height - skipBox.y - skipBox.height
    expect(inset).toBeGreaterThanOrEqual(8)
    expect(inset).toBeLessThanOrEqual(36)
  }
  await expectScreen(page, '01-trail-areas.png')
})

test('персональная лента с объяснениями и открытием', async ({ page }) => {
  await check(page, 'Данные и визуализация')
  await check(page, 'Люди и психология')
  await next(page)
  await check(page, 'Объяснять результаты команде')
  await next(page)
  await check(page, 'Проводить наблюдения и интервью')
  await next(page)
  await check(page, 'Применить на работе')
  await next(page)
  await page.getByRole('radio', { name: 'Данные и визуализация', exact: true }).check()
  await page.getByRole('button', { name: 'Посмотреть подборку' }).click()

  await expect(page.getByRole('heading', { name: 'Твоя подборка' })).toBeFocused()
  const matches = page.getByRole('region', { name: 'Рекомендации' })
  await expect(matches.getByRole('article', { name: /Анализ данных и инфографика/ })
    .getByText(/Чтобы объяснять результаты команде/)).toBeVisible()
  await expect(matches.getByRole('article', { name: /Первый выход в поле/ })).toBeVisible()
  await expect(matches.getByText(/^Другой ракурс/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Уточнить запрос' })).toHaveCount(0)
  await expect(page.getByRole('search')).toHaveCount(0)
  await expectScreen(page, '02-trail-feed.png')
})

test('интересы в ИИ с раскрытием ML и NLP', async ({ page }) => {
  await check(page, 'ИТ и ИИ')
  await next(page)
  await expect(page.getByRole('heading', { name: 'Что именно тебя цепляет?' })).toBeFocused()
  await check(page, 'Искусственный интеллект')
  await check(page, 'Как модели учатся · ML')
  await check(page, 'Тексты и языковые модели · NLP')
  await expect(choice(page, 'Тексты и языковые модели · NLP')).toBeChecked()
  await expectScreen(page, '03-trail-ai.png')
})

test('выбор цели для одного направления без шага приоритета', async ({ page }) => {
  await check(page, 'Люди и психология')
  await next(page)
  await next(page)
  await expect(page.getByRole('heading', { name: 'Что хочется унести с курса?' })).toBeFocused()
  await check(page, 'Попробовать метод исследования')
  await expect(page.getByRole('button', { name: 'Посмотреть подборку' })).toBeInViewport()
  await expectScreen(page, '04-trail-goals.png')
})

test('единственный приоритет для нескольких направлений', async ({ page }) => {
  await check(page, 'ИТ и ИИ')
  await check(page, 'Бизнес и продукт')
  await next(page)
  await next(page)
  await next(page)
  await next(page)
  await expect(page.getByRole('heading', { name: 'Что поставить на первое место?' })).toBeFocused()
  await page.getByRole('radio', { name: 'Бизнес и продукт', exact: true }).check()
  await expect(page.getByRole('radio', { name: 'Все интересы на равных' })).not.toBeChecked()
  await expectScreen(page, '05-trail-priority.png')
})

test('чат предлагает совпадения по интересу до добавления в подборку', async ({ page }) => {
  await check(page, 'Данные и визуализация')
  await openChat(page)
  await page.getByRole('button', { name: 'Инфографика' }).click()
  const replies = page.getByRole('log', { name: 'Ответы по каталогу' })
  await expect(replies.getByText('Инфографика', { exact: true })).toBeVisible()
  await expect(replies.getByRole('link', { name: /Анализ данных и инфографика/ }))
    .toHaveAttribute('href', 'https://www.hse.ru/edu/courses/1189299392')
  await expect(replies.getByText('Москва · 3, 4 модуль')).toBeVisible()
  await expect(replies.getByRole('button', { name: 'Учесть в подборке' })).toBeInViewport()
  await expectScreen(page, '06-interest-chat.png')
})

test('страница чата с примерами запросов и полем ввода', async ({ page }) => {
  await page.goto('/#/chat')
  await expect(chatHeading(page)).toBeVisible()
  const prompts = page.getByRole('region', { name: 'Примеры запросов' })
  await expect(prompts.getByRole('button')).toHaveCount(3)
  await expect(prompts.locator('button > svg[aria-hidden="true"]')).toHaveCount(3)
  await expect(chatInput(page)).toBeInViewport({ ratio: 1 })
  await expectScreen(page, '07-chat-welcome.png')
})

test('длинный свой интерес помещается на экране и удаляется', async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 570 })
  await expect(page.locator('label > svg[aria-hidden="true"]')).toHaveCount(6)
  await expect(page.getByRole('button', { name: 'Дальше', exact: true })).toBeInViewport({ ratio: 1 })
  const interest = 'Ж'.repeat(90)
  await check(page, 'Люди и психология')
  const initialHistoryLength = await page.evaluate<number>('window.history.length')
  await openChat(page)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Что тебе интересно?' })).toBeFocused()
  await expect(choice(page, 'Люди и психология')).toBeChecked()
  await page.getByRole('button', { name: 'Уже показать подборку' }).click()
  await expect(page.getByRole('heading', { name: 'Твоя подборка' })).toBeVisible()
  await page.goForward()
  await expect(chatHeading(page)).toBeFocused()
  await page.getByRole('button', { name: 'К анкете' }).click()
  await expect(page.getByRole('heading', { name: 'Что тебе интересно?' })).toBeFocused()
  await expect(choice(page, 'Люди и психология')).toBeChecked()
  await openChat(page)
  await page.getByRole('button', { name: 'К анкете' }).click()
  await expect(page.getByRole('heading', { name: 'Что тебе интересно?' })).toBeFocused()
  await openChat(page)
  expect(await page.evaluate<number>('window.history.length')).toBe(initialHistoryLength + 1)
  await chatInput(page).fill(interest + 'x')
  await expect(chatInput(page)).toHaveValue(interest)
  await chatInput(page).press('Enter')
  await page.getByRole('button', { name: 'Учесть в подборке' }).click()
  await expect(page.getByText('Учтено в подборке')).toBeVisible()
  await page.reload()
  await expect(chatHeading(page)).toBeVisible()
  await page.getByRole('button', { name: 'К анкете' }).click()
  await expect(page.getByRole('heading', { name: 'Что тебе интересно?' })).toBeFocused()
  await expect(choice(page, 'Люди и психология')).toBeChecked()
  const remove = page.getByRole('button', { name: `Удалить интерес ${interest}` })
  const checkWidth = async (element: ReturnType<Page['getByRole']>) => {
    const box = await element.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    expect(await element.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
  }
  await checkWidth(remove)
  await page.getByRole('button', { name: 'Уже показать подборку' }).click()
  await checkWidth(page.getByText(/пока нет совпадений среди тем подборки/))
  await page.getByRole('button', { name: 'Изменить интересы' }).click()
  await remove.click()
  await expect(remove).toHaveCount(0)
})

test('поиск по официальному каталогу ВШЭ', async ({ page }) => {
  await page.getByRole('button', { name: 'Каталог', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Каталог факультативов', level: 1 })).toBeVisible()
  await expect(page.getByText('Hack the School · прототип')).toHaveCount(0)
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
