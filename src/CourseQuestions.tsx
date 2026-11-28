import { Box, Button, CloseButton, Dialog, Input, Link, Portal, Stack, Text, chakra } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { courseActivities, courseFormat, courseHours, coursePeriod, courseRequirements, courseTopics, type ShowcaseCourse } from './showcase.ts'

const materialQuestion = /материал|презентац|пример задан/iu

function answerRequest(item: ShowcaseCourse, request: string, reason?: string) {
  const query = request.toLowerCase()
  if (/запис|мест[ао]|подать|дедлайн/u.test(query)) return 'Актуальные условия записи и наличие мест уточните в ВШЭ.'
  if (/сравн|отлич|разниц/u.test(query)) return courseTopics(item)
  if (/python|питон/u.test(query)) {
    const requirements = item.editorial?.requirements
    return requirements && /python|питон/iu.test(requirements)
      ? requirements
      : [requirements, 'В локальной справке нет сведений об обязательном знании Python.'].filter(Boolean).join(' ')
  }
  if (/подготов|знать|требован|prereq/u.test(query)) return courseRequirements(item)
  if (/онлайн|дистан|очно/u.test(query)) {
    const format = item.editorial?.format
    return format && /онлайн|дистан|очн/iu.test(format) ? format : 'В доступных сведениях формат присутствия не указан.'
  }
  if (/формат/u.test(query)) return courseFormat(item)
  if (/период|модул|когда|распис/u.test(query)) return `Период по каталогу — ${coursePeriod(item)}. Расписание уточните в ВШЭ.`
  if (/час|нагруз|времени|кредит/u.test(query)) {
    const credits = item.course.credits === undefined ? '' : ` Кредиты — ${item.course.credits}.`
    return `Объём за весь курс — ${courseHours(item)}.${credits}`
  }
  if (/язык|английс|русск/u.test(query) && item.course.language) return `Язык по каталогу — ${item.course.language}.`
  if (/почему|предлож/u.test(query)) return reason ?? 'Вариант доступен в витрине курса. Подбор по интересам учитывает только темы, которые вы отметили.'
  if (materialQuestion.test(query)) return item.editorial?.material ? 'В программе есть открытый пример.' : 'В локальной справке нет ссылки на отдельный материал курса.'
  if (/тем[ауые]|содерж|о чем|о чём/u.test(query)) return courseTopics(item)
  if (/занят|дела|обсужд|самостоятель|проект/u.test(query)) {
    return /больше|соотношен/u.test(query)
      ? `${courseActivities(item)} В справке нет сведений о соотношении этих видов работы.`
      : courseActivities(item)
  }
  return 'В локальной справке есть данные о темах, занятиях, требованиях, периоде и нагрузке. Попробуйте спросить об одном из них.'
}

export function CourseQuestions({ items, reason }: { items: readonly ShowcaseCourse[]; reason?: string }) {
  const multiple = items.length > 1
  const [input, setInput] = useState('')
  const [request, setRequest] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (input.trim()) {
      setRequest(input.trim())
      setInput('')
      inputRef.current?.focus()
    }
  }

  return (
    <Dialog.Root size="lg" placement="center" scrollBehavior="inside" motionPreset="none" lazyMount initialFocusEl={() => inputRef.current}>
      <Dialog.Trigger asChild>
        <Button type="button" variant="outline" colorPalette="hse" minH="12">
          {multiple ? 'Спросить о курсах' : 'Спросить о курсе'}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop _open={{ animationName: 'none' }} _closed={{ animationName: 'none' }} />
        <Dialog.Positioner alignItems={{ base: 'end', sm: 'center' }}>
          <Dialog.Content my={{ base: '0', sm: 'auto' }} maxH={{ base: 'min(85dvh, 100%)', sm: '80dvh' }}
            borderTopRadius="xl" borderBottomRadius={{ base: '0', sm: 'xl' }}>
            <Dialog.Header display="grid" gap="1" px="4" pe="12">
              <Dialog.Title>{multiple ? 'Справка по курсам' : 'Справка по курсу'}</Dialog.Title>
              <Dialog.Description color="catalog.muted">
                Локальные ответы по материалам выбранных курсов ВШЭ. Запрос остаётся в браузере.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild><CloseButton aria-label="Закрыть справку" minH="12" minW="12" /></Dialog.CloseTrigger>
            <Dialog.Body px="4" py="3" minH="0" overscrollBehavior="contain">
              <Stack role="log" aria-label="Ответ по материалам курсов" gap="3" overflowWrap="anywhere">
                {request && <>
                  <Text alignSelf="end" px="3" py="2" bg="hse.100" borderRadius="md">{request}</Text>
                  {items.map(item => (
                    <Box key={item.course.id} layerStyle="catalogSurface" p="3">
                      <Text fontWeight="semibold" mb="1">{item.course.title}</Text>
                      <Text>{answerRequest(item, request, reason)}</Text>
                      {materialQuestion.test(request) && item.editorial?.material && (
                        <Link display="block" href={item.editorial.material.url} target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline" mt="2">
                          {item.editorial.material.title} <span aria-hidden="true">↗</span>
                        </Link>
                      )}
                      <Link href={item.course.url} target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline" mt="2">
                        Программа ВШЭ <span aria-hidden="true">↗</span>
                      </Link>
                      {item.contentSource && <Link display="block" href={item.contentSource} target="_blank" rel="noreferrer" color="hse.fg" textDecoration="underline" mt="2">
                        Темы на сайте ВШЭ <span aria-hidden="true">↗</span>
                      </Link>}
                    </Box>
                  ))}
                </>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer display="block" px="4" borderTopWidth="1px" borderColor="catalog.border"
              pb="max(1rem, env(safe-area-inset-bottom))">
              <chakra.form onSubmit={ask} display="flex" alignItems="end" gap="2">
                <chakra.label display="grid" gap="1.5" minW="0" flex="1" fontSize="sm" fontWeight="semibold">
                  Ваш вопрос
                  <Input ref={inputRef} value={input} onChange={event => setInput(event.target.value)}
                    placeholder="Например, требования" minH="12" fontSize="md" maxLength={240} />
                </chakra.label>
                <Button type="submit" colorPalette="hse" minH="12" disabled={!input.trim()}>Спросить</Button>
              </chakra.form>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
