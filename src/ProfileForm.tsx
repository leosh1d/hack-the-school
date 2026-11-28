import { Button, Grid, Heading, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { careers, classes, formats, languages, levels, programs, skills, subjects, type StudentProfile } from './catalog.ts'
import { surveySteps, type SurveyDecision, type SurveyDraft, type SurveyRoute, type SurveyStep } from './survey.ts'

const questions = {
  route: { title: 'По чему подобрать факультативы?', description: 'Выберите карьерные направления, конкретные навыки или оба варианта.' },
  careers: { title: 'Какие направления вам интересны?', description: 'Выберите хотя бы одно направление.' },
  skills: { title: 'Какие навыки хотите развить?', description: 'Выберите хотя бы один навык.' },
  preferences: { title: 'Уточнить условия обучения?', description: 'Можно учесть подготовку, нагрузку, формат занятий и язык курса.' },
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
  careers: 'Карьерные интересы', skills: 'Навыки', both: 'Оба направления',
} satisfies Record<SurveyRoute, string>

const preferenceChoices = { yes: 'Уточнить условия', skip: 'Пропустить условия' } satisfies Record<SurveyDecision, string>
const academicChoices = { yes: 'Заполнить учебный профиль', skip: 'Пропустить профиль' } satisfies Record<SurveyDecision, string>

const hours = { '2': 'До 2 ч', '3': 'До 3 ч', '4': 'До 4 ч', '5': 'До 5 ч' } as const
const years = { '1': '1 курс', '2': '2 курс', '3': '3 курс', '4': '4 курс', '5': '5 курс' } as const

function Choice({ type, checked, title, onChange }: {
  type: 'radio' | 'checkbox'
  checked: boolean
  title: string
  onChange: (checked: boolean) => void
}) {
  return (
    <chakra.label
      display="flex" alignItems="center" gap="3" minH="12" px="3" py="2"
      borderWidth="1px" borderColor={checked ? 'hse.solid' : 'catalog.border'} borderRadius="md"
      bg={checked ? 'hse.50' : 'catalog.surface'} cursor="pointer" fontWeight={checked ? 'semibold' : 'medium'}
      _hover={{ borderColor: 'hse.400' }} _focusWithin={{ outline: '2px solid', outlineColor: 'gsb.solid', outlineOffset: '2px' }}
      _motionSafe={{ transition: 'background-color 150ms, border-color 150ms' }}
    >
      <chakra.input
        type={type} name={type === 'radio' ? 'survey-answer' : undefined}
        checked={checked} onChange={event => onChange(event.target.checked)}
        boxSize="4" flexShrink="0" accentColor="hse.solid"
      />
      {title}
    </chakra.label>
  )
}

function MultipleChoices<Key extends string>({ options, selected, onChange }: {
  options: Record<Key, string>
  selected: readonly Key[]
  onChange: (selected: Key[]) => void
}) {
  return (
    <Stack gap="2">
      {(Object.entries(options) as [Key, string][]).map(([value, title]) => (
        <Choice key={value} type="checkbox" title={title} checked={selected.includes(value)} onChange={checked => {
          onChange(checked ? [...selected, value] : selected.filter(item => item !== value))
        }} />
      ))}
    </Stack>
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

export function ProfileForm({ draft, onChange, onSubmit }: {
  draft: SurveyDraft
  onChange: (draft: SurveyDraft) => void
  onSubmit: () => void
}) {
  const [step, setStep] = useState<SurveyStep>('route')
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const focusNext = useRef(false)
  const steps = surveySteps(draft)
  const stepIndex = steps.indexOf(step)
  const nextStep = steps[stepIndex + 1]
  const previousStep = steps[stepIndex - 1]
  const showResults = step === 'completed' || (step === 'academic' && draft.academic === 'skip')
  const question: { title: string; description?: string } = questions[step]
  const { profile } = draft

  useEffect(() => {
    if (focusNext.current) {
      heading.current?.focus()
      focusNext.current = false
    }
  }, [step])

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
      preferences: draft.preferences ? '' : 'Выберите, учитывать ли условия обучения.',
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
      case 'route': return <SingleChoice options={routeChoices} selected={draft.route} onChange={route => update({ route })} />
      case 'careers': return <MultipleChoices options={careers} selected={profile.careers} onChange={value => updateProfile('careers', value)} />
      case 'skills': return <MultipleChoices options={skills} selected={profile.skills} onChange={value => updateProfile('skills', value)} />
      case 'preferences': return <SingleChoice options={preferenceChoices} selected={draft.preferences} onChange={preferences => update({ preferences })} />
      case 'level': return <SingleChoice options={levels} selected={profile.level} onChange={value => updateProfile('level', value)} emptyOption="Не указывать" />
      case 'maxHours': return <SingleChoice options={hours} selected={String(profile.maxHours ?? '')} onChange={value => updateProfile('maxHours', value ? Number(value) : null)} emptyOption="Без ограничений" />
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
    <chakra.form key={step} onSubmit={submit} layerStyle="catalogSurface" aria-labelledby="survey-question">
      <chakra.fieldset
        minW="0" px={{ base: '4', md: '8' }} py={{ base: '5', md: '7' }}
        aria-labelledby="survey-question" aria-describedby={question.description ? 'survey-description' : undefined}
        _motionSafe={{ animationName: 'fade-in', animationDuration: 'fast', animationTimingFunction: 'ease-out' }}
      >
        <Text color="gsb.fg" fontSize="sm" fontWeight="semibold" mb="2">Шаг {stepIndex + 1}</Text>
        <Heading as="h2" id="survey-question" tabIndex={-1} ref={heading} size={{ base: 'lg', md: 'xl' }} mb={question.description ? '2' : '5'} _focusVisible={{ outline: 'none' }}>
          {question.title}
        </Heading>
        {question.description && <Text color="catalog.muted" id="survey-description" mb="5" fontSize="sm">{question.description}</Text>}
        {renderChoices()}
        {error && <Text role="alert" color="gsb.fg" fontSize="sm" mt="3">{error}</Text>}
      </chakra.fieldset>

      <Grid
        position={{ base: 'sticky', md: 'static' }} bottom="0" zIndex="1" bg="catalog.surface"
        borderTopWidth="1px" borderColor="catalog.border" borderBottomRadius="xl" gap="2"
        px={{ base: '4', md: '8' }} py="3" justifyContent={{ md: 'end' }}
        templateColumns={previousStep ? { base: 'minmax(0, 1fr) minmax(0, 1.8fr)', md: 'auto auto' } : 'minmax(0, 1fr)'}
      >
        {previousStep && <Button type="button" variant="outline" size="lg" colorPalette="hse" px="3" onClick={() => goTo(previousStep)}>
          <span aria-hidden="true">←</span> Назад
        </Button>}
        <Button type="submit" size="lg" colorPalette="hse" px="3" justifySelf={{ md: 'end' }} whiteSpace="normal" textAlign="center">
          {showResults ? 'Показать подборку' : 'Дальше'} <span aria-hidden="true">→</span>
        </Button>
      </Grid>
    </chakra.form>
  )
}
