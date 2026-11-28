import { Box, Button, Container, Grid, Heading, Input, Link, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { InterestIllustration } from './InterestIllustration.tsx'
import { courses } from './catalog.ts'
import { ownInterestMaxLength } from './courseTrail.ts'
import { searchCourses } from './discovery.ts'
import { loadOfficialCourses, officialCatalogUrl, searchOfficialCourses, type OfficialCourse } from './officialCatalog.ts'

export const chatHash = '#/chat'

const prompts = [
  ['tech', 'ИИ-агенты'],
  ['data', 'Инфографика'],
  ['language', 'Лингвистика'],
] as const
const chatLimit = 5

export function CourseChat({ interests, queries, headingRef, onAsk, onAddInterest, onBack }: {
  interests: readonly string[]
  queries: readonly string[]
  headingRef: RefObject<HTMLHeadingElement | null>
  onAsk: (query: string) => void
  onAddInterest: (interest: string) => void
  onBack: () => void
}) {
  const [input, setInput] = useState('')
  const [catalog, setCatalog] = useState<readonly OfficialCourse[] | 'unavailable' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const hasQueries = queries.length > 0

  useEffect(() => {
    if (!hasQueries) return
    let active = true
    void loadOfficialCourses().then(
      items => { if (active) setCatalog(items) },
      () => { if (active) setCatalog('unavailable') },
    )
    return () => { active = false }
  }, [hasQueries])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [queries, catalog])

  function ask(text: string) {
    const query = text.trim().slice(0, ownInterestMaxLength)
    if (!query) return
    onAsk(query)
    setInput('')
    inputRef.current?.focus()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    ask(input)
  }

  return (
    <Stack as="main" gap="0" h="100dvh" minW="0" bg="catalog.canvas" color="catalog.ink">
      <Box as="header" flexShrink="0" bg="catalog.surface" borderBottomWidth="1px" borderColor="catalog.border">
        <Container maxW="3xl" px={{ base: '4', md: '6' }} py="2">
          <Button type="button" variant="plain" color="hse.fg" px="0" minH="12" onClick={onBack}>
            <span aria-hidden="true">←</span> К анкете
          </Button>
          <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: 'xl', md: '2xl' }} mb="1"
            _focusVisible={{ outline: 'none' }}>Чат по факультативам</Heading>
          <Text color="catalog.muted" fontSize="sm" mb="2">Поиск по каталогу ВШЭ и демоданным. Запросы остаются в браузере.</Text>
        </Container>
      </Box>

      <Box ref={bodyRef} flex="1" minH="0" overflowY="auto" overscrollBehavior="contain">
        <Container maxW="3xl" px={{ base: '4', md: '6' }} py={{ base: '6', md: '10' }}>
          {!hasQueries && (
            <Stack gap="4">
              <Heading as="h2" size={{ base: 'lg', md: 'xl' }}>Что хочется найти?</Heading>
              <Grid as="section" aria-label="Примеры запросов" gap="2" templateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }}>
                {prompts.map(([area, title]) => (
                  <Button key={area} type="button" colorPalette="hse" variant="outline" bg="catalog.surface"
                    borderColor="catalog.border" minH={{ base: '16', sm: '24' }} display="flex" gap="3" h="auto"
                    flexDirection={{ base: 'row', sm: 'column' }} justifyContent="start" alignItems={{ base: 'center', sm: 'start' }}
                    textAlign="start" whiteSpace="normal" px="3" py="2"
                    _hover={{ bg: 'hse.50', borderColor: 'hse.400' }}
                    _motionSafe={{ transition: 'background-color 150ms, scale 140ms', _active: { scale: '0.99' } }}
                    onClick={() => ask(title)}
                  >
                    <InterestIllustration area={area} /> {title}
                  </Button>
                ))}
              </Grid>
              <Text color="catalog.muted" fontSize="sm">Найди факультатив по теме или названию. Подходящий запрос можно учесть в подборке.</Text>
            </Stack>
          )}
          {hasQueries && <Stack gap="6" role="log" aria-label="Ответы по каталогу">
            {queries.map((query, index) => {
              const official = catalog && catalog !== 'unavailable' ? searchOfficialCourses(catalog, query) : []
              const demos = searchCourses(courses, query)
              return (
                <Stack key={index} gap="3" overflowWrap="anywhere">
                  <Text alignSelf="end" maxW="90%" px="4" py="2" bg="hse.100" borderRadius="xl">{query}</Text>
                  <Stack gap="3" layerStyle="catalogSurface" p="4">
                    {catalog === null && <Text color="catalog.muted" fontSize="sm">Ищем по каталогу ВШЭ…</Text>}
                    {catalog === 'unavailable' && <Text color="catalog.muted" fontSize="sm">
                      Каталог ВШЭ не загрузился. <Link href={officialCatalogUrl} color="hse.fg">Открыть каталог на сайте ВШЭ</Link>
                    </Text>}
                    {official.length > 0 && <Stack gap="2">
                      <Text color="catalog.muted" fontSize="sm">Курсы ВШЭ · {official.length}</Text>
                      <Stack as="ul" gap="2" listStyle="none">
                        {official.slice(0, chatLimit).map(course => (
                          <Stack as="li" key={course.id} gap="1" p="3" borderWidth="1px" borderColor="catalog.border" borderRadius="md">
                            <Text color="catalog.muted" fontSize="xs">{[course.campus, course.term].filter(Boolean).join(' · ')}</Text>
                            <Link href={course.url} target="_blank" rel="noreferrer" color="hse.fg" fontWeight="semibold" alignSelf="start">
                              {course.title} <Box as="span" aria-hidden="true">↗</Box>
                            </Link>
                          </Stack>
                        ))}
                      </Stack>
                      {official.length > chatLimit && <Text color="catalog.muted" fontSize="sm">
                        Показано {chatLimit} из {official.length}. <Link href={officialCatalogUrl} color="hse.fg">Смотреть каталог ВШЭ</Link>
                      </Text>}
                    </Stack>}
                    {demos.length > 0 && <Stack gap="2">
                      <Text color="catalog.muted" fontSize="sm">Демокурсы · {demos.length}</Text>
                      <Stack as="ul" gap="2" listStyle="none">
                        {demos.map(course => (
                          <Stack as="li" key={course.id} gap="1" p="3" bg="catalog.canvas" borderRadius="md">
                            <Text fontWeight="semibold">{course.title}</Text>
                            <Text color="catalog.muted" fontSize="sm">{course.description}</Text>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>}
                    {catalog !== null && catalog !== 'unavailable' && !official.length && !demos.length
                      && <Text>По этому запросу курсы не найдены.</Text>}
                    {interests.includes(query) ? (
                      <Text color="hse.fg" fontSize="sm" fontWeight="semibold">Учтено в подборке</Text>
                    ) : (
                      <Button type="button" variant="outline" colorPalette="hse" alignSelf="start" minH="12"
                        onClick={event => {
                          onAddInterest(query)
                          if (event.detail === 0) inputRef.current?.focus()
                        }}
                      >Учесть в подборке</Button>
                    )}
                  </Stack>
                </Stack>
              )
            })}
          </Stack>}
        </Container>
      </Box>

      <Box as="footer" flexShrink="0" bg="catalog.surface" borderTopWidth="1px" borderColor="catalog.border">
        <Container maxW="3xl" px={{ base: '4', md: '6' }} pt="3" pb="max(1rem, env(safe-area-inset-bottom))">
          <chakra.form onSubmit={submit} display="flex" alignItems="end" gap="2">
            <chakra.label display="grid" gap="1.5" minW="0" flex="1" fontSize="sm" fontWeight="semibold">
              Запрос по каталогу
              <Input ref={inputRef} value={input} onChange={event => setInput(event.target.value)} minH="12"
                placeholder="Например, инфографика" maxLength={ownInterestMaxLength} borderColor="catalog.border"
                fontSize="md" fontWeight="normal"
              />
            </chakra.label>
            <Button type="submit" minH="12" colorPalette="hse" disabled={!input.trim()}>Отправить</Button>
          </chakra.form>
        </Container>
      </Box>
    </Stack>
  )
}
