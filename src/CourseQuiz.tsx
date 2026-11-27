import { Button } from '@chakra-ui/react'
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
    <details className="course-quiz disclosure">
      <summary>Проверить себя</summary>
      <form onSubmit={submit} className="quiz-form">
        <fieldset className="quiz-options" lang={language}>
          <legend>{quiz.question}</legend>
          {quiz.options.map((option, index) => (
            <label key={option} className="quiz-answer">
              <input type="radio" name={answerGroup} checked={answer === index} onChange={() => {
                setAnswer(index)
                setChecked(false)
              }} />
              {option}
            </label>
          ))}
        </fieldset>
        <Button type="submit" size="sm" colorPalette="hse" disabled={answer === null}>Проверить ответ</Button>
        <div role="status">
          {checked && <div className="quiz-feedback" data-correct={answer === quiz.correct}>
            <strong>{answer === quiz.correct ? 'Верно' : 'Ответ пока неверный'}</strong>
            <p lang={language}>{quiz.explanation}</p>
          </div>}
        </div>
      </form>
    </details>
  )
}
