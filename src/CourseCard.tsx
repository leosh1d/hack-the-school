import { Badge, Box, Button, Card, Flex, Grid, Text, chakra } from '@chakra-ui/react'
import { useId } from 'react'
import { CourseQuiz } from './CourseQuiz.tsx'
import { classes, demoDate, formats, languages, levels, skills, smartWayUrl, subjects, type Course } from './catalog.ts'
import { isRegistrationOpen } from './discovery.ts'

const deadlineFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
})

export function CourseCard({ course, reasons }: { course: Course; reasons?: readonly string[] }) {
  const headingId = useId()
  const registrationOpen = isRegistrationOpen(course, demoDate)
  const status = registrationOpen ? 'Запись открыта' : course.available === 0 ? 'Мест нет' : 'Запись завершена'

  return (
    <Card.Root as="article" layerStyle="catalogSurface" h="full" minW="0" aria-labelledby={headingId}>
      <Card.Body px="4" py="4" gap="3">
        <Flex align="start" justify="space-between" wrap="wrap" gap="2" fontSize="xs" color="catalog.muted">
          <span>{formats[course.format]} · {classes[course.classType]} · {languages[course.language]}</span>
          <Badge colorPalette={registrationOpen ? 'hse' : 'gray'}>{status}</Badge>
        </Flex>
        <Card.Title as="h3" id={headingId}>{course.title}</Card.Title>
        <Card.Description color="catalog.muted">{course.description}</Card.Description>
        <Flex as="ul" wrap="wrap" gap="1.5" listStyle="none" aria-label="Навыки">
          {course.skills.map(skill => <Box as="li" key={skill} borderWidth="1px" borderColor="catalog.border" borderRadius="sm" px="1.5" py="0.5" color="catalog.muted" fontSize="xs">{skills[skill]}</Box>)}
        </Flex>
        {reasons && (
          <Box bg="hse.50" borderStartWidth="2px" borderColor="hse.solid" borderRadius="sm" px="3" py="2" fontSize="sm">
            <Text fontWeight="semibold" mb="1">Почему в подборке</Text>
            <Box as="ul" listStyle="disc" ps="4">{reasons.map(reason => <li key={reason}>{reason}</li>)}</Box>
          </Box>
        )}
        <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap="2.5" borderTopWidth="1px" borderColor="catalog.border" pt="2.5" mt="auto">
          <Box><Text as="dt" fontSize="xs" color="catalog.muted">Нагрузка</Text><Text as="dd" fontSize="sm" fontWeight="semibold">{course.hours} ч в неделю</Text></Box>
          <Box><Text as="dt" fontSize="xs" color="catalog.muted">Уровень курса</Text><Text as="dd" fontSize="sm" fontWeight="semibold">{levels[course.level]}</Text></Box>
          <Box><Text as="dt" fontSize="xs" color="catalog.muted">Дедлайн записи</Text><Text as="dd" fontSize="sm" fontWeight="semibold"><chakra.time dateTime={course.deadline}>{deadlineFormat.format(new Date(course.deadline))} МСК</chakra.time></Text></Box>
          <Box><Text as="dt" fontSize="xs" color="catalog.muted">Места</Text><Text as="dd" fontSize="sm" fontWeight="semibold">{registrationOpen ? `${course.available} из ${course.capacity} свободно` : course.capacity}</Text></Box>
        </Grid>
        {course.prerequisites.length > 0 && !reasons && <Text color="catalog.muted">Пригодятся основы: {course.prerequisites.map(subject => subjects[subject]).join(', ')}</Text>}
      </Card.Body>
      <Card.Footer display="block" px="4" pt="0" pb="4">
        <CourseQuiz quiz={course.quiz} language={course.language} />
        {registrationOpen && <Button asChild mt="1" variant="outline" colorPalette="hse" size="sm">
          <a href={smartWayUrl} target="_blank" rel="noreferrer">Открыть Smart Way <span aria-hidden="true">↗</span></a>
        </Button>}
      </Card.Footer>
    </Card.Root>
  )
}
