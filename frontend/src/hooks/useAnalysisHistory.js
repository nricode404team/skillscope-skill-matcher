import { useState, useEffect } from 'react'

const STORAGE_KEY = 'skill_gap_history'
const MAX_ENTRIES = 20

export function useAnalysisHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {
      // localStorage full or unavailable
    }
  }, [history])

  function addEntry({ resumeSkills, jobs, results }) {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      resumeSkillCount: resumeSkills.length,
      jobs: jobs.map((j) => ({ title: j.title, skillCount: j.skills.length })),
      results,
    }
    setHistory((prev) => [entry, ...prev].slice(0, MAX_ENTRIES))
  }

  function removeEntry(id) {
    setHistory((prev) => prev.filter((e) => e.id !== id))
  }

  function clearHistory() {
    setHistory([])
  }

  return { history, addEntry, removeEntry, clearHistory }
}
