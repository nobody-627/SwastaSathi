import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { useMLStore } from '../../store/mlStore'

const CATEGORY_COLORS = {
  Cardiovascular: '#ef4444',
  Metabolic: '#f59e0b',
  Respiratory: '#0ea5e9',
  'Mental Health': '#8b5cf6',
  'Renal/Endocrine': '#14b8a6',
  Musculoskeletal: '#f97316',
  Gastrointestinal: '#22c55e',
}

export default function RiskRadarChart() {
  const { allScores } = useMLStore()
  const [selectedCategory, setSelectedCategory] = useState('All')

  const chartData = useMemo(() => Object.entries(allScores || {})
    .map(([key, value]) => ({
      disease: key.replaceAll('_', ' '),
      category: value?.category || value?.displayCategory || 'Other',
      score: Math.round((value?.probability || 0) * 100),
      confidence: Math.round((value?.confidence || 0) * 100),
    }))
    .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8), [allScores, selectedCategory])

  const categories = useMemo(() => ['All', ...new Set(Object.values(allScores || {}).map((value) => value?.category).filter(Boolean))], [allScores])

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-bold text-slate-800">Disease Risk Overview</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${selectedCategory === category ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="disease" width={130} tick={{ fill: '#475569', fontSize: 11 }} />
            <Tooltip formatter={(value, name) => [`${value}%`, name === 'score' ? 'Risk score' : name]} />
            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.disease} fill={CATEGORY_COLORS[entry.category] || '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
