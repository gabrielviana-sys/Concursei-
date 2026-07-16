'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/components/AppContext'
import Layout from '@/components/Layout'
import { Key, Save, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const { getSetting, setSetting } = useApp()
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const value = await getSetting('geminiApiKey')
      setApiKey(value || '')
      setLoading(false)
    }
    load()
  }, [getSetting])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await setSetting('geminiApiKey', apiKey.trim())
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Layout>
      <div>
        <header style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Configurações</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Configure integrações e preferências do app.</p>
        </header>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            maxWidth: '640px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>API Key do Google Gemini</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Necessária para gerar resumos de PDFs com IA.</p>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Carregando...</p>
          ) : (
            <>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua API key do Gemini aqui"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  marginBottom: '16px',
                }}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <span className="spin">
                    <Save size={16} />
                  </span>
                ) : saved ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saved ? 'Salvo!' : 'Salvar API Key'}
              </button>

              <p
                style={{
                  marginTop: '16px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                A chave é armazenada de forma segura no banco de dados e é usada apenas para gerar seus resumos.
                Você pode obter uma chave gratuita em{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  aistudio.google.com/app/apikey
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
