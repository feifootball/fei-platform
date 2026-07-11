'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

type Lang = 'en' | 'es'

const pageCopy = {
  en: {
    legal: 'Legal',
    title: 'Privacy Policy',
    description:
      'Please read this Policy carefully to understand how FEI collects, uses, protects, and manages personal data.',
    updated: 'Last updated: July 2026',
    back: 'Back to Home',
    contactPrefix: 'For privacy questions, contact',
  },
  es: {
    legal: 'Legal',
    title: 'Política de privacidad',
    description:
      'Lee esta Política cuidadosamente para entender cómo FEI recopila, utiliza, protege y gestiona datos personales.',
    updated: 'Última actualización: julio de 2026',
    back: 'Volver a inicio',
    contactPrefix: 'Para preguntas sobre privacidad, escribe a',
  },
}

const sectionsByLang = {
  en: [
    {
      title: '1. Scope of this Policy',
      paragraphs: [
        'This Privacy Policy explains how FEI — Football English Intelligence collects, uses, stores, protects, and manages personal data related to its website, platform, diagnostics, learning content, accounts, plans, payments, institutional services, and related digital tools.',
        'This Policy applies when a user visits the website, creates an account, completes diagnostics, submits written or oral responses, accesses learning content, makes payments, requests support, or uses any FEI service.',
        'This Policy also applies, where relevant, to users connected to clubs, academies, schools, universities, federations, companies, sports programs, or other institutions that use FEI.',
      ],
    },
    {
      title: '2. Information we collect',
      paragraphs: [
        'FEI may collect account information such as name, email address, login details managed by authentication providers, preferred language, football role, country, institution where applicable, account status, and account preferences.',
        'FEI may collect profile and learning information such as role, level, learning pathway, communication goals, completed diagnostics, module progress, written responses, oral responses, voice recordings where applicable, scores, recommendations, reports, and learning activity.',
        'FEI may collect institutional and billing information such as institution name, responsible contact, assigned users, licenses, plan details, transaction history, payment status, billing information, renewal or cancellation dates, and information needed to manage contracts or services.',
        'FEI may collect technical and usage information such as visited pages, features used, device type, browser, operating system, IP address, approximate location based on IP, session identifiers, technical logs, errors, security events, and platform performance information.',
        'FEI may also collect communication and support information, including emails, form submissions, support requests, feedback, comments, and survey responses.',
      ],
    },
    {
      title: '3. How we use information',
      paragraphs: [
        'FEI uses personal data to operate, maintain, protect, and improve the platform.',
        'Information may be used to create and manage accounts, authenticate users, deliver diagnostics, generate results and recommendations, personalize learning, save progress, provide institutional features, process plans and payments, respond to support requests, and communicate important service information.',
        'FEI may also use information to improve diagnostics, content, platform performance, security, user experience, learning pathways, reports, and educational features.',
        'FEI may use contact information for account-related notices, security communications, payment or subscription messages, service updates, support responses, and educational or commercial communications where appropriate and allowed by law.',
      ],
    },
    {
      title: '4. Legal basis for processing',
      paragraphs: [
        'Where applicable law requires a legal basis, FEI may process personal data to perform a contract or provide a service; based on user consent; to comply with legal, tax, accounting, or regulatory obligations; to protect security and prevent fraud; or based on legitimate interests such as improving the platform, maintaining necessary communications, and protecting FEI, users, and institutions.',
        'When FEI relies on consent, the user may withdraw consent where applicable, without affecting processing that occurred before withdrawal.',
      ],
    },
    {
      title: '5. Technology-assisted and AI features',
      paragraphs: [
        'FEI may use automated systems, data analysis, language models, artificial intelligence, or related technologies to support diagnostics, communication analysis, feedback, level classification, recommendations, content personalization, reports, and platform improvement.',
        'These tools are used for educational and operational purposes. Although FEI aims for them to be useful, safe, and accurate, automated systems may contain limitations, errors, biases, or imperfect interpretations.',
        'Technology-assisted or AI-generated outputs do not replace human professional, pedagogical, institutional, sporting, medical, psychological, or legal judgment.',
      ],
    },
    {
      title: '6. Cookies and similar technologies',
      paragraphs: [
        'FEI may use cookies, local storage, pixels, session identifiers, and similar technologies to operate, secure, personalize, measure, and improve the platform.',
        'Essential technologies may be used for login sessions, authentication, security, fraud prevention, navigation, and basic platform functionality.',
        'Preference, analytics, performance, or communication technologies may be used to remember choices, understand platform usage, detect errors, improve speed and stability, and measure communications where appropriate.',
        'Users may control or block cookies through browser settings. If essential cookies are disabled, some FEI features may not work properly. FEI may also provide cookie management tools where applicable.',
      ],
    },
    {
      title: '7. External providers',
      paragraphs: [
        'FEI may use external providers for hosting, databases, authentication, payments, email, analytics, security, storage, support, artificial intelligence, communication, and other technology services.',
        'These providers may process personal data only as needed to provide services to FEI or according to their own terms where they act independently.',
        'FEI aims to work with providers that offer reasonable security, confidentiality, and data protection measures. FEI does not control external services that are not directly operated by FEI.',
      ],
    },
    {
      title: '8. International transfers',
      paragraphs: [
        'Personal data may be stored, processed, or transferred in countries other than the user’s country of residence, including countries where FEI or its technology providers operate.',
        'When data is transferred internationally, FEI will seek to apply reasonable safeguards, such as reliable providers, contractual measures where applicable, access controls, encryption in transit where appropriate, and compliance with applicable data protection laws.',
      ],
    },
    {
      title: '9. Information security',
      paragraphs: [
        'FEI uses reasonable technical, organizational, and administrative measures to protect personal data against unauthorized access, loss, alteration, improper disclosure, or destruction.',
        'These measures may include secure protocols, access controls, authentication, credential management, monitoring, internal restrictions, reliable technology providers, and progressive review of security practices.',
        'No digital system is completely secure. The user is also responsible for protecting their account, using secure passwords, not sharing credentials, and notifying FEI if they suspect unauthorized use.',
      ],
    },
    {
      title: '10. Data retention',
      paragraphs: [
        'FEI retains personal data for as long as necessary to provide the service, operate the platform, show progress, generate reports, manage accounts, comply with legal or contractual obligations, resolve disputes, protect security, and maintain necessary records.',
        'If a user requests account deletion, FEI will delete or anonymize personal data within a reasonable period, unless legal, contractual, tax, accounting, security, fraud prevention, or dispute resolution obligations require retaining certain information.',
        'Aggregated or anonymized information that does not directly identify the user may be used for analysis, research, product improvement, educational insights, and platform development.',
      ],
    },
    {
      title: '11. User rights',
      paragraphs: [
        'Depending on applicable law, users may have rights over their personal data, including access, rectification, deletion, portability, restriction, objection, withdrawal of consent, and rights related to certain automated processes.',
        'To exercise privacy rights, the user may contact FEI at contact@feifootball.com. The request should include the email associated with the account, full name, the right the user wishes to exercise, and enough detail to identify the request.',
        'FEI may request additional information to verify the user’s identity before responding and will seek to respond within a reasonable period in accordance with applicable law.',
      ],
    },
    {
      title: '12. Minors',
      paragraphs: [
        'FEI is primarily intended for adult users and for sports, educational, or professional institutions.',
        'Minors may use FEI only with authorization from their parents, legal guardians, club, academy, school, educational institution, or responsible entity, as applicable.',
        'When an institution creates, manages, or assigns an account to a minor, that institution is responsible for obtaining the necessary consents for the use of FEI and the processing of the minor’s personal data.',
        'If FEI detects that data has been collected from a minor without the required consent, it may suspend or delete the account and take reasonable measures to delete or limit processing, unless a legal or security obligation requires retention.',
      ],
    },
    {
      title: '13. Communications and third-party links',
      paragraphs: [
        'FEI may send communications related to account management, security, payments, subscriptions, billing, support, platform changes, educational progress, service updates, new content, products, features, or commercial information where appropriate.',
        'Users may unsubscribe from certain promotional communications where FEI provides that option. Some essential service communications cannot be disabled while the account is active.',
        'The platform may contain links or integrations with third-party services. Those services may collect or process data according to their own privacy policies and terms. Users should review third-party policies before using external services.',
      ],
    },
    {
      title: '14. Changes and contact',
      paragraphs: [
        'FEI may update this Privacy Policy when necessary to reflect legal, technical, commercial, operational, product, or data protection changes. Updates will be published on this page with a new update date.',
        'When changes are significant, FEI may attempt to notify users by email, within the platform, or through another reasonable channel.',
        'For questions about privacy, data requests, account deletion, rights, or reports related to data protection, users may contact FEI at contact@feifootball.com.',
      ],
    },
  ],
  es: [
    {
      title: '1. Alcance de esta Política',
      paragraphs: [
        'Esta Política de privacidad explica cómo FEI — Football English Intelligence recopila, utiliza, almacena, protege y gestiona datos personales relacionados con su sitio web, plataforma, diagnósticos, contenidos de aprendizaje, cuentas, planes, pagos, servicios institucionales y herramientas digitales relacionadas.',
        'Esta Política aplica cuando un usuario visita el sitio web, crea una cuenta, completa diagnósticos, envía respuestas escritas u orales, accede a contenidos, realiza pagos, solicita soporte o utiliza cualquier servicio de FEI.',
        'Esta Política también aplica, cuando corresponda, a usuarios vinculados a clubes, academias, colegios, universidades, federaciones, empresas, programas deportivos u otras instituciones que utilizan FEI.',
      ],
    },
    {
      title: '2. Información que recopilamos',
      paragraphs: [
        'FEI puede recopilar información de cuenta como nombre, correo electrónico, datos de acceso gestionados por proveedores de autenticación, idioma preferido, rol en el fútbol, país, institución cuando corresponda, estado de cuenta y preferencias.',
        'FEI puede recopilar información de perfil y aprendizaje como rol, nivel, ruta de aprendizaje, objetivos de comunicación, diagnósticos completados, progreso en módulos, respuestas escritas, respuestas orales, grabaciones de voz cuando corresponda, puntajes, recomendaciones, reportes y actividad de aprendizaje.',
        'FEI puede recopilar información institucional y de facturación como nombre de la institución, contacto responsable, usuarios asignados, licencias, detalles del plan, historial de transacciones, estado de pago, información de facturación, fechas de renovación o cancelación e información necesaria para gestionar contratos o servicios.',
        'FEI puede recopilar información técnica y de uso como páginas visitadas, funciones utilizadas, tipo de dispositivo, navegador, sistema operativo, dirección IP, ubicación aproximada basada en IP, identificadores de sesión, registros técnicos, errores, eventos de seguridad e información de rendimiento de la plataforma.',
        'FEI también puede recopilar información de comunicación y soporte, incluyendo correos, formularios, solicitudes de soporte, feedback, comentarios y respuestas a encuestas.',
      ],
    },
    {
      title: '3. Cómo usamos la información',
      paragraphs: [
        'FEI utiliza datos personales para operar, mantener, proteger y mejorar la plataforma.',
        'La información puede utilizarse para crear y gestionar cuentas, autenticar usuarios, entregar diagnósticos, generar resultados y recomendaciones, personalizar el aprendizaje, guardar progreso, habilitar funciones institucionales, procesar planes y pagos, responder solicitudes de soporte y comunicar información importante del servicio.',
        'FEI también puede utilizar información para mejorar diagnósticos, contenidos, rendimiento de la plataforma, seguridad, experiencia de usuario, rutas de aprendizaje, reportes y funciones educativas.',
        'FEI puede utilizar información de contacto para avisos relacionados con la cuenta, comunicaciones de seguridad, mensajes de pago o suscripción, actualizaciones del servicio, respuestas de soporte y comunicaciones educativas o comerciales cuando corresponda y la ley lo permita.',
      ],
    },
    {
      title: '4. Base legal para el tratamiento',
      paragraphs: [
        'Cuando la ley aplicable exija una base legal, FEI podrá tratar datos personales para ejecutar un contrato o prestar un servicio; con base en el consentimiento del usuario; para cumplir obligaciones legales, fiscales, contables o regulatorias; para proteger la seguridad y prevenir fraude; o con base en intereses legítimos como mejorar la plataforma, mantener comunicaciones necesarias y proteger a FEI, usuarios e instituciones.',
        'Cuando FEI se base en el consentimiento, el usuario podrá retirarlo cuando corresponda, sin afectar el tratamiento realizado antes de dicho retiro.',
      ],
    },
    {
      title: '5. Funciones asistidas por tecnología e IA',
      paragraphs: [
        'FEI puede utilizar sistemas automatizados, análisis de datos, modelos de lenguaje, inteligencia artificial o tecnologías relacionadas para apoyar diagnósticos, análisis de comunicación, feedback, clasificación de nivel, recomendaciones, personalización de contenido, reportes y mejora de la plataforma.',
        'Estas herramientas se utilizan con fines educativos y operativos. Aunque FEI busca que sean útiles, seguras y precisas, los sistemas automatizados pueden contener limitaciones, errores, sesgos o interpretaciones imperfectas.',
        'Los resultados asistidos por tecnología o generados con IA no reemplazan el criterio humano profesional, pedagógico, institucional, deportivo, médico, psicológico o legal.',
      ],
    },
    {
      title: '6. Cookies y tecnologías similares',
      paragraphs: [
        'FEI puede utilizar cookies, almacenamiento local, píxeles, identificadores de sesión y tecnologías similares para operar, proteger, personalizar, medir y mejorar la plataforma.',
        'Las tecnologías esenciales pueden utilizarse para sesiones de inicio de sesión, autenticación, seguridad, prevención de fraude, navegación y funciones básicas de la plataforma.',
        'Las tecnologías de preferencia, analítica, rendimiento o comunicación pueden utilizarse para recordar elecciones, entender el uso de la plataforma, detectar errores, mejorar velocidad y estabilidad y medir comunicaciones cuando corresponda.',
        'Los usuarios pueden controlar o bloquear cookies desde la configuración del navegador. Si se deshabilitan cookies esenciales, algunas funciones de FEI pueden no funcionar correctamente. FEI también podrá ofrecer herramientas de gestión de cookies cuando corresponda.',
      ],
    },
    {
      title: '7. Proveedores externos',
      paragraphs: [
        'FEI puede utilizar proveedores externos para hosting, bases de datos, autenticación, pagos, correo electrónico, analítica, seguridad, almacenamiento, soporte, inteligencia artificial, comunicación y otros servicios tecnológicos.',
        'Estos proveedores pueden tratar datos personales únicamente en la medida necesaria para prestar servicios a FEI o conforme a sus propios términos cuando actúen de forma independiente.',
        'FEI busca trabajar con proveedores que ofrezcan medidas razonables de seguridad, confidencialidad y protección de datos. FEI no controla servicios externos que no son operados directamente por FEI.',
      ],
    },
    {
      title: '8. Transferencias internacionales',
      paragraphs: [
        'Los datos personales pueden almacenarse, procesarse o transferirse en países distintos al país de residencia del usuario, incluyendo países donde FEI o sus proveedores tecnológicos operen.',
        'Cuando los datos se transfieran internacionalmente, FEI procurará aplicar salvaguardas razonables, como proveedores confiables, medidas contractuales cuando corresponda, controles de acceso, cifrado en tránsito cuando aplique y cumplimiento de leyes de protección de datos aplicables.',
      ],
    },
    {
      title: '9. Seguridad de la información',
      paragraphs: [
        'FEI utiliza medidas técnicas, organizativas y administrativas razonables para proteger datos personales contra acceso no autorizado, pérdida, alteración, divulgación indebida o destrucción.',
        'Estas medidas pueden incluir protocolos seguros, controles de acceso, autenticación, gestión de credenciales, monitoreo, restricciones internas, proveedores tecnológicos confiables y revisión progresiva de prácticas de seguridad.',
        'Ningún sistema digital es completamente seguro. El usuario también es responsable de proteger su cuenta, utilizar contraseñas seguras, no compartir credenciales y notificar a FEI si sospecha uso no autorizado.',
      ],
    },
    {
      title: '10. Conservación de datos',
      paragraphs: [
        'FEI conserva datos personales durante el tiempo necesario para prestar el servicio, operar la plataforma, mostrar progreso, generar reportes, gestionar cuentas, cumplir obligaciones legales o contractuales, resolver disputas, proteger la seguridad y mantener registros necesarios.',
        'Si un usuario solicita la eliminación de su cuenta, FEI eliminará o anonimizará datos personales dentro de un plazo razonable, salvo que obligaciones legales, contractuales, fiscales, contables, de seguridad, prevención de fraude o resolución de disputas exijan conservar cierta información.',
        'La información agregada o anonimizada que no identifique directamente al usuario podrá utilizarse para análisis, investigación, mejora de producto, insights educativos y desarrollo de la plataforma.',
      ],
    },
    {
      title: '11. Derechos del usuario',
      paragraphs: [
        'Dependiendo de la ley aplicable, los usuarios pueden tener derechos sobre sus datos personales, incluyendo acceso, rectificación, eliminación, portabilidad, restricción, oposición, retiro del consentimiento y derechos relacionados con ciertos procesos automatizados.',
        'Para ejercer derechos de privacidad, el usuario puede contactar a FEI en contact@feifootball.com. La solicitud debe incluir el correo asociado a la cuenta, nombre completo, el derecho que desea ejercer y suficiente detalle para identificar la solicitud.',
        'FEI podrá solicitar información adicional para verificar la identidad del usuario antes de responder y procurará hacerlo en un plazo razonable conforme a la ley aplicable.',
      ],
    },
    {
      title: '12. Menores de edad',
      paragraphs: [
        'FEI está dirigida principalmente a usuarios adultos y a instituciones deportivas, educativas o profesionales.',
        'Los menores de edad pueden usar FEI únicamente con autorización de sus padres, representantes legales, club, academia, colegio, institución educativa o entidad responsable, según corresponda.',
        'Cuando una institución crea, administra o asigna una cuenta a un menor, dicha institución es responsable de obtener los consentimientos necesarios para el uso de FEI y el tratamiento de datos personales del menor.',
        'Si FEI detecta que se han recopilado datos de un menor sin el consentimiento requerido, podrá suspender o eliminar la cuenta y tomar medidas razonables para eliminar o limitar el tratamiento, salvo que una obligación legal o de seguridad exija conservarlos.',
      ],
    },
    {
      title: '13. Comunicaciones y enlaces de terceros',
      paragraphs: [
        'FEI puede enviar comunicaciones relacionadas con gestión de cuentas, seguridad, pagos, suscripciones, facturación, soporte, cambios en la plataforma, progreso educativo, actualizaciones del servicio, nuevos contenidos, productos, funciones o información comercial cuando corresponda.',
        'Los usuarios pueden darse de baja de ciertas comunicaciones promocionales cuando FEI ofrezca esa opción. Algunas comunicaciones esenciales del servicio no pueden desactivarse mientras la cuenta esté activa.',
        'La plataforma puede contener enlaces o integraciones con servicios de terceros. Esos servicios pueden recopilar o tratar datos según sus propias políticas de privacidad y términos. Los usuarios deben revisar las políticas de terceros antes de utilizar servicios externos.',
      ],
    },
    {
      title: '14. Cambios y contacto',
      paragraphs: [
        'FEI puede actualizar esta Política de privacidad cuando sea necesario para reflejar cambios legales, técnicos, comerciales, operativos, de producto o de protección de datos. Las actualizaciones se publicarán en esta página con una nueva fecha.',
        'Cuando los cambios sean importantes, FEI podrá intentar notificar a los usuarios por correo electrónico, dentro de la plataforma o mediante otro canal razonable.',
        'Para preguntas sobre privacidad, solicitudes de datos, eliminación de cuenta, derechos o reportes relacionados con protección de datos, los usuarios pueden contactar a FEI en contact@feifootball.com.',
      ],
    },
  ],
}

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>('en')

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
  const sections = sectionsByLang[lang]

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
                {t.legal}
              </p>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-fei-bg sm:text-4xl">
                {t.title}
              </h1>

              <p className="mt-5 max-w-3xl text-[15px] leading-7 text-fei-bg/64 sm:text-base sm:leading-8">
                {t.description}
              </p>

              <p className="mt-5 inline-flex rounded-full border border-fei-bg/10 bg-[#F7F8FA] px-4 py-2 text-sm font-semibold text-fei-bg/72">
                {t.updated}
              </p>
            </header>

            <div className="space-y-10">
              {sections.map(section => (
                <section
                  key={section.title}
                  id={section.title.toLowerCase().replaceAll(' ', '-').replaceAll('.', '')}
                  className="scroll-mt-28 border-b border-fei-bg/10 pb-9 last:border-b-0 last:pb-0"
                >
                  <h2 className="mb-4 text-xl font-bold tracking-tight text-fei-bg sm:text-2xl">
                    {section.title}
                  </h2>

                  <div className="space-y-4">
                    {section.paragraphs.map(paragraph => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-fei-bg/66 sm:text-[15px] sm:leading-8"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-[1.5rem] border border-fei-bg/10 bg-[#F7F8FA] p-5 text-sm leading-7 text-fei-bg/66">
              <p>
                {t.contactPrefix}{' '}
                <a href="mailto:contact@feifootball.com" className="font-semibold text-[#38bdf8] hover:text-fei-bg hover:underline">
                  contact@feifootball.com
                </a>
                .
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
