import { Box, Button, Grid, Heading, Progress, Stack, Text, chakra } from '@chakra-ui/react'
import { LazyMotion, domAnimation, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent, type RefObject, type UIEvent } from 'react'
import { languages } from './catalog.ts'
import { CourseChat } from './CourseChat.tsx'
import { modules, skills, topics, type OfficialPreferences } from './officialRecommendations.ts'
import { surveySteps, type SurveyDraft, type SurveyRoute, type SurveyStep } from './survey.ts'

const optionalChoices = 'Отметьте подходящие варианты или пропустите вопрос.'

const questions = {
  route: { title: 'По чему подобрать факультативы?', description: 'Выберите интересы, навыки или оба варианта.' },
  topics: { title: 'Какие темы вам интересны?', description: 'Выберите хотя бы одну тему.' },
  skills: { title: 'Какие навыки хотите развить?', description: 'Выберите хотя бы один навык.' },
  maxContactHours: { title: 'Сколько контактных часов вы готовы выделить?', description: 'Объём занятий за весь курс.' },
  modules: { title: 'В каких модулях вы можете учиться?', description: 'Выберите все подходящие модули или пропустите вопрос.' },
  language: { title: 'На каком языке хотите учиться?', description: optionalChoices },
} satisfies Record<SurveyStep, { title: string; description?: string }>

const routeChoices = {
  topics: 'Интересы', skills: 'Навыки',
} satisfies Record<Exclude<SurveyRoute, 'both'>, string>

const hours: readonly (number | null)[] = [30, 40, 60, 80, null]

function Choice({ checked, title, onChange, card = false }: {
  checked: boolean
  title: string
  onChange: (checked: boolean) => void
  card?: boolean
}) {
  return (
    <chakra.label
      display="flex" flexDirection={card ? 'column' : 'row'} alignItems={card ? 'start' : 'center'}
      gap={card ? '2' : '3'} minH={card ? '20' : '12'} px={card ? '4' : '3'} py={card ? '3' : '2'}
      borderWidth="1px" borderColor={checked ? 'hse.solid' : 'catalog.border'} borderRadius="md"
      bg={checked ? 'hse.100' : 'catalog.surface'} cursor="pointer" fontWeight={card || checked ? 'semibold' : 'medium'}
      _hover={{ borderColor: checked ? 'hse.solid' : 'hse.400' }}
      _active={{ bg: 'hse.100' }}
      _motionSafe={{
        transition: 'background-color 150ms, border-color 150ms, scale 140ms, translate 140ms',
        _active: { scale: '0.99', translate: '0 1px' },
      }}
    >
      <chakra.input
        type="checkbox"
        checked={checked} onChange={event => onChange(event.target.checked)}
        boxSize="4" flexShrink="0" accentColor="hse.solid"
        _focusVisible={{ outline: '2px solid', outlineColor: 'hse.700', outlineOffset: '2px' }}
      />
      {title}
    </chakra.label>
  )
}

function MultipleChoices<Key extends string>({ options, selected, onChange, cards = false }: {
  options: Record<Key, string>
  selected: readonly Key[]
  onChange: (selected: Key[]) => void
  cards?: boolean
}) {
  return (
    <Grid gap="2" templateColumns={cards ? 'repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr))' : 'minmax(0, 1fr)'}>
      {(Object.entries(options) as [Key, string][]).map(([value, title]) => (
        <Choice key={value} card={cards} title={title} checked={selected.includes(value)} onChange={checked => {
          onChange(checked ? [...selected, value] : selected.filter(item => item !== value))
        }} />
      ))}
    </Grid>
  )
}

function hourRowHeight(wheel: HTMLDivElement) {
  return wheel.firstElementChild?.getBoundingClientRect().height ?? 0
}

function nearestHour(top: number, rowHeight: number) {
  return Math.max(0, Math.min(hours.length - 1, Math.round(top / rowHeight)))
}

type MouseDrag = {
  pointerId: number
  startY: number
  startTop: number
  lastY: number
  lastAt: number
  velocity: number
  moved: boolean
}

