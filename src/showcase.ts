import { loadOfficialCourses, type OfficialCourse } from './officialCatalog.ts'
import { loadOfficialCourseThemes, topics, type Topic } from './officialRecommendations.ts'

export type Editorial = {
  theme: string
  teaser: string
  topics?: readonly string[]
  activities?: readonly string[]
  format?: string
  requirements?: string
  material?: { title: string; url: string }
}

export type ShowcaseCourse = {
  course: OfficialCourse
  tags: readonly Topic[]
  theme: string
  teaser: string
  contentSource?: string
  editorial?: Editorial
}

const featuredIds = [
  '1189299913', '1189299498', '1189299833', '1189299655',
  '1189299383', '1189299392', '1189299807', '1189299897',
  '1189299631', '1189299514', '1189299767', '1189299799',
]

const titleNotes: Record<string, string> = {
  '1189299530': 'По названию — проектирование и настройка ИИ-агентов без программирования.',
  '1189299727': 'По названию — основы Python и проектирование систем автоматизации.',
  '1189299825': 'По названию — архитектура и разработка ИИ-агентов на Python.',
}

const contentSources: Record<string, string> = {
  '1189299905': 'https://elearning.hse.ru/oncampus/strategic_analytics/',
}

export const interestExamples = {
  culture: 'Придумывать героев и сюжеты',
  language: 'Разгадывать закономерности незнакомых языков',
  business: 'Разбираться, как инвестируют в технологические компании',
  society: 'Понять, почему регионы России так отличаются',
  tech: 'Собирать инструменты с ИИ для повседневных задач',
  data: 'Объяснять данные с помощью инфографики',
  people: 'Понять, как появляются новые идеи',
  science: 'Рассказывать о науке со сцены',
} satisfies Record<Topic, string>

export async function loadShowcase(): Promise<ShowcaseCourse[]> {
  const [courses, themes, { default: data }, { default: notesData }] = await Promise.all([
    loadOfficialCourses(), loadOfficialCourseThemes(), import('./official-course-editorial.json'), import('./official-course-topic-notes.json'),
  ])
  const editorial: Record<string, Editorial> = data
  const notes: Record<string, string> = notesData
  const byId = new Map(courses.map(course => [course.id, course]))
  const ordered = [...featuredIds.flatMap(id => byId.get(id) ?? []), ...courses.filter(course => !featuredIds.includes(course.id))]
  return ordered.map(course => {
    const tags = themes[course.id]?.topics ?? []
    const details = editorial[course.id]
    const theme = details?.theme ?? topics[tags[0]] ?? 'Факультатив'
    const catalogTeaser = course.department
      ? `Подразделение по каталогу — ${course.department}.`
      : `Тематика по названию — ${theme}.`
    return {
      course, tags, theme, editorial: details, contentSource: contentSources[course.id],
      teaser: details?.teaser ?? notes[course.id] ?? titleNotes[course.id] ?? catalogTeaser,
    }
  })
}

export function browseWindow<T>(items: readonly T[], batch: number, size: number) {
  if (!items.length) return []
  const start = (batch * size) % items.length
  return [...items.slice(start), ...items.slice(0, start)].slice(0, size)
}

export function matchedTopics(item: ShowcaseCourse, interests: readonly Topic[]) {
  return interests.filter(topic => item.tags.includes(topic))
}

export function courseTopics(item: ShowcaseCourse) {
  return item.editorial?.topics?.join('. ') ?? item.teaser
}

export function courseActivities(item: ShowcaseCourse) {
  return item.editorial?.activities?.join('. ') ?? 'В доступных материалах нет разбора занятий.'
}

export function courseRequirements(item: ShowcaseCourse) {
  return item.editorial?.requirements ?? 'В доступных материалах нет опубликованных требований.'
}

export function courseFormat(item: ShowcaseCourse) {
  return item.editorial?.format ?? 'В доступных материалах формат не указан.'
}

export function courseHours({ course }: ShowcaseCourse) {
  const parts = [
    course.contactHours === undefined ? '' : `${course.contactHours} контактных ч`,
    course.onlineHours === undefined ? '' : `${course.onlineHours} онлайн-ч`,
  ].filter(Boolean)
  return parts.join(' · ') || 'В доступных материалах объём не указан.'
}

export function coursePeriod({ course }: ShowcaseCourse) {
  return [course.term, course.academicYear].filter(Boolean).join(' · ')
}

export function courseFacts(item: ShowcaseCourse) {
  return [
    ['Формат занятий', courseFormat(item)],
    ['Период', coursePeriod(item)],
    ['Язык', item.course.language ?? 'В доступных материалах язык не указан.'],
    ['Объём', courseHours(item)],
    ['Требования', courseRequirements(item)],
    ['Запись', 'Актуальные условия записи уточните на сайте ВШЭ.'],
  ] as const
}
