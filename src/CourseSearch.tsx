import { Box, Button, Grid, Heading, Input, Stack, Text, chakra } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { CourseCard } from './CourseCard.tsx'
import { courses } from './catalog.ts'
import { searchCourses } from './discovery.ts'

export function CourseSearch() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const matches = query ? searchCourses(courses, query) : []

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(input.trim())
  }

  return (
    <Stack as="section" layerStyle="catalogSurface" p="4" gap="3" aria-labelledby="search-heading">
      <Heading as="h2" size="md" id="search-heading">Уточнить запрос</Heading>
      <chakra.form onSubmit={submit} role="search" aria-label="Поиск по демокаталогу" display="flex" alignItems="end" gap="2">
        <chakra.label display="grid" gap="1.5" minW="0" flex="1" fontSize="sm" fontWeight="semibold">
          Запрос по каталогу
          <Input type="search" value={input} onChange={event => setInput(event.target.value)} placeholder="Например, интервью с клиентами" maxLength={200} required minW="0" borderColor="catalog.border" fontWeight="normal" />
        </chakra.label>
        <Button type="submit" colorPalette="hse" variant="outline" disabled={!input.trim()}>Найти</Button>
      </chakra.form>
      <Box role="status" color="catalog.muted" fontSize="sm" overflowWrap="anywhere">
        {query && <Text>{matches.length ? `Совпадений по запросу «${query}»: ${matches.length}.` : `По запросу «${query}» курсы не найдены. Попробуйте название темы или навыка.`}</Text>}
      </Box>
      {matches.length > 0 && <Grid as="ul" role="list" layerStyle="catalogGrid">
        {matches.map(course => <Box as="li" key={course.id} minW="0"><CourseCard course={course} /></Box>)}
      </Grid>}
    </Stack>
  )
}
