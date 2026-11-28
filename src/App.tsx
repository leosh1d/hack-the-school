import { Box, Button, Container, Flex } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { CourseComparison, CourseDetails, SavedCourses } from './CourseWorkspace.tsx'
import { Showcase } from './Showcase.tsx'
import { loadShowcase, type ShowcaseCourse } from './showcase.ts'

type View =
  | { kind: 'browse' }
  | { kind: 'saved' }
  | { kind: 'detail'; id: string; from: 'browse' | 'saved'; reason?: string }
  | { kind: 'compare'; ids: readonly string[] }

const savedKey = 'hse-saved-courses-v1'

function readSavedIds(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(savedKey) ?? '[]')
    return Array.isArray(stored) ? [...new Set(stored.filter(id => typeof id === 'string'))] : []
  } catch {
    return []
  }
}

function App() {
  const [view, setView] = useState<View>({ kind: 'browse' })
  const [data, setData] = useState<ShowcaseCourse[] | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [savedIds, setSavedIds] = useState(readSavedIds)
  const [comparisonIds, setComparisonIds] = useState<readonly string[] | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const lastView = useRef(view)
  const browseScroll = useRef(0)

  useEffect(() => {
    let active = true
    void loadShowcase().then(
      courses => { if (active) setData(courses) },
      () => { if (active) setUnavailable(true) },
    )
    return () => { active = false }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(savedKey, JSON.stringify(savedIds))
    } catch {
      // Saving still works during this visit.
    }
  }, [savedIds])

  useEffect(() => {
    if (lastView.current === view) return
    lastView.current = view
    headingRef.current?.focus({ preventScroll: true })
    const scroller = document.scrollingElement
    if (scroller) scroller.scrollTop = view.kind === 'browse' ? browseScroll.current : 0
  }, [view])

  function navigate(next: View) {
    if (view.kind === 'browse') browseScroll.current = document.scrollingElement?.scrollTop ?? 0
    setView(next)
  }

  function toggleSave(id: string) {
    if (savedIds.includes(id)) {
      setComparisonIds(ids => (ids ?? selectedComparison).filter(courseId => courseId !== id))
    }
    setSavedIds(ids => ids.includes(id) ? ids.filter(saved => saved !== id) : [...ids, id])
  }

  const byId = new Map((data ?? []).map(item => [item.course.id, item]))
  const savedItems = savedIds.flatMap(id => byId.get(id) ?? [])
  const selectedComparison = (comparisonIds ?? savedItems.slice(0, 3).map(item => item.course.id))
    .filter(id => savedIds.includes(id) && byId.has(id))
  const detail = view.kind === 'detail' ? byId.get(view.id) : undefined
  const compared = view.kind === 'compare' ? view.ids.flatMap(id => byId.get(id) ?? []) : []

  return (
    <Box minH="100dvh" bg="catalog.canvas" color="catalog.ink">
      <Box as="header" bg="catalog.surface" borderBottomWidth="1px" borderColor="catalog.border">
        <Container maxW="6xl" px={{ base: '3', sm: '6' }}>
          <Flex as="nav" aria-label="Навигация" justify={view.kind === 'browse' ? 'end' : 'space-between'} align="center" gap="2" py="2">
            {view.kind !== 'browse' && <Button type="button" variant="plain" color="hse.fg" minH="12" px="0" onClick={() => navigate({ kind: 'browse' })}>
              К витрине
            </Button>}
            <Button type="button" variant="outline" colorPalette="hse" minH="12"
              aria-current={view.kind === 'saved' ? 'page' : undefined}
              onClick={() => navigate({ kind: 'saved' })}
            >Отложенные ({savedIds.length})</Button>
          </Flex>
        </Container>
      </Box>

      <Container as="main" maxW="6xl" px={{ base: '3', sm: '6' }} pt={{ base: '5', md: '9' }} pb="8">
        <Box hidden={view.kind !== 'browse'}>
          <Showcase data={data} unavailable={unavailable} savedIds={savedIds}
            headingRef={view.kind === 'browse' ? headingRef : undefined}
            onOpen={(id, reason) => navigate({ kind: 'detail', id, reason, from: 'browse' })} onSave={toggleSave}
          />
        </Box>
        {view.kind === 'detail' && detail && (
          <CourseDetails key={view.id} item={detail} headingRef={headingRef} saved={savedIds.includes(view.id)} reason={view.reason}
            onSave={() => toggleSave(view.id)} onBack={() => navigate({ kind: view.from })}
          />
        )}
        {view.kind === 'saved' && (
          <SavedCourses items={savedItems} headingRef={headingRef} onRemove={toggleSave}
            status={savedIds.length === 0 || data ? 'ready' : unavailable ? 'unavailable' : 'loading'}
            selected={selectedComparison} onSelectionChange={setComparisonIds}
            onOpen={id => navigate({ kind: 'detail', id, from: 'saved' })}
            onCompare={() => navigate({ kind: 'compare', ids: selectedComparison })}
          />
        )}
        {view.kind === 'compare' && <CourseComparison items={compared} headingRef={headingRef} onBack={() => navigate({ kind: 'saved' })} />}
      </Container>
    </Box>
  )
}

export default App
