export const careers = {
  product: 'Управление продуктом',
  analytics: 'Бизнес-аналитика',
  marketing: 'Маркетинг',
  finance: 'Финансы',
  entrepreneurship: 'Предпринимательство',
} as const

export const skills = {
  sql: 'SQL',
  visualization: 'Визуализация данных',
  research: 'Исследование клиентов',
  experiments: 'A/B-тесты',
  presentation: 'Презентации',
  modeling: 'Финансовое моделирование',
} as const

export const subjects = {
  statistics: 'Статистика',
  databases: 'Базы данных',
  marketing: 'Основы маркетинга',
  management: 'Основы менеджмента',
  finance: 'Корпоративные финансы',
} as const

export const levels = { start: 'Начальный', practice: 'Есть практика', advanced: 'Продвинутый' } as const
export const formats = { online: 'Онлайн', campus: 'Очно' } as const
export const classes = { lecture: 'Лекции', seminar: 'Семинары' } as const
export const languages = { ru: 'Русский', en: 'Английский' } as const
export type EducationProgram = {
  id: string
  title: string
  campus: string
  level: string
  url?: string
  code?: string
}

type Career = keyof typeof careers
type Skill = keyof typeof skills
type Subject = keyof typeof subjects
type Level = keyof typeof levels
type Format = keyof typeof formats
type ClassType = keyof typeof classes
type Language = keyof typeof languages
type ProgramArea = 'management' | 'business' | 'marketing' | 'finance'

export type StudentProfile = {
  careers: Career[]
  skills: Skill[]
  completed: Subject[]
  level: Level | ''
  maxHours: number | null
  formats: Format[]
  classTypes: ClassType[]
  languages: Language[]
  program: EducationProgram | null
  year: number | null
}

export const emptyProfile: StudentProfile = {
  careers: [], skills: [], completed: [], level: '', maxHours: null,
  formats: [], classTypes: [], languages: [], program: null, year: null,
}

export type Course = {
  id: string
  title: string
  description: string
  careers: readonly Career[]
  skills: readonly Skill[]
  level: Level
  hours: number
  format: Format
  classType: ClassType
  language: Language
  prerequisites: readonly Subject[]
  programs: readonly ProgramArea[]
  years: readonly number[]
  deadline: string
  capacity: number
  available: number
  keywords: string
  quiz: {
    question: string
    options: readonly string[]
    correct: number
    explanation: string
  }
}

export const demoDate = new Date('2026-11-27T12:00:00+03:00')
export const smartWayUrl = 'https://smartway.hse.ru/'

