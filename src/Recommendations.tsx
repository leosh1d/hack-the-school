import { Button, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { OfficialCourseList } from './OfficialCourseList.tsx'
import { loadOfficialCourses, officialCatalogUrl } from './officialCatalog.ts'
import { loadOfficialCourseThemes, recommendOfficialCourses, type OfficialPreferences } from './officialRecommendations.ts'

export function Recommendations({ preferences, onEdit, onBrowse }: {
  preferences: OfficialPreferences
  onEdit: () => void
  onBrowse: () => void
}) {
  const [matches, setMatches] = useState<ReturnType<typeof recommendOfficialCourses> | 'unavailable' | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([loadOfficialCourses(), loadOfficialCourseThemes()]).then(
      ([courses, themes]) => { if (active) setMatches(recommendOfficialCourses(courses, themes, preferences)) },
      () => { if (active) setMatches('unavailable') },
    )
    return () => { active = false }
  }, [preferences])

  return (
    <Stack gap="4">
      <Button type="button" variant="plain" size="sm" p="0" color="hse.solid" alignSelf="end" onClick={onEdit}>Изменить ответы</Button>
      {matches === null ? (
        <Text role="status" color="catalog.muted">Загружаем подборку…</Text>
      ) : matches === 'unavailable' ? (
        <Text role="alert" color="catalog.muted">
          Не удалось загрузить подборку. <Link href={officialCatalogUrl} color="hse.fg">Открыть каталог ВШЭ</Link>
        </Text>
      ) : matches.length ? (
        <OfficialCourseList heading="Рекомендации" items={matches} />
      ) : (
        <Stack as="section" layerStyle="catalogSurface" p="5" gap="2">
          <Heading as="h2" size="md">Подходящих курсов пока нет</Heading>
          <Text color="catalog.muted">Попробуйте увеличить лимит часов, выбрать больше модулей или поменять язык.</Text>
          <Button type="button" variant="plain" size="sm" p="0" alignSelf="start" color="hse.solid" onClick={onBrowse}>
            Смотреть каталог <span aria-hidden="true">→</span>
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
