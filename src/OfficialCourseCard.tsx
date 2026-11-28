import { Box, Button, Card, Grid, Text } from '@chakra-ui/react'
import { useId } from 'react'
import type { OfficialCourse } from './officialCatalog.ts'

export function OfficialCourseCard({ course }: { course: OfficialCourse }) {
  const headingId = useId()
  const facts = [
    ['Учебный год', course.academicYear],
    ['Язык', course.language],
    ['Период', course.term],
    ['Кредиты', course.credits],
    ['Контактные часы', course.contactHours],
    ['Онлайн-часы', course.onlineHours],
    ['Аудитория', course.audience],
  ] as const

  return (
    <Card.Root as="article" layerStyle="catalogSurface" h="full" minW="0" aria-labelledby={headingId}>
      <Card.Body px="4" py="4" gap="3">
        <Text color="catalog.muted" fontSize="xs">{course.status} · {course.campus}</Text>
        <Card.Title as="h3" id={headingId} overflowWrap="anywhere">{course.title}</Card.Title>
        {(course.department || course.faculty) && <Box color="catalog.muted" fontSize="sm">
          {course.department && <Text>{course.department}</Text>}
          {course.faculty && course.faculty !== course.department && <Text>{course.faculty}</Text>}
        </Box>}
        <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap="2.5" borderTopWidth="1px" borderColor="catalog.border" pt="2.5" mt="auto">
          {facts.map(([label, value]) => value !== undefined && (
            <Box key={label}>
              <Text as="dt" fontSize="xs" color="catalog.muted">{label}</Text>
              <Text as="dd" fontSize="sm" fontWeight="semibold">{value}</Text>
            </Box>
          ))}
        </Grid>
      </Card.Body>
      <Card.Footer px="4" pt="0" pb="4">
        <Button asChild variant="outline" colorPalette="hse" size="sm">
          <a href={course.url} target="_blank" rel="noreferrer">Открыть на сайте ВШЭ <span aria-hidden="true">↗</span></a>
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}
