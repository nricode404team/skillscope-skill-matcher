import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts'

const CATEGORIES = ['Technical', 'Frameworks', 'Cloud/DevOps', 'Data/AI', 'Soft Skills']

function categorize(skills) {
  const technical = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'sql', 'html', 'css', 'bash']
  const frameworks = ['react', 'vue', 'angular', 'django', 'flask', 'fastapi', 'express', 'spring', 'next.js']
  const cloud = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'linux']
  const data = ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'nlp', 'data science']
  const soft = ['leadership', 'communication', 'agile', 'scrum', 'project management', 'teamwork']

  const cats = { Technical: 0, Frameworks: 0, 'Cloud/DevOps': 0, 'Data/AI': 0, 'Soft Skills': 0 }
  for (const skill of skills) {
    const s = skill.toLowerCase()
    if (technical.some((k) => s.includes(k))) cats['Technical']++
    else if (frameworks.some((k) => s.includes(k))) cats['Frameworks']++
    else if (cloud.some((k) => s.includes(k))) cats['Cloud/DevOps']++
    else if (data.some((k) => s.includes(k))) cats['Data/AI']++
    else if (soft.some((k) => s.includes(k))) cats['Soft Skills']++
  }
  return cats
}

export function SkillRadarChart({ matchedSkills, missingSkills }) {
  const matchedCats = categorize(matchedSkills)
  const missingCats = categorize(missingSkills)

  const data = CATEGORIES.map((cat) => ({
    category: cat,
    Matched: matchedCats[cat] || 0,
    Missing: missingCats[cat] || 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
        <Radar name="Matched" dataKey="Matched" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
        <Radar name="Missing" dataKey="Missing" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function SkillBarChart({ matchedSkills, missingSkills, partialMatches }) {
  const data = [
    { name: 'Matched', count: matchedSkills.length, fill: '#22c55e' },
    { name: 'Partial', count: partialMatches.length, fill: '#eab308' },
    { name: 'Missing', count: missingSkills.length, fill: '#ef4444' },
  ]

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
