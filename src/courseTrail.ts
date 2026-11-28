export const areas = {
  tech: ['ИТ и ИИ', ['ai', 'automation']],
  business: ['Бизнес и продукт', ['customers', 'idea', 'decision']],
  data: ['Данные и визуализация', ['insights', 'show']],
  human: ['Люди и психология', ['behavior', 'observe', 'creative']],
  language: ['Языки и общение', ['meaning', 'structure', 'nlp']],
  art: ['Медиа и творчество', ['stories', 'ads', 'digital']],
} as const

export const topics = {
  ai: 'Искусственный интеллект', ml: 'Как модели учатся · ML', nlp: 'Тексты и языковые модели · NLP',
  automation: 'Собирать ИИ-помощников', customers: 'Понимать запросы клиентов', idea: 'Придумывать продукты',
  decision: 'Принимать решения по данным', insights: 'Искать закономерности', show: 'Объяснять результаты команде',
  behavior: 'Понимать поведение людей', observe: 'Проводить наблюдения и интервью', creative: 'Развивать творческое мышление',
  meaning: 'Понимать намерения собеседника', structure: 'Разбираться в устройстве языков',
  stories: 'Писать истории', ads: 'Разбирать рекламу', digital: 'Создавать цифровые проекты',
} as const

export const goals = {
  make: 'Сделать свой проект',
  research: 'Попробовать метод исследования',
  apply: 'Применить на работе',
  explore: 'Расширить кругозор',
} as const

export type Area = keyof typeof areas
export type Topic = keyof typeof topics
export type Goal = keyof typeof goals
export type TrailStep = 'areas' | Area | 'goals' | 'priority'

export type TrailState = {
  areas: readonly Area[]
  tags: readonly Topic[]
  goals: readonly Goal[]
  own: readonly string[]
  priority: Area | ''
  wide: boolean
  stage: TrailStep | 'feed'
  from: TrailStep
}

export const trailStorageKey = 'hse-elective-trail-v1'
export const ownInterestMaxLength = 90

export function emptyTrail(): TrailState {
  return { areas: [], tags: [], goals: [], own: [], priority: '', wide: true, stage: 'areas', from: 'areas' }
}

export function trailSteps(state: Pick<TrailState, 'areas'>): TrailStep[] {
  return ['areas', ...state.areas, 'goals', ...(state.areas.length >= 2 ? ['priority' as const] : [])]
}

function validTopics(state: TrailState) {
  const valid = state.areas.flatMap<Topic>(area => areas[area][1])
  if (state.areas.includes('tech') && state.tags.includes('ai')) valid.push('ml')
  if (valid.includes('ml') && state.tags.includes('ml')) valid.push('nlp')
  return valid
}

export function cleanTrail(state: TrailState): TrailState {
  const permitted = validTopics(state)
  const steps = trailSteps(state)
  return {
    ...state,
    tags: state.tags.filter(tag => permitted.includes(tag)),
    priority: state.areas.length >= 2 && state.priority && state.areas.includes(state.priority) ? state.priority : '',
    stage: state.stage === 'feed' || steps.includes(state.stage) ? state.stage : 'areas',
    from: steps.includes(state.from) ? state.from : 'areas',
  }
}

function recognized<Key extends string>(value: unknown, options: Record<Key, unknown>): Key[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is Key => typeof item === 'string' && Object.hasOwn(options, item)))]
    : []
}

export function restoreTrail(): TrailState {
  try {
    const saved = JSON.parse(localStorage.getItem(trailStorageKey) ?? 'null')
    if (!saved || typeof saved !== 'object') return emptyTrail()
    const own = Array.isArray(saved.own)
      ? [...new Set(saved.own.flatMap((value: unknown) => typeof value === 'string' && value.trim() ? [value.trim().slice(0, ownInterestMaxLength)] : []))] as string[]
      : []
    return cleanTrail({
      areas: recognized(saved.areas, areas), tags: recognized(saved.tags, topics), goals: recognized(saved.goals, goals),
      own, priority: recognized([saved.priority], areas)[0] ?? '', wide: saved.wide !== false,
      stage: saved.stage, from: saved.from,
    })
  } catch {
    return emptyTrail()
  }
}

const vocabulary = {
  nlp: /nlp|языков.{0,4}модел|обработк.{0,5}текст/i, automation: /агент|чат.?бот/i,
  customers: /клиент|покупател|отзыв/i, observe: /интервью|этнограф|наблюден/i,
  show: /инфограф|визуализ|презентаци/i, decision: /бизнес.?аналит|метрик/i,
  digital: /вайб.?код|цифров.{0,4}проект/i, ads: /реклам|пропаганд/i,
  creative: /творчеств|кр[еи]атив/i, stories: /сюжет|рассказ|писател/i, meaning: /подтекст|прагматик/i,
  structure: /лингвистик|грамматик/i, behavior: /психолог|поведен/i, idea: /стартап|предпринимат/i,
  insights: /статистик|анализ данных/i,
} as const

export function ownTags(text: string) {
  return (Object.keys(vocabulary) as (keyof typeof vocabulary)[]).filter(id => vocabulary[id].test(text))
}

type TrailCourse = {
  id: string
  areas: readonly Area[]
  tags: readonly Topic[]
  goals: readonly Goal[]
  detail: string
}

