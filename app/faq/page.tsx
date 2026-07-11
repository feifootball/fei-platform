'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

type Lang = 'en' | 'es'

const pageCopy = {
  en: {
    legal: 'Support',
    title: 'FAQs',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'Answers to common questions about FEI, accounts, diagnostics, plans, privacy, institutional access, and technical requirements.',
    back: 'Back to Home',
    contactPrefix: 'Did not find your answer? Contact',
  },
  es: {
    legal: 'Soporte',
    title: 'Preguntas frecuentes',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'Respuestas a preguntas comunes sobre FEI, cuentas, diagnósticos, planes, privacidad, acceso institucional y requisitos técnicos.',
    back: 'Volver a inicio',
    contactPrefix: '¿No encontraste tu respuesta? Escribe a',
  },
}

const faqByLang = {
  en: [
    {
      category: 'General',
      items: [
        {
          question: 'What is FEI?',
          answer:
            'FEI — Football English Intelligence is a specialized learning platform that teaches English communication applied to football. It is not a traditional English course. FEI focuses on the practical communication skills needed by players, coaches, scouts, analysts, and other football professionals. The platform combines personalized diagnostics, real football scenarios, role-specific learning pathways, and recommendations based on each user’s profile.',
        },
        {
          question: 'Who is FEI for?',
          answer:
            'FEI is designed for football professionals who need to communicate better in English. This includes players, coaches, scouts, analysts, sports psychologists, fitness coaches, physiotherapists, nutritionists, academy directors, clubs, academies, schools, universities, and institutions connected to football. FEI is mainly intended for adults, although minors may use it with the proper authorization from parents, legal guardians, clubs, academies, schools, or responsible institutions.',
        },
        {
          question: 'How does FEI work?',
          answer:
            'The process is simple: the user creates an account, completes a diagnostic, receives personalized results, and then follows recommended modules based on role, level, and communication needs. FEI helps users practice with football-specific situations such as interviews, team talks, scouting reports, contract conversations, tactical meetings, player feedback, and professional communication scenarios.',
        },
        {
          question: 'Where is FEI based?',
          answer:
            'FEI operates from Ecuador and is designed for an international football audience. The project combines expertise in education, football, communication, technology, and professional English for global football environments.',
        },
      ],
    },
    {
      category: 'Accounts and registration',
      items: [
        {
          question: 'How do I register?',
          answer:
            'To register, go to feifootball.com, select Register, enter your account details, choose your football role, and accept the Terms of Service and Privacy Policy. Registration gives you access to the initial experience. Additional premium content or institutional access may depend on the selected plan.',
        },
        {
          question: 'Can I change my email or password?',
          answer:
            'Account settings may allow the user to update certain profile or access details. If password recovery is needed, the user can use the password reset option from the login screen when available. FEI may update account management features as the platform develops.',
        },
        {
          question: 'What happens if I forget my password?',
          answer:
            'The user can request a password reset from the login screen by entering the email associated with the account. If the account exists, the user should receive instructions to create a new password through the authentication provider.',
        },
        {
          question: 'Can I have multiple accounts?',
          answer:
            'FEI recommends one account per person. Multiple accounts may create confusion in diagnostics, progress tracking, reports, subscriptions, and institutional access. If an institution needs access for several users, FEI can provide institutional options.',
        },
        {
          question: 'Are my account details secure?',
          answer:
            'FEI uses secure authentication and works with technology providers that offer reasonable security measures. Users are also responsible for protecting their credentials, using strong passwords, and not sharing accounts with unauthorized third parties.',
        },
      ],
    },
    {
      category: 'Diagnostics and results',
      items: [
        {
          question: 'What is the FEI diagnostic?',
          answer:
            'The FEI diagnostic is an initial assessment designed to understand the user’s English communication skills in football-specific contexts. It may include reading, listening, writing, speaking, role-based situations, and professional communication tasks depending on the diagnostic version available.',
        },
        {
          question: 'What do my results include?',
          answer:
            'Results may include an estimated CEFR level, a score, strengths, areas for improvement, role-specific insights, and recommended modules. The objective is to help the user understand their current communication profile and what to work on next.',
        },
        {
          question: 'Does the diagnostic give me an official certification?',
          answer:
            'No. FEI diagnostics are educational and guidance-oriented. They are not official language certifications and should not be treated as a replacement for certified exams such as Cambridge, TOEFL, IELTS, or other external qualifications. FEI helps users prepare for real football communication, but it does not issue official language certifications unless a specific product clearly states otherwise.',
        },
        {
          question: 'Can I repeat the diagnostic?',
          answer:
            'Yes, FEI may allow users to repeat diagnostics to measure progress over time. The recommended frequency may depend on the user’s learning pathway, role, and platform access.',
        },
        {
          question: 'How long do FEI modules take?',
          answer:
            'Module duration can vary depending on the topic, level, and activity type. Some lessons may be short and focused, while scenarios, speaking tasks, or projects may take longer. FEI is designed so users can progress at their own pace.',
        },
      ],
    },
    {
      category: 'Plans and payments',
      items: [
        {
          question: 'How much does FEI cost?',
          answer:
            'FEI may offer Free Access, Individual Premium plans, and Institutional Plans. Free Access may include an initial diagnostic and limited preview. Individual Premium may start from around $49/month or $399/year. Institutional Plans may start from around $199/month, depending on the number of users, licenses, reports, support, implementation needs, country, promotions, and commercial conditions. FEI will show the applicable price before any payment is made.',
        },
        {
          question: 'How do I subscribe?',
          answer:
            'When premium access is available, the user may choose a plan from the platform, review the price and conditions, and complete payment through the available payment provider. Access is activated according to the selected plan and payment confirmation.',
        },
        {
          question: 'Does FEI store my card details?',
          answer:
            'Full credit or debit card details are processed by external payment providers. FEI does not directly store full card information unless expressly stated otherwise and always in accordance with applicable law.',
        },
        {
          question: 'What is the refund policy?',
          answer:
            'Refund conditions may vary depending on the plan, country, payment provider, promotion, or institutional agreement. Unless applicable law states otherwise, payments may not be refundable once the user has accessed content, completed diagnostics, used digital services, or consumed a substantial part of the service. FEI may review exceptional cases individually.',
        },
        {
          question: 'How do I cancel a subscription?',
          answer:
            'When subscriptions are available, users will be able to manage or cancel their plan through the account, payment provider, or FEI support channels, depending on how the subscription was created. Access may continue until the end of the billing period unless stated otherwise.',
        },
        {
          question: 'What payment methods does FEI accept?',
          answer:
            'Available payment methods may depend on the payment provider, country, currency, and plan. FEI may support credit or debit card payments and other options as the platform develops.',
        },
      ],
    },
    {
      category: 'Technical requirements',
      items: [
        {
          question: 'Which browsers are supported?',
          answer:
            'FEI is designed to work on modern browsers such as Chrome, Safari, Firefox, and Edge. For the best experience, users should keep their browser updated.',
        },
        {
          question: 'Can I use FEI on mobile?',
          answer:
            'Yes. FEI is designed to be responsive and can be used on phones, tablets, laptops, and desktop computers. For longer diagnostics, speaking tasks, writing activities, or practice sessions, a laptop or desktop may provide a better experience.',
        },
        {
          question: 'What technical requirements do I need?',
          answer:
            'The user needs a stable internet connection, a modern device, an updated browser, and cookies enabled for login and essential platform features. For speaking or pronunciation activities, a working microphone and audio output may be required.',
        },
        {
          question: 'Can I use FEI offline?',
          answer:
            'FEI is primarily designed for online use. Some content or features may require an active internet connection, authentication, and access to platform services.',
        },
      ],
    },
    {
      category: 'Privacy and security',
      items: [
        {
          question: 'What data does FEI collect?',
          answer:
            'FEI may collect account information, role information, diagnostic responses, results, progress, technical data, payment-related information, and support communications. The exact data depends on how the user uses the platform. Full details are available in the Privacy Policy.',
        },
        {
          question: 'Does FEI sell my data?',
          answer:
            'No. FEI does not sell personal data to third parties. Data is used to operate the platform, personalize learning, generate diagnostics and recommendations, improve services, protect security, and comply with legal or contractual obligations.',
        },
        {
          question: 'How can I request a copy or deletion of my data?',
          answer:
            'The user can contact FEI at contact@feifootball.com to request access, correction, deletion, portability, restriction, objection, or other applicable privacy rights. FEI may need to verify the user’s identity before processing the request.',
        },
        {
          question: 'Are voice recordings used?',
          answer:
            'If a diagnostic or speaking activity includes voice input, FEI may process recordings or spoken responses to evaluate communication, generate feedback, improve learning recommendations, operate the feature, and maintain platform quality. More details are available in the Privacy Policy.',
        },
      ],
    },
    {
      category: 'Institutional access',
      items: [
        {
          question: 'Does FEI offer access for clubs or academies?',
          answer:
            'Yes. FEI may offer institutional access for clubs, academies, schools, universities, federations, companies, and football programs. Institutional access may include multiple users, role-based diagnostics, reports, progress tracking, and specific implementation conditions.',
        },
        {
          question: 'How many users can be included in an institutional plan?',
          answer:
            'The number of users depends on the plan, institution size, license type, and implementation needs. FEI may offer plans for small groups, medium-sized academies, large clubs, or custom institutional projects.',
        },
        {
          question: 'Can institutions view user progress?',
          answer:
            'Depending on the plan and permissions, institutions may receive individual or aggregated reports, diagnostic results, progress information, or learning insights. Institutions are responsible for informing users and obtaining any necessary consents, especially when minors are involved.',
        },
      ],
    },
    {
      category: 'Support and contact',
      items: [
        {
          question: 'How do I contact FEI?',
          answer:
            'For general questions, privacy requests, institutional access, sales, support, or account-related matters, the user can contact FEI at contact@feifootball.com.',
        },
        {
          question: 'Does FEI offer live support chat?',
          answer:
            'Live chat may not be available at all times. FEI may provide support through email or other official channels as the platform develops.',
        },
        {
          question: 'What should I do if I cannot find my answer?',
          answer:
            'The user can contact FEI at contact@feifootball.com with a clear description of the question, account email if relevant, and any useful details to help FEI respond.',
        },
      ],
    },
  ],
  es: [
    {
      category: 'General',
      items: [
        {
          question: '¿Qué es FEI?',
          answer:
            'FEI — Football English Intelligence es una plataforma de aprendizaje especializada que enseña comunicación en inglés aplicada al contexto futbolístico. No es un curso de inglés tradicional. FEI se enfoca en las habilidades prácticas de comunicación que necesitan jugadores, entrenadores, scouts, analistas y otros profesionales del fútbol. La plataforma combina diagnósticos personalizados, escenarios reales de fútbol, rutas por rol y recomendaciones basadas en el perfil de cada usuario.',
        },
        {
          question: '¿Para quién es FEI?',
          answer:
            'FEI está diseñado para profesionales del fútbol que necesitan comunicarse mejor en inglés. Esto incluye jugadores, entrenadores, scouts, analistas, psicólogos deportivos, preparadores físicos, fisioterapeutas, nutricionistas, directores de academia, clubes, academias, colegios, universidades e instituciones vinculadas al fútbol. FEI está dirigido principalmente a usuarios mayores de edad, aunque menores pueden utilizarlo con autorización de padres, representantes legales, clubes, academias, colegios o instituciones responsables.',
        },
        {
          question: '¿Cómo funciona FEI?',
          answer:
            'El proceso es simple: el usuario crea una cuenta, completa un diagnóstico, recibe resultados personalizados y sigue módulos recomendados según su rol, nivel y necesidades de comunicación. FEI ayuda a practicar situaciones específicas del fútbol como entrevistas, charlas de equipo, reportes de scouting, conversaciones contractuales, reuniones tácticas, feedback a jugadores y comunicación profesional.',
        },
        {
          question: '¿Dónde está basado FEI?',
          answer:
            'FEI opera desde Ecuador y está diseñado para una audiencia futbolística internacional. El proyecto combina experiencia en educación, fútbol, comunicación, tecnología e inglés profesional para entornos globales del fútbol.',
        },
      ],
    },
    {
      category: 'Cuentas y registro',
      items: [
        {
          question: '¿Cómo me registro?',
          answer:
            'Para registrarse, el usuario debe ir a feifootball.com, seleccionar Register, ingresar sus datos de cuenta, elegir su rol futbolístico y aceptar los Términos de Servicio y la Política de Privacidad. El registro permite acceder a la experiencia inicial. El contenido premium o acceso institucional puede depender del plan seleccionado.',
        },
        {
          question: '¿Puedo cambiar mi email o contraseña?',
          answer:
            'La configuración de cuenta puede permitir al usuario actualizar ciertos datos de perfil o acceso. Si necesita recuperar su contraseña, puede utilizar la opción de recuperación desde la pantalla de login cuando esté disponible. FEI podrá actualizar estas funciones conforme avance la plataforma.',
        },
        {
          question: '¿Qué pasa si olvido mi contraseña?',
          answer:
            'El usuario puede solicitar un restablecimiento de contraseña desde la pantalla de login ingresando el correo asociado a su cuenta. Si la cuenta existe, recibirá instrucciones para crear una nueva contraseña mediante el proveedor de autenticación.',
        },
        {
          question: '¿Puedo tener múltiples cuentas?',
          answer:
            'FEI recomienda una cuenta por persona. Tener múltiples cuentas puede generar confusión en diagnósticos, seguimiento de progreso, reportes, suscripciones y acceso institucional. Si una institución necesita acceso para varios usuarios, FEI puede ofrecer opciones institucionales.',
        },
        {
          question: '¿Mis datos de cuenta están seguros?',
          answer:
            'FEI utiliza autenticación segura y trabaja con proveedores tecnológicos que ofrecen medidas razonables de seguridad. El usuario también es responsable de proteger sus credenciales, usar contraseñas seguras y no compartir su cuenta con terceros no autorizados.',
        },
      ],
    },
    {
      category: 'Diagnósticos y resultados',
      items: [
        {
          question: '¿Qué es el diagnóstico FEI?',
          answer:
            'El diagnóstico FEI es una evaluación inicial diseñada para entender las habilidades de comunicación en inglés del usuario en contextos específicos del fútbol. Puede incluir lectura, escucha, escritura, speaking, situaciones por rol y tareas de comunicación profesional según la versión disponible del diagnóstico.',
        },
        {
          question: '¿Qué incluyen mis resultados?',
          answer:
            'Los resultados pueden incluir un nivel CEFR estimado, un puntaje, fortalezas, áreas de mejora, insights específicos por rol y módulos recomendados. El objetivo es ayudar al usuario a entender su perfil actual de comunicación y qué trabajar después.',
        },
        {
          question: '¿El diagnóstico me certifica oficialmente?',
          answer:
            'No. Los diagnósticos FEI son educativos y orientativos. No son certificaciones oficiales de idioma y no deben tratarse como reemplazo de exámenes certificados como Cambridge, TOEFL, IELTS u otras calificaciones externas. FEI ayuda a prepararse para comunicación real en fútbol, pero no emite certificaciones oficiales de idioma salvo que un producto específico lo indique claramente.',
        },
        {
          question: '¿Puedo repetir el diagnóstico?',
          answer:
            'Sí. FEI puede permitir repetir diagnósticos para medir progreso a lo largo del tiempo. La frecuencia recomendada puede depender de la ruta de aprendizaje, rol y acceso del usuario.',
        },
        {
          question: '¿Cuánto tiempo duran los módulos?',
          answer:
            'La duración de los módulos puede variar según el tema, nivel y tipo de actividad. Algunas lecciones pueden ser breves y enfocadas, mientras que escenarios, ejercicios orales o proyectos pueden tomar más tiempo. FEI está diseñado para que el usuario avance a su propio ritmo.',
        },
      ],
    },
    {
      category: 'Planes y pagos',
      items: [
        {
          question: '¿Cuál es el costo de FEI?',
          answer:
            'FEI puede ofrecer acceso gratuito, planes Premium Individuales y Planes Institucionales. El acceso gratuito puede incluir un diagnóstico inicial y una vista previa limitada. El plan Premium Individual puede empezar alrededor de $49/mes o $399/año. Los Planes Institucionales pueden empezar alrededor de $199/mes, según número de usuarios, licencias, reportes, soporte, implementación, país, promociones y condiciones comerciales. FEI mostrará el precio aplicable antes de cualquier pago.',
        },
        {
          question: '¿Cómo me suscribo?',
          answer:
            'Cuando el acceso premium esté disponible, el usuario podrá elegir un plan desde la plataforma, revisar el precio y las condiciones, y completar el pago mediante el proveedor de pago disponible. El acceso se activará según el plan seleccionado y la confirmación del pago.',
        },
        {
          question: '¿FEI almacena los datos de mi tarjeta?',
          answer:
            'Los datos completos de tarjetas de crédito o débito son procesados por proveedores externos de pago. FEI no almacena directamente la información completa de tarjetas, salvo que se indique expresamente lo contrario y siempre conforme a la normativa aplicable.',
        },
        {
          question: '¿Cuál es la política de reembolsos?',
          answer:
            'Las condiciones de reembolso pueden variar según el plan, país, proveedor de pago, promoción o acuerdo institucional. Salvo que la ley aplicable indique lo contrario, los pagos pueden no ser reembolsables una vez que el usuario haya accedido a contenidos, completado diagnósticos, utilizado servicios digitales o consumido parte sustancial del servicio. FEI podrá revisar casos excepcionales de forma individual.',
        },
        {
          question: '¿Cómo cancelo mi suscripción?',
          answer:
            'Cuando las suscripciones estén disponibles, los usuarios podrán gestionar o cancelar su plan desde la cuenta, el proveedor de pago o los canales de soporte de FEI, según cómo se haya creado la suscripción. El acceso puede continuar hasta el final del periodo de facturación salvo que se indique lo contrario.',
        },
        {
          question: '¿Qué métodos de pago acepta FEI?',
          answer:
            'Los métodos de pago disponibles pueden depender del proveedor de pago, país, moneda y plan. FEI puede admitir pagos con tarjeta de crédito o débito y otras opciones conforme avance la plataforma.',
        },
      ],
    },
    {
      category: 'Requisitos técnicos',
      items: [
        {
          question: '¿Qué navegadores son compatibles?',
          answer:
            'FEI está diseñado para funcionar en navegadores modernos como Chrome, Safari, Firefox y Edge. Para una mejor experiencia, el usuario debe mantener su navegador actualizado.',
        },
        {
          question: '¿Puedo usar FEI en móvil?',
          answer:
            'Sí. FEI está diseñado para ser responsive y puede utilizarse en teléfonos, tablets, laptops y computadoras de escritorio. Para diagnósticos largos, ejercicios de speaking, escritura o sesiones de práctica, una laptop o desktop puede ofrecer una mejor experiencia.',
        },
        {
          question: '¿Qué requisitos técnicos necesito?',
          answer:
            'El usuario necesita una conexión estable a internet, un dispositivo moderno, un navegador actualizado y cookies habilitadas para iniciar sesión y usar funciones esenciales. Para actividades de speaking o pronunciación, puede requerirse micrófono y salida de audio.',
        },
        {
          question: '¿Puedo usar FEI sin internet?',
          answer:
            'FEI está diseñado principalmente para uso online. Algunos contenidos o funciones pueden requerir conexión activa a internet, autenticación y acceso a los servicios de la plataforma.',
        },
      ],
    },
    {
      category: 'Privacidad y seguridad',
      items: [
        {
          question: '¿Qué datos recopila FEI?',
          answer:
            'FEI puede recopilar información de cuenta, información de rol, respuestas de diagnóstico, resultados, progreso, datos técnicos, información relacionada con pagos y comunicaciones de soporte. Los datos exactos dependen de cómo el usuario utilice la plataforma. Los detalles completos están disponibles en la Política de Privacidad.',
        },
        {
          question: '¿FEI venderá mis datos?',
          answer:
            'No. FEI no vende datos personales a terceros. Los datos se utilizan para operar la plataforma, personalizar el aprendizaje, generar diagnósticos y recomendaciones, mejorar los servicios, proteger la seguridad y cumplir obligaciones legales o contractuales.',
        },
        {
          question: '¿Cómo solicito una copia o eliminación de mis datos?',
          answer:
            'El usuario puede contactar a FEI en contact@feifootball.com para solicitar acceso, corrección, eliminación, portabilidad, restricción, oposición u otros derechos de privacidad aplicables. FEI puede necesitar verificar la identidad del usuario antes de procesar la solicitud.',
        },
        {
          question: '¿Se utilizan grabaciones de voz?',
          answer:
            'Si un diagnóstico o actividad de speaking incluye entrada de voz, FEI puede procesar grabaciones o respuestas habladas para evaluar comunicación, generar feedback, mejorar recomendaciones de aprendizaje, operar la función y mantener la calidad de la plataforma. Más detalles están disponibles en la Política de Privacidad.',
        },
      ],
    },
    {
      category: 'Acceso institucional',
      items: [
        {
          question: '¿FEI ofrece acceso para clubes o academias?',
          answer:
            'Sí. FEI puede ofrecer acceso institucional para clubes, academias, colegios, universidades, federaciones, empresas y programas de fútbol. El acceso institucional puede incluir múltiples usuarios, diagnósticos por rol, reportes, seguimiento de progreso y condiciones específicas de implementación.',
        },
        {
          question: '¿Cuántos usuarios puedo incluir en un plan institucional?',
          answer:
            'El número de usuarios depende del plan, tamaño de la institución, tipo de licencia y necesidades de implementación. FEI puede ofrecer planes para grupos pequeños, academias medianas, clubes grandes o proyectos institucionales personalizados.',
        },
        {
          question: '¿Las instituciones pueden ver el progreso de los usuarios?',
          answer:
            'Según el plan y los permisos, las instituciones pueden recibir reportes individuales o agregados, resultados de diagnóstico, información de progreso o insights de aprendizaje. Las instituciones son responsables de informar a los usuarios y obtener los consentimientos necesarios, especialmente cuando existan menores de edad.',
        },
      ],
    },
    {
      category: 'Soporte y contacto',
      items: [
        {
          question: '¿Cómo contacto con FEI?',
          answer:
            'Para preguntas generales, solicitudes de privacidad, acceso institucional, ventas, soporte o asuntos relacionados con la cuenta, el usuario puede contactar a FEI en contact@feifootball.com.',
        },
        {
          question: '¿FEI ofrece chat de soporte en vivo?',
          answer:
            'El chat en vivo puede no estar disponible en todo momento. FEI puede ofrecer soporte por correo electrónico u otros canales oficiales conforme avance la plataforma.',
        },
        {
          question: '¿Qué hago si no encuentro mi respuesta?',
          answer:
            'El usuario puede contactar a FEI en contact@feifootball.com con una descripción clara de la pregunta, correo de cuenta si aplica y cualquier detalle útil para que FEI pueda responder.',
        },
      ],
    },
  ],
}

