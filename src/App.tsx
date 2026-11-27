import { Box, Heading } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { CourseCard } from './CourseCard.tsx'
import { CourseSearch } from './CourseSearch.tsx'
import { ProfileForm } from './ProfileForm.tsx'
import { courses, demoDate, emptyProfile, type StudentProfile } from './catalog.ts'
import { recommendCourses } from './discovery.ts'
import './app.css'

type View = 'profile' | 'results' | 'catalog'

const pageTitles = { profile: 'Факультативы ВШБ', results: 'Ваша подборка', catalog: 'Каталог факультативов' }
const pageDescriptions = {
  profile: 'Подберите факультативы по карьерным интересам, навыкам и времени, которое готовы уделять учёбе.',
  results: 'Курсы с открытой записью, которые совпали с вашими интересами и условиями обучения.',
  catalog: 'Посмотрите все курсы прототипа, сравните формат и попробуйте задания.',
}

function App() {
  const [view, setView] = useState<View>('profile')
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusHeading = useRef(false)

  useEffect(() => {
    if (focusHeading.current) {
      headingRef.current?.focus()
      focusHeading.current = false
    }
  }, [view])

  function navigate(nextView: View) {
    if (nextView === view) return
    focusHeading.current = true
    setView(nextView)
  }

  const recommendations = view === 'results' ? recommendCourses(courses, profile, demoDate) : []

  return (
    <div className="application">
      <header className="top-bar">
        <div className="frame top-bar-inner">
          <button type="button" className="brand" onClick={() => navigate('profile')}>
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>Факультативы<span className="brand-school"> / ВШБ</span></span>
          </button>
          <nav aria-label="Разделы" className="navigation">
            <button type="button" aria-current={view !== 'catalog' ? 'page' : undefined} onClick={() => navigate('profile')}>Подбор</button>
            <button type="button" aria-current={view === 'catalog' ? 'page' : undefined} onClick={() => navigate('catalog')}>Каталог</button>
          </nav>
        </div>
      </header>

      <main className="frame">
        <header className={`page-header${view === 'profile' ? ' page-header-hero' : ''}`}>
          <div>
            <div className="page-context"><span aria-hidden="true" /> Hack the School · прототип</div>
            <Heading as="h1" ref={headingRef} tabIndex={-1}>{pageTitles[view]}</Heading>
            <p>{pageDescriptions[view]}</p>
          </div>
          {view === 'profile' && <div className="hero-grid" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
          </div>}
        </header>

        {view === 'profile' && <div className="content-columns view-content" key={view}>
          <ProfileForm profile={profile} onChange={setProfile} onSubmit={() => navigate('results')} />
          <Box as="aside" className="surface information-panel" aria-labelledby="demo-heading">
            <p className="panel-kicker">О каталоге</p>
            <h2 id="demo-heading">{courses.length} демофакультативов</h2>
            <p className="muted">Даты, нагрузка и места приведены для примера на 27 ноября 2026 года.</p>
            <button type="button" className="text-button" onClick={() => navigate('catalog')}>Смотреть каталог <span aria-hidden="true">↗</span></button>
          </Box>
        </div>}

        {view === 'results' && <div className="view-content" key={view}>
          <div className="results-toolbar">
            <h2>Рекомендации <span>{recommendations.length}</span></h2>
            <button type="button" className="text-button" onClick={() => navigate('profile')}>Изменить ответы</button>
          </div>
          {recommendations.length > 0 ? (
            <ol className="course-list" role="list">
              {recommendations.map(({ course, reasons }) => <li key={course.id}><CourseCard course={course} reasons={reasons} /></li>)}
            </ol>
          ) : (
            <section className="surface empty-state">
              <h3>Подходящих курсов пока нет</h3>
              <p className="muted">Увеличьте время на занятия, выберите другой формат или посмотрите весь каталог.</p>
              <button type="button" className="text-button" onClick={() => navigate('catalog')}>Смотреть каталог <span aria-hidden="true">→</span></button>
            </section>
          )}
          <CourseSearch />
        </div>}

        {view === 'catalog' && <div className="view-content" key={view}>
          <div className="results-toolbar"><h2>Все курсы <span>{courses.length}</span></h2><button type="button" className="text-button" onClick={() => navigate('profile')}>К анкете</button></div>
          <ul className="course-list" role="list">
            {courses.map(course => <li key={course.id}><CourseCard course={course} /></li>)}
          </ul>
          <CourseSearch />
        </div>}
      </main>

      <footer className="frame site-footer"><span>Демоданные · 27 ноября 2026</span><span>Hack the School / ВШБ</span></footer>
    </div>
  )
}

export default App
