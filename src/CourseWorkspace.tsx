import { Box, Button, Flex, Grid, Heading, Link, Stack, Table, Text, chakra } from '@chakra-ui/react'
import type { RefObject } from 'react'
import { CourseQuestions } from './CourseQuestions.tsx'
import { CoursePreview } from './Showcase.tsx'
import { officialCatalogUrl } from './officialCatalog.ts'
import {
  courseActivities, courseFacts, courseFormat, courseHours, coursePeriod, courseRequirements, courseTopics, type ShowcaseCourse,
} from './showcase.ts'

type HeadingRef = RefObject<HTMLHeadingElement | null>

function CourseTopics({ item }: { item: ShowcaseCourse }) {
  return item.editorial?.topics?.length
    ? <Box as="ul" listStyle="disc" ps="5">{item.editorial.topics.map(topic => <Box as="li" key={topic}>{topic}</Box>)}</Box>
    : <Text color="catalog.muted">{courseTopics(item)}</Text>
}

function CourseActivities({ item }: { item: ShowcaseCourse }) {
  return item.editorial?.activities?.length
    ? <Box as="ul" listStyle="disc" ps="5">{item.editorial.activities.map(activity => <Box as="li" key={activity}>{activity}</Box>)}</Box>
    : <Text color="catalog.muted">{courseActivities(item)}</Text>
}

export function CourseDetails({ item, headingRef, saved, reason, onSave, onBack }: {
  item: ShowcaseCourse
  headingRef: HeadingRef
  saved: boolean
  reason?: string
  onSave: () => void
  onBack: () => void
}) {
  const { course, editorial } = item

  return (
    <Stack gap="5">
      <Button type="button" variant="plain" px="0" alignSelf="start" color="hse.fg" onClick={onBack}>
        <span aria-hidden="true">←</span> Назад
      </Button>
      <Stack gap="2">
        <Text color="gsb.fg" fontWeight="semibold">{item.theme}</Text>
        <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '4xl' }} overflowWrap="anywhere" _focusVisible={{ outline: 'none' }}>
          {course.title}
        </Heading>
        {editorial?.teaser && <Text color="catalog.muted" maxW="3xl">{editorial.teaser}</Text>}
        {reason && <Text color="hse.fg" fontSize="sm">{reason}</Text>}
        <Flex gap="2" wrap="wrap" mt="2">
          <Button type="button" colorPalette="hse" variant={saved ? 'subtle' : 'solid'} aria-pressed={saved} onClick={onSave} minH="12">
            {saved ? 'Отложено' : 'Отложить'}
          </Button>
          <CourseQuestions items={[item]} reason={reason} />
        </Flex>
      </Stack>
      <Grid gap="4" templateColumns={{ base: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }}>
        <Stack as="section" layerStyle="catalogSurface" p="4" gap="3">
          <Heading as="h2" size="lg">О чём курс</Heading>
          <CourseTopics item={item} />
          {item.contentSource && <Link href={item.contentSource} target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline">
            Темы на сайте ВШЭ <span aria-hidden="true">↗</span>
          </Link>}
        </Stack>
        <Stack as="section" layerStyle="catalogSurface" p="4" gap="3">
          <Heading as="h2" size="lg">Что происходит на занятиях</Heading>
          <CourseActivities item={item} />
        </Stack>
        <Stack as="section" layerStyle="catalogSurface" p="4" gap="3">
          <Heading as="h2" size="lg">Посмотреть изнутри</Heading>
          {editorial?.material ? (
            <Link href={editorial.material.url} target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline">
              {editorial.material.title} <span aria-hidden="true">↗</span>
            </Link>
          ) : <Text color="catalog.muted">В локальной справке пока нет примера задания или материала курса.</Text>}
        </Stack>
        <Stack as="section" layerStyle="catalogSurface" p="4" gap="3">
          <Heading as="h2" size="lg">Подойдёт ли мне участие</Heading>
          <Grid as="dl" templateColumns={{ base: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }} gap="3">
            {courseFacts(item).map(([label, value]) => (
              <Box key={label} overflowWrap="anywhere">
                <Text as="dt" fontWeight="semibold" fontSize="sm">{label}</Text>
                <Text as="dd" color="catalog.muted">{value}</Text>
              </Box>
            ))}
          </Grid>
        </Stack>
      </Grid>
      <Button asChild colorPalette="hse" variant="outline" minH="12" alignSelf="start">
        <a href={course.url} target="_blank" rel="noreferrer">Открыть программу ВШЭ <span aria-hidden="true">↗</span></a>
      </Button>
    </Stack>
  )
}

