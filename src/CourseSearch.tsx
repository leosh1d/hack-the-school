import { Box, Button, Flex, Grid, Heading, Input, Link, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useState, type FormEvent } from 'react'
import { CourseCard } from './CourseCard.tsx'
import { OfficialCourseCard } from './OfficialCourseCard.tsx'
import { courses } from './catalog.ts'
import { searchCourses } from './discovery.ts'
import { loadOfficialCourses, officialCatalogUrl, searchOfficialCourses, type OfficialCourse } from './officialCatalog.ts'

const pageSize = 6

export function CourseSearch({ browse = false }: { browse?: boolean }) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [official, setOfficial] = useState<readonly OfficialCourse[] | 'unavailable' | null>(null)
  const shouldLoad = browse || Boolean(query)
  const officialMatches = official && official !== 'unavailable'
    ? query ? searchOfficialCourses(official, query) : browse ? official : []
    : []
  const demoMatches = query ? searchCourses(courses, query) : browse ? courses : []
  const matchCount = demoMatches.length + officialMatches.length

  useEffect(() => {
    if (!shouldLoad) return
    let active = true
    void loadOfficialCourses().then(
      courses => { if (active) setOfficial(courses) },
      () => { if (active) setOfficial('unavailable') },
    )
    return () => { active = false }
  }, [shouldLoad])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(input.trim())
    setVisibleCount(pageSize)
  }

  return (
    <Stack gap="4">
      <Stack as="section" layerStyle="catalogSurface" p="4" gap="3" aria-labelledby="search-heading">
        <Heading as="h2" size="md" id="search-heading">{browse ? 'Найти курс' : 'Уточнить запрос'}</Heading>
        <chakra.form onSubmit={submit} role="search" aria-label="Поиск по каталогу факультативов" display="flex" alignItems="end" gap="2">
          <chakra.label display="grid" gap="1.5" minW="0" flex="1" fontSize="sm" fontWeight="semibold">
            Запрос по каталогу
            <Input
              type="search" value={input} onChange={event => setInput(event.target.value)}
              placeholder={browse ? 'Например, инфографика' : 'Например, интервью с клиентами'}
              maxLength={200} required minW="0" borderColor="catalog.border" fontWeight="normal"
            />
          </chakra.label>
          <Button type="submit" colorPalette="hse" variant="outline" disabled={!input.trim()}>Найти</Button>
        </chakra.form>
        <Flex gap="2" align="start" justify="space-between">
          <Box role="status" color="catalog.muted" fontSize="sm" overflowWrap="anywhere">
            {shouldLoad && official === null && <Text>Загружаем каталог ВШЭ…</Text>}
            {official === 'unavailable' && <Text>Каталог ВШЭ не загрузился. <Link href={officialCatalogUrl} color="hse.fg">Открыть на сайте ВШЭ</Link></Text>}
            {query && official !== null && official !== 'unavailable' && (
              <Text>{matchCount
                ? `Совпадений по запросу «${query}»: ${matchCount}.`
                : `По запросу «${query}» курсы не найдены. Попробуйте название темы или навыка.`}
              </Text>
            )}
          </Box>
          {query && <Button type="button" variant="plain" size="xs" p="0" color="hse.solid" onClick={() => {
            setInput('')
            setQuery('')
            setVisibleCount(pageSize)
          }}>Сбросить</Button>}
        </Flex>
      </Stack>
      {officialMatches.length > 0 && <Stack as="section" aria-labelledby="official-courses-heading" gap="3">
        <Flex align="center" justify="space-between" wrap="wrap" gap="2">
          <Heading as="h2" size="md" id="official-courses-heading">Курсы ВШЭ</Heading>
          <Text color="catalog.muted" fontSize="sm">Показано {Math.min(visibleCount, officialMatches.length)} из {officialMatches.length}</Text>
        </Flex>
        <Grid as="ul" role="list" layerStyle="catalogGrid">
          {officialMatches.slice(0, visibleCount).map(course => <Box as="li" key={course.id} minW="0"><OfficialCourseCard course={course} /></Box>)}
        </Grid>
        {visibleCount < officialMatches.length && (
          <Button type="button" colorPalette="hse" variant="outline" alignSelf={{ base: 'stretch', sm: 'start' }}
            onClick={() => setVisibleCount(current => current + pageSize)}
          >Показать ещё</Button>
        )}
      </Stack>}
      {demoMatches.length > 0 && <Stack as="section" aria-labelledby="demo-courses-heading" gap="3">
        <Heading as="h2" size="md" id="demo-courses-heading">Демокурсы</Heading>
        <Text color="catalog.muted" fontSize="sm">Даты, места и запись приведены для примера.</Text>
        <Grid as="ul" role="list" layerStyle="catalogGrid">
          {demoMatches.map(course => <Box as="li" key={course.id} minW="0"><CourseCard course={course} /></Box>)}
        </Grid>
      </Stack>}
    </Stack>
  )
}
