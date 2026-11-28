import { Box, Button, Grid, Heading, Progress, Stack, Text, chakra } from '@chakra-ui/react'
import { LazyMotion, domAnimation, useReducedMotion } from 'motion/react'
import * as m from 'motion/react-m'
import { lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react'
import { careers, classes, formats, languages, skills, subjects, type StudentProfile } from './catalog.ts'
import { CourseChat } from './CourseChat.tsx'
import { profileForSurvey, surveySteps, type SurveyDecision, type SurveyDraft, type SurveyRoute, type SurveyStep } from './survey.ts'

const optionalChoices = 'Отметьте подходящие варианты или пропустите вопрос.'
const ProgramPicker = lazy(() => import('./ProgramPicker.tsx'))

const questions = {
  route: { title: 'По чему подобрать факультативы?', description: 'Выберите карьерные направления, конкретные навыки или оба варианта.' },
  careers: { title: 'Какие направления вам интересны?', description: 'Выберите хотя бы одно направление.' },
  skills: { title: 'Какие навыки хотите развить?', description: 'Выберите хотя бы один навык.' },
  level: { title: 'Какой у вас опыт в выбранных темах?' },
  maxHours: { title: 'Сколько времени в неделю вы готовы уделять?' },
  format: { title: 'Какой формат занятий вам подходит?', description: optionalChoices },
  classType: { title: 'Какой вид занятий предпочитаете?', description: optionalChoices },
  language: { title: 'На каком языке хотите учиться?', description: optionalChoices },
  academic: { title: 'Учесть ваш учебный профиль?', description: 'Программа, курс и пройденные дисциплины помогут учесть ваш опыт.' },
  program: { title: 'На какой программе вы учитесь?' },
  year: { title: 'На каком курсе вы учитесь?' },
  completed: { title: 'Какие дисциплины вы уже прошли?', description: 'Можно выбрать несколько или перейти к подборке.' },
} satisfies Record<SurveyStep, { title: string; description?: string }>

const routeChoices = {
  careers: 'Карьерные интересы', skills: 'Навыки',
} satisfies Record<Exclude<SurveyRoute, 'both'>, string>

const experienceChoices = {
  start: 'Только знакомлюсь с темой',
  practice: 'Решаю задачи по инструкции или с помощью',
  advanced: 'Самостоятельно решаю задачи на практике',
} satisfies Record<Exclude<StudentProfile['level'], ''>, string>

const academicChoices = { yes: 'Заполнить учебный профиль', skip: 'Пропустить профиль' } satisfies Record<SurveyDecision, string>

const hours: readonly (number | null)[] = [2, 3, 4, 5, null]
const years = { '1': '1 курс', '2': '2 курс', '3': '3 курс', '4': '4 курс' } as const

function describeExperience(draft: SurveyDraft) {
  const activeProfile = profileForSurvey(draft)
  const topics = [
    ...activeProfile.careers.map(career => careers[career]),
    ...activeProfile.skills.map(skill => skills[skill]),
  ]

  if (topics.length) {
    return `Ваши темы — ${topics.slice(0, 2).join(', ')}${topics.length > 2 ? ' и другие выбранные темы' : ''}.`
  }
}

function Choice({ type, checked, title, onChange, card = false }: {
  type: 'radio' | 'checkbox'
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
        type={type} name={type === 'radio' ? 'survey-answer' : undefined}
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
        <Choice key={value} type="checkbox" card={cards} title={title} checked={selected.includes(value)} onChange={checked => {
          onChange(checked ? [...selected, value] : selected.filter(item => item !== value))
        }} />
      ))}
    </Grid>
  )
}

function SingleChoice<Key extends string>({ options, selected, onChange, emptyOption }: {
  options: Record<Key, string>
  selected: string
  onChange: (selected: Key | '') => void
  emptyOption?: string
}) {
  const optionsWithLabel: readonly [Key | '', string][] = Object.entries(options) as [Key, string][]
  const items = emptyOption ? [...optionsWithLabel, ['', emptyOption] as const] : optionsWithLabel

  return (
    <Stack gap="2">
      {items.map(([value, title]) => (
        <Choice key={value} type="radio" title={title} checked={selected === value} onChange={() => onChange(value)} />
      ))}
    </Stack>
  )
}

function hourRowHeight(wheel: HTMLDivElement) {
  return wheel.firstElementChild?.getBoundingClientRect().height ?? 0
}

