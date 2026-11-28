import { languages } from './catalog.ts'
import { catalogSearchWords, searchLanguageAliases } from './discovery.ts'

export type OfficialCourse = {
  id: string
  title: string
  url: string
  campus: string
  academicYear: string
  status: string
  department?: string
  faculty?: string
  term?: string
  audience?: string
  language?: string
  contactHours?: number
  onlineHours?: number
  credits?: number
}

export const officialCatalogUrl = 'https://www.hse.ru/edu/courses/?filial=22723&words=&full_words=&flag=ignore&year=2026&level=&language=&status=5&audience_scope='

export async function loadOfficialCourses(): Promise<readonly OfficialCourse[]> {
  const { default: courses } = await import('./official-courses.json')
  return courses
}

export function searchOfficialCourses(courses: readonly OfficialCourse[], query: string, extraText?: (course: OfficialCourse) => string) {
  const terms = catalogSearchWords(query, 2)
  if (!terms.length) return []

  return courses.filter(course => {
    const words = catalogSearchWords([
      course.title, course.department, course.faculty, course.status, course.campus, course.academicYear, course.language,
      extraText?.(course),
    ].join(' '), 2)
    return terms.every(term => {
      const language = searchLanguageAliases.get(term)
      return language
        ? course.language?.toLowerCase() === languages[language].toLowerCase()
        : words.some(word => word.startsWith(term))
    })
  })
}