function StudyHours({ value, onChange }: { value: number | null; onChange: (hours: number | null) => void }) {
  const reducedMotion = useReducedMotion()
  const wheelRef = useRef<HTMLDivElement>(null)
  const drag = useRef<MouseDrag | null>(null)
  const ignoreClick = useRef(false)
  const selection = hours.indexOf(value)
  const initialSelection = useRef(selection)
  const optionId = useId()

  useLayoutEffect(() => {
    const wheel = wheelRef.current
    if (wheel) wheel.scrollTop = initialSelection.current * hourRowHeight(wheel)
  }, [])

  function updateSelection(index: number) {
    if (index !== selection) onChange(hours[index])
  }

  function choose(index: number) {
    const wheel = wheelRef.current
    if (wheel) wheel.scrollTop = index * hourRowHeight(wheel)
    updateSelection(index)
  }

  function syncScroll({ currentTarget: wheel }: UIEvent<HTMLDivElement>) {
    const rowHeight = hourRowHeight(wheel)
    if (rowHeight > 0) updateSelection(nearestHour(wheel.scrollTop, rowHeight))
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    ignoreClick.current = false
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const y = event.clientY
    drag.current = {
      pointerId: event.pointerId, startY: y, startTop: event.currentTarget.scrollTop,
      lastY: y, lastAt: performance.now(), velocity: 0, moved: false,
    }
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (current?.pointerId !== event.pointerId || !(event.buttons & 1)) return
    const wheel = event.currentTarget
    const distance = current.startY - event.clientY
    if (!current.moved) {
      if (Math.abs(distance) < 4) return
      current.moved = true
      ignoreClick.current = true
      wheel.setPointerCapture(event.pointerId)
      wheel.dataset.dragging = ''
    }
    const now = performance.now()
    current.velocity = (current.lastY - event.clientY) / Math.max(1, now - current.lastAt)
    current.lastY = event.clientY
    current.lastAt = now
    wheel.scrollTop = current.startTop + distance
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (current?.pointerId !== event.pointerId) return
    drag.current = null
    if (!current.moved) return
    const wheel = event.currentTarget
    const height = hourRowHeight(wheel)
    const top = wheel.scrollTop
    const flick = event.type === 'pointerup' && !reducedMotion && performance.now() - current.lastAt < 75
    const travel = flick ? Math.max(-2 * height, Math.min(2 * height, current.velocity * 115)) : 0
    delete wheel.dataset.dragging
    wheel.focus({ preventScroll: true })
    if (!height) return
    const target = nearestHour(top + travel, height)
    if (target === nearestHour(top, height)) {
      choose(target)
    } else {
      wheel.scrollTo({ top: target * height, behavior: 'smooth' })
    }
  }

  function moveByKey(event: KeyboardEvent<HTMLDivElement>) {
    const positions: Record<string, number> = {
      ArrowUp: Math.max(0, selection - 1),
      ArrowDown: Math.min(hours.length - 1, selection + 1),
      Home: 0,
      End: hours.length - 1,
    }
    const next = positions[event.key]
    if (typeof next !== 'number') return
    event.preventDefault()
    choose(next)
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <Box layerStyle="catalogSurface" position="relative" p="3">
        <Box
          aria-hidden="true" position="absolute" insetInline="3" top="50%" translate="0 -50%"
          h="12" bg="hse.100" borderRadius="md" pointerEvents="none"
        />
        <Box
          ref={wheelRef} role="listbox" tabIndex={0} aria-labelledby="survey-question"
          aria-activedescendant={`${optionId}-${selection}`}
          h="36" py="12" position="relative" overflowY="auto" scrollSnapType="y mandatory"
          scrollBehavior="auto" overscrollBehaviorY="contain" scrollbarWidth="none" borderRadius="md"
          _dragging={{ scrollSnapType: 'none', cursor: 'grabbing' }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'hse.700', outlineOffset: '2px' }}
          onKeyDown={moveByKey}
          onScroll={syncScroll}
          onPointerDown={startDrag} onPointerMove={moveDrag}
          onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}
          onPointerLeave={() => { if (!drag.current?.moved) drag.current = null }}
          onClickCapture={event => {
            if (!ignoreClick.current) return
            ignoreClick.current = false
            event.stopPropagation()
          }}
        >
          {hours.map((hour, index) => {
            const selected = index === selection
            return (
              <Box
                key={index} id={`${optionId}-${index}`} role="option" aria-selected={selected}
                display="grid" placeItems="center" h="12" px="2" scrollSnapAlign="center" cursor="inherit"
                color={selected ? 'hse.fg' : 'catalog.muted'} fontWeight={selected ? 'bold' : 'medium'}
                fontSize="md" textAlign="center" userSelect="none"
                _motionSafe={{ transition: 'color 140ms ease-out' }}
                onClick={() => {
                  wheelRef.current?.focus({ preventScroll: true })
                  choose(index)
                }}
              >
                <m.span initial={false}
                  animate={{ scale: reducedMotion || !selected ? 1 : 1.06 }}
                  transition={{ duration: reducedMotion ? 0 : 0.12, ease: 'easeOut' }}
                >
                  {hour === null ? 'Без ограничений' : `До ${hour} ч`}
                </m.span>
              </Box>
            )
          })}
        </Box>
      </Box>
    </LazyMotion>
  )
}

