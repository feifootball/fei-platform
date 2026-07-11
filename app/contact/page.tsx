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
    faqText: 'You may find a faster answer in our FAQ.',
    faqLink: 'View FAQs',
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
    faqText: 'Puede que encuentres una respuesta más rápida en nuestras FAQs.',
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_10%,rgba(125,211,252,0.08),transparent_30%),linear-gradient(to_bottom,#ffffff_0%,#ffffff_34%,#F7F8FA_100%)] text-fei-bg">
      <Navbar hideSectionLinks variant="light" />

      <section className="px-5 pb-14 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-fei-bg/12 bg-white px-4 py-2 text-sm font-semibold text-fei-bg/70 shadow-[0_10px_30px_rgba(7,17,31,0.04)] transition hover:border-fei-sky/35 hover:text-fei-bg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-fei-sky"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t.back}
          </a>

          <article className="relative overflow-hidden rounded-[2rem] border border-fei-bg/10 bg-white p-6 shadow-[0_26px_70px_rgba(7,17,31,0.065)] sm:p-8 lg:p-10">
            <header className="mb-10 border-b border-fei-bg/10 pb-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-fei-bg/50">
                {t.label}
              </p>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-fei-bg sm:text-4xl">
                {t.title}
              </h1>

              <p className="mt-5 max-w-3xl text-[15px] leading-7 text-fei-bg/64 sm:text-base sm:leading-8">
                {t.description}
              </p>
            </header>

            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <aside className="space-y-5">
                <div className="rounded-[1.5rem] border border-fei-bg/10 bg-[#F7F8FA] p-5 sm:p-6">
                  <h2 className="text-lg font-bold tracking-tight text-fei-bg">
                    FAQs
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-fei-bg/60">
                    {t.faqText}
                  </p>

                  <a
                    href="/faq"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#38bdf8] transition hover:text-fei-bg"
                  >
                    {t.faqLink}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>

                <div className="rounded-[1.5rem] border border-fei-bg/10 bg-white p-5 shadow-[0_18px_55px_rgba(7,17,31,0.035)] sm:p-6">
                  <h2 className="text-lg font-bold tracking-tight text-fei-bg">
                    {t.otherWays}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-fei-bg/60">
                    {t.direct}
                  </p>

                  <a
                    href="mailto:contact@feifootball.com"
                    className="mt-5 inline-flex font-semibold text-[#38bdf8] hover:text-fei-bg hover:underline"
                  >
                    contact@feifootball.com
                  </a>
                </div>
              </aside>

              <div className="rounded-[1.5rem] border border-fei-bg/10 bg-white p-5 shadow-[0_18px_55px_rgba(7,17,31,0.04)] sm:p-7">
                {submitted ? (
                  <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-fei-yellow/35 bg-fei-yellow/[0.10] text-2xl text-fei-bg">
                      ✓
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-fei-bg sm:text-3xl">
                      {t.successTitle}
                    </h2>

                    <p className="mt-4 max-w-lg text-sm leading-7 text-fei-bg/62">
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
                        <span className="text-sm font-medium text-fei-bg/70">{t.fullName}</span>
                        <input
                          value={values.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          placeholder={t.fullNamePlaceholder}
                          className="mt-2 w-full rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] px-4 py-3 text-sm text-fei-bg outline-none transition placeholder:text-fei-bg/35 focus:border-fei-sky/50 focus:bg-white"
                        />
                        {errors.fullName && <p className="mt-2 text-xs font-medium text-fei-bg">{errors.fullName}</p>}
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-fei-bg/70">{t.email}</span>
                        <input
                          value={values.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder={t.emailPlaceholder}
                          className="mt-2 w-full rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] px-4 py-3 text-sm text-fei-bg outline-none transition placeholder:text-fei-bg/35 focus:border-fei-sky/50 focus:bg-white"
                        />
                        {errors.email ? (
                          <p className="mt-2 text-xs font-medium text-fei-bg">{errors.email}</p>
                        ) : (
                          <p className="mt-2 text-xs text-fei-bg/45">{t.emailHelp}</p>
                        )}
                      </label>
                    </div>
<label className="block">
                      <span className="text-sm font-medium text-fei-bg/70">{t.message}</span>
                      <textarea
                        value={values.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        placeholder={t.messagePlaceholder}
                        rows={7}
                        maxLength={5000}
                        className="mt-2 w-full resize-none rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] px-4 py-3 text-sm leading-7 text-fei-bg outline-none transition placeholder:text-fei-bg/35 focus:border-fei-sky/50 focus:bg-white"
                      />
                      <div className="mt-2 flex items-center justify-between gap-4">
                        <p className="text-xs font-medium text-fei-bg">{errors.message || ''}</p>
                        <p className="text-xs text-fei-bg/40">{values.message.length}/5000</p>
                      </div>
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-fei-bg/70">{t.phone}</span>
                        <input
                          value={values.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder={t.phonePlaceholder}
                          className="mt-2 w-full rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] px-4 py-3 text-sm text-fei-bg outline-none transition placeholder:text-fei-bg/35 focus:border-fei-sky/50 focus:bg-white"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-fei-bg/70">{t.organization}</span>
                        <input
                          value={values.organization}
                          onChange={(e) => updateField('organization', e.target.value)}
                          placeholder={t.organizationPlaceholder}
                          className="mt-2 w-full rounded-2xl border border-fei-bg/10 bg-[#F7F8FA] px-4 py-3 text-sm text-fei-bg outline-none transition placeholder:text-fei-bg/35 focus:border-fei-sky/50 focus:bg-white"
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

                    <p className="text-center text-xs leading-6 text-fei-bg/48">
                      {t.privacy}{' '}
                      <a href="/privacy" className="font-semibold text-[#38bdf8] hover:text-fei-bg hover:underline">
                        {lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
                      </a>
                      .
                    </p>
                  </form>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
