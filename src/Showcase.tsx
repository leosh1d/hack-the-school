import { Box, Button, Card, Collapsible, Flex, Grid, Heading, Input, Stack, Text, chakra } from '@chakra-ui/react'
import { useId, useState, type FormEvent, type RefObject } from 'react'
import { languages } from './catalog.ts'
import { searchOfficialCourses } from './officialCatalog.ts'
import { matchesConditions, modules, topics, type Module, type Topic } from './officialRecommendations.ts'
import { browseWindow, interestExamples, matchedTopics, type ShowcaseCourse } from './showcase.ts'

type Language = keyof typeof languages

function toggle<Key>(items: readonly Key[], item: Key) {
  return items.includes(item) ? items.filter(value => value !== item) : [...items, item]
}

export function CoursePreview({ item, saved, note, onOpen, onSave }: {
  item: ShowcaseCourse
  saved: boolean
  note?: string
  onOpen: () => void
  onSave: () => void
}) {
  const headingId = useId()
  return (
    <Card.Root as="article" aria-labelledby={headingId} layerStyle="catalogSurface" minW="0" h="full">
      <Card.Body px="4" py="4" gap="2">
        <Text color="gsb.fg" fontSize="sm" fontWeight="semibold">{item.theme}</Text>
        <Card.Title as="h2" id={headingId} overflowWrap="anywhere">{item.course.title}</Card.Title>
        <Card.Description color="catalog.muted">{item.teaser}</Card.Description>
        {note && <Text color="hse.fg" fontSize="sm" fontWeight="semibold">{note}</Text>}
      </Card.Body>
      <Card.Footer px="4" pt="0" pb="4" gap="2" flexWrap="wrap">
        <Button type="button" colorPalette="hse" minH="12" onClick={onOpen}>Что внутри</Button>
        <Button type="button" colorPalette="hse" variant={saved ? 'subtle' : 'outline'} minH="12" aria-pressed={saved} onClick={onSave}>
          {saved ? 'Отложено' : 'Отложить'}
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}

export function Showcase({ data, unavailable, savedIds, headingRef, onOpen, onSave }: {
  data: readonly ShowcaseCourse[] | null
  unavailable: boolean
  savedIds: readonly string[]
  headingRef?: RefObject<HTMLHeadingElement | null>
  onOpen: (id: string, reason?: string) => void
  onSave: (id: string) => void
}) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [selectedModules, setModules] = useState<Module[]>([])
  const [selectedLanguages, setLanguages] = useState<Language[]>([])
  const [browseAll, setBrowseAll] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)
  const [batch, setBatch] = useState(0)
  const [interests, setInterests] = useState<Topic[]>([])
  const [draft, setDraft] = useState<Topic[]>([])
  const [showQuestion, setShowQuestion] = useState(false)
  const [questionPage, setQuestionPage] = useState(0)

  const candidates = (data ?? []).filter(item => matchesConditions(item.course, {
    maxContactHours: null, modules: selectedModules, languages: selectedLanguages,
  }))
  const byId = new Map(candidates.map(item => [item.course.id, item]))
  const found = query ? searchOfficialCourses(candidates.map(item => item.course), query, course => {
    const item = byId.get(course.id)
    return [item?.theme, item?.teaser, ...(item?.editorial?.topics ?? []), ...(item?.editorial?.activities ?? [])].join(' ')
  }).flatMap(course => byId.get(course.id) ?? []) : candidates

  const personalized = !query && !browseAll && interests.length > 0
  const plainList = Boolean(query || browseAll || (!personalized && (selectedModules.length || selectedLanguages.length)))
  const related = personalized
    ? found.filter(item => matchedTopics(item, interests).length > 0)
      .sort((a, b) => matchedTopics(b, interests).length - matchedTopics(a, interests).length)
    : []
  const contrast = personalized ? browseWindow(found.filter(item => !matchedTopics(item, interests).length), batch, 1)[0] : undefined
  const visible = personalized
    ? [...browseWindow(related, batch, contrast ? 3 : 4), ...(contrast ? [contrast] : [])]
    : plainList ? found.slice(0, visibleCount) : browseWindow(found, batch, 4)
  const examples = [...new Set([...browseWindow(Object.keys(interestExamples) as Topic[], questionPage, 4), ...draft])]

  function resetBatch() {
    setVisibleCount(6)
    setBatch(0)
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(input.trim())
    setBrowseAll(false)
    resetBatch()
  }

  function editInterests() {
    setDraft(interests)
    setQuestionPage(0)
    setShowQuestion(true)
  }

  function applyInterests(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInterests(draft)
    setShowQuestion(false)
    setInput('')
    setQuery('')
    setBrowseAll(false)
    resetBatch()
  }

  return (
    <Stack gap="5">
      <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '5xl' }} letterSpacing="tight" _focusVisible={{ outline: 'none' }}>
        Что хочется попробовать?
      </Heading>
      <Stack gap="3">
        <chakra.form onSubmit={submitSearch} role="search" aria-label="Поиск факультативов" display="flex" gap="2">
          <Input
            type="search" aria-label="Поиск по курсам" value={input}
            onChange={event => {
              setInput(event.target.value)
              if (!event.target.value) { setQuery(''); resetBatch() }
            }}
            placeholder="Например, письмо или инфографика" bg="catalog.surface" minH="12" minW="0" maxLength={200}
          />
          <Button type="submit" colorPalette="hse" minH="12">Найти</Button>
        </chakra.form>
        <Collapsible.Root>
          <Flex wrap="wrap" gap="2">
            <Collapsible.Trigger asChild>
              <Button type="button" variant="outline" minH="12" colorPalette="hse">
                Фильтры{selectedModules.length + selectedLanguages.length > 0 && ` · ${selectedModules.length + selectedLanguages.length}`}
              </Button>
            </Collapsible.Trigger>
            <Button type="button" variant="plain" minH="12" px="2" color="hse.fg"
              aria-expanded={showQuestion} aria-controls={showQuestion ? 'interest-question' : undefined}
              onClick={showQuestion ? () => setShowQuestion(false) : editInterests}
            >Помоги нащупать интерес</Button>
          </Flex>
          <Collapsible.Content>
            <Stack layerStyle="catalogSurface" mt="3" p="4" gap="3">
              <chakra.fieldset minW="0">
                <chakra.legend fontWeight="semibold" mb="2">Модули</chakra.legend>
                <Text mb="2" color="catalog.muted" fontSize="sm">Курс должен целиком проходить в выбранных модулях.</Text>
                <Flex wrap="wrap" gap="2">
                  {(Object.keys(modules) as Module[]).map(module => (
                    <Button key={module} type="button" variant={selectedModules.includes(module) ? 'subtle' : 'outline'}
                      minH="12" aria-pressed={selectedModules.includes(module)}
                      onClick={() => { setModules(current => toggle(current, module)); resetBatch() }}
                    >{modules[module]}</Button>
                  ))}
                </Flex>
              </chakra.fieldset>
              <chakra.fieldset minW="0">
                <chakra.legend fontWeight="semibold" mb="2">Язык</chakra.legend>
                <Flex wrap="wrap" gap="2">
                  {(Object.keys(languages) as Language[]).map(language => (
                    <Button key={language} type="button" variant={selectedLanguages.includes(language) ? 'subtle' : 'outline'}
                      minH="12" aria-pressed={selectedLanguages.includes(language)}
                      onClick={() => { setLanguages(current => toggle(current, language)); resetBatch() }}
                    >{languages[language]}</Button>
                  ))}
                </Flex>
              </chakra.fieldset>
              {(selectedModules.length > 0 || selectedLanguages.length > 0) && (
                <Button type="button" variant="plain" alignSelf="start" px="0" color="hse.fg" onClick={() => {
                  setModules([]); setLanguages([]); resetBatch()
                }}>Сбросить фильтры</Button>
              )}
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      </Stack>

      {showQuestion && (
        <chakra.form id="interest-question" onSubmit={applyInterests} layerStyle="catalogSurface" p="4">
          <chakra.fieldset minW="0">
            <chakra.legend fontSize="lg" fontWeight="semibold" mb="1">Что вам было бы любопытно попробовать?</chakra.legend>
            <Text color="catalog.muted" fontSize="sm" mb="3">Можно отметить несколько вариантов.</Text>
            <Grid gap="2" templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}>
              {examples.map(topic => (
                <chakra.label key={topic} display="flex" alignItems="center" gap="3" minH="12" px="3" py="2"
                  borderWidth="1px" borderColor={draft.includes(topic) ? 'hse.solid' : 'catalog.border'}
                  borderRadius="md" bg={draft.includes(topic) ? 'hse.100' : 'catalog.surface'} cursor="pointer"
                >
                  <chakra.input type="checkbox" checked={draft.includes(topic)}
                    onChange={() => setDraft(current => toggle(current, topic))} boxSize="4" flexShrink="0" accentColor="hse.solid"
                  />
                  {interestExamples[topic]}
                </chakra.label>
              ))}
            </Grid>
          </chakra.fieldset>
          <Flex wrap="wrap" gap="2" mt="4">
            <Button type="submit" colorPalette="hse" minH="12" disabled={!draft.length}>Показать варианты</Button>
            <Button type="button" variant="outline" colorPalette="hse" minH="12" onClick={() => setQuestionPage(current => current + 1)}>Показать другое</Button>
            <Button type="button" variant="plain" minH="12" onClick={() => setShowQuestion(false)}>Вернуться к просмотру</Button>
          </Flex>
        </chakra.form>
      )}

      {interests.length > 0 && (
        <Stack layerStyle="catalogSurface" p="4" gap="2">
          <Text fontWeight="semibold">Отмеченные темы — {interests.map(topic => topics[topic]).join(', ')}</Text>
          {personalized && <Text color="catalog.muted" fontSize="sm">
            {related.length ? 'Подобрали курсы по отмеченным темам.' : 'По отмеченным темам с этими фильтрами совпадений нет.'}
            {contrast && ' Добавили вариант из другой области.'}
          </Text>}
          <Flex gap="4" wrap="wrap">
            <Button type="button" variant="plain" p="0" color="hse.fg" onClick={editInterests}>Изменить интересы</Button>
            <Button type="button" variant="plain" p="0" color="hse.fg" onClick={() => { setInterests([]); resetBatch() }}>Очистить интересы</Button>
          </Flex>
        </Stack>
      )}

      {visible.length > 0 ? (
        <Stack as="section" aria-label={query ? 'Результаты поиска' : 'Варианты курсов'} gap="3">
          {plainList && <Text role="status" color="catalog.muted" fontSize="sm">Показано {visible.length} из {found.length}</Text>}
          <Grid as="ul" role="list" layerStyle="catalogGrid">
            {visible.map(item => {
              const reason = personalized && item !== contrast
                ? `По интересу — ${matchedTopics(item, interests).map(topic => topics[topic]).join(', ')}`
                : undefined
              return <Box as="li" minW="0" key={item.course.id}>
                <CoursePreview item={item} saved={savedIds.includes(item.course.id)}
                  note={item === contrast ? 'Другое направление' : reason}
                  onOpen={() => onOpen(item.course.id, reason)} onSave={() => onSave(item.course.id)}
                />
              </Box>
            })}
          </Grid>
          <Flex gap="2" wrap="wrap">
            {plainList ? visible.length < found.length && (
              <Button type="button" minH="12" variant="outline" colorPalette="hse" onClick={() => setVisibleCount(count => count + 6)}>Показать ещё</Button>
            ) : found.length > visible.length && (
              <Button type="button" minH="12" variant="outline" colorPalette="hse" onClick={() => setBatch(current => current + 1)}>Показать другие направления</Button>
            )}
            {!plainList && <Button type="button" minH="12" variant="plain" color="hse.fg" onClick={() => {
              setBrowseAll(true); resetBatch()
            }}>Смотреть все курсы</Button>}
            {browseAll && <Button type="button" minH="12" variant="plain" color="hse.fg" onClick={() => {
              setBrowseAll(false); resetBatch()
            }}>Вернуться к направлениям</Button>}
          </Flex>
        </Stack>
      ) : (
        <Text role="status" color="catalog.muted">
          {unavailable ? 'Каталог ВШЭ не загрузился.' : data ? 'Совпадений нет. Измените запрос или фильтры.' : 'Загружаем факультативы…'}
        </Text>
      )}
    </Stack>
  )
}
