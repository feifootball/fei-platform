'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function SuggestRolePage() {
  const router = useRouter()
  const supabase = createClient()
  const [suggestedRole, setSuggestedRole] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase
      .from('role_suggestions')
      .insert({
        user_id: user?.id || null,
        suggested_role: suggestedRole,
        email: email || user?.email,
        message,
      })

    if (insertError) {
      setError('Error al enviar la sugerencia')
      setLoading(false)
      return
    }

    setSuccess(true)
    setSuggestedRole('')
    setEmail('')
    setMessage('')
    setLoading(false)

    setTimeout(() => router.push('/'), 3000)
  }

  return (
    <div className="min-h-screen bg-fei-bg px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
          <img src="/fei-logo-navbar-vector.svg" alt="FEI" className="h-8 w-auto" />
          <span className="text-xs font-medium text-fei-sky">
            Football English Intelligence
          </span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-fei-text">Sugiere un rol</h1>
          <p className="mt-2 text-fei-text/60">¿Falta un rol en FEI? Cuéntanos cuál necesitas y nos lo estudiaremos.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-fei-text/10 bg-fei-text/[0.03] p-8 space-y-6">
          {success && (
            <div className="rounded-lg bg-fei-sky/10 px-4 py-3 text-sm text-fei-sky">
              ✓ Gracias por tu sugerencia. Te redirigiremos en breve.
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-fei-text/70">
              ¿Qué rol te falta? *
            </label>
            <input
              type="text"
              value={suggestedRole}
              onChange={(e) => setSuggestedRole(e.target.value)}
              required
              placeholder="Ej: Director de Comunicaciones"
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-fei-text/70">
              Email (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-fei-text/70">
              Mensaje (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Cuéntanos por qué necesitas este rol..."
              className="w-full rounded-xl border border-fei-text/10 bg-fei-text/[0.05] px-4 py-3 text-fei-text placeholder-fei-text/30 focus:border-fei-yellow focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !suggestedRole}
            className="w-full rounded-full bg-fei-yellow px-6 py-3 font-semibold text-fei-bg transition-colors hover:bg-fei-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar sugerencia'}
          </button>

          <p className="text-center text-sm text-fei-text/50">
            <Link href="/" className="text-fei-sky hover:underline">
              Volver a inicio
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
