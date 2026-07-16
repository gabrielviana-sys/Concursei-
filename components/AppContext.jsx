'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext({ loading: true })

async function fetcher(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Erro na requisição')
  }
  return res.json()
}

export function AppProvider({ children }) {
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [questions, setQuestions] = useState([])
  const [topics, setTopics] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadSubjects = useCallback(async () => {
    const data = await fetcher('/api/subjects')
    setSubjects(data)
  }, [])

  const loadSessions = useCallback(async () => {
    const data = await fetcher('/api/sessions')
    setSessions(data)
  }, [])

  const loadQuestions = useCallback(async () => {
    const data = await fetcher('/api/questions')
    setQuestions(data)
  }, [])

  const loadTopics = useCallback(async () => {
    const data = await fetcher('/api/topics')
    setTopics(data)
  }, [])

  const loadStats = useCallback(async () => {
    const data = await fetcher('/api/stats')
    setStats(data)
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadSubjects(), loadSessions(), loadQuestions(), loadTopics(), loadStats()])
    setLoading(false)
  }, [loadSubjects, loadSessions, loadQuestions, loadTopics, loadStats])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const addSubject = async (subject) => {
    await fetcher('/api/subjects', { method: 'POST', body: JSON.stringify(subject) })
    await refreshAll()
  }

  const updateSubject = async (subject) => {
    await fetcher(`/api/subjects/${subject.id}`, { method: 'PUT', body: JSON.stringify(subject) })
    await refreshAll()
  }

  const deleteSubject = async (id) => {
    await fetcher(`/api/subjects/${id}`, { method: 'DELETE' })
    await refreshAll()
  }

  const addSession = async (session) => {
    await fetcher('/api/sessions', { method: 'POST', body: JSON.stringify(session) })
    await refreshAll()
  }

  const deleteSession = async (id) => {
    await fetcher(`/api/sessions/${id}`, { method: 'DELETE' })
    await refreshAll()
  }

  const addQuestion = async (question) => {
    await fetcher('/api/questions', { method: 'POST', body: JSON.stringify(question) })
    await refreshAll()
  }

  const updateQuestion = async (question) => {
    await fetcher(`/api/questions/${question.id}`, { method: 'PUT', body: JSON.stringify(question) })
    await refreshAll()
  }

  const deleteQuestion = async (id) => {
    await fetcher(`/api/questions/${id}`, { method: 'DELETE' })
    await refreshAll()
  }

  const addTopic = async (topic) => {
    await fetcher('/api/topics', { method: 'POST', body: JSON.stringify(topic) })
    await refreshAll()
  }

  const updateTopic = async (topic) => {
    await fetcher(`/api/topics/${topic.id}`, { method: 'PUT', body: JSON.stringify(topic) })
    await refreshAll()
  }

  const deleteTopic = async (id) => {
    await fetcher(`/api/topics/${id}`, { method: 'DELETE' })
    await refreshAll()
  }

  const toggleTopicCompleted = async (id, completed) => {
    await fetcher(`/api/topics/${id}`, { method: 'PUT', body: JSON.stringify({ completed }) })
    await refreshAll()
  }

  const getTopicAttachments = async (topicId) => {
    const topic = await fetcher(`/api/topics/${topicId}`)
    return topic.attachments || []
  }

  const getTopicAttachmentById = async (id) => {
    return fetcher(`/api/attachments/${id}`)
  }

  const addTopicAttachment = async (attachment) => {
    return fetcher('/api/attachments', { method: 'POST', body: JSON.stringify(attachment) })
  }

  const updateTopicAttachment = async (id, data) => {
    return fetcher(`/api/attachments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  const deleteTopicAttachment = async (id) => {
    await fetcher(`/api/attachments/${id}`, { method: 'DELETE' })
    await refreshAll()
  }

  const summarizeAttachment = async (attachmentId) => {
    return fetcher('/api/summarize', { method: 'POST', body: JSON.stringify({ attachmentId }) })
  }

  const getSetting = async (key) => {
    const settings = await fetcher('/api/settings')
    return settings[key]
  }

  const setSetting = async (key, value) => {
    await fetcher('/api/settings', { method: 'POST', body: JSON.stringify({ key, value }) })
  }

  const value = {
    subjects,
    sessions,
    questions,
    topics,
    stats,
    loading,
    refreshAll,
    addSubject,
    updateSubject,
    deleteSubject,
    addSession,
    deleteSession,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopicCompleted,
    getTopicAttachments,
    getTopicAttachmentById,
    addTopicAttachment,
    updateTopicAttachment,
    deleteTopicAttachment,
    summarizeAttachment,
    getSetting,
    setSetting,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
