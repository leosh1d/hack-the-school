import { expect, test } from 'vitest'
import { courses, emptyProfile, type Course } from './catalog.ts'
import { recommendCourses, searchCourses } from './discovery.ts'

const now = new Date('2026-11-27T12:00:00+03:00')
const research: Course = {
  id: 'research', title: 'Интервью с клиентами', description: 'Разбор интервью',
  careers: ['product'], skills: ['research'], level: 'start', hours: 2,
  format: 'online', classType: 'seminar', language: 'ru', prerequisites: [],
  programs: [], years: [], deadline: '2026-12-15T23:59:00+03:00', capacity: 30, available: 8,
  keywords: 'качественная обратная связь',
  quiz: { question: 'Что спросить?', options: ['Что делали?', 'Купили бы?'], correct: 0, explanation: 'Прошлый опыт даёт примеры.' },
}
const experiments: Course = {
  ...research, id: 'experiments', title: 'Эксперименты', skills: ['experiments'],
}

test('поднимает курс с совпадением цели и навыка и объясняет оба совпадения', () => {
  const recommendations = recommendCourses([experiments, research], {
    ...emptyProfile, careers: ['product'], skills: ['research'],
  }, now)

  expect(recommendations.map(({ course }) => course.id)).toEqual(['research', 'experiments'])
  expect(recommendations[0]?.reasons.join(' ')).toMatch(/Управление продуктом.*Исследование клиентов/)
})

test('показывает совпадение до дедлайна и исключает его в момент окончания записи', () => {
  const profile = { ...emptyProfile, skills: ['research'] } satisfies typeof emptyProfile
  expect(recommendCourses([research], profile, new Date('2026-12-15T23:58:59+03:00'))).toHaveLength(1)
  expect(recommendCourses([research], profile, new Date('2026-12-15T23:59:00+03:00'))).toEqual([])
})

test('возвращает пустую подборку, когда совпадающий курс выходит за рамки анкеты', () => {
  expect(recommendCourses([research], { ...emptyProfile, careers: ['product'], formats: ['campus'] }, now)).toEqual([])
  expect(recommendCourses([research], { ...emptyProfile, skills: ['research'], maxHours: 1 }, now)).toEqual([])
  expect(recommendCourses([research], { ...emptyProfile, skills: ['sql'] }, now)).toEqual([])
})

test('фильтрует по одному выбранному условию и сохраняет все совпадения при выборе обоих', () => {
  const profile = { ...emptyProfile, skills: ['research'] } satisfies typeof emptyProfile
  const campusLecture = { ...research, id: 'campus-lecture', format: 'campus', classType: 'lecture', language: 'en' } satisfies Course
  const matches = (preferences: Partial<typeof emptyProfile>) => (
    recommendCourses([research, campusLecture], { ...profile, ...preferences }, now).map(({ course }) => course.id)
  )

  expect(matches({})).toEqual(['research', 'campus-lecture'])
  expect(matches({ formats: ['online'] })).toEqual(['research'])
  expect(matches({ classTypes: ['lecture'] })).toEqual(['campus-lecture'])
  expect(matches({ languages: ['ru'] })).toEqual(['research'])
  expect(matches({
    formats: ['online', 'campus'], classTypes: ['lecture', 'seminar'], languages: ['ru', 'en'],
  })).toEqual(['research', 'campus-lecture'])
})

test.each(['нейросети в бизнесе', 'визуальная культура', 'SQL на английском'])(
  'не подменяет полный запрос «%s» совпадением по одному слову',
  query => expect(searchCourses(courses, query)).toEqual([]),
)

test('находит курс по теме и проверяет указанный язык обучения', () => {
  expect(searchCourses(courses, 'интервью с клиентами').map(course => course.id)).toEqual(['interviews'])
  expect(searchCourses(courses, 'курс по SQL').map(course => course.id)).toEqual(['data', 'sql'])
  expect(searchCourses(courses, 'презентации на английском').map(course => course.id)).toEqual(['presentation'])
})

test('показывает все совпадения в порядке каталога', () => {
  expect(searchCourses(courses, 'семинары').map(course => course.id)).toEqual([
    'data', 'interviews', 'experiments', 'finance', 'presentation', 'sql',
  ])
})
