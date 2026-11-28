import { languages } from './catalog.ts'
import type { OfficialCourse } from './officialCatalog.ts'

export const topics = {
  tech: 'Технологии и ИИ',
  data: 'Данные и математика',
  business: 'Бизнес и управление',
  society: 'Общество и международные отношения',
  culture: 'Культура и творчество',
  language: 'Языки и литература',
  science: 'Наука и здоровье',
  people: 'Личное развитие и работа с людьми',
} as const

export const skills = {
  automation: 'Автоматизация и ИИ',
  coding: 'Программирование',
  analysis: 'Анализ данных',
  product: 'Создание продуктов и проектов',
  communication: 'Коммуникация и презентации',
  research: 'Исследования',
} as const

export const modules = { '1': '1-й модуль', '2': '2-й модуль', '3': '3-й модуль', '4': '4-й модуль' } as const

export type Topic = keyof typeof topics
export type OfficialSkill = keyof typeof skills
export type Module = keyof typeof modules

export type OfficialPreferences = {
  topics: readonly Topic[]
  skills: readonly OfficialSkill[]
  maxContactHours: number | null
  modules: readonly Module[]
  languages: readonly (keyof typeof languages)[]
}

type OfficialCourseThemes = Readonly<Record<string, { topics: readonly Topic[]; skills: readonly OfficialSkill[] }>>

export async function loadOfficialCourseThemes(): Promise<OfficialCourseThemes> {
  const { default: themes } = await import('./official-course-themes.json')
  return themes as OfficialCourseThemes
}

function courseModules(term: string | undefined) {
  const moduleText = term?.match(/^([1-4][1-4,\s–—-]*)\s+модул(?:ь|я|и|ей)$/iu)?.[1]
  if (!moduleText) return []

  return moduleText.split(',').flatMap(part => {
    const [first, last = first] = part.trim().split(/\s*[-–—]\s*/u).map(Number)
    return Object.keys(modules).filter(module => Number(module) >= first && Number(module) <= last) as Module[]
  })
}

export function matchesConditions(course: OfficialCourse, profile: Pick<OfficialPreferences, 'maxContactHours' | 'modules' | 'languages'>) {
  if (profile.maxContactHours !== null && (course.contactHours === undefined || course.contactHours > profile.maxContactHours)) {
    return false
  }
  if (profile.languages.length && !profile.languages.some(language => languages[language].toLowerCase() === course.language?.toLowerCase())) {
    return false
  }
  if (!profile.modules.length) return true
  const requiredModules = courseModules(course.term)
  return requiredModules.length > 0 && requiredModules.every(module => profile.modules.includes(module))
}

export function recommendOfficialCourses(
  courses: readonly OfficialCourse[], themes: OfficialCourseThemes, profile: OfficialPreferences,
) {
  const matches = courses.flatMap(course => {
    const tags = themes[course.id]
    if (!tags || !matchesConditions(course, profile)) return []

    const matchingTopics = tags.topics.filter(topic => profile.topics.includes(topic))
    const matchingSkills = tags.skills.filter(skill => profile.skills.includes(skill))
    const reasons = [
      ...matchingTopics.map(topic => `Интерес — ${topics[topic]}`),
      ...matchingSkills.map(skill => `Навык — ${skills[skill]}`),
    ]
    return reasons.length ? [{ course, reasons }] : []
  })

  return matches.sort((first, second) => second.reasons.length - first.reasons.length)
}
