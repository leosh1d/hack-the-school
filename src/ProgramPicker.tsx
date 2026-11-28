import { Combobox, Portal, Stack, Text, useCombobox, useFilter, useListCollection } from '@chakra-ui/react'
import type { EducationProgram } from './catalog.ts'
import programData from './education-programs.json'

const educationPrograms: EducationProgram[] = programData

export default function ProgramPicker({ value, invalid, onChange }: {
  value: EducationProgram | null
  invalid: boolean
  onChange: (program: EducationProgram | null) => void
}) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const { collection, filter } = useListCollection({
    initialItems: educationPrograms,
    itemToString: program => program.title,
    itemToValue: program => program.id,
    filter: contains,
  })
  const combobox = useCombobox({
    collection, value: value ? [value.id] : [], defaultInputValue: value?.title, selectionBehavior: 'preserve',
    ids: { label: 'survey-question' }, invalid, openOnClick: true,
    onInputValueChange({ inputValue, reason }) {
      if (reason !== 'input-change' && reason !== 'clear-trigger') return
      filter(inputValue.trim())
      if (value && inputValue !== value.title) onChange(null)
    },
    onValueChange({ items }) {
      const selected = items[0] ?? null
      if (selected) queueMicrotask(() => combobox.setInputValue(selected.title))
      filter('')
      onChange(selected)
    },
    positioning: { placement: 'bottom-start', sameWidth: true, strategy: 'fixed' },
    translations: {
      triggerLabel: 'Показать программы', clearTriggerLabel: 'Очистить программу',
      resultsCount: count => `Найдено программ: ${count}`, noResults: 'Программы не найдены',
    },
  })

  return (
    <Combobox.RootProvider value={combobox} lazyMount unmountOnExit size="lg" colorPalette="hse">
      <Combobox.Control>
        <Combobox.Input
          aria-labelledby="survey-question" aria-required="true" aria-describedby={invalid ? 'survey-error' : undefined}
          placeholder="Введите название программы" bg="catalog.surface" borderColor="catalog.border"
        />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      {value && <Text fontSize="sm" color="catalog.muted" mt="1">{value.campus} · {value.level}</Text>}
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content
            maxH="min(18rem, var(--available-height, 18rem))" overscrollBehaviorY="contain"
            layerStyle="catalogSurface" _open={{ animationName: 'none' }}
            _motionSafe={{ _open: { animationName: 'fade-in', animationDuration: 'fast' } }}
          >
            <Combobox.Empty color="catalog.muted">Программы не найдены. Попробуйте другое название.</Combobox.Empty>
            {collection.items.map(program => (
              <Combobox.Item key={program.id} item={program} minH="12" _highlighted={{ bg: 'hse.100' }}>
                <Combobox.ItemText asChild>
                  <Stack gap="0.5">
                    <Text fontWeight="semibold">{program.title}</Text>
                    <Text color="catalog.muted" fontSize="xs">{program.campus} · {program.level}</Text>
                  </Stack>
                </Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.RootProvider>
  )
}
