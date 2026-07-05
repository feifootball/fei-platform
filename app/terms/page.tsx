'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

const sections = [
  {
    title: 'Introducción',
    paragraphs: [
      'Estos Términos de Servicio, junto con nuestra Política de Privacidad y cualquier otra política o condición aplicable, regulan el acceso y uso de la plataforma FEI — Football English Intelligence, disponible en https://www.feifootball.com y cualquier otro sitio web, aplicación, herramienta digital, servicio, contenido, diagnóstico, plan, producto o plataforma operada por FEI o en su nombre, colectivamente, la “Plataforma”.',
      'FEI es una plataforma educativa especializada en inglés aplicado al fútbol. Su objetivo es apoyar el desarrollo de habilidades de comunicación en inglés para jugadores, entrenadores, scouts, analistas, preparadores físicos, fisioterapeutas, psicólogos deportivos, nutricionistas, directores de academia, clubes, academias, instituciones educativas y otros profesionales vinculados al fútbol.',
      'Al crear una cuenta, acceder a la Plataforma, realizar un pago, completar un diagnóstico, utilizar contenidos educativos o navegar por nuestros servicios, el usuario confirma que ha leído, comprendido y aceptado estos Términos.',
      'Si el usuario no está de acuerdo con estos Términos, no debe acceder, registrarse ni utilizar la Plataforma.',
    ],
  },
  {
    title: '1. Aceptación de los Términos',
    paragraphs: [
      'Al utilizar FEI, el usuario declara que tiene capacidad legal para aceptar estos Términos; que la información que proporciona es verdadera, actual y completa; que utilizará la Plataforma de forma legal, responsable y respetuosa; que acepta cumplir estos Términos, nuestra Política de Privacidad y cualquier política vinculada; que entiende que FEI puede actualizar estos Términos cuando sea necesario; y que es responsable de que cualquier persona que acceda a la Plataforma mediante su cuenta o autorización conozca y respete estos Términos.',
      'Si una persona accede a FEI en nombre de un club, academia, colegio, universidad, federación, empresa, institución o equipo, declara que tiene autorización suficiente para aceptar estos Términos en nombre de dicha entidad.',
    ],
  },
  {
    title: '2. Elegibilidad y menores de edad',
    paragraphs: [
      'La Plataforma está dirigida principalmente a usuarios mayores de edad y a instituciones deportivas, educativas o profesionales.',
      'Los menores de edad podrán utilizar FEI únicamente cuando exista autorización expresa de sus padres, representantes legales, club, academia, escuela, institución educativa o entidad responsable, según corresponda.',
      'Cuando una institución cree, administre o asigne una cuenta a un menor de edad, dicha institución será responsable de obtener los consentimientos necesarios antes de permitir el uso de la Plataforma o el tratamiento de datos personales del menor.',
      'Si FEI descubre que una cuenta pertenece a un menor de edad sin el consentimiento requerido, podrá suspender o eliminar la cuenta y tomar las medidas necesarias conforme a la ley aplicable.',
      'Los menores que utilicen la Plataforma con autorización deberán cumplir estos Términos.',
    ],
  },
  {
    title: '3. Registro de cuenta',
    paragraphs: [
      'Para acceder a ciertas funciones de FEI, el usuario deberá crear una cuenta.',
      'Al registrarse, el usuario acepta proporcionar información precisa, incluyendo, cuando corresponda, nombre, correo electrónico, rol futbolístico, institución, país, nivel, datos de acceso u otra información necesaria para operar y personalizar la experiencia dentro de la Plataforma.',
      'El usuario es responsable de mantener la confidencialidad de su contraseña y credenciales de acceso; no compartir su cuenta con terceros no autorizados; mantener actualizada la información de su cuenta; notificar a FEI si sospecha acceso no autorizado, pérdida de credenciales o uso indebido de su cuenta; y responder por las actividades realizadas desde su cuenta, salvo que exista evidencia clara de acceso no autorizado ajeno a su control.',
      'FEI podrá suspender, restringir o cancelar una cuenta si considera razonablemente que el usuario ha incumplido estos Términos; que la información proporcionada es falsa, incompleta o engañosa; que la cuenta está siendo utilizada indebidamente; que existe un riesgo de seguridad; que se ha producido un uso fraudulento, abusivo o no autorizado; o que la cuenta afecta negativamente a FEI, a otros usuarios o a terceros.',
    ],
  },
  {
    title: '4. Cuentas institucionales',
    paragraphs: [
      'FEI puede ofrecer cuentas, licencias, planes o accesos para clubes, academias, colegios, universidades, federaciones, empresas, programas deportivos u otras instituciones.',
      'Cuando una institución contrata, administra o asigna acceso a sus miembros, estudiantes, jugadores, empleados, entrenadores, staff o colaboradores, dicha institución será responsable de gestionar adecuadamente los accesos; informar a sus usuarios sobre el uso de FEI; obtener los consentimientos necesarios, especialmente cuando existan menores de edad; pagar las tarifas aplicables; garantizar que los usuarios cumplan estos Términos; notificar a FEI cuando una cuenta deba modificarse, suspenderse o eliminarse; y utilizar los datos, reportes o resultados de forma responsable y conforme a la normativa aplicable.',
      'FEI podrá establecer condiciones específicas para cuentas institucionales mediante propuestas comerciales, contratos, órdenes de compra, acuerdos de servicio u otros documentos separados.',
      'En caso de conflicto entre estos Términos y un contrato institucional firmado, prevalecerá el contrato institucional en lo que sea aplicable.',
    ],
  },
  {
    title: '5. Planes, pagos y facturación',
    paragraphs: [
      'FEI puede ofrecer planes gratuitos, planes de pago, suscripciones mensuales, suscripciones anuales, accesos institucionales, compras individuales, pruebas gratuitas, promociones, servicios personalizados u otros modelos comerciales.',
      'Los precios, características, límites de uso, duración del acceso, beneficios incluidos, condiciones de renovación y cualquier restricción aplicable se mostrarán en la Plataforma o serán comunicados por FEI antes de la compra.',
      'Al contratar un plan o realizar un pago, el usuario o institución acepta pagar los importes correspondientes, incluidos impuestos, cargos de procesamiento, comisiones u otros costos aplicables.',
      'Los pagos podrán ser procesados por proveedores externos de pago. FEI no almacena directamente la información completa de tarjetas de crédito o débito, salvo que se indique expresamente lo contrario y siempre conforme a la normativa aplicable.',
      'FEI podrá modificar precios, planes, funciones o condiciones comerciales. Cuando un cambio afecte de forma significativa a usuarios o instituciones con suscripción activa, FEI intentará notificarlo con antelación razonable.',
    ],
  },
  {
    title: '6. Renovaciones, cancelaciones y reembolsos',
    paragraphs: [
      'Si un plan funciona como suscripción, podrá renovarse automáticamente según el periodo contratado, salvo que el usuario o institución cancele antes de la fecha de renovación.',
      'El usuario o institución es responsable de cancelar su suscripción dentro del plazo correspondiente si no desea continuar con el servicio.',
      'Salvo que la ley aplicable indique lo contrario, los pagos no serán reembolsables una vez que el usuario haya accedido al contenido, completado diagnósticos, utilizado servicios digitales, recibido acceso al plan contratado o consumido parte sustancial del servicio.',
      'FEI podrá analizar solicitudes excepcionales de reembolso caso por caso, sin que esto implique obligación futura de conceder reembolsos similares.',
      'Las condiciones específicas de cancelación, renovación o reembolso podrán variar según el plan, país, proveedor de pago, contrato institucional o promoción aplicable.',
    ],
  },
  {
    title: '7. Accesos gratuitos, pruebas y promociones',
    paragraphs: [
      'FEI puede ofrecer accesos gratuitos, pruebas, descuentos, códigos promocionales, becas, accesos temporales o beneficios comerciales.',
      'Estos beneficios pueden estar sujetos a condiciones específicas, límites de uso, fechas de vencimiento, restricciones por usuario, institución, país o tipo de cuenta.',
      'FEI podrá modificar, suspender o cancelar promociones en cualquier momento si detecta abuso, uso fraudulento, error técnico, incumplimiento de condiciones o necesidad comercial razonable.',
    ],
  },
  {
    title: '8. Licencia de uso',
    paragraphs: [
      'Mientras la cuenta esté activa y el usuario cumpla estos Términos, FEI concede una licencia limitada, personal, no exclusiva, no transferible, revocable y sujeta al plan contratado para acceder y utilizar la Plataforma.',
      'Esta licencia permite utilizar FEI únicamente para fines educativos, profesionales, institucionales o de aprendizaje autorizados.',
      'Esta licencia no permite copiar, reproducir o extraer contenidos; revender, sublicenciar o transferir accesos; modificar, adaptar o crear trabajos derivados; explotar comercialmente la Plataforma sin autorización; utilizar bots, scrapers, automatizaciones abusivas o métodos no autorizados; acceder a contenidos, datos o funciones fuera de los permisos concedidos; ni utilizar materiales de FEI para entrenar sistemas externos, modelos de inteligencia artificial o productos competidores sin autorización expresa.',
      'FEI se reserva todos los derechos no concedidos expresamente en estos Términos.',
    ],
  },
  {
    title: '9. Propiedad intelectual de FEI',
    paragraphs: [
      'Todos los derechos sobre FEI, incluyendo nombre, marca, logotipo, identidad visual, diseño, interfaz, textos, diagnósticos, preguntas, respuestas modelo, contenidos educativos, metodología, rutas de aprendizaje, estructura de niveles, reportes, gráficos, código, software, bases de datos, documentación y materiales, pertenecen a FEI o a sus licenciantes.',
      'El acceso a la Plataforma no transfiere al usuario ningún derecho de propiedad intelectual sobre FEI ni sobre sus contenidos.',
      'Salvo autorización expresa y por escrito, el usuario no podrá reproducir, copiar o distribuir contenidos de FEI; publicar diagnósticos, preguntas, módulos, rutas o materiales internos; crear productos derivados basados en FEI; vender, sublicenciar o redistribuir recursos de FEI; usar la marca FEI sin permiso; extraer contenido de forma masiva; alterar, eliminar u ocultar avisos de propiedad intelectual; utilizar materiales de FEI para desarrollar productos competidores; ni utilizar materiales de FEI para entrenar sistemas externos o modelos de IA.',
      'FEI podrá tomar medidas técnicas, contractuales o legales para proteger sus derechos de propiedad intelectual.',
    ],
  },
  {
    title: '10. Contenido enviado por el usuario',
    paragraphs: [
      'FEI puede permitir que los usuarios envíen respuestas escritas, respuestas orales, grabaciones de voz, ejercicios, tareas, comentarios, información de perfil, archivos u otro contenido.',
      'El usuario conserva los derechos que le correspondan sobre el contenido que envía.',
      'Al enviar contenido a FEI, el usuario concede a FEI una licencia limitada, no exclusiva, mundial y necesaria para almacenar, procesar, analizar, reproducir técnicamente y utilizar dicho contenido únicamente con el fin de operar la Plataforma; entregar diagnósticos; generar resultados; ofrecer feedback; personalizar la experiencia de aprendizaje; mejorar los servicios; brindar soporte; garantizar seguridad; y cumplir obligaciones legales o contractuales.',
      'El usuario garantiza que el contenido enviado no infringe derechos de terceros; no es ilegal, ofensivo, discriminatorio, difamatorio, falso, dañino o abusivo; no contiene virus, malware ni código perjudicial; no vulnera la privacidad, imagen, reputación o derechos de otra persona; y cumple estos Términos y la normativa aplicable.',
      'FEI podrá eliminar, restringir o revisar contenido enviado por usuarios si considera razonablemente que incumple estos Términos o genera riesgo para FEI, otros usuarios o terceros.',
    ],
  },
  {
    title: '11. Uso permitido',
    paragraphs: [
      'El usuario acepta utilizar FEI únicamente para fines lícitos, educativos, profesionales, institucionales o de aprendizaje.',
      'Está permitido utilizar FEI para mejorar habilidades de comunicación en inglés; completar diagnósticos; acceder a resultados y recomendaciones; estudiar módulos o contenidos educativos; recibir feedback; gestionar progreso individual o institucional; apoyar programas de formación futbolística; descargar reportes cuando el plan lo permita; y utilizar recursos autorizados dentro de la Plataforma.',
    ],
  },
  {
    title: '12. Uso prohibido',
    paragraphs: [
      'El usuario no podrá utilizar FEI para infringir leyes, regulaciones o derechos de terceros; acceder sin autorización a cuentas, sistemas, servidores o datos; copiar, revender, sublicenciar o distribuir contenidos; compartir su cuenta con terceros no autorizados; usar bots, scrapers, automatizaciones abusivas o métodos no autorizados; alterar, dañar, sobrecargar o interferir con la Plataforma; cargar virus, malware, troyanos, gusanos o código dañino; hacerse pasar por otra persona, institución o entidad; proporcionar información falsa, incompleta o engañosa; acosar, amenazar, discriminar, difamar o dañar a otros usuarios; compartir contenido ofensivo, sexual, violento, discriminatorio, ilegal o contrario al propósito educativo de FEI; manipular, intentar manipular o alterar diagnósticos, evaluaciones, resultados o sistemas de medición; utilizar resultados de FEI de forma engañosa o fuera de contexto; intentar eludir controles de acceso, seguridad, pago o autorización; ni utilizar FEI para fines distintos a los permitidos.',
      'FEI podrá investigar, restringir, suspender o cancelar cuentas que incumplan estas reglas.',
    ],
  },
  {
    title: '13. Diagnósticos FEI',
    paragraphs: [
      'Los diagnósticos de FEI están diseñados para ofrecer orientación educativa sobre habilidades de comunicación en inglés aplicadas a contextos futbolísticos específicos.',
      'Los resultados pueden incluir niveles, puntajes, análisis, recomendaciones, fortalezas, áreas de mejora, rutas sugeridas y comentarios de aprendizaje.',
      'Los diagnósticos FEI no deben interpretarse como certificación oficial de idioma; garantía de desempeño profesional; criterio único de contratación, selección o promoción; evaluación médica, psicológica o clínica; sustituto de pruebas certificadas externas; promesa de oportunidades laborales, deportivas, académicas o institucionales; ni garantía de avance profesional o empleabilidad.',
      'FEI no emite certificaciones oficiales de idioma salvo que un producto, certificado, contrato o acuerdo específico lo indique expresamente.',
      'Los resultados tienen fines educativos y orientativos. El usuario, club, academia o institución será responsable de interpretar y aplicar la información de forma adecuada y contextual.',
      'FEI podrá actualizar la estructura, criterios, preguntas, niveles, algoritmos, metodología o presentación de los diagnósticos para mejorar la calidad educativa de la Plataforma.',
    ],
  },
  {
    title: '14. Resultados, recomendaciones e insights',
    paragraphs: [
      'FEI puede generar resultados, reportes, recomendaciones, comentarios personalizados o insights educativos basados en las respuestas del usuario, su rol, nivel, progreso, desempeño o interacciones con la Plataforma.',
      'Estos resultados tienen finalidad educativa y orientativa. No deben considerarse asesoría profesional definitiva ni reemplazo del criterio humano, pedagógico, institucional, deportivo, médico, psicológico o legal.',
      'FEI no garantiza que una recomendación sea perfecta, completa, exacta o aplicable a todas las situaciones personales, profesionales, deportivas o institucionales.',
    ],
  },
  {
    title: '15. Funciones asistidas por tecnología o inteligencia artificial',
    paragraphs: [
      'FEI puede utilizar sistemas automatizados, modelos lingüísticos, análisis de datos, inteligencia artificial u otras tecnologías para apoyar funciones como evaluación de respuestas, generación de feedback, clasificación de nivel, análisis de desempeño comunicativo, recomendaciones de aprendizaje, personalización de contenido, reportes individuales o institucionales y mejora de la experiencia educativa.',
      'Aunque FEI busca que estas herramientas sean útiles, precisas y seguras, los resultados automatizados pueden contener errores, limitaciones, sesgos o interpretaciones imperfectas.',
      'El usuario entiende que las funciones asistidas por tecnología o inteligencia artificial no sustituyen el criterio humano profesional, pedagógico, institucional, deportivo, médico, psicológico o legal.',
      'FEI podrá revisar, mejorar, ajustar, limitar o reemplazar estas herramientas en cualquier momento.',
    ],
  },
  {
    title: '16. Disponibilidad, mantenimiento y cambios en la Plataforma',
    paragraphs: [
      'FEI busca mantener la Plataforma disponible, segura y funcional. Sin embargo, no garantiza que el servicio esté siempre disponible, libre de errores, ininterrumpido, compatible con todos los dispositivos o accesible desde todos los territorios.',
      'FEI podrá realizar mantenimiento, actualizaciones, mejoras, cambios técnicos o ajustes de seguridad en cualquier momento.',
      'FEI también podrá modificar, suspender, sustituir o retirar funciones, contenidos, diagnósticos, planes, precios, rutas de aprendizaje o servicios por razones técnicas, comerciales, pedagógicas, legales, operativas o de seguridad.',
      'Cuando sea razonable, FEI intentará minimizar interrupciones y comunicar cambios relevantes.',
    ],
  },
  {
    title: '17. Servicios y enlaces de terceros',
    paragraphs: [
      'FEI puede integrarse o enlazar con servicios externos, incluyendo proveedores de pago, autenticación, hosting, analítica, correo electrónico, comunicación, video, almacenamiento, soporte u otros servicios tecnológicos.',
      'Estos terceros pueden tener sus propios términos, condiciones y políticas de privacidad.',
      'FEI no controla ni se responsabiliza por servicios externos que no sean operados directamente por FEI, aunque estén integrados o enlazados desde la Plataforma.',
      'El acceso o uso de servicios de terceros será responsabilidad del usuario y estará sujeto a los términos aplicables de dichos terceros.',
    ],
  },
  {
    title: '18. Privacidad y protección de datos',
    paragraphs: [
      'El tratamiento de datos personales se regula en la Política de Privacidad de FEI.',
      'Al usar la Plataforma, el usuario entiende que FEI puede procesar datos personales para fines como creación y gestión de cuentas, autenticación, entrega de servicios, diagnósticos, generación de resultados, personalización de aprendizaje, pagos y facturación, soporte, seguridad, mejora de la Plataforma, comunicaciones relacionadas con el servicio y cumplimiento de obligaciones legales o contractuales.',
      'Cuando corresponda, FEI procesará datos personales conforme a leyes de protección de datos aplicables y principios de transparencia, seguridad, minimización, finalidad y respeto de los derechos del usuario.',
      'El uso de cookies y tecnologías similares se regula en la Política de Privacidad y, cuando corresponda, en la Política de Cookies de FEI.',
    ],
  },
  {
    title: '19. Suspensión y cancelación de acceso',
    paragraphs: [
      'FEI podrá suspender, restringir o cancelar el acceso de un usuario o institución si incumple estos Términos; no paga tarifas aplicables; utiliza la Plataforma indebidamente; genera riesgos de seguridad; infringe derechos de FEI o de terceros; proporciona información falsa o engañosa; utiliza FEI de forma abusiva, fraudulenta o ilegal; o afecta negativamente la experiencia, seguridad o funcionamiento de la Plataforma.',
      'El usuario puede dejar de usar FEI o solicitar la eliminación de su cuenta, sujeto a obligaciones legales, contables, contractuales, fiscales o de seguridad que puedan requerir conservar cierta información durante un periodo determinado.',
      'Tras la cancelación, el acceso a contenidos, resultados, reportes, diagnósticos o servicios podrá finalizar, salvo que FEI indique lo contrario o exista obligación legal o contractual aplicable.',
    ],
  },
  {
    title: '20. Exclusiones y advertencias',
    paragraphs: [
      'FEI proporciona una plataforma educativa y herramientas de apoyo al aprendizaje.',
      'Aunque FEI trabaja para ofrecer contenido de alta calidad, no garantiza que los resultados sean exactos en todos los casos; que el usuario alcance un nivel específico; que el usuario obtenga oportunidades laborales, deportivas, académicas o institucionales; que la Plataforma esté disponible sin interrupciones; que todo contenido esté libre de errores; que las recomendaciones sean aplicables a todas las circunstancias; ni que los diagnósticos reflejen de forma completa todas las habilidades lingüísticas, profesionales o personales del usuario.',
      'El uso de FEI y la interpretación de resultados, reportes o recomendaciones son responsabilidad del usuario, club, academia o institución correspondiente.',
    ],
  },
  {
    title: '21. Limitación de responsabilidad',
    paragraphs: [
      'En la medida permitida por la ley, FEI no será responsable por daños indirectos, incidentales, especiales, consecuentes, punitivos o derivados, incluyendo pérdida de ingresos, pérdida de oportunidades, pérdida de datos, interrupción de negocio, daño reputacional, pérdida de acceso, decisiones tomadas con base en resultados o recomendaciones, o uso inadecuado de la Plataforma.',
      'FEI tampoco será responsable por pérdidas o daños derivados de imposibilidad de usar la Plataforma; interrupciones, errores o fallos técnicos; acceso no autorizado causado por negligencia del usuario; servicios de terceros; contenido enviado por usuarios; o decisiones deportivas, académicas, laborales o institucionales tomadas con base en información de FEI.',
      'Nada en estos Términos excluye o limita responsabilidades que no puedan excluirse legalmente.',
    ],
  },
  {
    title: '22. Indemnización',
    paragraphs: [
      'El usuario acepta mantener indemne a FEI frente a reclamaciones, daños, responsabilidades, pérdidas, costos o gastos derivados de uso indebido de la Plataforma; incumplimiento de estos Términos; contenido enviado por el usuario; infracción de derechos de terceros; violación de leyes aplicables; o uso no autorizado de cuentas, materiales, resultados o servicios FEI.',
    ],
  },
  {
    title: '23. Marcas comerciales',
    paragraphs: [
      '“FEI”, “Football English Intelligence”, sus logotipos, nombres comerciales, diseños, mensajes de marca y demás identificadores son propiedad de FEI o de sus titulares correspondientes.',
      'El usuario no podrá utilizar marcas, nombres, logotipos, diseños o elementos de identidad de FEI sin autorización previa y por escrito, excepto para referencias lícitas, descriptivas y de buena fe.',
    ],
  },
  {
    title: '24. Cambios en estos Términos',
    paragraphs: [
      'FEI puede revisar y actualizar estos Términos cuando sea necesario para reflejar cambios legales, técnicos, comerciales, operativos, pedagógicos o de producto.',
      'Los cambios se publicarán en esta página con una nueva fecha de actualización.',
      'Cuando los cambios sean importantes, FEI podrá intentar notificar a los usuarios por correo electrónico, dentro de la Plataforma o mediante otro medio razonable.',
      'El uso continuado de FEI después de la publicación de los cambios implica la aceptación de los Términos actualizados.',
    ],
  },
  {
    title: '25. Legislación aplicable',
    paragraphs: [
      'Estos Términos se interpretarán conforme a las leyes aplicables según la sede, operación o entidad legal responsable de FEI, salvo que una normativa obligatoria establezca lo contrario.',
      'Cuando FEI establezca una entidad legal formal, domicilio jurídico o jurisdicción específica, esta sección podrá actualizarse para reflejar la ley aplicable y los tribunales competentes.',
    ],
  },
  {
    title: '26. Contacto',
    paragraphs: [
      'Para preguntas, comentarios o reportes relacionados con estos Términos, el usuario puede contactar a FEI a través de contact@feifootball.com o mediante los canales oficiales disponibles en la Plataforma.',
      'Si FEI habilita correos específicos para privacidad, ventas, soporte o cuentas institucionales, dichos canales podrán indicarse en la Plataforma o en las políticas correspondientes.',
    ],
  },
  {
    title: '27. Nota final',
    paragraphs: [
      'Estos Términos describen el funcionamiento previsto de FEI y buscan proteger adecuadamente a la Plataforma, sus usuarios, instituciones, contenidos y servicios.',
      'Antes de un lanzamiento comercial a gran escala, FEI podrá revisar estos documentos con asesoría legal especializada, especialmente en materia de pagos, protección de datos, menores de edad, jurisdicción, inteligencia artificial y servicios internacionales.',
      'Gracias por usar FEI — Football English Intelligence.',
    ],
  },
]