export default function FAQPage() {
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
  const categories = faqByLang[lang]

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
            </header>

            <div className="space-y-10">
              {categories.map(category => (
                <section
                  key={category.category}
                  id={category.category.toLowerCase().replaceAll(' ', '-')}
                  className="scroll-mt-28 border-b border-fei-bg/10 pb-9 last:border-b-0 last:pb-0"
                >
                  <h2 className="mb-5 text-xl font-bold tracking-tight text-fei-bg sm:text-2xl">
                    {category.category}
                  </h2>

                  <div className="divide-y divide-fei-bg/10 overflow-hidden rounded-[1.5rem] border border-fei-bg/10 bg-[#F7F8FA]">
                    {category.items.map(item => (
                      <details key={item.question} className="group bg-white/60 p-5 transition open:bg-white">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-5">
                          <span className="text-[15px] font-semibold leading-7 text-fei-bg/82 sm:text-base">
                            {item.question}
                          </span>

                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-fei-bg/12 bg-white text-sm leading-none text-fei-bg/58 transition group-open:rotate-45 group-open:border-fei-sky/35 group-open:text-fei-bg">
                            +
                          </span>
                        </summary>

                        <p className="mt-4 max-w-4xl text-sm leading-7 text-fei-bg/64 sm:text-[15px] sm:leading-8">
                          {item.answer}
                        </p>
                      </details>
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
