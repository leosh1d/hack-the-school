import { Box, Button, Flex, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { OfficialCourseCard } from './OfficialCourseCard.tsx'
import type { OfficialCourse } from './officialCatalog.ts'

const pageSize = 6

export function OfficialCourseList({ heading, items }: {
  heading: string
  items: readonly { course: OfficialCourse; reasons?: readonly string[] }[]
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const headingId = useId()

  return (
    <Stack as="section" aria-labelledby={headingId} gap="3">
      <Flex align="center" justify="space-between" wrap="wrap" gap="2">
        <Heading as="h2" size="md" id={headingId}>{heading}</Heading>
        <Text color="catalog.muted" fontSize="sm">Показано {Math.min(visibleCount, items.length)} из {items.length}</Text>
      </Flex>
      <Grid as="ul" role="list" layerStyle="catalogGrid">
        {items.slice(0, visibleCount).map(({ course, reasons }) => (
          <Box as="li" key={course.id} minW="0"><OfficialCourseCard course={course} reasons={reasons} /></Box>
        ))}
      </Grid>
      {visibleCount < items.length && (
        <Button type="button" colorPalette="hse" variant="outline" alignSelf={{ base: 'stretch', sm: 'start' }}
          onClick={() => setVisibleCount(current => current + pageSize)}
        >Показать ещё</Button>
      )}
    </Stack>
  )
}
