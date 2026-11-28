import { expect, test } from 'vitest'
import { cleanTrail, emptyTrail, recommendTrail, trailSteps, type Area, type TrailState } from './courseTrail.ts'

test('считает 5 за тему, 3 за область, 2 за цель и 5 за приоритет', () => {
  const state: TrailState = {
    ...emptyTrail(), areas: ['business', 'data'], tags: ['decision', 'show'],
    goals: ['make', 'apply'], priority: 'business', own: ['визуализация'], wide: false,
  }
  const [first] = recommendTrail(state)
  expect(first.course.id).toBe('1189299392')
  expect(first.tags).toEqual(['decision', 'show'])
  expect(first.score).toBe(25)
})

test('покрывает выбранные направления и добавляет отдельное открытие', () => {
  const selected: Area[] = ['business', 'human', 'tech', 'art', 'language', 'data']
  const state: TrailState = {
    ...emptyTrail(), areas: selected, tags: ['ai', 'show', 'observe'], goals: ['make'], priority: 'tech', wide: false,
  }
  const narrow = recommendTrail(state)
  const covered = new Set(narrow.flatMap(item => item.domains))
  expect(covered).toEqual(new Set(selected))
  const wide = recommendTrail({ ...state, wide: true })
  expect(wide.slice(0, -1)).toEqual(narrow)
  expect(wide.at(-1)?.explore).toBe(true)
  expect(new Set(wide.map(item => item.course.id)).size).toBe(wide.length)
})

test('снимает недоступные уточнения и приоритет при изменении направлений', () => {
  const state = cleanTrail({
    ...emptyTrail(), areas: ['language'], tags: ['ai', 'ml', 'nlp', 'structure'], priority: 'tech', from: 'tech',
  })
  expect(state.tags).toEqual(['nlp', 'structure'])
  expect(state.priority).toBe('')
  expect(state.from).toBe('areas')
  expect(trailSteps(state)).toEqual(['areas', 'language', 'goals'])
})
