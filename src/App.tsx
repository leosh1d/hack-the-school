import { Box, Button, Container, Flex, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { CourseSearch } from './CourseSearch.tsx'
import { ProfileForm } from './ProfileForm.tsx'
import { Recommendations } from './Recommendations.tsx'
import { emptySurvey, profileForSurvey, type SurveyDraft } from './survey.ts'

type View = 'profile' | 'results' | 'catalog'

const pageTitles = { results: 'Ваша подборка', catalog: 'Каталог факультативов' }
const pageDescriptions = {
  results: 'Факультативы ВШЭ по вашим интересам, навыкам и условиям.',
  catalog: 'Общеуниверситетские факультативы московского кампуса ВШЭ на 2026/2027 учебный год.',
}

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

  return (
    <Box display="flex" flexDirection="column" minH="100dvh" h={view === 'profile' ? { base: '100dvh', md: 'auto' } : undefined} bg="catalog.canvas" color="catalog.ink">
      <Box as="header" flexShrink="0" bg="catalog.surface" borderBottomWidth="1px" borderColor="catalog.border">
        <Grid as="nav" aria-label="Разделы" w="full" templateColumns="repeat(2, minmax(0, 1fr))">
          {([
            { title: 'Подбор', target: 'profile', active: view !== 'catalog' },
            { title: 'Каталог', target: 'catalog', active: view === 'catalog' },
          ] as const).map(({ title, target, active }) => (
            <Button
              key={target} type="button" variant="plain" size="sm" minH="12" justifyContent="center"
              borderBottomWidth="2px" borderRadius="0" borderBottomColor={active ? 'gsb.solid' : 'transparent'}
              color={active ? 'hse.solid' : 'catalog.muted'} focusVisibleRing="inside"
              aria-current={active ? 'page' : undefined} onClick={() => navigate(target)}
            >
              {title}
            </Button>
          ))}
        </Grid>
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
          <Stack as="aside" layerStyle="catalogSurface" aria-labelledby="catalog-heading" p="5" gap="2" display={{ base: 'none', lg: 'flex' }}>
            <Text fontWeight="semibold" fontSize="sm" color="gsb.fg">О каталоге</Text>
            <Heading as="h2" size="md" id="catalog-heading">Факультативы ВШЭ</Heading>
            <Text color="catalog.muted">Москва · 2026/2027 учебный год</Text>
            <Button type="button" variant="plain" size="sm" p="0" alignSelf="start" color="hse.solid" onClick={() => navigate('catalog')}>
              Смотреть каталог <span aria-hidden="true">↗</span>
            </Button>
          </Stack>
        </Grid>}

        {view === 'results' && <Stack gap="4">
          <Recommendations preferences={profileForSurvey(survey)} onEdit={() => navigate('profile')} onBrowse={() => navigate('catalog')} />
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
