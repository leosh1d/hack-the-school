import { careers, classes, formats, levels, programs, skills, subjects, type Course, type StudentProfile } from './catalog.ts'

export type Recommendation = { course: Course; reasons: string[] }

export function isRegistrationOpen(course: Course, now: Date) {
  return course.available > 0 && now.getTime() < Date.parse(course.deadline)
}

const levelIndex = { start: 0, practice: 1, advanced: 2 }

function matchesPreferences(course: Course, profile: StudentProfile) {
  return (profile.maxHours === null || course.hours <= profile.maxHours)
    && (!profile.format || course.format === profile.format)
    && (!profile.classType || course.classType === profile.classType)
    && (!profile.language || course.language === profile.language)
}

export function recommendCourses(courses: readonly Course[], profile: StudentProfile, now: Date): Recommendation[] {
  const ranked = courses.flatMap(course => {
    if (!isRegistrationOpen(course, now) || !matchesPreferences(course, profile)) return []

    const matchingCareers = course.careers.filter(career => profile.careers.includes(career))
    const matchingSkills = course.skills.filter(skill => profile.skills.includes(skill))
    let score = matchingCareers.length * 4 + matchingSkills.length * 5
    if (!score) return []

    const reasons = [
      ...matchingCareers.map(career => `Карьерное направление — ${careers[career]}`),
      ...matchingSkills.map(skill => `Навык — ${skills[skill]}`),
    ]

    if (profile.level) {
      const difference = levelIndex[profile.level] - levelIndex[course.level]
      score += difference === 0 ? 3 : difference > 0 ? 1 : -2
      reasons.push(difference === 0 ? 'Совпадает с вашим уровнем' : `Уровень курса — ${levels[course.level].toLowerCase()}`)
    }

    const completed = course.prerequisites.filter(subject => profile.completed.includes(subject))
    const missing = course.prerequisites.filter(subject => !profile.completed.includes(subject))
    score += completed.length * 2 - missing.length * 2
    if (completed.length) reasons.push(`Вы уже изучали: ${completed.map(subject => subjects[subject]).join(', ')}`)
    if (missing.length) reasons.push(`Пригодятся основы: ${missing.map(subject => subjects[subject]).join(', ')}`)

    if (profile.program && course.programs.includes(profile.program)) {
      score += 1
      reasons.push(`Дополняет программу «${programs[profile.program]}»`)
    }
    if (profile.year && course.years.includes(profile.year)) {
      score += 1
      reasons.push(`Подходит студентам ${profile.year} курса`)
    }

    return [{ course, reasons, score }]
  })

  return ranked.sort((first, second) => second.score - first.score).map(({ course, reasons }) => ({ course, reasons }))
}

const commonWords = new Set(['мне', 'есть', 'хочу', 'найди', 'найти', 'курс', 'курсы', 'факультатив', 'факультативы', 'можно', 'нужен', 'нужны', 'что', 'для', 'как', 'чтобы', 'который', 'где', 'про', 'только'])
const languageWords = new Map<string, Course['language']>([
  ['английский', 'en'], ['английском', 'en'], ['english', 'en'],
  ['русский', 'ru'], ['русском', 'ru'], ['russian', 'ru'],
])

function keywords(text: string) {
  const words = text.toLowerCase().replaceAll('ё', 'е').match(/[\p{L}\p{N}]{3,}/gu) ?? []
  return [...new Set(words.filter(word => !commonWords.has(word)))]
}

export function searchCourses(courses: readonly Course[], query: string) {
  const terms = keywords(query)
  if (!terms.length) return []

  return courses.filter(course => {
    const catalogWords = new Set(keywords([
      course.title, course.description, course.keywords, formats[course.format], classes[course.classType],
      ...course.skills.map(skill => skills[skill]),
    ].join(' ')))
    return terms.every(term => {
      const language = languageWords.get(term)
      return language ? course.language === language : catalogWords.has(term)
    })
  })
}
