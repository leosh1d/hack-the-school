import { Box, Button, Container, Flex, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { CourseCard } from './CourseCard.tsx'
import { CourseSearch } from './CourseSearch.tsx'
import { ProfileForm } from './ProfileForm.tsx'
import { courses, demoDate } from './catalog.ts'
import { recommendCourses } from './discovery.ts'
import { emptySurvey, profileForSurvey, type SurveyDraft } from './survey.ts'

type View = 'profile' | 'results' | 'catalog'

const pageTitles = { profile: 'Факультативы ВШБ', results: 'Ваша подборка', catalog: 'Каталог факультативов' }
const pageDescriptions = {
  profile: 'Подберите факультативы по интересам, навыкам и условиям обучения.',
  results: 'Курсы с открытой записью, которые совпали с вашими интересами и условиями обучения.',
  catalog: 'Посмотрите все курсы прототипа, сравните формат и попробуйте задания.',
}

const markColors = ['hse.solid', 'gsb.solid', 'hse.solid', 'hse.300']
const patternColors = ['transparent', 'hse.100', 'hse.solid', 'transparent', 'gsb.50', 'transparent',
  'transparent', 'gsb.solid', 'hse.100', 'hse.solid', 'transparent', 'hse.solid']

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
    <Box minH="100dvh" bg="catalog.canvas" color="catalog.ink">
      <Box as="header" bg="catalog.surface" borderBottomWidth="1px" borderColor="catalog.border">
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

      <Container as="main" maxW="6xl" px={{ base: '3', sm: '6' }}>
        <Flex as="header" pt={{ base: '5', md: '9' }} pb={{ base: '4', md: '6' }} gap="6" align="center" justify="space-between">
          <Box>
            <Flex gap="2" align="center" color="catalog.muted" fontSize="xs" mb="2">
              <Box aria-hidden="true" boxSize="2" bg="gsb.solid" /> Hack the School · прототип
            </Flex>
            <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '5xl' }} letterSpacing="tight" _focusVisible={{ outline: 'none' }}>
              {pageTitles[view]}
            </Heading>
            <Text color="catalog.muted" fontSize={{ base: 'sm', md: 'md' }} mt="2" maxW="2xl" display={view === 'profile' ? { base: 'none', md: 'block' } : undefined}>
              {pageDescriptions[view]}
            </Text>
          </Box>
          {view === 'profile' && <Grid aria-hidden="true" display={{ base: 'none', md: 'grid' }} templateColumns="repeat(6, 1fr)" gap="1" w="44" flexShrink="0">
            {patternColors.map((bg, index) => (
              <Box key={index} aspectRatio="1" borderWidth="1px" borderColor={bg === 'transparent' ? 'catalog.border' : bg}
                bg={bg} borderRadius={index === 7 ? 'full' : undefined} borderTopRightRadius={index === 11 ? 'full' : undefined} />
            ))}
          </Grid>}
        </Flex>

        {view === 'profile' && <Grid gap="5" alignItems="start" templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
          <ProfileForm draft={survey} onChange={setSurvey} onSubmit={() => navigate('results')} />
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
          <Flex wrap="wrap" align="center" justify="space-between" gap="2">
            <Heading as="h2" size="md">Все курсы <Box as="span" ml="1" fontSize="sm" color="catalog.muted">{courses.length}</Box></Heading>
            <Button type="button" variant="plain" size="sm" p="0" color="hse.solid" onClick={() => navigate('profile')}>К анкете</Button>
          </Flex>
          <Grid as="ul" role="list" layerStyle="catalogGrid">
            {courses.map(course => <Box as="li" minW="0" key={course.id}><CourseCard course={course} /></Box>)}
          </Grid>
          <CourseSearch />
        </Stack>}
      </Container>

      <Container as="footer" maxW="6xl" px={{ base: '3', sm: '6' }} mt="8">
        <Flex justify="space-between" wrap="wrap" borderTopWidth="1px" borderColor="catalog.border" gap="2" py="4" color="catalog.muted" fontSize="xs">
          <span>Демоданные · 27 ноября 2026</span><span>Hack the School / ВШБ</span>
        </Flex>
      </Container>
    </Box>
  )
}

export default App