type Lang = 'en' | 'es'

const pageCopy = {
  en: {
    legal: 'Legal',
    title: 'Terms of Service',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'Terms governing access, registration, platform use, plans, payments, diagnostics, educational content, and institutional services provided by FEI.',
    updated: 'Last updated: July 2026',
    back: 'Back to Home',
    contactPrefix: 'For questions about these terms, contact',
  },
  es: {
    legal: 'Legal',
    title: 'Términos de Servicio',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'Términos que regulan el acceso, registro, uso de la plataforma, planes, pagos, diagnósticos, contenidos educativos y servicios institucionales de FEI.',
    updated: 'Última actualización: Julio 2026',
    back: 'Volver a inicio',
    contactPrefix: 'Para preguntas sobre estos términos, escribe a',
  },
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

  return (
    <main className="min-h-screen bg-fei-bg text-fei-text">
      <Navbar hideSectionLinks />

      <section className="border-b border-fei-text/10 px-6 py-10 sm:py-12 lg:py-14">
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
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-fei-sky">
              {t.legal}
            </p>

            <h1 className="text-4xl font-black tracking-tight text-fei-text sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>

            <p className="mt-4 text-lg font-semibold text-fei-text/75 sm:text-xl">
              {t.subtitle}
            </p>

            <p className="mt-6 max-w-3xl text-base leading-8 text-fei-text/60">
              {t.description}
            </p>

            <p className="mt-6 text-sm font-semibold text-fei-yellow">
              {t.updated}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl space-y-12">
            {sections.map(section => (
              <section
                key={section.title}
                id={section.title.toLowerCase().replaceAll(' ', '-').replaceAll('.', '')}
                className="border-b border-fei-text/10 pb-10 last:border-b-0 last:pb-0"
              >
                <h2 className="mb-5 text-2xl font-bold tracking-tight text-fei-text sm:text-3xl">
                  {section.title}
                </h2>

                <div className="space-y-4">
                  {section.paragraphs.map(paragraph => (
                    <p
                      key={paragraph}
                      className="max-w-5xl text-sm leading-7 text-fei-text/65 sm:text-base sm:leading-8"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 max-w-5xl border-t border-fei-text/10 pt-8 text-sm leading-7 text-fei-text/60">
            <p>
              {t.contactPrefix}{' '}
              <a href="mailto:contact@feifootball.com" className="font-semibold text-fei-sky hover:underline">
                contact@feifootball.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}



