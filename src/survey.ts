import type { OfficialPreferences } from './officialRecommendations.ts'

export type SurveyRoute = 'topics' | 'skills' | 'both'
export type SurveyStep = 'route' | 'topics' | 'skills' | 'maxContactHours' | 'modules' | 'language'

export type SurveyDraft = {
  route: SurveyRoute | ''
  profile: OfficialPreferences
}

export const emptySurvey: SurveyDraft = {
  route: '',
  profile: { topics: [], skills: [], maxContactHours: null, modules: [], languages: [] },
}

export function surveySteps(route: SurveyDraft['route']): SurveyStep[] {
  const interests = { topics: ['topics'], skills: ['skills'], both: ['topics', 'skills'], '': [] } as const
  return ['route', ...interests[route], 'maxContactHours', 'modules', 'language']
}

export function profileForSurvey({ route, profile }: SurveyDraft): OfficialPreferences {
  return {
    ...profile,
    topics: route === 'topics' || route === 'both' ? profile.topics : [],
    skills: route === 'skills' || route === 'both' ? profile.skills : [],
  }
}
