import { emptyProfile, type StudentProfile } from './catalog.ts'

export type SurveyRoute = 'careers' | 'skills' | 'both'
export type SurveyDecision = 'yes' | 'skip'

export type SurveyDraft = {
  route: SurveyRoute | ''
  academic: SurveyDecision | ''
  profile: StudentProfile
}

export const emptySurvey: SurveyDraft = { route: '', academic: '', profile: emptyProfile }

const conditionSteps = ['level', 'maxHours', 'format', 'classType', 'language'] as const
const academicSteps = ['program', 'year', 'completed'] as const

export type SurveyStep = 'route' | 'careers' | 'skills' | 'academic'
  | typeof conditionSteps[number] | typeof academicSteps[number]

export function surveySteps(draft: SurveyDraft): SurveyStep[] {
  const interests = {
    careers: ['careers'], skills: ['skills'], both: ['careers', 'skills'], '': [],
  } as const

  return [
    'route',
    ...interests[draft.route],
    ...conditionSteps,
    'academic',
    ...(draft.academic === 'yes' ? academicSteps : []),
  ]
}

export function profileForSurvey({ route, academic, profile }: SurveyDraft): StudentProfile {
  return {
    ...profile,
    careers: route === 'careers' || route === 'both' ? profile.careers : emptyProfile.careers,
    skills: route === 'skills' || route === 'both' ? profile.skills : emptyProfile.skills,
    ...(academic === 'yes' ? {} : { program: emptyProfile.program, year: emptyProfile.year, completed: emptyProfile.completed }),
  }
}
