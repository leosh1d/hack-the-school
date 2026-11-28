import { Box, Button, Stack, Text, chakra } from '@chakra-ui/react'
import { useId, useState, type FormEvent } from 'react'
import type { Course } from './catalog.ts'

export function CourseQuiz({ quiz, language }: { quiz: Course['quiz']; language: Course['language'] }) {
  const answerGroup = useId()
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (answer !== null) setChecked(true)
  }

  return (
    <chakra.details borderTopWidth="1px" borderColor="catalog.border">
      <chakra.summary py="3" color="hse.solid" fontWeight="semibold" cursor="pointer" _focusVisible={{ outline: '2px solid', outlineColor: 'gsb.solid', outlineOffset: '2px' }}>Проверить себя</chakra.summary>
      <chakra.form onSubmit={submit} pb="3">
        <chakra.fieldset mb="3" minW="0" lang={language}>
          <chakra.legend mb="2" fontSize="sm" fontWeight="semibold">{quiz.question}</chakra.legend>
          <Stack gap="1.5">
            {quiz.options.map((option, index) => (
              <chakra.label key={option} display="flex" alignItems="center" gap="2" p="2" borderWidth="1px" borderRadius="md" fontSize="sm" cursor="pointer"
                borderColor={answer === index ? 'hse.solid' : 'catalog.border'} bg={answer === index ? 'hse.50' : undefined}>
                <chakra.input type="radio" name={answerGroup} checked={answer === index} onChange={() => {
                  setAnswer(index)
                  setChecked(false)
                }} boxSize="4" flexShrink="0" accentColor="hse.solid" />
                {option}
              </chakra.label>
            ))}
          </Stack>
        </chakra.fieldset>
        <Button type="submit" size="sm" colorPalette="hse" disabled={answer === null}>Проверить ответ</Button>
        <Box role="status">
          {checked && <Box mt="2.5" p="2.5" borderRadius="md" fontSize="sm" bg={answer === quiz.correct ? 'hse.50' : 'gsb.50'}>
            <Text fontWeight="semibold">{answer === quiz.correct ? 'Верно' : 'Ответ пока неверный'}</Text>
            <Text lang={language} mt="1">{quiz.explanation}</Text>
          </Box>}
        </Box>
      </chakra.form>
    </chakra.details>
  )
}