export const trailCourses: readonly TrailCourse[] = [
  { id: '1189299392', areas: ['business', 'data'], tags: ['decision', 'insights', 'show'], goals: ['apply', 'make'],
    detail: 'На курсе работают с CRM и веб-аналитикой и представляют данные в диаграммах и на картах. Это пригодится, когда команде нужно объяснить вывод и принять решение.' },
  { id: '1189299751', areas: ['human', 'language'], tags: ['observe', 'behavior', 'customers', 'meaning'], goals: ['research', 'apply'],
    detail: 'В программе есть включённое наблюдение, исследовательское интервью и анализ полевых материалов. Эти методы пригодятся, чтобы глубже разобраться в ответах клиентов.' },
  { id: '1189299929', areas: ['language', 'tech'], tags: ['nlp', 'meaning', 'customers'], goals: ['research', 'explore'],
    detail: 'Разберёшь, как контекст и интонация меняют смысл высказывания и помогают понять намерение собеседника.' },
  { id: '1189299825', areas: ['tech'], tags: ['ai', 'automation'], goals: ['make'],
    detail: 'Курс посвящён архитектуре и реализации ИИ-агентов на Python. Это технический вариант для тех, кто хочет собирать помощников.' },
  { id: '1189299647', areas: ['tech', 'art'], tags: ['ai', 'digital', 'idea'], goals: ['research', 'make'],
    detail: 'В лаборатории можно взять гуманитарную задачу, собрать цифровой прототип с помощью ИИ и оформить проект на GitHub.' },
  { id: '1189299807', areas: ['human', 'business'], tags: ['idea', 'creative', 'behavior'], goals: ['make', 'apply'],
    detail: 'Разберёшь, как возникают новые идеи, и попробуешь методы развития инновационного мышления. Это пригодится при поиске решений для продукта.' },
  { id: '1189299655', areas: ['language', 'data'], tags: ['structure', 'insights'], goals: ['research', 'explore'],
    detail: 'По примерам из незнакомых языков будешь находить закономерности и проверять догадки. Подготовка по лингвистике не требуется.' },
  { id: '1189299913', areas: ['art', 'language'], tags: ['stories', 'creative'], goals: ['make', 'explore'],
    detail: 'Разберёшь, как строят героя, сюжет и детали художественного текста, и познакомишься с техниками творческого письма.' },
  { id: '1189299687', areas: ['art', 'human'], tags: ['ads', 'behavior', 'customers'], goals: ['research', 'explore'],
    detail: 'Разберёшь, как визуальные образы рекламы и пропаганды воздействуют на аудиторию.' },
]

export function activeTags(state: TrailState): Topic[] {
  return [...new Set([...state.tags, ...state.own.flatMap(ownTags)])]
}

export type TrailMatch = {
  course: TrailCourse
  domains: Area[]
  tags: Topic[]
  goals: Goal[]
  score: number
  explore?: boolean
}

export function recommendTrail(state: TrailState): TrailMatch[] {
  const selectedTags = activeTags(state)
  const candidates: TrailMatch[] = trailCourses.map(course => {
    const domains = course.areas.filter(area => state.areas.includes(area))
    const tags = course.tags.filter(topic => selectedTags.includes(topic))
    const goals = course.goals.filter(goal => state.goals.includes(goal))
    const score = tags.length * 5 + domains.length * 3 + goals.length * 2
      + (state.priority && domains.includes(state.priority) ? 5 : 0)
    return { course, domains, tags, goals, score }
  }).sort((a, b) => b.score - a.score)

  const ranked = candidates.filter(item => item.domains.length || item.tags.length)
  const base = ranked.length ? ranked : candidates
  const selected: TrailMatch[] = []
  const covered = new Set<Area>()
  function add(item: TrailMatch) {
    selected.push(item)
    for (const area of item.domains) covered.add(area)
  }

  add(base[0])
  while (covered.size < state.areas.length) {
    const additional = base.filter(item => !selected.includes(item) && item.domains.some(area => !covered.has(area)))
    if (!additional.length) break
    const weight = (item: TrailMatch) => item.domains.filter(area => !covered.has(area)).length * 9 + item.score
    additional.sort((a, b) => weight(b) - weight(a))
    add(additional[0])
  }
  for (const item of base) {
    if (selected.length >= 3) break
    if (!selected.includes(item)) add(item)
  }

  if (state.wide) {
    const elsewhere = candidates.filter(item => !selected.includes(item) && item.course.areas.some(area => !state.areas.includes(area)))
    const next = elsewhere.find(item => item.domains.length || item.tags.length || item.goals.length)
      ?? elsewhere[0] ?? candidates.find(item => !selected.includes(item))
    if (next) selected.push({ ...next, explore: true })
  }
  return selected
}

export function trailReason({ course, tags, goals }: TrailMatch) {
  if (course.id === '1189299392' && tags.includes('show')) {
    return 'Чтобы объяснять результаты команде, можно пройти путь от данных CRM и веб-аналитики до наглядных графиков и карт.'
  }
  if (course.id === '1189299751' && tags.includes('customers')) {
    return 'Исследовательское интервью и наблюдение пригодятся, чтобы разбирать запросы клиентов и уточнять, что стоит за ответами.'
  }
  if (course.id === '1189299929' && tags.includes('nlp')) {
    return 'Интерес к NLP связан здесь с языком: в программе разбирают, как контекст и интонация помогают восстановить смысл реплики.'
  }
  if (course.id === '1189299807' && tags.includes('idea')) {
    return 'Если хочется придумывать продукты, можно попробовать психологические методы поиска и оценки новых идей.'
  }
  if (course.id === '1189299647' && goals.includes('make')) {
    return 'Свой проект можно построить вокруг гуманитарной задачи: собрать цифровой прототип с ИИ и оформить результат на GitHub.'
  }
  return course.detail
}
