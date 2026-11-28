import { Box, Button, Flex, Heading, Link, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useState, type RefObject } from 'react'
import { OfficialCourseList } from './OfficialCourseList.tsx'
import { activeTags, areas, goals, ownTags, recommendTrail, topics, trailReason, type TrailState } from './courseTrail.ts'
import { loadOfficialCourses, officialCatalogUrl, type OfficialCourse } from './officialCatalog.ts'

const petersburg = 'Санкт-Петербургская школа гуманитарных наук и искусств'
const perm = {
  campus: 'Пермь',
  department: 'Кафедра гуманитарных дисциплин (Пермь)',
  faculty: 'Факультет социально-экономических и компьютерных наук',
}
const extraCourses: readonly OfficialCourse[] = [
  {
    id: '1189299751', title: 'Первый выход в поле: этнографические методы в гуманитарных и социальных науках',
    url: 'https://www.hse.ru/edu/courses/1189299751', campus: 'Санкт-Петербург', academicYear: '2026/2027',
    status: 'Общеуниверситетский факультатив', department: 'Департамент истории', faculty: petersburg,
    term: '3, 4 модуль', audience: 'для всех', language: 'русский', contactHours: 62, credits: 6,
  },
  {
    id: '1189299647', title: 'Лаборатория вайб-кодинга: программирование с искусственным интеллектом для гуманитарных исследований',
    url: 'https://www.hse.ru/edu/courses/1189299647', ...perm, academicYear: '2026/2027',
    status: 'Общеуниверситетский факультатив', term: '4 модуль', audience: 'для всех',
    language: 'русский', contactHours: 42, credits: 3,
  },
  {
    id: '1189299687', title: 'Манипуляция потребителем информации: реклама, пропаганда, социальные мифы',
    url: 'https://www.hse.ru/edu/courses/1189299687', ...perm, academicYear: '2026/2027',
    status: 'Общеуниверситетский факультатив', term: '3 модуль', audience: 'для всех',
    language: 'русский', contactHours: 48, credits: 3,
  },
]

export function Recommendations({ state, headingRef, onChange }: {
  state: TrailState
  headingRef: RefObject<HTMLHeadingElement | null>
  onChange: (state: TrailState) => void
}) {
  const [catalog, setCatalog] = useState<readonly OfficialCourse[] | 'unavailable' | null>(null)

  useEffect(() => {
    let active = true
    void loadOfficialCourses().then(
      courses => { if (active) setCatalog([...courses, ...extraCourses]) },
      () => { if (active) setCatalog('unavailable') },
    )
    return () => { active = false }
  }, [])

  const matches = catalog === null || catalog === 'unavailable' ? [] : recommendTrail(state).flatMap(match => {
    const course = catalog.find(item => item.id === match.course.id)
    if (!course) return []
    const reasons = [
      ...[...match.tags.map(tag => topics[tag]), ...match.domains.map(area => areas[area][0])].slice(0, 2),
      ...match.goals.slice(0, 1).map(goal => goals[goal]),
    ]
    return [{ course, reasons, summary: trailReason(match), discovery: match.explore }]
  })
  const unmatched = state.own.filter(word => !ownTags(word).length)
  const hasAnswers = state.areas.length > 0 || state.goals.length > 0 || activeTags(state).length > 0

  return (
    <Stack gap="4" pb="4">
      <Flex gap="2" justify="space-between" flexWrap="wrap">
        <Button type="button" variant="plain" px="0" minH="12" color="hse.fg" onClick={() => onChange({ ...state, stage: state.from })}>
          <span aria-hidden="true">←</span> Назад
        </Button>
        <Button type="button" variant="plain" px="0" minH="12" color="hse.fg" onClick={() => onChange({ ...state, stage: 'areas' })}>
          Изменить интересы
        </Button>
      </Flex>
      <Box>
        <Text fontWeight="semibold" color="gsb.fg" fontSize="sm" mb="1">Общеуниверситетские факультативы · 2026/2027</Text>
        <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '5xl' }} _focusVisible={{ outline: 'none' }}>
          Твоя подборка
        </Heading>
      </Box>
      {unmatched.length > 0 && <Text color="catalog.muted" overflowWrap="anywhere">
        Для интересов «{unmatched.join('», «')}» пока нет совпадений среди тем подборки.
        {hasAnswers ? ' Ниже — варианты по остальным ответам.' : ' Ниже — курсы для знакомства.'}
      </Text>}
      <Flex role="group" aria-label="Режим подборки" gap="2" flexWrap="wrap">
        {([['По выбранному', false], ['Добавить открытие', true]] as const).map(([label, wide]) => (
          <Button key={label} type="button" colorPalette="hse" minH="12"
            variant={wide === state.wide ? 'solid' : 'outline'} aria-pressed={wide === state.wide}
            onClick={() => onChange({ ...state, wide })}
          >{label}</Button>
        ))}
      </Flex>
      {catalog === null && <Text role="status" color="catalog.muted">Загружаем подборку…</Text>}
      {catalog === 'unavailable' && <Text role="alert" color="catalog.muted">
        Подборка не загрузилась. <Link href={officialCatalogUrl} color="hse.fg" textDecoration="underline">Открыть каталог ВШЭ</Link>
      </Text>}
      {matches.length > 0 && <OfficialCourseList heading="Рекомендации" items={matches} />}
      {activeTags(state).includes('nlp') && (
        <chakra.details layerStyle="catalogSurface" p="4">
          <chakra.summary color="hse.fg" cursor="pointer" fontWeight="semibold">Профильные курсы ФКН по NLP</chakra.summary>
          <Text color="catalog.muted" mt="2">Актуальный набор и доступность уточни в каталоге ФКН.</Text>
          <Link href="https://cs.hse.ru/electives" target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline">Каталог ФКН</Link>
        </chakra.details>
      )}
    </Stack>
  )
}
