export const mockProgressData = [
  {
    childId: 'child-1',
    subject: 'Mathematics',
    scores: [
      { date: '2026-06-01', score: 55 },
      { date: '2026-06-15', score: 62 },
      { date: '2026-07-01', score: 68 },
      { date: '2026-07-15', score: 75 },
      { date: '2026-07-28', score: 82 },
    ],
    achievements: [
      { id: 'ach-1', title: 'Times Table Master', description: 'Mastered multiplication tables 1-7', icon: 'star', unlockedAt: '2026-07-28' },
      { id: 'ach-2', title: 'Fraction Finder', description: 'Successfully identified fractions', icon: 'target', unlockedAt: '2026-07-25' },
    ],
    overallProgress: 75,
  },
  {
    childId: 'child-2',
    subject: 'English',
    scores: [
      { date: '2026-06-01', score: 70 },
      { date: '2026-06-15', score: 72 },
      { date: '2026-07-01', score: 75 },
      { date: '2026-07-15', score: 78 },
    ],
    achievements: [],
    overallProgress: 30,
  },
]

export const mockLearningPassport = {
  childId: 'child-1',
  subjects: [
    { name: 'Mathematics', level: 'Intermediate', progress: 75, topics: ['Multiplication', 'Division', 'Fractions', 'Geometry'] },
    { name: 'Science', level: 'Beginner', progress: 25, topics: ['Plants', 'Animals', 'Weather'] },
    { name: 'English', level: 'Intermediate', progress: 50, topics: ['Reading', 'Writing', 'Grammar'] },
  ],
  badges: [
    { id: 'badge-1', title: 'Math Whiz', description: 'Completed 10 math sessions', icon: 'award', unlockedAt: '2026-07-01' },
    { id: 'badge-2', title: 'Perfect Attendance', description: 'Attended 5 sessions in a row', icon: 'check-circle', unlockedAt: '2026-07-15' },
  ],
  overallProgress: 75,
  strengths: ['Problem Solving', 'Creative Thinking', 'Spatial Awareness'],
  areasForImprovement: ['Reading Comprehension', 'Focus Duration', 'Organization'],
}
