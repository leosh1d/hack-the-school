import { Box, Button, Container, Flex, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { CourseCard } from './CourseCard.tsx'
import { CourseSearch } from './CourseSearch.tsx'
import { ProfileForm } from './ProfileForm.tsx'
import { courses, demoDate } from './catalog.ts'
import { recommendCourses } from './discovery.ts'
import { emptySurvey, profileForSurvey, type SurveyDraft } from './survey.ts'

type View = 'profile' | 'results' | 'catalog'

const pageTitles = { results: 'Ваша подборка', catalog: 'Каталог факультативов' }
const pageDescriptions = {
  results: 'Подборка по демокаталогу. Даты, места и условия записи приведены для примера.',
  catalog: 'Общеуниверситетские факультативы московского кампуса ВШЭ на 2026/2027 учебный год.',
}

const markColors = ['hse.solid', 'gsb.solid', 'hse.solid', 'hse.300']

function App() {
  const [view, setView] = useState<View>('profile')
  const [survey, setSurvey] = useState<SurveyDraft>(emptySurvey)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)

  useEffect(() => {
    if (focusHeading.current) {
      headingRef.current?.focus()
      focusHeading.current = false
    }
  }, [view])

  function navigate(nextView: View) {
    if (nextView === view) return
    focusHeading.current = true
    setView(nextView)
  }

  const recommendations = view === 'results' ? recommendCourses(courses, profileForSurvey(survey), demoDate) : []

  return (
    <Box display="flex" flexDirection="column" minH="100dvh" h={view === 'profile' ? { base: '100dvh', md: 'auto' } : undefined} bg="catalog.canvas" color="catalog.ink">
      <Box as="header" flexShrink="0" bg="catalog.surface" borderBottomWidth="1px" borderColor="catalog.border">
        <Container maxW="6xl" px={{ base: '3', sm: '6' }}>
          <Flex minH="15" align="center" justify="space-between" gap={{ base: '1', sm: '4' }}>
            <Button type="button" size="sm" variant="plain" p="0" color="catalog.ink" onClick={() => navigate('profile')}>
              <Grid aria-hidden="true" templateColumns="repeat(2, 6px)" gap="2px">
                {markColors.map((bg, index) => <Box key={index} boxSize="6px" bg={bg} borderTopRightRadius={index === 1 ? 'full' : undefined} />)}
              </Grid>
              Факультативы<Box as="span" display={{ base: 'none', sm: 'inline' }} color="catalog.muted">/ ВШБ</Box>
            </Button>
            <Flex as="nav" aria-label="Разделы" gap="1" align="stretch" alignSelf="stretch">
              {([
                { title: 'Подбор', target: 'profile', active: view !== 'catalog' },
                { title: 'Каталог', target: 'catalog', active: view === 'catalog' },
              ] as const).map(({ title, target, active }) => (
                <Button
                  key={target} type="button" variant="plain" size="sm" h="auto" px="2"
                  borderBottomWidth="2px" borderRadius="0" borderColor={active ? 'gsb.solid' : 'transparent'}
                  color={active ? 'hse.solid' : 'catalog.muted'} aria-current={active ? 'page' : undefined}
                  onClick={() => navigate(target)}
                >
                  {title}
                </Button>
              ))}
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container as="main" display="flex" flexDirection="column" flex="1" minH="0" maxW="6xl" px={{ base: '3', sm: '6' }}>
        {view !== 'profile' && <Box as="header" pt={{ base: '5', md: '9' }} pb={{ base: '4', md: '6' }}>
          <Flex gap="2" align="center" color="catalog.muted" fontSize="xs" mb="2">
            <Box aria-hidden="true" boxSize="2" bg="gsb.solid" /> Hack the School · прототип
          </Flex>
          <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '5xl' }} letterSpacing="tight" _focusVisible={{ outline: 'none' }}>
            {pageTitles[view]}
          </Heading>
          <Text color="catalog.muted" fontSize={{ base: 'sm', md: 'md' }} mt="2" maxW="2xl">
            {pageDescriptions[view]}
          </Text>
        </Box>}

        {view === 'profile' && <Grid
          flex="1" minH="0" gap="5" pt={{ base: '5', md: '9' }} alignItems={{ base: 'stretch', md: 'start' }}
          templateRows={{ base: 'minmax(0, 1fr)', md: 'auto' }}
          templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }}
        >
          <ProfileForm draft={survey} headingRef={headingRef} onChange={setSurvey} onSubmit={() => navigate('results')} />
          <Stack as="aside" layerStyle="catalogSurface" aria-labelledby="demo-heading" p="5" gap="2" display={{ base: 'none', lg: 'flex' }}>
            <Text fontWeight="semibold" fontSize="sm" color="gsb.fg">О каталоге</Text>
            <Heading as="h2" size="md" id="demo-heading">{courses.length} демофакультативов</Heading>
            <Text color="catalog.muted">Даты, нагрузка и места приведены для примера на 27 ноября 2026 года.</Text>
            <Button type="button" variant="plain" size="sm" p="0" alignSelf="start" color="hse.solid" onClick={() => navigate('catalog')}>
              Смотреть каталог <span aria-hidden="true">↗</span>
            </Button>
          </Stack>
        </Grid>}

        {view === 'results' && <Stack gap="4">
          <Flex wrap="wrap" align="center" justify="space-between" gap="2">
            <Heading as="h2" size="md">Рекомендации <Box as="span" ml="1" fontSize="sm" color="catalog.muted">{recommendations.length}</Box></Heading>
            <Button type="button" variant="plain" size="sm" p="0" color="hse.solid" onClick={() => navigate('profile')}>Изменить ответы</Button>
          </Flex>
          {recommendations.length > 0 ? (
            <Grid as="ol" role="list" layerStyle="catalogGrid">
              {recommendations.map(({ course, reasons }) => <Box as="li" minW="0" key={course.id}><CourseCard course={course} reasons={reasons} /></Box>)}
            </Grid>
          ) : (
            <Stack as="section" layerStyle="catalogSurface" p="5" gap="2">
              <Heading as="h3" size="md">Подходящих курсов пока нет</Heading>
              <Text color="catalog.muted">Увеличьте время на занятия, выберите другой формат или посмотрите весь каталог.</Text>
              <Button type="button" variant="plain" size="sm" p="0" alignSelf="start" color="hse.solid" onClick={() => navigate('catalog')}>
                Смотреть каталог <span aria-hidden="true">→</span>
              </Button>
            </Stack>
          )}
          <CourseSearch />
        </Stack>}

        {view === 'catalog' && <Stack gap="4">
          <CourseSearch browse />
        </Stack>}
      </Container>
    </Box>
  )
}

export default App
