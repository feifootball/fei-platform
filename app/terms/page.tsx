'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

type Lang = 'en' | 'es'

const pageCopy = {
  en: {
    legal: 'Legal',
    title: 'Terms of Use',
    description:
      'Please read these Terms carefully before accessing or using FEI.',
    updated: 'Last updated: July 2026',
    back: 'Back to Home',
    contactPrefix: 'For questions about these terms, contact',
  },
  es: {
    legal: 'Legal',
    title: 'Términos de uso',
    description:
      'Lee estos Términos cuidadosamente antes de acceder o utilizar FEI.',
    updated: 'Última actualización: julio de 2026',
    back: 'Volver a inicio',
    contactPrefix: 'Para preguntas sobre estos términos, escribe a',
  },
}

const sectionsByLang = {
  en: [
    {
      title: '1. Acceptance of these Terms',
      paragraphs: [
        'These Terms of Use govern access to and use of FEI — Football English Intelligence, including its website, platform, diagnostics, learning content, plans, reports, institutional services, and related digital tools.',
        'By creating an account, accessing the platform, completing a diagnostic, making a payment, or using FEI services, the user confirms that they have read, understood, and accepted these Terms, together with the Privacy Policy and any other applicable policy.',
        'If the user does not agree with these Terms, they must not access, register for, or use FEI.',
      ],
    },
    {
      title: '2. Purpose of FEI',
      paragraphs: [
        'FEI is an educational platform specialized in English communication for football. It is designed to support players, coaches, scouts, analysts, fitness coaches, physiotherapists, sports psychologists, nutritionists, academy directors, clubs, academies, educational institutions, and other professionals connected to football.',
        'FEI provides diagnostics, learning pathways, role-based content, communication scenarios, feedback, recommendations, and progress tools for educational and professional development purposes.',
        'FEI is not a formal language certification provider unless a specific product, certificate, contract, or agreement expressly states otherwise.',
      ],
    },
    {
      title: '3. Accounts and registration',
      paragraphs: [
        'To access certain features, the user may need to create an account and provide accurate information, including name, email address, football role, country, institution where applicable, and other information needed to operate or personalize the experience.',
        'The user is responsible for keeping login credentials confidential, maintaining accurate account information, and notifying FEI if they suspect unauthorized access or misuse.',
        'FEI may suspend, restrict, or cancel an account if it reasonably believes that the information provided is false, the account is being misused, security is at risk, payment obligations have not been met, or these Terms have been breached.',
      ],
    },
    {
      title: '4. Eligibility, minors, and institutional responsibility',
      paragraphs: [
        'FEI is primarily intended for adult users and for sports, educational, or professional institutions.',
        'Minors may use FEI only with the authorization of a parent, legal guardian, club, academy, school, educational institution, or responsible entity, as applicable.',
        'When an institution creates, manages, or assigns access to minors or other users, that institution is responsible for obtaining the necessary consents, managing access properly, informing users about FEI, and ensuring that users comply with these Terms.',
      ],
    },
    {
      title: '5. Institutional access',
      paragraphs: [
        'FEI may offer accounts, licenses, plans, reports, dashboards, or implementation services for clubs, academies, schools, universities, federations, companies, sports programs, or other institutions.',
        'Institutional users are responsible for managing assigned accounts, paying applicable fees, using reports and results responsibly, protecting user data, and notifying FEI when an account must be modified, suspended, or deleted.',
        'Specific institutional conditions may be set out in proposals, contracts, purchase orders, service agreements, or other separate documents. If there is a conflict between these Terms and a signed institutional agreement, the institutional agreement will prevail where applicable.',
      ],
    },
    {
      title: '6. Plans, payments, renewals, and refunds',
      paragraphs: [
        'FEI may offer free access, paid plans, monthly or annual subscriptions, institutional plans, individual purchases, free trials, promotions, scholarships, or other commercial models.',
        'Prices, features, access duration, usage limits, renewal conditions, and included benefits will be shown on the platform or communicated by FEI before purchase.',
        'Payments may be processed by external providers. FEI does not directly store full credit or debit card information unless expressly stated otherwise and always in accordance with applicable law.',
        'If a plan renews automatically, the user or institution is responsible for canceling before the renewal date if they do not wish to continue.',
        'Unless applicable law requires otherwise, payments may be non-refundable once the user has accessed content, completed diagnostics, received platform access, or used a substantial part of the service. FEI may review exceptional refund requests on a case-by-case basis.',
      ],
    },
    {
      title: '7. License and permitted use',
      paragraphs: [
        'While the account is active and the user complies with these Terms, FEI grants a limited, personal, non-exclusive, non-transferable, revocable license to access and use the platform according to the contracted plan.',
        'The user may use FEI for lawful educational, professional, institutional, or learning purposes, including completing diagnostics, accessing results, studying modules, receiving feedback, tracking progress, and using authorized reports or resources.',
        'This license does not transfer ownership of FEI content, software, methodology, diagnostics, questions, reports, visual identity, or intellectual property.',
      ],
    },
    {
      title: '8. Prohibited use',
      paragraphs: [
        'The user may not use FEI to violate laws, infringe third-party rights, share accounts with unauthorized parties, copy or resell content, bypass payment or security controls, manipulate diagnostics, use bots or scrapers, upload harmful code, access systems without authorization, impersonate others, or use the platform in an abusive, fraudulent, discriminatory, offensive, or illegal manner.',
        'The user may not reproduce, publish, distribute, extract, sell, sublicense, adapt, or use FEI materials to develop competing products or train external artificial intelligence systems without prior written authorization.',
        'FEI may investigate, restrict, suspend, or cancel accounts that breach these rules or create risk for FEI, other users, institutions, or third parties.',
      ],
    },
    {
      title: '9. Diagnostics, results, and recommendations',
      paragraphs: [
        'FEI diagnostics are designed to provide educational guidance about English communication skills applied to football roles and professional contexts.',
        'Results may include scores, estimated levels, strengths, areas for improvement, recommendations, suggested learning pathways, reports, or educational insights.',
        'FEI results should not be interpreted as official language certification, a guarantee of professional performance, a hiring or selection decision, medical or psychological evaluation, or a promise of employment, sporting, academic, or institutional opportunity.',
        'Users, clubs, academies, and institutions are responsible for interpreting and applying results appropriately and in context.',
      ],
    },
    {
      title: '10. Technology-assisted and AI features',
      paragraphs: [
        'FEI may use automated systems, data analysis, language models, artificial intelligence, or other technologies to support diagnostics, feedback, level classification, recommendations, content personalization, reports, and platform improvement.',
        'Although FEI aims for these tools to be useful, safe, and accurate, automated systems may contain limitations, errors, biases, or imperfect interpretations.',
        'Technology-assisted or AI-generated outputs do not replace human professional, pedagogical, institutional, sporting, medical, psychological, or legal judgment.',
      ],
    },
    {
      title: '11. User content',
      paragraphs: [
        'FEI may allow users to submit written responses, oral responses, voice recordings, exercises, assignments, comments, profile information, files, or other content.',
        'The user retains any rights they may have over the content they submit. By submitting content, the user grants FEI the limited rights necessary to store, process, analyze, reproduce technically, and use that content to operate the platform, deliver diagnostics, generate feedback, personalize learning, provide support, improve services, and comply with legal or contractual obligations.',
        'The user confirms that submitted content is lawful, does not infringe third-party rights, does not contain harmful code, and does not include offensive, discriminatory, defamatory, false, abusive, or illegal material.',
      ],
    },
    {
      title: '12. Intellectual property',
      paragraphs: [
        'FEI, including its name, brand, logo, visual identity, design, interface, text, diagnostics, questions, model answers, educational content, methodology, learning pathways, level structure, reports, software, code, databases, documentation, and materials, belongs to FEI or its licensors.',
        'The user may not use FEI trademarks, names, logos, designs, content, diagnostics, or materials without prior written authorization, except for lawful, descriptive, and good-faith references.',
        'FEI may take technical, contractual, or legal measures to protect its intellectual property rights.',
      ],
    },
    {
      title: '13. Privacy, data, and third-party services',
      paragraphs: [
        'The processing of personal data is governed by FEI’s Privacy Policy.',
        'By using FEI, the user understands that FEI may process personal data for account creation, authentication, diagnostics, results, learning personalization, payments, support, security, communications, platform improvement, and legal or contractual compliance.',
        'FEI may integrate with external providers for hosting, authentication, payments, analytics, email, storage, support, artificial intelligence, or other technology services. These providers may have their own terms and privacy policies.',
        'Cookies and similar technologies may be used as described in the Privacy Policy or any applicable Cookie Policy.',
      ],
    },
    {
      title: '14. Availability, changes, and suspension',
      paragraphs: [
        'FEI aims to keep the platform available, secure, and functional, but does not guarantee that it will always be uninterrupted, error-free, compatible with all devices, or accessible in all territories.',
        'FEI may modify, update, suspend, replace, or withdraw features, content, diagnostics, reports, plans, prices, pathways, or services for technical, commercial, pedagogical, legal, operational, or security reasons.',
        'FEI may suspend, restrict, or cancel access if a user or institution breaches these Terms, fails to pay applicable fees, creates security risks, misuses the platform, infringes rights, provides false information, or negatively affects FEI, other users, or third parties.',
      ],
    },
    {
      title: '15. Disclaimers and limitation of liability',
      paragraphs: [
        'FEI provides an educational platform and learning support tools. Although FEI works to provide high-quality content and useful feedback, it does not guarantee that every result, recommendation, level estimate, report, or analysis will be perfect, complete, accurate, or applicable to every situation.',
        'To the extent permitted by law, FEI will not be liable for indirect, incidental, special, consequential, punitive, or derivative damages, including loss of revenue, loss of opportunities, loss of data, business interruption, reputational damage, loss of access, or decisions made based on FEI results or recommendations.',
        'Nothing in these Terms excludes or limits liabilities that cannot legally be excluded.',
      ],
    },
    {
      title: '16. Updates, governing law, and contact',
      paragraphs: [
        'FEI may update these Terms when necessary to reflect legal, technical, commercial, operational, pedagogical, or product changes. Changes will be published on this page with an updated date.',
        'These Terms will be interpreted according to the applicable laws based on the headquarters, operation, or legal entity responsible for FEI, unless mandatory rules provide otherwise.',
        'For questions, comments, or reports related to these Terms, the user may contact FEI at contact@feifootball.com or through official channels available on the platform.',
      ],
    },
  ],
  es: [
    {
      title: '1. Aceptación de estos Términos',
      paragraphs: [
        'Estos Términos de uso regulan el acceso y uso de FEI — Football English Intelligence, incluyendo su sitio web, plataforma, diagnósticos, contenidos de aprendizaje, planes, reportes, servicios institucionales y herramientas digitales relacionadas.',
        'Al crear una cuenta, acceder a la plataforma, completar un diagnóstico, realizar un pago o utilizar servicios de FEI, el usuario confirma que ha leído, entendido y aceptado estos Términos, junto con la Política de privacidad y cualquier otra política aplicable.',
        'Si el usuario no está de acuerdo con estos Términos, no debe acceder, registrarse ni utilizar FEI.',
      ],
    },
    {
      title: '2. Propósito de FEI',
      paragraphs: [
        'FEI es una plataforma educativa especializada en comunicación en inglés para el fútbol. Está diseñada para apoyar a jugadores, entrenadores, scouts, analistas, preparadores físicos, fisioterapeutas, psicólogos deportivos, nutricionistas, directores de academia, clubes, academias, instituciones educativas y otros profesionales vinculados al fútbol.',
        'FEI ofrece diagnósticos, rutas de aprendizaje, contenido por rol, escenarios de comunicación, feedback, recomendaciones y herramientas de progreso con fines educativos y de desarrollo profesional.',
        'FEI no es un proveedor de certificación oficial de idiomas, salvo que un producto, certificado, contrato o acuerdo específico lo indique expresamente.',
      ],
    },
    {
      title: '3. Cuentas y registro',
      paragraphs: [
        'Para acceder a ciertas funciones, el usuario puede necesitar crear una cuenta y proporcionar información precisa, incluyendo nombre, correo electrónico, rol en el fútbol, país, institución cuando corresponda y otra información necesaria para operar o personalizar la experiencia.',
        'El usuario es responsable de mantener la confidencialidad de sus credenciales, conservar la información de su cuenta actualizada y notificar a FEI si sospecha acceso no autorizado o uso indebido.',
        'FEI podrá suspender, restringir o cancelar una cuenta si considera razonablemente que la información proporcionada es falsa, la cuenta está siendo utilizada indebidamente, existe un riesgo de seguridad, no se han cumplido obligaciones de pago o se han incumplido estos Términos.',
      ],
    },
    {
      title: '4. Elegibilidad, menores e instituciones responsables',
      paragraphs: [
        'FEI está dirigida principalmente a usuarios adultos y a instituciones deportivas, educativas o profesionales.',
        'Los menores de edad podrán usar FEI únicamente con autorización de sus padres, representantes legales, club, academia, colegio, institución educativa o entidad responsable, según corresponda.',
        'Cuando una institución crea, administra o asigna accesos a menores u otros usuarios, dicha institución es responsable de obtener los consentimientos necesarios, gestionar correctamente el acceso, informar a sus usuarios sobre FEI y asegurar que cumplan estos Términos.',
      ],
    },
    {
      title: '5. Acceso institucional',
      paragraphs: [
        'FEI podrá ofrecer cuentas, licencias, planes, reportes, paneles o servicios de implementación para clubes, academias, colegios, universidades, federaciones, empresas, programas deportivos u otras instituciones.',
        'Los usuarios institucionales son responsables de administrar las cuentas asignadas, pagar las tarifas aplicables, utilizar reportes y resultados de forma responsable, proteger los datos de los usuarios y notificar a FEI cuando una cuenta deba modificarse, suspenderse o eliminarse.',
        'Las condiciones institucionales específicas podrán establecerse en propuestas, contratos, órdenes de compra, acuerdos de servicio u otros documentos separados. En caso de conflicto entre estos Términos y un acuerdo institucional firmado, prevalecerá el acuerdo institucional cuando corresponda.',
      ],
    },
    {
      title: '6. Planes, pagos, renovaciones y reembolsos',
      paragraphs: [
        'FEI podrá ofrecer acceso gratuito, planes pagados, suscripciones mensuales o anuales, planes institucionales, compras individuales, pruebas gratuitas, promociones, becas u otros modelos comerciales.',
        'Los precios, funciones, duración del acceso, límites de uso, condiciones de renovación y beneficios incluidos se mostrarán en la plataforma o serán comunicados por FEI antes de la compra.',
        'Los pagos podrán ser procesados por proveedores externos. FEI no almacena directamente datos completos de tarjetas de crédito o débito, salvo que se indique expresamente lo contrario y siempre conforme a la ley aplicable.',
        'Si un plan se renueva automáticamente, el usuario o la institución es responsable de cancelar antes de la fecha de renovación si no desea continuar.',
        'Salvo que la ley aplicable exija lo contrario, los pagos podrán no ser reembolsables una vez que el usuario haya accedido a contenido, completado diagnósticos, recibido acceso a la plataforma o utilizado una parte sustancial del servicio. FEI podrá revisar solicitudes excepcionales de reembolso caso por caso.',
      ],
    },
    {
      title: '7. Licencia y uso permitido',
      paragraphs: [
        'Mientras la cuenta esté activa y el usuario cumpla estos Términos, FEI otorga una licencia limitada, personal, no exclusiva, no transferible y revocable para acceder y usar la plataforma según el plan contratado.',
        'El usuario podrá utilizar FEI con fines legales, educativos, profesionales, institucionales o de aprendizaje, incluyendo completar diagnósticos, acceder a resultados, estudiar módulos, recibir feedback, seguir su progreso y utilizar reportes o recursos autorizados.',
        'Esta licencia no transfiere propiedad sobre contenidos, software, metodología, diagnósticos, preguntas, reportes, identidad visual ni propiedad intelectual de FEI.',
      ],
    },
    {
      title: '8. Uso prohibido',
      paragraphs: [
        'El usuario no podrá usar FEI para violar leyes, infringir derechos de terceros, compartir cuentas con personas no autorizadas, copiar o revender contenido, evadir controles de pago o seguridad, manipular diagnósticos, usar bots o scrapers, cargar código dañino, acceder a sistemas sin autorización, suplantar a terceros o utilizar la plataforma de forma abusiva, fraudulenta, discriminatoria, ofensiva o ilegal.',
        'El usuario no podrá reproducir, publicar, distribuir, extraer, vender, sublicenciar, adaptar o utilizar materiales de FEI para desarrollar productos competidores o entrenar sistemas externos de inteligencia artificial sin autorización previa y por escrito.',
        'FEI podrá investigar, restringir, suspender o cancelar cuentas que incumplan estas reglas o generen riesgos para FEI, otros usuarios, instituciones o terceros.',
      ],
    },
    {
      title: '9. Diagnósticos, resultados y recomendaciones',
      paragraphs: [
        'Los diagnósticos FEI están diseñados para ofrecer orientación educativa sobre habilidades de comunicación en inglés aplicadas a roles y contextos profesionales del fútbol.',
        'Los resultados pueden incluir puntajes, niveles estimados, fortalezas, áreas de mejora, recomendaciones, rutas sugeridas, reportes o insights educativos.',
        'Los resultados de FEI no deben interpretarse como certificación oficial de idioma, garantía de desempeño profesional, decisión de contratación o selección, evaluación médica o psicológica, ni promesa de oportunidades laborales, deportivas, académicas o institucionales.',
        'Los usuarios, clubes, academias e instituciones son responsables de interpretar y aplicar los resultados de forma adecuada y en contexto.',
      ],
    },
    {
      title: '10. Funciones asistidas por tecnología e IA',
      paragraphs: [
        'FEI podrá utilizar sistemas automatizados, análisis de datos, modelos de lenguaje, inteligencia artificial u otras tecnologías para apoyar diagnósticos, feedback, clasificación de nivel, recomendaciones, personalización de contenido, reportes y mejora de la plataforma.',
        'Aunque FEI busca que estas herramientas sean útiles, seguras y precisas, los sistemas automatizados pueden contener limitaciones, errores, sesgos o interpretaciones imperfectas.',
        'Los resultados asistidos por tecnología o generados con IA no reemplazan el criterio humano profesional, pedagógico, institucional, deportivo, médico, psicológico o legal.',
      ],
    },
    {
      title: '11. Contenido enviado por usuarios',
      paragraphs: [
        'FEI podrá permitir que los usuarios envíen respuestas escritas, respuestas orales, grabaciones de voz, ejercicios, tareas, comentarios, información de perfil, archivos u otro contenido.',
        'El usuario conserva los derechos que pueda tener sobre el contenido que envía. Al enviar contenido, el usuario otorga a FEI los derechos limitados necesarios para almacenar, procesar, analizar, reproducir técnicamente y utilizar dicho contenido con el fin de operar la plataforma, entregar diagnósticos, generar feedback, personalizar el aprendizaje, brindar soporte, mejorar servicios y cumplir obligaciones legales o contractuales.',
        'El usuario confirma que el contenido enviado es legal, no infringe derechos de terceros, no contiene código dañino y no incluye material ofensivo, discriminatorio, difamatorio, falso, abusivo o ilegal.',
      ],
    },
    {
      title: '12. Propiedad intelectual',
      paragraphs: [
        'FEI, incluyendo su nombre, marca, logo, identidad visual, diseño, interfaz, textos, diagnósticos, preguntas, respuestas modelo, contenidos educativos, metodología, rutas de aprendizaje, estructura de niveles, reportes, software, código, bases de datos, documentación y materiales, pertenece a FEI o a sus licenciantes.',
        'El usuario no podrá utilizar marcas, nombres, logos, diseños, contenidos, diagnósticos o materiales de FEI sin autorización previa y por escrito, salvo para referencias legales, descriptivas y de buena fe.',
        'FEI podrá adoptar medidas técnicas, contractuales o legales para proteger sus derechos de propiedad intelectual.',
      ],
    },
    {
      title: '13. Privacidad, datos y servicios de terceros',
      paragraphs: [
        'El tratamiento de datos personales se rige por la Política de privacidad de FEI.',
        'Al utilizar FEI, el usuario entiende que FEI podrá tratar datos personales para creación de cuentas, autenticación, diagnósticos, resultados, personalización del aprendizaje, pagos, soporte, seguridad, comunicaciones, mejora de la plataforma y cumplimiento legal o contractual.',
        'FEI podrá integrarse con proveedores externos para hosting, autenticación, pagos, analítica, correo electrónico, almacenamiento, soporte, inteligencia artificial u otros servicios tecnológicos. Estos proveedores pueden tener sus propios términos y políticas de privacidad.',
        'Las cookies y tecnologías similares podrán utilizarse según lo descrito en la Política de privacidad o en cualquier Política de cookies aplicable.',
      ],
    },
    {
      title: '14. Disponibilidad, cambios y suspensión',
      paragraphs: [
        'FEI busca mantener la plataforma disponible, segura y funcional, pero no garantiza que siempre esté libre de interrupciones, errores, que sea compatible con todos los dispositivos o accesible en todos los territorios.',
        'FEI podrá modificar, actualizar, suspender, reemplazar o retirar funciones, contenidos, diagnósticos, reportes, planes, precios, rutas o servicios por razones técnicas, comerciales, pedagógicas, legales, operativas o de seguridad.',
        'FEI podrá suspender, restringir o cancelar el acceso si un usuario o institución incumple estos Términos, no paga tarifas aplicables, genera riesgos de seguridad, usa indebidamente la plataforma, infringe derechos, proporciona información falsa o afecta negativamente a FEI, otros usuarios o terceros.',
      ],
    },
    {
      title: '15. Exclusiones y limitación de responsabilidad',
      paragraphs: [
        'FEI proporciona una plataforma educativa y herramientas de apoyo al aprendizaje. Aunque trabaja para ofrecer contenido de calidad y feedback útil, no garantiza que cada resultado, recomendación, estimación de nivel, reporte o análisis sea perfecto, completo, exacto o aplicable a toda situación.',
        'En la medida permitida por la ley, FEI no será responsable por daños indirectos, incidentales, especiales, consecuentes, punitivos o derivados, incluyendo pérdida de ingresos, oportunidades, datos, interrupción de negocio, daño reputacional, pérdida de acceso o decisiones tomadas con base en resultados o recomendaciones de FEI.',
        'Nada en estos Términos excluye o limita responsabilidades que no puedan excluirse legalmente.',
      ],
    },
    {
      title: '16. Actualizaciones, legislación aplicable y contacto',
      paragraphs: [
        'FEI podrá actualizar estos Términos cuando sea necesario para reflejar cambios legales, técnicos, comerciales, operativos, pedagógicos o de producto. Los cambios se publicarán en esta página con una fecha actualizada.',
        'Estos Términos se interpretarán conforme a las leyes aplicables según la sede, operación o entidad legal responsable de FEI, salvo que una norma obligatoria disponga lo contrario.',
        'Para preguntas, comentarios o reportes relacionados con estos Términos, el usuario puede contactar a FEI en contact@feifootball.com o mediante los canales oficiales disponibles en la plataforma.',
      ],
    },
  ],
}

export default function TermsPage() {
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

              <p className="mt-5 inline-flex rounded-full border border-fei-yellow/35 bg-fei-yellow/[0.08] px-4 py-2 text-sm font-bold text-fei-bg">
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
