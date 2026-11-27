import { Button } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { CourseCard } from './CourseCard.tsx'
import { courses } from './catalog.ts'
import { searchCourses } from './discovery.ts'

export function CourseSearch() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const matches = query ? searchCourses(courses, query) : []

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(input.trim())
  }

  return (
    <section className="course-search surface" aria-labelledby="search-heading">
      <h2 id="search-heading">Уточнить запрос</h2>
      <form onSubmit={submit} role="search" aria-label="Поиск по демокаталогу" className="search-form">
        <label className="field">
          Запрос по каталогу
          <input type="search" value={input} onChange={event => setInput(event.target.value)} placeholder="Например, интервью с клиентами" maxLength={200} required />
        </label>
        <Button type="submit" colorPalette="hse" variant="outline" disabled={!input.trim()}>Найти</Button>
      </form>
      <div role="status" className="search-status muted">
        {query && (matches.length ? `Совпадений по запросу «${query}»: ${matches.length}.` : `По запросу «${query}» курсы не найдены. Попробуйте название темы или навыка.`)}
      </div>
      {matches.length > 0 && <ul className="course-list" role="list">
        {matches.map(course => <li key={course.id}><CourseCard course={course} /></li>)}
      </ul>}
    </section>
  )
}