export const courses: readonly Course[] = [
  {
    id: 'data', title: 'Данные для бизнеса',
    description: 'Соберите отчёт из таблиц и объясните руководителю, какие решения поддерживают данные.',
    careers: ['analytics', 'product'], skills: ['sql', 'visualization'],
    level: 'start', hours: 3, format: 'online', classType: 'seminar', language: 'ru',
    prerequisites: [], programs: ['management', 'business'], years: [1, 2],
    deadline: '2026-12-15T23:59:00+03:00', capacity: 45, available: 14,
    keywords: 'аналитика анализ цифры таблицы дашборд база данных',
    quiz: {
      question: 'Зачем используют GROUP BY в SQL?',
      options: ['Чтобы сгруппировать строки для расчёта показателей', 'Чтобы поменять порядок колонок', 'Чтобы удалить дубли из базы данных'],
      correct: 0,
      explanation: 'GROUP BY объединяет строки с одинаковыми значениями ключа, чтобы посчитать сумму, среднее или другой показатель по каждой группе.',
    },
  },
  {
    id: 'interviews', title: 'Интервью с клиентами',
    description: 'Спланируйте интервью, соберите примеры из опыта клиента и превратите ответы в гипотезы о продукте.',
    careers: ['product', 'entrepreneurship'], skills: ['research'],
    level: 'start', hours: 2, format: 'campus', classType: 'seminar', language: 'ru',
    prerequisites: [], programs: ['management', 'marketing'], years: [1, 2, 3],
    deadline: '2026-12-14T18:00:00+03:00', capacity: 30, available: 11,
    keywords: 'качественные исследования интервью custdev customer development клиенты пользователи',
    quiz: {
      question: 'С какого вопроса лучше начать интервью о пользовательском опыте?',
      options: ['Купили бы вы такой продукт?', 'Расскажите, как вы решали эту задачу в последний раз', 'Подтвердите, что наш вариант вам удобнее'],
      correct: 1,
      explanation: 'Рассказ о последнем случае показывает реальные действия, обстоятельства и затруднения клиента.',
    },
  },
  {
    id: 'experiments', title: 'Эксперименты в продукте',
    description: 'Спроектируйте A/B-тест, выберите метрику и разберите результат с учётом ошибок эксперимента.',
    careers: ['product', 'analytics', 'marketing'], skills: ['experiments', 'visualization'],
    level: 'practice', hours: 4, format: 'online', classType: 'seminar', language: 'ru',
    prerequisites: ['statistics'], programs: ['business', 'marketing'], years: [2, 3, 4],
    deadline: '2026-12-18T23:59:00+03:00', capacity: 40, available: 9,
    keywords: 'эксперименты ab тест гипотеза продукт метрики статистика',
    quiz: {
      question: 'Зачем распределять участников теста по группам случайно?',
      options: ['Чтобы быстрее набрать аудиторию', 'Чтобы в группах было одинаковое число кликов', 'Чтобы различия между группами меньше влияли на оценку эффекта'],
      correct: 2,
      explanation: 'Случайное распределение помогает сбалансировать особенности групп до начала эксперимента.',
    },
  },
  {
    id: 'finance', title: 'Финансовая модель проекта',
    description: 'Постройте прогноз выручки и затрат и проверьте, как меняется результат при разных допущениях.',
    careers: ['finance', 'entrepreneurship'], skills: ['modeling'],
    level: 'advanced', hours: 5, format: 'campus', classType: 'seminar', language: 'ru',
    prerequisites: ['finance'], programs: ['finance', 'management'], years: [3, 4],
    deadline: '2026-12-17T23:59:00+03:00', capacity: 32, available: 6,
    keywords: 'деньги бюджет юнит экономика инвестиции cashflow excel npv',
    quiz: {
      question: 'Что даёт анализ чувствительности в финансовой модели?',
      options: ['Показывает, как результат зависит от допущений', 'Гарантирует точность прогноза', 'Считает выручку без допущений'],
      correct: 0,
      explanation: 'Меняя цену, объём или затраты, можно увидеть, какие параметры сильнее меняют прогноз.',
    },
  },
  {
    id: 'marketing', title: 'Маркетинговые решения на данных',
    description: 'Сопоставьте воронку, сегменты и затраты на рекламу, чтобы выбрать следующий эксперимент.',
    careers: ['marketing', 'analytics'], skills: ['experiments', 'visualization'],
    level: 'practice', hours: 3, format: 'online', classType: 'lecture', language: 'ru',
    prerequisites: ['marketing'], programs: ['marketing'], years: [2, 3, 4],
    deadline: '2026-12-16T20:00:00+03:00', capacity: 65, available: 35,
    keywords: 'реклама маркетинг продвижение воронка сегментация клики конверсия',
    quiz: {
      question: 'Какой показатель нужен, чтобы сравнить долю покупок в двух сегментах?',
      options: ['Число просмотров сайта', 'Отношение числа покупок к числу посетителей в каждом сегменте', 'Суммарная выручка команды'],
      correct: 1,
      explanation: 'Конверсия учитывает размер сегмента и позволяет сравнивать группы с разным числом посетителей.',
    },
  },
  {
    id: 'presentation', title: 'Business Storytelling',
    description: 'Подготовьте короткую презентацию на английском и обоснуйте рекомендацию для деловой аудитории.',
    careers: ['product', 'entrepreneurship', 'marketing'], skills: ['presentation'],
    level: 'start', hours: 2, format: 'campus', classType: 'seminar', language: 'en',
    prerequisites: [], programs: ['management', 'marketing'], years: [1, 2, 3, 4],
    deadline: '2026-12-15T19:00:00+03:00', capacity: 25, available: 7,
    keywords: 'английский выступление публичная речь питч презентации storytelling speaking',
    quiz: {
      question: 'What makes a recommendation actionable?',
      options: ['A longer slide deck', 'A clear next step and the evidence for it', 'Using the same chart twice'],
      correct: 1,
      explanation: 'A clear next step tells the audience what to do, while supporting evidence explains why it matters.',
    },
  },
  {
    id: 'sql', title: 'SQL и метрики продукта',
    description: 'Напишите запросы к учебной базе, чтобы измерить удержание и активность пользователей.',
    careers: ['analytics', 'product'], skills: ['sql'],
    level: 'practice', hours: 3, format: 'online', classType: 'seminar', language: 'ru',
    prerequisites: ['databases'], programs: ['business'], years: [2, 3],
    deadline: '2026-11-23T23:59:00+03:00', capacity: 35, available: 3,
    keywords: 'база данных запросы аналитика sql retention когорта',
    quiz: {
      question: 'Когда пригодится LEFT JOIN?',
      options: ['Когда надо исключить все строки без совпадений', 'Когда надо отсортировать результат', 'Когда надо сохранить все строки левой таблицы'],
      correct: 2,
      explanation: 'LEFT JOIN сохраняет строки левой таблицы и подставляет NULL, если справа совпадения нет.',
    },
  },
]
