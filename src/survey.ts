import { emptyProfile, type StudentProfile } from './catalog.ts'

export type SurveyRoute = 'careers' | 'skills' | 'both'
export type SurveyDecision = 'yes' | 'skip'

export type SurveyDraft = {
  route: SurveyRoute | ''
  preferences: SurveyDecision | ''
  academic: SurveyDecision | ''
  profile: StudentProfile
}

export const emptySurvey: SurveyDraft = { route: '', preferences: '', academic: '', profile: emptyProfile }

const preferenceSteps = ['level', 'maxHours', 'format', 'classType', 'language'] as const
const academicSteps = ['program', 'year', 'completed'] as const

export type SurveyStep = 'route' | 'careers' | 'skills' | 'preferences' | 'academic'
  | typeof preferenceSteps[number] | typeof academicSteps[number]

export function surveySteps(draft: SurveyDraft): SurveyStep[] {
  const interests = {
    careers: ['careers'], skills: ['skills'], both: ['careers', 'skills'], '': [],
  } as const

  return [
    'route',
    ...interests[draft.route],
    'preferences',
    ...(draft.preferences === 'yes' ? preferenceSteps : []),
    'academic',
    ...(draft.academic === 'yes' ? academicSteps : []),
  ]
}

export function profileForSurvey({ route, preferences, academic, profile }: SurveyDraft): StudentProfile {
  const { careers, skills, level, maxHours, format, classType, language, program, year, completed } = profile

  return {
    ...emptyProfile,
    ...(route === 'careers' || route === 'both' ? { careers } : {}),
    ...(route === 'skills' || route === 'both' ? { skills } : {}),
    ...(preferences === 'yes' ? { level, maxHours, format, classType, language } : {}),
    ...(academic === 'yes' ? { program, year, completed } : {}),
  }
}
