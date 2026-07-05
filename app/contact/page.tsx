'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

type Lang = 'en' | 'es'

const pageCopy = {
  en: {
    label: 'Contact',
    title: 'Get in Touch',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'Have a question about FEI, diagnostics, institutional access, privacy, or technical support? Send us a message and we will get back to you as soon as possible.',
    updated: 'Contact FEI',
    back: 'Back to Home',
    faqText: 'Before contacting us, check our FAQ — you might find your answer there.',
    faqLink: 'Visit FAQ',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Doe',
    email: 'Email Address',
    emailPlaceholder: 'john@example.com',
    emailHelp: 'We will use this to respond to you.',
    reason: 'Reason for Contact',
    reasons: ['General question', 'Institutional access', 'Privacy request', 'Technical support', 'Other'],
    message: 'Message',
    messagePlaceholder: 'Tell us more about your question or request...',
    phone: 'Phone Number (Optional)',
    phonePlaceholder: '+1 (555) 123-4567',
    organization: 'Club / Academy / Organization (Optional)',
    organizationPlaceholder: 'e.g., Barcelona Academy',
    send: 'Send Message',
    sending: 'Sending...',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    shortMessage: 'Message must be at least 10 characters',
    longMessage: 'Message cannot exceed 5000 characters',
    successTitle: 'Thank you!',
    successMessage:
      'Your message has been prepared successfully. We will connect this form to FEI inbox in the next implementation phase.',
    another: 'Send Another Message',
    privacy:
      'By submitting this form, you agree to our Privacy Policy. We will only use your information to respond to your request.',
    otherWays: 'Other Ways to Reach Us',
    direct:
      'For now, you can also contact FEI directly by email for general questions, institutional access, privacy requests, technical support, or account-related matters.',
  },
  es: {
    label: 'Contacto',
    title: 'Contáctanos',
    subtitle: 'FEI — Football English Intelligence',
    description:
      '¿Tienes una pregunta sobre FEI, diagnósticos, acceso institucional, privacidad o soporte técnico? Envíanos un mensaje y te responderemos lo antes posible.',
    updated: 'Contactar FEI',
    back: 'Volver a inicio',
    faqText: 'Antes de contactarnos, revisa nuestras FAQs — puede que encuentres tu respuesta allí.',
    faqLink: 'Ver FAQs',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Juan Pérez',
    email: 'Correo electrónico',
    emailPlaceholder: 'juan@example.com',
    emailHelp: 'Usaremos este correo para responderte.',
    reason: 'Motivo de contacto',
    reasons: ['Pregunta general', 'Acceso institucional', 'Solicitud de privacidad', 'Soporte técnico', 'Otro'],
    message: 'Mensaje',
    messagePlaceholder: 'Cuéntanos más sobre tu pregunta o solicitud...',
    phone: 'Teléfono (Opcional)',
    phonePlaceholder: '+593 99 123 4567',
    organization: 'Club / Academia / Organización (Opcional)',
    organizationPlaceholder: 'Ej. Academia Barcelona',
    send: 'Enviar mensaje',
    sending: 'Enviando...',
    required: 'Este campo es obligatorio',
    invalidEmail: 'Ingresa un correo electrónico válido',
    shortMessage: 'El mensaje debe tener al menos 10 caracteres',
    longMessage: 'El mensaje no puede superar los 5000 caracteres',
    successTitle: '¡Gracias!',
    successMessage:
      'Tu mensaje ha sido preparado correctamente. Conectaremos este formulario al inbox de FEI en la siguiente fase de implementación.',
    another: 'Enviar otro mensaje',
    privacy:
      'Al enviar este formulario, aceptas nuestra Política de Privacidad. Solo usaremos tu información para responder a tu solicitud.',
    otherWays: 'Otras formas de contacto',
    direct:
      'Por ahora, también puedes contactar directamente a FEI por correo para preguntas generales, acceso institucional, privacidad, soporte técnico o asuntos relacionados con tu cuenta.',
  },
}

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    reason: '',
    message: '',
    phone: '',
    organization: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const saved = localStorage.getItem('fei_lang_v2') as Lang | null

    if (saved === 'en' || saved === 'es') {
      setLang(saved)
    } else {
      localStorage.setItem('fei_lang_v2', 'en')
    }

    function handleLangChange(e: Event) {
      const custom = e as CustomEvent<Lang>
      setLang(custom.detail)
    }

    window.addEventListener('fei_lang_v2_v2_change', handleLangChange)
    return () => window.removeEventListener('fei_lang_v2_v2_change', handleLangChange)
  }, [])

  const t = pageCopy[lang]

  function validate() {
    const nextErrors: Record<string, string> = {}

    if (!values.fullName.trim()) nextErrors.fullName = t.required
    if (!values.email.trim()) {
      nextErrors.email = t.required
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = t.invalidEmail
    }
    if (!values.reason.trim()) nextErrors.reason = t.required
    if (!values.message.trim()) {
      nextErrors.message = t.required
    } else if (values.message.trim().length < 10) {
      nextErrors.message = t.shortMessage
    } else if (values.message.length > 5000) {
      nextErrors.message = t.longMessage
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    window.setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 500)
  }

  function updateField(field: keyof typeof values, value: string) {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  return (
    <main className="min-h-screen bg-fei-bg text-fei-text">
      <Navbar hideSectionLinks />

      <section className="border-b border-fei-text/10 px-6 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <a
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-fei-sky/35 px-4 py-2 text-sm font-medium text-fei-sky transition hover:border-fei-yellow/45 hover:text-fei-yellow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t.back}
          </a>

          <div className="max-w-4xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-fei-sky">
              {t.label}
            </p>

            <h1 className="text-3xl font-black tracking-tight text-fei-text sm:text-4xl lg:text-5xl">
              {t.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-fei-text/60">
              {t.description}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <aside className="rounded-3xl border border-fei-text/10 bg-white/[0.025] p-6">
            <p className="text-sm leading-7 text-fei-text/65">
              {t.faqText}
            </p>

            <a
              href="/faq"
              className="mt-5 inline-flex rounded-full border border-fei-sky/40 px-5 py-2.5 text-sm font-semibold text-fei-sky transition hover:bg-fei-sky/10"
            >
              {t.faqLink}
            </a>

            <div className="mt-8 border-t border-fei-text/10 pt-6">
              <h2 className="text-xl font-bold tracking-tight text-fei-text">
                {t.otherWays}
              </h2>

              <p className="mt-3 text-sm leading-7 text-fei-text/60">
                {t.direct}
              </p>

              <a
                href="mailto:contact@feifootball.com"
                className="mt-5 inline-flex font-semibold text-fei-sky hover:underline"
              >
                contact@feifootball.com
              </a>
            </div>
          </aside>

          <div className="rounded-3xl border border-fei-text/10 bg-white/[0.025] p-5 sm:p-7">
            {submitted ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-fei-yellow/30 bg-fei-yellow/[0.10] text-2xl text-fei-yellow">
                  ✓
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-fei-text">
                  {t.successTitle}
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-fei-text/60">
                  {t.successMessage}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setValues({
                      fullName: '',
                      email: '',
                      reason: '',
                      message: '',
                      phone: '',
                      organization: '',
                    })
                    setErrors({})
                  }}
                  className="mt-8 rounded-full bg-fei-yellow px-7 py-3 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90"
                >
                  {t.another}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-fei-text/80">{t.fullName}</span>
                    <input
                      value={values.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="mt-2 w-full rounded-2xl border border-fei-text/10 bg-fei-bg/70 px-4 py-3 text-sm text-fei-text outline-none transition placeholder:text-fei-text/30 focus:border-fei-sky/50"
                    />
                    {errors.fullName && <p className="mt-2 text-xs text-fei-yellow">{errors.fullName}</p>}
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-fei-text/80">{t.email}</span>
                    <input
                      value={values.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="mt-2 w-full rounded-2xl border border-fei-text/10 bg-fei-bg/70 px-4 py-3 text-sm text-fei-text outline-none transition placeholder:text-fei-text/30 focus:border-fei-sky/50"
                    />
                    {errors.email ? (
                      <p className="mt-2 text-xs text-fei-yellow">{errors.email}</p>
                    ) : (
                      <p className="mt-2 text-xs text-fei-text/40">{t.emailHelp}</p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-fei-text/80">{t.reason}</span>
                  <select
                    value={values.reason}
                    onChange={(e) => updateField('reason', e.target.value)}
                    className="mt-2 min-h-[56px] w-full rounded-2xl border border-fei-text/10 bg-fei-bg/70 px-4 py-4 text-base text-fei-text outline-none transition focus:border-fei-sky/50"
                  >
                    <option value="">{lang === 'en' ? 'Select a reason' : 'Selecciona un motivo'}</option>
                    {t.reasons.map(reason => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  {errors.reason && <p className="mt-2 text-xs text-fei-yellow">{errors.reason}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-fei-text/80">{t.message}</span>
                  <textarea
                    value={values.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder={t.messagePlaceholder}
                    rows={7}
                    maxLength={5000}
                    className="mt-2 w-full resize-none rounded-2xl border border-fei-text/10 bg-fei-bg/70 px-4 py-3 text-sm leading-7 text-fei-text outline-none transition placeholder:text-fei-text/30 focus:border-fei-sky/50"
                  />
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="text-xs text-fei-yellow">{errors.message || ''}</p>
                    <p className="text-xs text-fei-text/40">{values.message.length}/5000</p>
                  </div>
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-fei-text/80">{t.phone}</span>
                    <input
                      value={values.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="mt-2 w-full rounded-2xl border border-fei-text/10 bg-fei-bg/70 px-4 py-3 text-sm text-fei-text outline-none transition placeholder:text-fei-text/30 focus:border-fei-sky/50"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-fei-text/80">{t.organization}</span>
                    <input
                      value={values.organization}
                      onChange={(e) => updateField('organization', e.target.value)}
                      placeholder={t.organizationPlaceholder}
                      className="mt-2 w-full rounded-2xl border border-fei-text/10 bg-fei-bg/70 px-4 py-3 text-sm text-fei-text outline-none transition placeholder:text-fei-text/30 focus:border-fei-sky/50"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-fei-yellow px-8 py-3.5 text-sm font-semibold text-fei-bg transition hover:bg-fei-yellow/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? t.sending : t.send}
                </button>

                <p className="text-center text-xs leading-6 text-fei-text/45">
                  {t.privacy}{' '}
                  <a href="/privacy" className="font-semibold text-fei-sky hover:underline">
                    {lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
