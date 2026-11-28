import { Box, Button, CloseButton, Dialog, Input, Portal, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { courses, type Course } from './catalog.ts'
import { searchCourses } from './discovery.ts'

type Reply = { query: string; matches: readonly Course[] }

export function CourseChat() {
  const [input, setInput] = useState('')
  const [replies, setReplies] = useState<Reply[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [replies])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    const query = input.trim()
    if (!query) return

    const matches = searchCourses(courses, query)
    setReplies(previous => [...previous, { query, matches }])
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <Dialog.Root
      size="lg" placement="center" scrollBehavior="inside" motionPreset="none" lazyMount
      initialFocusEl={() => inputRef.current}
    >
      <Dialog.Trigger asChild>
        <Button
          type="button" variant="outline" colorPalette="hse" size="lg" minH="14" px="4" justifyContent="space-between"
          bg="catalog.surface" color="catalog.ink" borderColor="catalog.border" borderRadius="md" fontWeight="semibold"
          _hover={{ bg: 'catalog.surface', borderColor: 'hse.400' }}
          _active={{ bg: 'hse.100' }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'hse.700', outlineOffset: '2px' }}
          _motionSafe={{ transition: 'scale 140ms, translate 140ms', _active: { scale: '0.99', translate: '0 1px' } }}
        >
          Расскажу в чате <Box as="span" aria-hidden="true">↗</Box>
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop _open={{ animationName: 'none' }} _closed={{ animationName: 'none' }}
          _motionSafe={{
            _open: { animationName: 'fade-in', animationDuration: 'fast' },
            _closed: { animationName: 'fade-out', animationDuration: 'fast' },
          }}
        />
        <Dialog.Positioner alignItems={{ base: 'end', sm: 'center' }}>
          <Dialog.Content
            bg="catalog.surface" color="catalog.ink" my={{ base: '0', sm: 'auto' }}
            minH={{ base: 'min(28rem, 78dvh)', sm: 'unset' }} maxH={{ base: '100%', sm: 'calc(100% - 5rem)' }}
            borderTopRadius={{ base: '2xl', sm: 'xl' }} borderBottomRadius={{ base: '0', sm: 'xl' }}
            _motionSafe={{
              _open: { animationName: { base: 'slide-from-bottom-full', sm: 'scale-in, fade-in' }, animationDuration: 'fast', animationTimingFunction: 'ease-out' },
              _closed: { animationName: { base: 'slide-to-bottom-full', sm: 'scale-out, fade-out' }, animationDuration: 'fast', animationTimingFunction: 'ease-in' },
            }}
          >
            <Dialog.Header display="grid" gap="1" px={{ base: '4', sm: '6' }} pe={{ base: '12', sm: '14' }}>
              <Dialog.Title>Чат по факультативам</Dialog.Title>
              <Dialog.Description color="catalog.muted">
                Ищем по демокаталогу. Запрос остаётся в браузере.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton minW="12" minH="12" aria-label="Закрыть чат" />
            </Dialog.CloseTrigger>
            <Dialog.Body ref={bodyRef} minH="0" overscrollBehavior="contain" px={{ base: '4', sm: '6' }} py="4">
              <Stack gap="4" role="log" aria-label="Ответы по каталогу">
                {replies.map(({ query, matches }, index) => (
                  <Stack key={index} gap="2" overflowWrap="anywhere">
                    <Text alignSelf="end" maxW="90%" px="3" py="2" bg="hse.100" borderRadius="md">{query}</Text>
                    <Box alignSelf="start" maxW="100%" px="3" py="2" bg="gray.100" borderRadius="md">
                      {matches.length ? (
                        <>
                          <Text color="catalog.muted" fontSize="sm">Совпадений: {matches.length}</Text>
                          <Stack as="ul" gap="1" listStyle="none" mt="1">
                            {matches.map(course => (
                              <Box as="li" key={course.id} fontWeight="semibold">{course.title}</Box>
                            ))}
                          </Stack>
                        </>
                      ) : (
                        <Text>По этому запросу курсы не найдены.</Text>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer
              display="block" px={{ base: '4', sm: '6' }} pb="max(1rem, env(safe-area-inset-bottom))"
              borderTopWidth="1px" borderColor="catalog.border"
            >
              <chakra.form onSubmit={submit} display="flex" alignItems="end" gap="2">
                <chakra.label display="grid" gap="1.5" minW="0" flex="1" fontSize="sm" fontWeight="semibold">
                  Запрос по каталогу
                  <Input ref={inputRef} value={input} onChange={event => setInput(event.target.value)}
                    minH="12" placeholder="Например, курс по SQL" maxLength={200} borderColor="catalog.border" fontSize="md" fontWeight="normal"
                  />
                </chakra.label>
                <Button type="submit" minH="12" colorPalette="hse" disabled={!input.trim()}>Отправить</Button>
              </chakra.form>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
