import { Badge, Button, Card } from '@chakra-ui/react'
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
    <Card.Root as="article" className="course-card surface" aria-labelledby={headingId}>
      <Card.Body className="course-body" gap="3">
        <div className="course-meta-top">
          <span>{formats[course.format]} · {classes[course.classType]} · {languages[course.language]}</span>
          <Badge colorPalette={registrationOpen ? 'hse' : 'gray'}>{status}</Badge>
        </div>
        <Card.Title as="h3" id={headingId}>{course.title}</Card.Title>
        <Card.Description className="muted">{course.description}</Card.Description>
        <ul className="course-skills" aria-label="Навыки">
          {course.skills.map(skill => <li key={skill}>{skills[skill]}</li>)}
        </ul>
        {reasons && (
          <div className="course-match">
            <p>Почему в подборке</p>
            <ul>{reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
          </div>
        )}
        <dl className="course-facts">
          <div><dt>Нагрузка</dt><dd>{course.hours} ч в неделю</dd></div>
          <div><dt>Уровень курса</dt><dd>{levels[course.level]}</dd></div>
          <div><dt>Дедлайн записи</dt><dd><time dateTime={course.deadline}>{deadlineFormat.format(new Date(course.deadline))} МСК</time></dd></div>
          <div><dt>Места</dt><dd>{registrationOpen ? `${course.available} из ${course.capacity} свободно` : course.capacity}</dd></div>
        </dl>
        {course.prerequisites.length > 0 && !reasons && <p className="muted">Пригодятся основы: {course.prerequisites.map(subject => subjects[subject]).join(', ')}</p>}
      </Card.Body>
      <Card.Footer className="course-actions">
        <CourseQuiz quiz={course.quiz} language={course.language} />
        {registrationOpen && <Button asChild className="register-link" variant="outline" colorPalette="hse" size="sm">
          <a href={smartWayUrl} target="_blank" rel="noreferrer">Открыть Smart Way <span aria-hidden="true">↗</span></a>
        </Button>}
      </Card.Footer>
    </Card.Root>
  )
}