export function ProfileForm({ draft, headingRef, onChange, onSubmit }: {
  draft: SurveyDraft
  headingRef: RefObject<HTMLHeadingElement | null>
  onChange: (draft: SurveyDraft) => void
  onSubmit: () => void
}) {
  const [step, setStep] = useState<SurveyStep>('route')
  const [error, setError] = useState('')
  const focusNext = useRef(false)
  const steps = surveySteps(draft.route)
  const stepIndex = steps.indexOf(step)
  const progressMax = step === 'route' ? surveySteps('both').length : steps.length
  const progressPercent = Math.round((stepIndex + 1) / progressMax * 100)
  const nextStep = steps[stepIndex + 1]
  const previousStep = steps[stepIndex - 1]
  const { title, description } = questions[step]
  const { profile } = draft
  const selectedRoutes: (keyof typeof routeChoices)[] = draft.route === 'both'
    ? ['topics', 'skills']
    : draft.route ? [draft.route] : []

  useEffect(() => {
    if (focusNext.current) {
      headingRef.current?.focus()
      focusNext.current = false
    }
  }, [headingRef, step])

  function update(values: Partial<SurveyDraft>) {
    onChange({ ...draft, ...values })
    setError('')
  }

  function updateProfile<Key extends keyof OfficialPreferences>(field: Key, value: OfficialPreferences[Key]) {
    update({ profile: { ...profile, [field]: value } })
  }

  function goTo(next: SurveyStep) {
    focusNext.current = true
    setError('')
    setStep(next)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors: Partial<Record<SurveyStep, string>> = {
      route: draft.route ? '' : 'Выберите, по чему подобрать курсы.',
      topics: profile.topics.length ? '' : 'Выберите хотя бы одну тему.',
      skills: profile.skills.length ? '' : 'Выберите хотя бы один навык.',
    }

    if (errors[step]) {
      setError(errors[step])
      return
    }
    if (nextStep) goTo(nextStep)
    else onSubmit()
  }

  function renderChoices() {
    switch (step) {
      case 'route': return (
        <Stack gap="2">
          <MultipleChoices cards options={routeChoices} selected={selectedRoutes} onChange={value => update({
            route: value.length === 2 ? 'both' : value[0] ?? '',
          })} />
          <CourseChat />
        </Stack>
      )
      case 'topics': return <MultipleChoices options={topics} selected={profile.topics} onChange={value => updateProfile('topics', value)} />
      case 'skills': return <MultipleChoices options={skills} selected={profile.skills} onChange={value => updateProfile('skills', value)} />
      case 'maxContactHours': return <StudyHours value={profile.maxContactHours} onChange={value => updateProfile('maxContactHours', value)} />
      case 'modules': return <MultipleChoices cards options={modules} selected={profile.modules} onChange={value => updateProfile('modules', value)} />
      case 'language': return <MultipleChoices cards options={languages} selected={profile.languages} onChange={value => updateProfile('languages', value)} />
    }
  }

  return (
    <Stack gap="4" minH="0">
      <Progress.Root value={stepIndex + 1} max={progressMax} size="xs" shape="full" colorPalette="hse"
        display="flex" flexShrink="0" alignItems="center" gap="3"
      >
        <Progress.Label color="gsb.fg" fontWeight="semibold" whiteSpace="nowrap">Шаг {stepIndex + 1}</Progress.Label>
        <Progress.Track flex="1" bg="hse.200" aria-label="Ход анкеты" aria-valuetext={`Шаг ${stepIndex + 1}, ${progressPercent}%`}>
          <Progress.Range borderRadius="full" transition="none" _motionSafe={{ transition: 'width 180ms ease-out' }} />
        </Progress.Track>
      </Progress.Root>
      <chakra.form key={step} onSubmit={submit} aria-labelledby="survey-question" display="flex" flexDirection="column" flex="1" minH="0">
        <chakra.fieldset
          flex="1" minW="0" minH="0" pb="4" overflowY={{ base: 'auto', md: 'visible' }}
          aria-labelledby="survey-question" aria-describedby={description ? 'survey-description' : undefined}
          _motionSafe={{ animationName: 'fade-in, slide-from-bottom', animationDuration: 'fast', animationTimingFunction: 'ease-out' }}
        >
          <Heading as="h1" id="survey-question" tabIndex={-1} ref={headingRef} size={{ base: 'xl', md: '3xl' }} mb={description ? '2' : '5'} _focusVisible={{ outline: 'none' }}>
            {title}
          </Heading>
          {description && <Text color="catalog.muted" id="survey-description" mb="5" fontSize="sm">{description}</Text>}
          {renderChoices()}
          {error && <Text id="survey-error" role="alert" color="gsb.fg" fontSize="sm" mt="3">{error}</Text>}
        </chakra.fieldset>

        <Grid
          flexShrink="0" gap="2" justifyContent={{ md: 'end' }} pt={{ base: '2', md: '0' }}
          pb={{ base: 'max(0.75rem, env(safe-area-inset-bottom))', md: '0' }}
          templateColumns={previousStep ? { base: 'minmax(0, 1fr) minmax(0, 1.8fr)', md: 'auto auto' } : 'minmax(0, 1fr)'}
        >
          {previousStep && <Button type="button" variant="outline" size="lg" minH="12" colorPalette="hse" px="3" onClick={() => goTo(previousStep)}>
            <span aria-hidden="true">←</span> Назад
          </Button>}
          <Button type="submit" size="lg" minH="12" colorPalette="hse" px="3" minW={{ md: '44' }} justifySelf={{ md: 'end' }} whiteSpace="normal" textAlign="center">
            {nextStep ? 'Дальше' : 'Показать подборку'} <span aria-hidden="true">→</span>
          </Button>
        </Grid>
      </chakra.form>
    </Stack>
  )
}
