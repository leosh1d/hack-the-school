import { Box, Button, Collapsible, Flex, Grid, Heading, Input, Progress, Stack, Text, chakra } from '@chakra-ui/react'
import { useState, type FormEvent, type RefObject } from 'react'
import { areas, goals, topics, trailSteps, type Area, type Topic, type TrailState } from './courseTrail.ts'

const areaKeys = Object.keys(areas) as Area[]
const goalKeys = Object.keys(goals) as (keyof typeof goals)[]

function toggle<Key>(items: readonly Key[], key: Key) {
  return items.includes(key) ? items.filter(item => item !== key) : [...items, key]
}

function Choice({ title, checked, onChange, card = false, radio = false }: {
  title: string
  checked: boolean
  onChange: () => void
  card?: boolean
  radio?: boolean
}) {
  return (
    <chakra.label
      display="flex" flexDirection={card ? 'column' : 'row'} alignItems={card ? 'start' : 'center'}
      gap={card ? '2' : '3'} minH={card ? '20' : '12'} px={card ? '4' : '3'} py={card ? '3' : '2'}
      borderWidth="1px" borderColor={checked ? 'hse.solid' : 'catalog.border'} borderRadius="md"
      bg={checked ? 'hse.100' : 'catalog.surface'} fontWeight={checked || card ? 'semibold' : 'medium'}
      cursor="pointer" _hover={{ borderColor: checked ? 'hse.solid' : 'hse.400' }}
      _active={{ bg: 'hse.100' }}
      _motionSafe={{
        transition: 'background-color 150ms, border-color 150ms, scale 140ms, translate 140ms',
        _active: { scale: '0.99', translate: '0 1px' },
      }}
    >
      <chakra.input
        type={radio ? 'radio' : 'checkbox'} name={radio ? 'trail-priority' : undefined}
        checked={checked} onChange={onChange} boxSize="4" flexShrink="0" accentColor="hse.solid"
        _focusVisible={{ outline: '2px solid', outlineColor: 'hse.700', outlineOffset: '2px' }}
      />
      {title}
    </chakra.label>
  )
}

