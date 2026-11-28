import { Box, Button, Flex, Grid, Heading, Progress, Slider, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { careers, classes, formats, languages, levels, programs, skills, subjects, type StudentProfile } from './catalog.ts'
import { CourseChat } from './CourseChat.tsx'
import { surveySteps, type SurveyDecision, type SurveyDraft, type SurveyRoute, type SurveyStep } from './survey.ts'

const questions = {
  route: { title: 'По чему подобрать факультативы?', description: 'Выберите карьерные направления, конкретные навыки или оба варианта.' },
  careers: { title: 'Какие направления вам интересны?', description: 'Выберите хотя бы одно направление.' },
  skills: { title: 'Какие навыки хотите развить?', description: 'Выберите хотя бы один навык.' },
  level: { title: 'Какой у вас уровень подготовки?' },
  maxHours: { title: 'Сколько времени в неделю вы готовы уделять?' },
  format: { title: 'Какой формат занятий вам подходит?' },
  classType: { title: 'Какой вид занятий предпочитаете?' },
  language: { title: 'На каком языке хотите учиться?' },
  academic: { title: 'Учесть ваш учебный профиль?', description: 'Программа, курс и пройденные дисциплины помогут учесть ваш опыт.' },
  program: { title: 'На какой программе вы учитесь?' },
  year: { title: 'На каком курсе вы учитесь?' },
  completed: { title: 'Какие дисциплины вы уже прошли?', description: 'Можно выбрать несколько или перейти к подборке.' },
} satisfies Record<SurveyStep, { title: string; description?: string }>

const routeChoices = {
  careers: 'Карьерные интересы', skills: 'Навыки',
} satisfies Record<Exclude<SurveyRoute, 'both'>, string>

const academicChoices = { yes: 'Заполнить учебный профиль', skip: 'Пропустить профиль' } satisfies Record<SurveyDecision, string>

const hours: readonly (number | null)[] = [null, 2, 3, 4, 5]
const years = { '1': '1 курс', '2': '2 курс', '3': '3 курс', '4': '4 курс', '5': '5 курс' } as const

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

function StudyHours({ value, onChange }: { value: number | null; onChange: (hours: number | null) => void }) {
  const selection = Math.max(0, hours.indexOf(value))
  const hourLabel = (index: number) => hours[index] === null ? 'Без ограничений' : `До ${hours[index]} ч`

  return (
    <Slider.Root
      colorPalette="hse" size="lg" variant="solid" max={hours.length - 1} value={[selection]}
      onValueChange={({ value: [index] }) => onChange(hours[index])}
      getAriaValueText={({ value: index }) => hourLabel(index)}
      thumbSize={{ width: 48, height: 48 }}
      layerStyle="catalogSurface" px={{ base: '3', sm: '5' }} py="4"
    >
      <Slider.ValueText mx="auto" color="hse.fg" fontWeight="bold" fontSize="lg">{hourLabel(selection)}</Slider.ValueText>
      <Slider.Control minH="12">
        <Slider.Track bg="hse.200"><Slider.Range bg="hse.700" /></Slider.Track>
        <Slider.Thumb index={0} aria-labelledby="survey-question" boxSize="12" bg="transparent"
          transition="none" _focusVisible={{ ring: '2px', ringColor: 'hse.700' }}
          _motionSafe={{ transition: 'scale 140ms ease-out', _active: { scale: '0.92' } }}
        >
          <Box boxSize="7" borderRadius="full" bg="hse.solid" borderWidth="3px" borderColor="white" shadow="sm" />
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
      <Flex justify="space-between" color="catalog.muted" fontSize="sm">
        <Text>{hourLabel(0)}</Text>
        <Text>{hourLabel(hours.length - 1)}</Text>
      </Flex>
    </Slider.Root>
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
      case 'level': return <SingleChoice options={levels} selected={profile.level} onChange={value => updateProfile('level', value)} emptyOption="Не указывать" />
      case 'maxHours': return <StudyHours value={profile.maxHours} onChange={value => updateProfile('maxHours', value)} />
      case 'format': return <SingleChoice options={formats} selected={profile.format} onChange={value => updateProfile('format', value)} emptyOption="Любой формат" />
      case 'classType': return <SingleChoice options={classes} selected={profile.classType} onChange={value => updateProfile('classType', value)} emptyOption="Любой вид занятий" />
      case 'language': return <SingleChoice options={languages} selected={profile.language} onChange={value => updateProfile('language', value)} emptyOption="Любой язык" />
      case 'academic': return <SingleChoice options={academicChoices} selected={draft.academic} onChange={academic => update({ academic })} />
      case 'program': return <SingleChoice options={programs} selected={profile.program} onChange={value => updateProfile('program', value)} emptyOption="Не указывать" />
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
          aria-labelledby="survey-question" aria-describedby={question.description ? 'survey-description' : undefined}
          _motionSafe={{ animationName: 'fade-in, slide-from-bottom', animationDuration: 'fast', animationTimingFunction: 'ease-out' }}
        >
          <Heading as="h1" id="survey-question" tabIndex={-1} ref={headingRef} size={{ base: 'xl', md: '3xl' }} mb={question.description ? '2' : '5'} _focusVisible={{ outline: 'none' }}>
            {question.title}
          </Heading>
          {question.description && <Text color="catalog.muted" id="survey-description" mb="5" fontSize="sm">{question.description}</Text>}
          {renderChoices()}
          {error && <Text role="alert" color="gsb.fg" fontSize="sm" mt="3">{error}</Text>}
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