export function SavedCourses({ items, status, selected, headingRef, onOpen, onRemove, onCompare, onSelectionChange }: {
  items: readonly ShowcaseCourse[]
  status: 'loading' | 'unavailable' | 'ready'
  selected: readonly string[]
  headingRef: HeadingRef
  onOpen: (id: string) => void
  onRemove: (id: string) => void
  onCompare: () => void
  onSelectionChange: (ids: readonly string[]) => void
}) {
  return (
    <Stack gap="5">
      <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '4xl' }} _focusVisible={{ outline: 'none' }}>
        Отложенные курсы
      </Heading>
      {status === 'loading' ? <Text role="status" color="catalog.muted">Загружаем отложенные курсы…</Text>
        : status === 'unavailable' ? <Text role="alert" color="catalog.muted">
          Данные об отложенных курсах не загрузились. <Link href={officialCatalogUrl} color="hse.fg" textDecoration="underline">Открыть каталог ВШЭ</Link>
        </Text>
        : items.length === 0 ? <Text role="status" color="catalog.muted">Список пока пуст. Отложите интересные курсы в витрине.</Text> : <>
        <Flex wrap="wrap" gap="3" align="center">
          <Button type="button" colorPalette="hse" minH="12" disabled={selected.length < 2} onClick={onCompare}>Сравнить</Button>
          <Text color="catalog.muted" fontSize="sm">Выбрано для сравнения — {selected.length}. Можно сравнить 2–3 курса.</Text>
        </Flex>
        <Grid as="ul" role="list" layerStyle="catalogGrid">
          {items.map(item => {
            const id = item.course.id
            const checked = selected.includes(id)
            return <Stack as="li" key={id} minW="0" gap="2">
              <CoursePreview item={item} saved onOpen={() => onOpen(id)} onSave={() => onRemove(id)} />
              <chakra.label display="flex" alignItems="center" minH="12" gap="2" cursor="pointer">
                <chakra.input type="checkbox" checked={checked} disabled={!checked && selected.length >= 3}
                  aria-label={`Включить в сравнение: ${item.course.title}`}
                  onChange={() => onSelectionChange(checked ? selected.filter(itemId => itemId !== id) : [...selected, id])}
                  boxSize="4" accentColor="hse.solid"
                />
                Для сравнения
              </chakra.label>
            </Stack>
          })}
        </Grid>
      </>}
    </Stack>
  )
}

const comparisonRows = [
  ['О чём курс', courseTopics],
  ['Что делают на занятиях', courseActivities],
  ['Требования', courseRequirements],
  ['Формат занятий', courseFormat],
  ['Период', coursePeriod],
  ['Объём', courseHours],
] as const

export function CourseComparison({ items, headingRef, onBack }: {
  items: readonly ShowcaseCourse[]
  headingRef: HeadingRef
  onBack: () => void
}) {
  return (
    <Stack gap="5">
      <Button type="button" variant="plain" px="0" alignSelf="start" color="hse.fg" onClick={onBack}>
        <span aria-hidden="true">←</span> К отложенным
      </Button>
      <Heading as="h1" ref={headingRef} tabIndex={-1} size={{ base: '2xl', md: '4xl' }} _focusVisible={{ outline: 'none' }}>
        Сравнение курсов
      </Heading>
      <Box alignSelf="start"><CourseQuestions items={items} /></Box>
      {items.length === 3 && <Text display={{ base: 'block', md: 'none' }} color="catalog.muted" fontSize="sm">Прокрутите таблицу вбок, чтобы увидеть все курсы.</Text>}
      <Box overflowX="auto" layerStyle="catalogSurface" tabIndex={0} role="region" aria-label="Поля для сравнения курсов" minW="0">
        <Table.Root tableLayout="fixed" minW={items.length === 3 ? '44rem' : undefined} size={{ base: 'sm', md: 'md' }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader scope="col" w={{ base: '23%', md: '20%' }}>Раздел</Table.ColumnHeader>
              {items.map(item => <Table.ColumnHeader key={item.course.id} scope="col" whiteSpace="normal" overflowWrap="anywhere">
                <Text color="gsb.fg" fontSize="sm">{item.theme}</Text>
                <Text fontWeight="bold" fontSize="md">{item.course.title}</Text>
              </Table.ColumnHeader>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {comparisonRows.map(([label, value]) => (
              <Table.Row key={label}>
                <Table.Cell as="th" scope="row" fontWeight="semibold" verticalAlign="top" overflowWrap="anywhere">{label}</Table.Cell>
                {items.map(item => <Table.Cell key={item.course.id} verticalAlign="top" overflowWrap="anywhere">{value(item)}</Table.Cell>)}
              </Table.Row>
            ))}
            <Table.Row>
              <Table.Cell as="th" scope="row" fontWeight="semibold">Перед записью</Table.Cell>
              {items.map(item => <Table.Cell key={item.course.id}>
                <Text mb="1">Уточните расписание и условия записи.</Text>
                <Link href={item.course.url} target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline">
                  Программа ВШЭ <span aria-hidden="true">↗</span>
                </Link>
              </Table.Cell>)}
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  )
}
