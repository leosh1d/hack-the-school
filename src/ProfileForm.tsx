import { Button } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { careers, classes, formats, languages, levels, programs, skills, subjects, type StudentProfile } from './catalog.ts'

function Choices<Key extends string>({ label, options, selected, onChange }: {
  label: string
  options: Record<Key, string>
  selected: readonly Key[]
  onChange: (selected: Key[]) => void
}) {
  return (
    <fieldset className="choice-group">
      <legend>{label}</legend>
      <div className="choice-list">
        {(Object.entries(options) as [Key, string][]).map(([value, title]) => (
          <label className="choice" key={value}>
            <input type="checkbox" checked={selected.includes(value)} onChange={event => {
              onChange(event.target.checked ? [...selected, value] : selected.filter(item => item !== value))
            }} />
            {title}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function SelectField<Key extends string>({ label, options, value, onChange }: {
  label: string
  options: Record<Key, string>
  value: Key | ''
  onChange: (value: Key | '') => void
}) {
  return (
    <label className="field">
      {label}
      <select value={value} onChange={event => onChange(event.target.value as Key | '')}>
        <option value="">Любой вариант</option>
        {Object.entries(options).map(([key, title]) => <option key={key} value={key}>{String(title)}</option>)}
      </select>
    </label>
  )
}

export function ProfileForm({ profile, onChange, onSubmit }: {
  profile: StudentProfile
  onChange: (profile: StudentProfile) => void
  onSubmit: () => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const hasInterests = profile.careers.length > 0 || profile.skills.length > 0

  function update<Key extends keyof StudentProfile>(field: Key, value: StudentProfile[Key]) {
    onChange({ ...profile, [field]: value })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (hasInterests) onSubmit()
  }

  return (
    <form onSubmit={submit} className="profile-form surface" aria-labelledby="profile-heading">
      <section className="form-section">
        <h2 id="profile-heading">Что хотите изучить?</h2>
        <p className="muted">Выберите хотя бы одно направление или навык. Можно отметить несколько.</p>
        <Choices label="Карьерные направления" options={careers} selected={profile.careers} onChange={value => update('careers', value)} />
        <Choices label="Навыки" options={skills} selected={profile.skills} onChange={value => update('skills', value)} />
      </section>

      <section className="form-section divided" aria-labelledby="study-heading">
        <h2 id="study-heading">Условия обучения</h2>
        <div className="fields">
          <SelectField label="Уровень подготовки" options={levels} value={profile.level} onChange={value => update('level', value)} />
          <label className="field">
            Время в неделю
            <select value={profile.maxHours ?? ''} onChange={event => update('maxHours', Number(event.target.value) || null)}>
              <option value="">Любое</option>
              {[2, 3, 4, 5].map(hours => <option key={hours} value={hours}>До {hours} ч</option>)}
            </select>
          </label>
          <SelectField label="Формат" options={formats} value={profile.format} onChange={value => update('format', value)} />
          <SelectField label="Вид занятий" options={classes} value={profile.classType} onChange={value => update('classType', value)} />
          <SelectField label="Язык курса" options={languages} value={profile.language} onChange={value => update('language', value)} />
        </div>
      </section>

      <details className="profile-details disclosure">
        <summary><span>Учебный профиль</span><span className="muted optional">Необязательно</span></summary>
        <div className="disclosure-body">
          <div className="fields">
            <SelectField label="Образовательная программа" options={programs} value={profile.program} onChange={value => update('program', value)} />
            <label className="field">
              Курс обучения
              <select value={profile.year ?? ''} onChange={event => update('year', Number(event.target.value) || null)}>
                <option value="">Любой курс</option>
                {[1, 2, 3, 4, 5].map(year => <option key={year} value={year}>{year} курс</option>)}
              </select>
            </label>
          </div>
          <Choices label="Пройденные дисциплины" options={subjects} selected={profile.completed} onChange={value => update('completed', value)} />
        </div>
      </details>

      <div className="form-actions divided">
        {submitted && !hasInterests && <p role="alert" className="form-error">Выберите направление или навык, чтобы получить подборку.</p>}
        <Button type="submit" size="lg" colorPalette="hse">Подобрать факультативы <span aria-hidden="true">→</span></Button>
      </div>
    </form>
  )
}