function StudyHours({ value, onChange }: { value: number | null; onChange: (hours: number | null) => void }) {
  const reducedMotion = useReducedMotion()
  const wheelRef = useRef<HTMLDivElement>(null)
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
          _focusVisible={{ outline: '2px solid', outlineColor: 'hse.700', outlineOffset: '2px' }}
          onKeyDown={moveByKey}
          onScroll={({ currentTarget: wheel }) => {
            const rowHeight = hourRowHeight(wheel)
            if (rowHeight > 0) {
              updateSelection(Math.max(0, Math.min(hours.length - 1, Math.round(wheel.scrollTop / rowHeight))))
            }
          }}
        >
          {hours.map((hour, index) => {
            const selected = index === selection
            return (
              <Box
                key={index} id={`${optionId}-${index}`} role="option" aria-selected={selected}
                display="grid" placeItems="center" h="12" px="2" scrollSnapAlign="center" cursor="pointer"
                color={selected ? 'hse.fg' : 'catalog.muted'} fontWeight={selected ? 'bold' : 'medium'}
                fontSize="md" textAlign="center" userSelect="none"
                _motionSafe={{ transition: 'color 140ms ease-out' }}
                onClick={() => {
                  wheelRef.current?.focus({ preventScroll: true })
                  choose(index)
                }}
              >
                <m.span initial={false} animate={{ scale: reducedMotion || !selected ? 1 : 1.06 }}
                  transition={{ duration: reducedMotion ? 0 : 0.16, ease: 'easeOut' }}
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
  const steps = surveySteps(draft)
  const stepIndex = steps.indexOf(step)
  const progressMax = surveySteps({ ...draft, route: step === 'route' ? 'both' : draft.route, academic: 'yes' }).length
  const progressPercent = Math.round((stepIndex + 1) / progressMax * 100)
  const nextStep = steps[stepIndex + 1]
  const previousStep = steps[stepIndex - 1]
  const showResults = step === 'completed' || (step === 'academic' && draft.academic === 'skip')
  const question: { title: string; description?: string } = questions[step]
  const description = step === 'level' ? describeExperience(draft) : question.description
  const { profile } = draft
  const selectedRoutes: (keyof typeof routeChoices)[] = draft.route === 'both'
    ? ['careers', 'skills']
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

  function updateProfile<Key extends keyof StudentProfile>(field: Key, value: StudentProfile[Key]) {
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
      careers: profile.careers.length ? '' : 'Выберите хотя бы одно направление.',
      skills: profile.skills.length ? '' : 'Выберите хотя бы один навык.',
      academic: draft.academic ? '' : 'Выберите, учитывать ли учебный профиль.',
      program: profile.program ? '' : 'Выберите программу из списка.',
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
      case 'careers': return <MultipleChoices options={careers} selected={profile.careers} onChange={value => updateProfile('careers', value)} />
      case 'skills': return <MultipleChoices options={skills} selected={profile.skills} onChange={value => updateProfile('skills', value)} />
      case 'level': return <SingleChoice options={experienceChoices} selected={profile.level} onChange={value => updateProfile('level', value)} emptyOption="Не указывать" />
      case 'maxHours': return <StudyHours value={profile.maxHours} onChange={value => updateProfile('maxHours', value)} />
      case 'format': return <MultipleChoices cards options={formats} selected={profile.formats} onChange={value => updateProfile('formats', value)} />
      case 'classType': return <MultipleChoices cards options={classes} selected={profile.classTypes} onChange={value => updateProfile('classTypes', value)} />
      case 'language': return <MultipleChoices cards options={languages} selected={profile.languages} onChange={value => updateProfile('languages', value)} />
      case 'academic': return <SingleChoice options={academicChoices} selected={draft.academic} onChange={academic => update({ academic })} />
      case 'program': return (
        <Suspense fallback={<Text role="status" color="catalog.muted">Загружаем список программ…</Text>}>
          <ProgramPicker value={profile.program} invalid={Boolean(error)} onChange={value => updateProfile('program', value)} />
        </Suspense>
      )
      case 'year': return <SingleChoice options={years} selected={String(profile.year ?? '')} onChange={value => updateProfile('year', value ? Number(value) : null)} emptyOption="Не указывать" />
      case 'completed': return <MultipleChoices options={subjects} selected={profile.completed} onChange={value => updateProfile('completed', value)} />
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
            {question.title}
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
            {showResults ? 'Показать подборку' : 'Дальше'} <span aria-hidden="true">→</span>
          </Button>
        </Grid>
      </chakra.form>
    </Stack>
  )
}
