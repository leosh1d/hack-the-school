import { expect, test } from 'vitest'
import type { OfficialCourse } from './officialCatalog.ts'
import { recommendOfficialCourses } from './officialRecommendations.ts'
import { emptySurvey } from './survey.ts'

const first: OfficialCourse = {
  id: 'first', title: 'Курс в двух модулях', url: 'https://www.hse.ru/edu/courses/1',
  campus: 'Москва', academicYear: '2026/2027', status: 'Общеуниверситетский факультатив',
  term: '3, 4 модуль', contactHours: 40, language: 'русский',
}
const second: OfficialCourse = {
  ...first, id: 'second', title: 'Курс в четырёх модулях', url: 'https://www.hse.ru/edu/courses/2',
  term: '1-4 модуль', contactHours: 80, language: 'английский',
}
const themes = {
  first: { topics: ['tech'], skills: ['coding'] },
  second: { topics: ['tech'], skills: [] },
} as const

test('допускает курс, только если выбраны все его модули из списка или диапазона', () => {
  const profile = { ...emptySurvey.profile, topics: ['tech'] } as const
  const courses = [first, second]
  expect(recommendOfficialCourses(courses, themes, { ...profile, modules: ['4'] })).toEqual([])
  expect(recommendOfficialCourses(courses, themes, { ...profile, modules: ['1', '3', '4'] }).map(({ course }) => course.id))
    .toEqual(['first'])
  expect(recommendOfficialCourses(courses, themes, { ...profile, modules: ['1', '2', '3', '4'] })).toHaveLength(2)
  expect(recommendOfficialCourses(courses, themes, profile)).toHaveLength(2)
})

test('учитывает суммарные контактные часы и выбранные языки', () => {
  const profile = { ...emptySurvey.profile, topics: ['tech'] } as const
  const courses = [first, second]
  expect(recommendOfficialCourses(courses, themes, { ...profile, maxContactHours: 40 }).map(({ course }) => course.id))
    .toEqual(['first'])
  expect(recommendOfficialCourses(courses, themes, { ...profile, maxContactHours: 40, languages: ['en'] })).toEqual([])
  expect(recommendOfficialCourses(courses, themes, { ...profile, maxContactHours: 80, languages: ['en'] }).map(({ course }) => course.id))
    .toEqual(['second'])
  expect(recommendOfficialCourses(courses, themes, { ...profile, languages: ['ru', 'en'] })).toHaveLength(2)
})

test('поднимает совпадение темы и навыка и сохраняет порядок источника при равенстве', () => {
  const other = { ...second, id: 'other' }
  const profile = { ...emptySurvey.profile, topics: ['tech'], skills: ['coding'] } as const
  const ranked = recommendOfficialCourses([second, first, other], { ...themes, other: themes.second }, profile)

  expect(ranked.map(({ course }) => course.id)).toEqual(['first', 'second', 'other'])
  expect(ranked[0]?.reasons).toEqual(['Интерес — Технологии и ИИ', 'Навык — Программирование'])
})