function OwnInterest({ interests, onChange }: { interests: readonly string[]; onChange: (interests: string[]) => void }) {
  const [input, setInput] = useState('')

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = input.trim()
    if (!value || interests.includes(value)) return
    onChange([...interests, value])
    setInput('')
  }

  return (
    <Collapsible.Root defaultOpen={interests.length > 0}>
      <Collapsible.Trigger asChild>
        <Button type="button" variant="plain" color="hse.fg" px="0" minH="12">Добавить свой интерес</Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Stack gap="2">
          <chakra.form onSubmit={add} display="flex" gap="2">
            <Input
              aria-label="Свой интерес" minH="12" minW="0" bg="catalog.surface"
              placeholder="Например, исследовательские интервью" maxLength={90}
              value={input} onChange={event => setInput(event.target.value)}
            />
            <Button type="submit" minH="12" colorPalette="hse" variant="outline" disabled={!input.trim()}>Добавить</Button>
          </chakra.form>
          <Flex wrap="wrap" gap="2">
            {interests.map(interest => <Button key={interest} type="button" size="sm" variant="subtle" colorPalette="hse"
              maxW="full" minW="0" h="auto" minH="8" py="1" whiteSpace="normal" textAlign="start"
              aria-label={`Удалить интерес ${interest}`} onClick={() => onChange(interests.filter(value => value !== interest))}
            >
              <Text as="span" minW="0" overflowWrap="anywhere">{interest}</Text>
              <Box as="span" flexShrink="0" aria-hidden="true">×</Box>
            </Button>)}
          </Flex>
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function ProfileForm({ state, headingRef, onChange }: {
  state: TrailState
  headingRef: RefObject<HTMLHeadingElement | null>
  onChange: (state: TrailState) => void
}) {
  if (state.stage === 'feed') return null
  const stage = state.stage
  const steps = trailSteps(state)
  const index = steps.indexOf(stage)
  const previous = steps[index - 1]
  const next = steps[index + 1]
  const total = stage === 'areas' ? trailSteps({ areas: areaKeys }).length : steps.length
  const percent = Math.round((index + 1) / total * 100)
  const area = stage === 'areas' || stage === 'goals' || stage === 'priority' ? undefined : areas[stage]
  const title = stage === 'areas' ? 'Что тебе интересно?'
    : stage === 'goals' ? 'Что хочется унести с курса?'
    : stage === 'priority' ? 'Что поставить на первое место?'
    : 'Что именно тебя цепляет?'
  const description = stage === 'areas' ? 'Отметь всё, что хочется попробовать в следующем семестре.'
    : stage === 'goals' ? 'Можно отметить несколько целей.'
    : area ? 'Можно выбрать несколько занятий или оставить тему широкой.' : undefined

  function update(values: Partial<TrailState>) {
    onChange({ ...state, ...values })
  }

  function topicChoice(id: Topic) {
    return <Choice title={topics[id]} checked={state.tags.includes(id)} onChange={() => update({ tags: toggle(state.tags, id) })} />
  }

  function showFeed() {
    update({ stage: 'feed', from: stage })
  }

  function choices() {
    if (stage === 'areas') {
      return <Stack gap="2">
        <Grid gap="2" templateColumns="repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr))">
          {areaKeys.map(id => <Choice key={id} card title={areas[id][0]} checked={state.areas.includes(id)}
            onChange={() => update({ areas: toggle(state.areas, id) })} />)}
        </Grid>
        <OwnInterest interests={state.own} onChange={own => update({ own })} />
      </Stack>
    }
    if (stage === 'goals') {
      return <Stack gap="2">
        {goalKeys.map(id => <Choice key={id} title={goals[id]} checked={state.goals.includes(id)}
          onChange={() => update({ goals: toggle(state.goals, id) })} />)}
      </Stack>
    }
    if (stage === 'priority') {
      return <Stack gap="2">
        <Choice radio title="Все интересы на равных" checked={!state.priority} onChange={() => update({ priority: '' })} />
        {state.areas.map(id => <Choice key={id} radio title={areas[id][0]} checked={state.priority === id}
          onChange={() => update({ priority: id })} />)}
      </Stack>
    }
    return <Stack gap="2">
      {areas[stage][1].map(id => <Stack key={id} gap="2">
        {topicChoice(id)}
        {id === 'ai' && state.tags.includes('ai') && (
          <Stack gap="2" ps="3" borderStartWidth="2px" borderColor="catalog.border"
            _motionSafe={{ animationName: 'fade-in', animationDuration: 'fast' }}>
            {topicChoice('ml')}
            {state.tags.includes('ml') && <Box ps="3">{topicChoice('nlp')}</Box>}
          </Stack>
        )}
      </Stack>)}
    </Stack>
  }

  return (
    <Stack gap="4" minH="0">
      <Progress.Root value={index + 1} max={total} size="xs" shape="full" colorPalette="hse"
        display="flex" flexShrink="0" alignItems="center" gap="3"
      >
        <Progress.Label color="gsb.fg" fontWeight="semibold" whiteSpace="nowrap">Шаг {index + 1}</Progress.Label>
        <Progress.Track flex="1" bg="hse.200" aria-label="Ход подбора" aria-valuetext={`Шаг ${index + 1}, ${percent}%`}>
          <Progress.Range borderRadius="full" transition="none" _motionSafe={{ transition: 'width 180ms ease-out' }} />
        </Progress.Track>
      </Progress.Root>
      <chakra.fieldset
        key={stage} flex="1" minW="0" minH="0" p="1" overflowY={{ base: 'auto', md: 'visible' }}
        aria-labelledby="trail-question" aria-describedby={description ? 'trail-description' : undefined}
        _motionSafe={{ animationName: 'fade-in, slide-from-bottom', animationDuration: 'fast', animationTimingFunction: 'ease-out' }}
      >
        {area && <Text color="gsb.fg" fontWeight="semibold" fontSize="sm" mb="1">{area[0]}</Text>}
        <Heading as="h1" id="trail-question" ref={headingRef} tabIndex={-1} size={{ base: 'xl', md: '3xl' }}
          mb={description ? '2' : '5'} _focusVisible={{ outline: 'none' }}
        >{title}</Heading>
        {description && <Text color="catalog.muted" id="trail-description" mb="5" fontSize="sm">{description}</Text>}
        {choices()}
      </chakra.fieldset>

      <Stack flexShrink="0" gap="2" pt={{ base: '2', md: '0' }} pb={{ base: 'max(0.75rem, env(safe-area-inset-bottom))', md: '0' }}>
        <Grid gap="2" justifyContent={{ md: 'end' }}
          templateColumns={previous ? { base: 'minmax(0, 1fr) minmax(0, 1.8fr)', md: 'auto auto' } : 'minmax(0, 1fr)'}
        >
          {previous && <Button type="button" variant="outline" colorPalette="hse" minH="12" onClick={() => update({ stage: previous })}>
            <span aria-hidden="true">←</span> Назад
          </Button>}
          <Button type="button" minH="12" colorPalette="hse" justifySelf={{ md: 'end' }} minW={{ md: '44' }}
            onClick={next ? () => update({ stage: next }) : showFeed}
          >{next ? 'Дальше' : 'Посмотреть подборку'} <span aria-hidden="true">→</span></Button>
        </Grid>
        {(next || index > 1) && (
          <Flex wrap="wrap" justify={{ base: 'center', md: 'end' }} gap="2">
            {next && <Button type="button" variant="plain" color="hse.fg" onClick={showFeed} size="sm">
              {index || state.areas.length || state.own.length ? 'Уже показать подборку' : 'Посмотреть разные темы'}
            </Button>}
            {index > 1 && <Button type="button" variant="plain" color="hse.fg" size="sm" onClick={() => update({ stage: 'areas' })}>
              Изменить интересы
            </Button>}
          </Flex>
        )}
      </Stack>
    </Stack>
  )
}
