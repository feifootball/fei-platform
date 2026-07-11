'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

type Lang = 'en' | 'es'

const pageCopy = {
  en: {
    legal: 'Legal',
    title: 'Privacy Policy',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'This policy explains how FEI collects, uses, stores, protects, and manages personal data across accounts, diagnostics, payments, institutional services, cookies, and learning features.',
    updated: 'Last updated: July 2026',
    back: 'Back to Home',
    contactPrefix: 'For privacy questions, contact',
  },
  es: {
    legal: 'Legal',
    title: 'Política de Privacidad',
    subtitle: 'FEI — Football English Intelligence',
    description:
      'Esta política explica cómo FEI recopila, utiliza, almacena, protege y gestiona datos personales en cuentas, diagnósticos, pagos, servicios institucionales, cookies y funciones de aprendizaje.',
    updated: 'Última actualización: Julio 2026',
    back: 'Volver a inicio',
    contactPrefix: 'Para preguntas sobre privacidad, escribe a',
  },
}

const sectionsByLang = {
  en: [
    {
      title: 'Introduction',
      paragraphs: [
        'This Privacy Policy explains how FEI — Football English Intelligence collects, uses, stores, protects, and, where applicable, shares personal information related to the use of the FEI platform, available at https://www.feifootball.com and any other website, application, digital tool, diagnostic, content, service, plan, product, or platform operated by FEI or on its behalf, collectively referred to as the “Platform”.',
        'FEI is an educational platform specialized in English for football. Its purpose is to support the development of English communication skills for players, coaches, scouts, analysts, fitness coaches, physiotherapists, sports psychologists, nutritionists, academy directors, clubs, academies, educational institutions, and other professionals connected to football.',
        'This Privacy Policy works together with our Terms of Service and any other applicable policy.',
        'By creating an account, using the Platform, completing diagnostics, accessing content, making payments, or interacting with FEI, the user understands that their personal data may be processed in accordance with this Policy.',
        'FEI does not sell personal data to third parties.',
      ],
    },
    {
      title: '1. Scope of this Policy',
      paragraphs: [
        'This Policy applies to personal data processed by FEI when the user visits the FEI website; creates an account; logs into the Platform; completes diagnostics; submits written or oral exercises; uploads information, responses, files, or recordings; accesses educational content; makes payments or purchases plans; uses institutional features; requests support; interacts with FEI communications; or participates in trials, promotions, programs, or services related to the Platform.',
        'This Policy also applies, where relevant, to users connected to clubs, academies, schools, universities, federations, companies, sports programs, or other institutions that use FEI.',
      ],
    },
    {
      title: '2. Information we collect',
      paragraphs: [
        'FEI may collect different types of information depending on how the user uses the Platform.',
        'Account information may include full name, email address, access credentials securely managed by our authentication provider, preferred language, football or professional role, associated institution, club, academy, or entity where applicable, country or approximate location, account preferences, account creation date, account status, and information necessary for authentication, security, and support.',
        'Profile and personalization information may include the user’s role or professional area within football, level or learning pathway, educational interests, communication goals, language preferences, progress within the Platform, and history of modules, diagnostics, or activities completed.',
        'Diagnostic, progress, and response information may include written responses, oral responses, voice recordings where applicable, diagnostic results, scores, estimated levels, strengths and areas for improvement, generated recommendations, individual or institutional reports, time spent on activities, completed modules, progress history, and interactions with exercises, content, or learning tools.',
        'Institutional information may include the name of the institution, account administrator or responsible contact, users assigned to the institution, number of licenses or accesses, user roles within the institution, aggregated or individual reports depending on the contracted plan, group or user progress, institutional billing information, commercial or support communications, and information necessary to manage contracts, access, renewals, or institutional services.',
        'Payment and billing information may include the contracted plan, transaction history, payment status, subscription, renewal, or cancellation dates, billing information, tax or commercial information, and payment identifiers provided by the payment provider. Full credit or debit card details are processed by external payment providers. FEI does not directly store full card information unless expressly stated otherwise and always in accordance with applicable law.',
        'Technical, usage, and device information may include visited pages, features used, session duration, actions performed within the Platform, date and time of access, device type, operating system, browser, IP address, approximate location based on IP, session identifiers, technical logs, errors, security events, and information related to performance, stability, and use of the Platform.',
        'Communication and support information may include emails, form submissions, support requests, feedback, comments, survey responses, and information necessary to answer questions, resolve issues, or improve the service.',
      ],
    },
    {
      title: '3. How we use data',
      paragraphs: [
        'FEI uses personal data to operate, maintain, protect, and improve the Platform.',
        'We may use information to create and manage accounts, authenticate users, allow access to diagnostics and content, generate results, reports, and recommendations, personalize learning pathways, save progress, enable institutional features, process payments, plans, and subscriptions, and provide technical or administrative support.',
        'FEI may use data to personalize the educational experience by adapting content to the user’s role, recommending modules, activities, or pathways, adjusting diagnostics or feedback to the user’s level, showing progress, generating educational insights, and improving relevance within FEI.',
        'FEI may use data to improve the Platform by analyzing usage trends, identifying errors or areas for improvement, developing new features, optimizing performance, improving diagnostics, scenarios, and content, evaluating the effectiveness of learning pathways, and improving security, stability, and user experience.',
        'FEI may use contact information to send account-related information, confirm registrations, payments, or important changes, respond to inquiries, send security notices, notify changes to the Platform, communicate relevant service updates, and send educational, commercial, or promotional information where appropriate and in accordance with applicable law.',
        'FEI may use data for security, fraud prevention, and compliance, including detecting unauthorized access, preventing fraud, protecting accounts, investigating misuse, enforcing the Terms of Service, resolving disputes, and complying with legal, tax, accounting, regulatory, or contractual obligations.',
      ],
    },
    {
      title: '4. Legal basis for processing',
      paragraphs: [
        'Where applicable law requires a legal basis for processing personal data, FEI may process data on one or more of the following bases.',
        'Performance of a contract or service: to create accounts, deliver diagnostics, process payments, provide access to content, and operate the Platform.',
        'Consent: when the user accepts certain features, communications, non-essential cookies, specific data processing, or voluntary information submission.',
        'Legal obligations: to comply with tax, accounting, regulatory, judicial, or data protection requirements.',
        'Legitimate interests of FEI: to improve the Platform, protect security, prevent fraud, analyze usage, develop services, and maintain necessary communications, while respecting user rights.',
        'Protection of rights and security: to investigate misuse, protect the Platform, respond to claims, or prevent harm to FEI, users, or third parties.',
      ],
    },
    {
      title: '5. Technology, artificial intelligence, and automated analysis',
      paragraphs: [
        'FEI may use automated systems, data analysis, language models, artificial intelligence, or other technologies to support functions such as response evaluation, communication performance analysis, feedback generation, level classification, learning recommendations, content personalization, report creation, progress pattern detection, and improvement of diagnostics and educational materials.',
        'These processes are used for educational, operational, and service improvement purposes.',
        'Although FEI aims for these technologies to be useful, safe, and accurate, automated systems may have limitations, errors, biases, or imperfect interpretations.',
        'Results generated by technology or artificial intelligence do not replace human professional, pedagogical, institutional, sporting, medical, psychological, or legal judgment.',
        'Where applicable, the user may request additional information about the use of their data in automated processes or exercise applicable rights under this Policy and current law.',
      ],
    },
    {
      title: '6. Cookies and similar technologies',
      paragraphs: [
        'FEI may use cookies, local storage, pixels, session identifiers, and similar technologies to operate and improve the Platform.',
        'Cookies are small files or technologies that make it possible to remember information about the user’s device, browser, session, or preferences.',
        'Essential cookies are necessary for the Platform to function correctly. They may be used to maintain logged-in sessions, authenticate users, protect security, remember necessary actions, prevent fraud, and enable basic navigation functions.',
        'Preference cookies allow FEI to remember choices such as preferred language, interface preferences, experience settings, and selected options within the Platform.',
        'Analytics and performance cookies help FEI understand how the Platform is used, measure performance, detect errors, identify aggregate trends, and improve speed, stability, and content.',
        'Marketing or communication cookies may be used for marketing, campaign measurement, or communication purposes only where appropriate and in accordance with applicable law.',
        'The user may control or block cookies through browser settings. However, if essential cookies are disabled, some FEI features may not work properly.',
        'FEI may provide cookie management tools within the Platform to accept, reject, or configure certain categories of cookies where applicable. The use of cookies and similar technologies may also be detailed in a specific Cookie Policy.',
      ],
    },
    {
      title: '7. External providers',
      paragraphs: [
        'FEI may use external providers to operate, host, protect, process payments, analyze, communicate, or improve the Platform.',
        'These providers may include services for web hosting, databases, authentication, payment processing, email, analytics, security, support, storage, technological infrastructure, communication tools, artificial intelligence, or data analysis.',
        'FEI aims to work with providers that offer reasonable security, confidentiality, and data protection measures.',
        'External providers should process personal data only according to instructions, contracts, policies, or purposes compatible with the services provided to FEI, unless they act as independent controllers under their own terms and policies.',
        'FEI does not control external services that are not directly operated by FEI, even if they are linked to or integrated with the Platform.',
      ],
    },
    {
      title: '8. International transfers',
      paragraphs: [
        'Personal data may be stored, processed, or transferred in countries other than the user’s country of residence, including countries where FEI, its technology providers, payment providers, or infrastructure services operate.',
        'When data is transferred internationally, FEI will seek to apply reasonable measures to protect information, such as using providers with appropriate security standards, data processing agreements where applicable, technical protection measures, encryption in transit where applicable, access controls, and compliance with applicable data protection laws.',
        'By using FEI, the user understands that their data may be processed outside their country of residence in accordance with this Policy.',
      ],
    },
    {
      title: '9. Information security',
      paragraphs: [
        'FEI implements reasonable technical, organizational, and administrative measures to protect personal data against unauthorized access, loss, alteration, improper disclosure, or destruction.',
        'These measures may include encryption in transit through secure protocols, access controls, authentication, secure credential management, suspicious activity monitoring, internal access restrictions, use of reliable technology providers, backup or continuity mechanisms where applicable, and progressive review and improvement of security practices.',
        'However, no digital system is completely secure. FEI cannot guarantee that the Platform will be free from risks, unauthorized access, technical failures, or security incidents.',
        'The user is also responsible for protecting their account, using secure passwords, not sharing credentials, and notifying FEI if they suspect unauthorized use.',
      ],
    },
    {
      title: '10. Data retention',
      paragraphs: [
        'FEI will retain personal data for as long as necessary to fulfill the purposes described in this Policy, operate the Platform, provide services, comply with legal or contractual obligations, resolve disputes, protect security, and maintain necessary records.',
        'Account data is retained while the account is active or while necessary to operate the service. If the user requests account deletion, FEI will delete or anonymize data within a reasonable period, unless a legal, contractual, tax, accounting, security, or dispute resolution obligation requires retaining certain information.',
        'Diagnostic, progress, and learning data is retained while necessary to provide the service, show progress, generate recommendations, maintain reports, support institutional features, or improve the educational experience.',
        'After account deletion, FEI may delete, anonymize, or retain certain data where necessary for legal obligations, security, fraud prevention, investigation of misuse, authorized institutional reports, or aggregated Platform improvement.',
        'Technical logs, security logs, and usage data may be retained for reasonable periods for performance analysis, security, fraud prevention, error resolution, and legal compliance.',
        'Payment, billing, transaction, tax, or contract data may be retained for the period required by applicable tax, accounting, contractual, or regulatory laws.',
        'Communications with FEI may be retained as long as necessary to respond to requests, resolve issues, maintain support records, comply with legal obligations, or improve the service.',
      ],
    },
    {
      title: '11. User rights',
      paragraphs: [
        'Depending on applicable law, the user may have rights over their personal data, including access, rectification, deletion, portability, restriction, objection, withdrawal of consent, and rights related to automated decisions.',
        'The right of access allows the user to request information about the personal data FEI processes about them.',
        'The right of rectification allows the user to request correction of inaccurate, incomplete, or outdated personal data.',
        'The right of deletion allows the user to request deletion of personal data, subject to legal, contractual, tax, accounting, security, or dispute resolution exceptions.',
        'The right of portability may allow the user to request certain personal data in a structured, commonly used, machine-readable format where applicable.',
        'The right of restriction allows the user to request that data processing be limited in certain circumstances.',
        'The right of objection allows the user to object to certain processing activities, including, where applicable, direct marketing, legitimate interests, or certain automated processes.',
        'When FEI processes data based on consent, the user may withdraw consent at any time, without affecting the lawfulness of processing carried out before withdrawal.',
        'Where applicable law allows it, the user may request additional information or human intervention regarding certain automated processing that produces significant effects.',
        'To exercise privacy rights, the user may contact FEI at contact@feifootball.com. The request should include the email associated with the account, full name, the right the user wishes to exercise, and enough detail to identify the request. FEI may request additional information to verify the user’s identity before responding. FEI will respond within a reasonable period and in accordance with applicable law.',
      ],
    },
    {
      title: '12. Minors',
      paragraphs: [
        'FEI is primarily intended for adult users and sports, educational, or professional institutions.',
        'Minors may use FEI only with authorization from their parents, legal guardians, club, academy, school, educational institution, or responsible entity, as applicable.',
        'When an institution creates, manages, or assigns an account to a minor, that institution is responsible for obtaining the necessary consents for the use of FEI and the processing of the minor’s personal data.',
        'Parents, legal guardians, or responsible institutions may exercise privacy rights on behalf of the minor in accordance with applicable law.',
        'If FEI detects that it has collected data from a minor without the required consent, it may suspend or delete the account and take reasonable measures to delete or limit processing of that data, unless a legal or security obligation requires retaining it.',
      ],
    },
    {
      title: '13. Communications',
      paragraphs: [
        'FEI may send communications related to account creation or management, security, important changes to the Platform, payments, subscriptions, billing, support, educational progress or activity, service updates, new content, products or features, and commercial or promotional communications where applicable.',
        'The user may unsubscribe from or manage certain promotional communications where FEI provides that option.',
        'Some communications are necessary to operate the Platform and cannot be disabled while the account is active, such as security notices, account confirmations, payment information, or important service changes.',
      ],
    },
    {
      title: '14. Third-party services and external links',
      paragraphs: [
        'The Platform may contain links or integrations with third-party services, such as payment providers, authentication providers, social networks, analytics tools, hosting services, storage, communication, or support tools.',
        'These third parties may collect or process data according to their own privacy policies and terms of service.',
        'FEI does not control and is not responsible for the privacy practices of external websites, services, or platforms that are not directly operated by FEI.',
        'The user should review the privacy policies of third parties before using external services linked to or integrated with the Platform.',
      ],
    },
    {
      title: '15. Aggregated and anonymized data',
      paragraphs: [
        'FEI may use aggregated, statistical, or anonymized information to analyze usage trends, improve diagnostics, develop new content, evaluate Platform performance, create internal reports, improve institutional services, research educational patterns, and optimize the learning experience.',
        'When data has been reasonably anonymized so that it does not directly identify the user, it may be used for analysis, research, product improvement, or commercial development in accordance with applicable law.',
      ],
    },
    {
      title: '16. Changes to this Policy',
      paragraphs: [
        'FEI may update this Privacy Policy when necessary to reflect legal, technical, commercial, operational, product, or data protection changes.',
        'Changes will be published on this page with a new update date.',
        'When changes are significant, FEI may attempt to notify users by email, within the Platform, or through another reasonable channel.',
        'Continued use of FEI after publication of changes means the user understands the updated Policy.',
      ],
    },
    {
      title: '17. Contact',
      paragraphs: [
        'For questions about privacy, data requests, account deletion, exercising rights, or reports related to data protection, the user may contact FEI at contact@feifootball.com.',
        'If FEI enables specific emails for privacy, support, sales, or institutional accounts, those channels may be indicated on the Platform or in the relevant policies.',
      ],
    },
    {
      title: '18. Additional information for users in the European Union or United Kingdom',
      paragraphs: [
        'If the user is located in the European Union, the European Economic Area, or the United Kingdom, they may have additional rights under applicable data protection laws, including the General Data Protection Regulation where applicable.',
        'These rights may include access, rectification, deletion, restriction, objection, portability, withdrawal of consent, and the right to lodge complaints with a competent data protection authority.',
        'FEI will seek to handle requests from users in those jurisdictions in accordance with applicable regulations.',
      ],
    },
    {
      title: '19. Final note',
      paragraphs: [
        'FEI processes personal data with the aim of operating a secure, useful, and specialized educational platform for English communication in football.',
        'This Policy seeks to clearly explain how FEI collects, uses, protects, and manages personal information in the context of its educational services, diagnostics, payments, institutional accounts, and technology features.',
        'Before a large-scale commercial launch, FEI may review this Policy with specialized legal counsel, especially regarding data protection, payments, minors, international transfers, artificial intelligence, and institutional services.',
        'Thank you for trusting FEI — Football English Intelligence.',
      ],
    },
  ],
  es: [
    {
      title: 'Introducción',
      paragraphs: [
        'Esta Política de Privacidad explica cómo FEI — Football English Intelligence recopila, utiliza, almacena, protege y, cuando corresponde, comparte información personal relacionada con el uso de la plataforma FEI, disponible en https://www.feifootball.com y cualquier otro sitio web, aplicación, herramienta digital, diagnóstico, contenido, servicio, plan, producto o plataforma operada por FEI o en su nombre, colectivamente, la “Plataforma”.',
        'FEI es una plataforma educativa especializada en inglés aplicado al fútbol. Su objetivo es apoyar el desarrollo de habilidades de comunicación en inglés para jugadores, entrenadores, scouts, analistas, preparadores físicos, fisioterapeutas, psicólogos deportivos, nutricionistas, directores de academia, clubes, academias, instituciones educativas y otros profesionales vinculados al fútbol.',
        'Esta Política de Privacidad trabaja conjuntamente con nuestros Términos de Servicio y cualquier otra política aplicable.',
        'Al crear una cuenta, utilizar la Plataforma, completar diagnósticos, acceder a contenidos, realizar pagos o interactuar con FEI, el usuario entiende que sus datos personales podrán ser tratados conforme a esta Política.',
        'FEI no vende datos personales a terceros.',
      ],
    },
    {
      title: '1. Alcance de esta Política',
      paragraphs: [
        'Esta Política aplica a los datos personales tratados por FEI cuando el usuario visita el sitio web de FEI; crea una cuenta; inicia sesión en la Plataforma; completa diagnósticos; responde ejercicios escritos u orales; carga información, respuestas, archivos o grabaciones; accede a contenidos educativos; realiza pagos o contrata planes; utiliza funciones institucionales; solicita soporte; interactúa con comunicaciones de FEI; o participa en pruebas, promociones, programas o servicios relacionados con la Plataforma.',
        'Esta Política también aplica, cuando corresponda, a usuarios vinculados a clubes, academias, colegios, universidades, federaciones, empresas, programas deportivos u otras instituciones que utilicen FEI.',
      ],
    },
    {
      title: '2. Información que recopilamos',
      paragraphs: [
        'FEI puede recopilar diferentes tipos de información según la forma en que el usuario utilice la Plataforma.',
        'La información de cuenta puede incluir nombre completo, correo electrónico, credenciales de acceso gestionadas de forma segura por nuestro proveedor de autenticación, idioma preferido, rol futbolístico o profesional, institución, club, academia o entidad asociada si aplica, país o ubicación aproximada, preferencias de cuenta, fecha de creación de cuenta, estado de la cuenta e información necesaria para autenticación, seguridad y soporte.',
        'La información de perfil y personalización puede incluir rol o área profesional dentro del fútbol, nivel o ruta de aprendizaje, intereses educativos, objetivos de comunicación, preferencias de idioma, progreso dentro de la Plataforma e historial de módulos, diagnósticos o actividades completadas.',
        'La información de diagnósticos, progreso y respuestas puede incluir respuestas escritas, respuestas orales, grabaciones de voz si la función aplica, resultados de diagnóstico, puntajes, niveles estimados, fortalezas y áreas de mejora, recomendaciones generadas, reportes individuales o institucionales, tiempo dedicado a actividades, módulos completados, historial de progreso e interacciones con ejercicios, contenidos o herramientas de aprendizaje.',
        'La información institucional puede incluir nombre de la institución, datos del administrador o responsable de cuenta, usuarios asignados a la institución, número de licencias o accesos, roles de usuarios dentro de la institución, reportes agregados o individuales según el plan contratado, progreso de grupos o usuarios, información de facturación institucional, comunicaciones comerciales o de soporte e información necesaria para gestionar contratos, accesos, renovaciones o servicios institucionales.',
        'La información de pagos y facturación puede incluir plan contratado, historial de transacciones, estado de pago, fechas de contratación, renovación o cancelación, datos de facturación, información fiscal o comercial necesaria e identificadores de pago proporcionados por el proveedor de pagos. Los datos completos de tarjetas de crédito o débito son procesados por proveedores externos de pago. FEI no almacena directamente la información completa de tarjetas, salvo que se indique expresamente lo contrario y siempre conforme a la normativa aplicable.',
        'La información técnica, de uso y dispositivo puede incluir páginas visitadas, funciones utilizadas, duración de sesiones, acciones realizadas dentro de la Plataforma, fecha y hora de acceso, tipo de dispositivo, sistema operativo, navegador, dirección IP, ubicación aproximada basada en IP, identificadores de sesión, registros técnicos, errores o eventos de seguridad e información relacionada con rendimiento, estabilidad y uso de la Plataforma.',
        'La información de comunicación y soporte puede incluir correos electrónicos enviados, mensajes a través de formularios, solicitudes de soporte, feedback, comentarios, respuestas a encuestas e información necesaria para responder consultas, resolver problemas o mejorar el servicio.',
      ],
    },
    {
      title: '3. Cómo usamos los datos',
      paragraphs: [
        'FEI utiliza los datos personales para operar, mantener, proteger y mejorar la Plataforma.',
        'Podemos utilizar la información para crear y gestionar cuentas, autenticar usuarios, permitir el acceso a diagnósticos y contenidos, generar resultados, reportes y recomendaciones, personalizar rutas de aprendizaje, guardar progreso, permitir funciones institucionales, procesar pagos, planes y suscripciones, y brindar soporte técnico o administrativo.',
        'FEI puede utilizar datos para personalizar la experiencia educativa mediante la adaptación de contenidos al rol del usuario, recomendación de módulos, actividades o rutas, ajuste de diagnósticos o feedback al nivel del usuario, visualización de progreso, generación de insights educativos y mejora de la relevancia de la experiencia dentro de FEI.',
        'FEI puede utilizar datos para mejorar la Plataforma mediante análisis de tendencias de uso, identificación de errores o áreas de mejora, desarrollo de nuevas funciones, optimización del rendimiento, mejora de diagnósticos, escenarios y contenidos, evaluación de la efectividad de rutas de aprendizaje y mejora de seguridad, estabilidad y experiencia de usuario.',
        'FEI puede utilizar datos de contacto para enviar información relacionada con la cuenta, confirmar registros, pagos o cambios importantes, responder consultas, enviar avisos de seguridad, notificar cambios en la Plataforma, comunicar actualizaciones relevantes del servicio y enviar información educativa, comercial o promocional cuando corresponda y conforme a la ley aplicable.',
        'FEI puede utilizar datos para seguridad, prevención de fraude y cumplimiento, incluyendo detectar accesos no autorizados, prevenir fraude, proteger cuentas, investigar usos indebidos, hacer cumplir los Términos de Servicio, resolver disputas y cumplir obligaciones legales, fiscales, contables, regulatorias o contractuales.',
      ],
    },
    {
      title: '4. Base legal del tratamiento',
      paragraphs: [
        'Cuando la normativa aplicable exige una base legal para el tratamiento de datos personales, FEI podrá tratar datos sobre una o más de las siguientes bases.',
        'Ejecución de un contrato o servicio: para crear cuentas, entregar diagnósticos, procesar pagos, dar acceso a contenidos y operar la Plataforma.',
        'Consentimiento: cuando el usuario acepta ciertas funciones, comunicaciones, cookies no esenciales, tratamiento de datos específicos o uso de información proporcionada voluntariamente.',
        'Cumplimiento de obligaciones legales: para atender requisitos fiscales, contables, regulatorios, judiciales o de protección de datos.',
        'Intereses legítimos de FEI: para mejorar la Plataforma, proteger la seguridad, prevenir fraude, analizar uso, desarrollar servicios y mantener comunicaciones necesarias, siempre respetando los derechos del usuario.',
        'Protección de derechos y seguridad: para investigar usos indebidos, proteger la Plataforma, responder a reclamaciones o prevenir daños a FEI, usuarios o terceros.',
      ],
    },
    {
      title: '5. Tecnología, inteligencia artificial y análisis automatizado',
      paragraphs: [
        'FEI puede utilizar sistemas automatizados, análisis de datos, modelos lingüísticos, inteligencia artificial u otras tecnologías para apoyar funciones como evaluación de respuestas, análisis de desempeño comunicativo, generación de feedback, clasificación de nivel, recomendaciones de aprendizaje, personalización de contenido, creación de reportes, detección de patrones de progreso y mejora de diagnósticos y materiales educativos.',
        'Estos tratamientos tienen una finalidad educativa, operativa y de mejora del servicio.',
        'Aunque FEI busca que estas tecnologías sean útiles, seguras y precisas, los sistemas automatizados pueden tener limitaciones, errores, sesgos o interpretaciones imperfectas.',
        'Los resultados generados por tecnología o inteligencia artificial no sustituyen el criterio humano profesional, pedagógico, institucional, deportivo, médico, psicológico o legal.',
        'Cuando corresponda, el usuario podrá solicitar información adicional sobre el uso de sus datos en procesos automatizados o ejercer los derechos aplicables conforme a esta Política y la normativa vigente.',
      ],
    },
    {
      title: '6. Cookies y tecnologías similares',
      paragraphs: [
        'FEI puede utilizar cookies, almacenamiento local, píxeles, identificadores de sesión y tecnologías similares para operar y mejorar la Plataforma.',
        'Las cookies son pequeños archivos o tecnologías que permiten recordar información sobre el dispositivo, navegador, sesión o preferencias del usuario.',
        'Las cookies esenciales son necesarias para que la Plataforma funcione correctamente. Pueden utilizarse para mantener sesiones iniciadas, autenticar usuarios, proteger la seguridad, recordar acciones necesarias, prevenir fraude y permitir funciones básicas de navegación.',
        'Las cookies de preferencias permiten recordar elecciones del usuario, como idioma preferido, preferencias de interfaz, configuraciones de experiencia y opciones seleccionadas dentro de la Plataforma.',
        'Las cookies de análisis y rendimiento ayudan a entender cómo se utiliza la Plataforma, medir rendimiento, detectar errores, entender tendencias agregadas y mejorar velocidad, estabilidad y contenido.',
        'Las cookies de marketing o comunicación podrán utilizarse con fines de marketing, medición de campañas o comunicación, solo cuando corresponda y conforme a la normativa aplicable.',
        'El usuario puede controlar o bloquear cookies desde la configuración de su navegador. Sin embargo, si desactiva cookies esenciales, algunas funciones de FEI pueden dejar de funcionar correctamente.',
        'FEI podrá ofrecer herramientas de gestión de cookies dentro de la Plataforma para aceptar, rechazar o configurar ciertas categorías de cookies, cuando corresponda. El uso de cookies y tecnologías similares podrá detallarse también en una Política de Cookies específica.',
      ],
    },
    {
      title: '7. Proveedores externos',
      paragraphs: [
        'FEI puede utilizar proveedores externos para operar, alojar, proteger, procesar pagos, analizar, comunicar o mejorar la Plataforma.',
        'Estos proveedores pueden incluir servicios de alojamiento web, base de datos, autenticación, procesamiento de pagos, correo electrónico, analítica, seguridad, soporte, almacenamiento, infraestructura tecnológica, herramientas de comunicación, servicios de inteligencia artificial o análisis de datos.',
        'FEI procura trabajar con proveedores que ofrezcan medidas razonables de seguridad, confidencialidad y protección de datos.',
        'Los proveedores externos solo deben procesar datos personales conforme a instrucciones, contratos, políticas o finalidades compatibles con los servicios prestados a FEI, salvo que actúen como responsables independientes bajo sus propios términos y políticas.',
        'FEI no controla servicios externos que no sean operados directamente por FEI, aunque puedan estar enlazados o integrados con la Plataforma.',
      ],
    },
    {
      title: '8. Transferencias internacionales',
      paragraphs: [
        'Los datos personales pueden almacenarse, procesarse o transferirse en países distintos al país de residencia del usuario, incluyendo países donde operen FEI, sus proveedores tecnológicos, sus proveedores de pago o sus servicios de infraestructura.',
        'Cuando los datos sean transferidos internacionalmente, FEI procurará aplicar medidas razonables para proteger la información, como uso de proveedores con estándares de seguridad adecuados, acuerdos de procesamiento de datos cuando corresponda, medidas técnicas de protección, cifrado en tránsito cuando sea aplicable, controles de acceso y cumplimiento de leyes de protección de datos aplicables.',
        'Al utilizar FEI, el usuario entiende que sus datos pueden ser tratados fuera de su país de residencia conforme a esta Política.',
      ],
    },
    {
      title: '9. Seguridad de la información',
      paragraphs: [
        'FEI implementa medidas técnicas, organizativas y administrativas razonables para proteger los datos personales contra acceso no autorizado, pérdida, alteración, divulgación indebida o destrucción.',
        'Estas medidas pueden incluir cifrado en tránsito mediante protocolos seguros, controles de acceso, autenticación, gestión segura de credenciales, monitoreo de actividad sospechosa, restricciones de acceso interno, uso de proveedores tecnológicos confiables, copias de seguridad o mecanismos de continuidad cuando corresponda, y revisión y mejora progresiva de prácticas de seguridad.',
        'Sin embargo, ningún sistema digital es completamente seguro. FEI no puede garantizar que la Plataforma esté libre de riesgos, accesos no autorizados, fallos técnicos o incidentes de seguridad.',
        'El usuario también es responsable de proteger su cuenta, utilizar contraseñas seguras, no compartir credenciales y notificar a FEI si sospecha un uso no autorizado.',
      ],
    },
    {
      title: '10. Retención de datos',
      paragraphs: [
        'FEI conservará los datos personales durante el tiempo necesario para cumplir las finalidades descritas en esta Política, operar la Plataforma, prestar servicios, cumplir obligaciones legales o contractuales, resolver disputas, proteger la seguridad y mantener registros necesarios.',
        'Los datos de cuenta se conservan mientras la cuenta esté activa o mientras sean necesarios para operar el servicio. Si el usuario solicita la eliminación de su cuenta, FEI eliminará o anonimizará los datos dentro de un plazo razonable, salvo que exista una obligación legal, contractual, fiscal, contable, de seguridad o resolución de disputas que requiera conservar cierta información.',
        'Los datos de diagnósticos, progreso y aprendizaje se conservan mientras sean necesarios para prestar el servicio, mostrar progreso, generar recomendaciones, mantener reportes, apoyar funciones institucionales o mejorar la experiencia educativa.',
        'Tras la eliminación de una cuenta, FEI podrá eliminar, anonimizar o conservar ciertos datos cuando sea necesario por obligaciones legales, seguridad, prevención de fraude, investigación de uso indebido, reportes institucionales autorizados o mejora agregada de la Plataforma.',
        'Los registros técnicos, logs, datos de seguridad o información de uso podrán conservarse durante periodos razonables para análisis de rendimiento, seguridad, prevención de fraude, solución de errores y cumplimiento legal.',
        'Los datos relacionados con pagos, facturación, transacciones, impuestos o contratos podrán conservarse durante el periodo requerido por leyes fiscales, contables, contractuales o regulatorias aplicables.',
        'Las comunicaciones con FEI podrán conservarse mientras sean necesarias para responder solicitudes, resolver problemas, mantener registros de soporte, atender obligaciones legales o mejorar el servicio.',
      ],
    },
    {
      title: '11. Derechos del usuario',
      paragraphs: [
        'Según la legislación aplicable, el usuario puede tener derechos sobre sus datos personales, incluyendo acceso, rectificación, eliminación, portabilidad, restricción, oposición, retirada del consentimiento y derechos relacionados con decisiones automatizadas.',
        'El derecho de acceso permite solicitar información sobre los datos personales que FEI trata sobre el usuario.',
        'El derecho de rectificación permite solicitar la corrección de datos personales inexactos, incompletos o desactualizados.',
        'El derecho de eliminación permite solicitar la eliminación de datos personales, sujeto a excepciones legales, contractuales, fiscales, contables, de seguridad o resolución de disputas.',
        'El derecho de portabilidad puede permitir solicitar ciertos datos personales en un formato estructurado, común y legible por máquina cuando corresponda.',
        'El derecho de restricción permite solicitar que se limite el tratamiento de datos en determinadas circunstancias.',
        'El derecho de oposición permite oponerse a ciertos tratamientos de datos, incluyendo, cuando corresponda, marketing directo, intereses legítimos o determinados procesos automatizados.',
        'Cuando FEI trate datos con base en el consentimiento, el usuario podrá retirarlo en cualquier momento, sin afectar la legalidad del tratamiento realizado antes de la retirada.',
        'Cuando la ley aplicable lo permita, el usuario podrá solicitar información adicional o intervención humana respecto de ciertos tratamientos automatizados que produzcan efectos significativos.',
        'Para ejercer derechos de privacidad, el usuario puede contactar a FEI en contact@feifootball.com. La solicitud debe incluir el correo electrónico asociado a la cuenta, nombre completo, derecho que desea ejercer y detalles suficientes para identificar la solicitud. FEI podrá solicitar información adicional para verificar la identidad del usuario antes de responder. FEI responderá dentro de un plazo razonable y conforme a la ley aplicable.',
      ],
    },
    {
      title: '12. Menores de edad',
      paragraphs: [
        'FEI está dirigida principalmente a usuarios mayores de edad y a instituciones deportivas, educativas o profesionales.',
        'Los menores de edad podrán utilizar FEI únicamente con autorización de sus padres, representantes legales, club, academia, escuela, institución educativa o entidad responsable, según corresponda.',
        'Cuando una institución cree, administre o asigne una cuenta a un menor, dicha institución será responsable de obtener los consentimientos necesarios para el uso de FEI y el tratamiento de datos personales del menor.',
        'Los padres, representantes legales o instituciones responsables podrán ejercer derechos de privacidad en nombre del menor conforme a la ley aplicable.',
        'Si FEI detecta que ha recopilado datos de un menor sin el consentimiento requerido, podrá suspender o eliminar la cuenta y tomar medidas razonables para eliminar o limitar el tratamiento de dichos datos, salvo que exista una obligación legal o de seguridad que requiera conservarlos.',
      ],
    },
    {
      title: '13. Comunicaciones',
      paragraphs: [
        'FEI puede enviar comunicaciones relacionadas con creación o gestión de cuenta, seguridad, cambios importantes en la Plataforma, pagos, suscripciones o facturación, soporte, progreso o actividad educativa, actualizaciones de servicio, nuevos contenidos, productos o funciones, y comunicaciones comerciales o promocionales cuando corresponda.',
        'El usuario podrá cancelar o gestionar ciertas comunicaciones promocionales cuando FEI ofrezca esa opción.',
        'Algunas comunicaciones son necesarias para operar la Plataforma y no podrán desactivarse mientras la cuenta esté activa, como avisos de seguridad, confirmaciones de cuenta, información de pagos o cambios importantes del servicio.',
      ],
    },
    {
      title: '14. Servicios de terceros y enlaces externos',
      paragraphs: [
        'La Plataforma puede contener enlaces o integraciones con servicios de terceros, como proveedores de pago, autenticación, redes sociales, herramientas de análisis, servicios de hosting, almacenamiento, comunicación o soporte.',
        'Estos terceros pueden recopilar o tratar datos conforme a sus propias políticas de privacidad y términos de servicio.',
        'FEI no controla ni se responsabiliza por las prácticas de privacidad de sitios, servicios o plataformas externas que no sean operadas directamente por FEI.',
        'El usuario debe revisar las políticas de privacidad de terceros antes de utilizar servicios externos enlazados o integrados.',
      ],
    },
    {
      title: '15. Datos agregados y anonimizados',
      paragraphs: [
        'FEI puede utilizar información agregada, estadística o anonimizada para analizar tendencias de uso, mejorar diagnósticos, desarrollar nuevos contenidos, evaluar rendimiento de la Plataforma, crear reportes internos, mejorar servicios institucionales, investigar patrones educativos y optimizar la experiencia de aprendizaje.',
        'Cuando los datos han sido anonimizados de forma razonable para que no identifiquen directamente al usuario, podrán utilizarse para fines de análisis, investigación, mejora de producto o desarrollo comercial conforme a la ley aplicable.',
      ],
    },
    {
      title: '16. Cambios en esta Política',
      paragraphs: [
        'FEI puede actualizar esta Política de Privacidad cuando sea necesario para reflejar cambios legales, técnicos, comerciales, operativos, de producto o de protección de datos.',
        'Los cambios se publicarán en esta página con una nueva fecha de actualización.',
        'Cuando los cambios sean importantes, FEI podrá intentar notificar a los usuarios por correo electrónico, dentro de la Plataforma o mediante otro medio razonable.',
        'El uso continuado de FEI después de la publicación de los cambios implica que el usuario entiende la Política actualizada.',
      ],
    },
    {
      title: '17. Contacto',
      paragraphs: [
        'Para preguntas sobre privacidad, solicitudes de datos, eliminación de cuenta, ejercicio de derechos o reportes relacionados con protección de datos, el usuario puede contactar a FEI en contact@feifootball.com.',
        'Si FEI habilita correos específicos para privacidad, soporte, ventas o cuentas institucionales, dichos canales podrán indicarse en la Plataforma o en las políticas correspondientes.',
      ],
    },
    {
      title: '18. Información adicional para usuarios en la Unión Europea o Reino Unido',
      paragraphs: [
        'Si el usuario se encuentra en la Unión Europea, el Espacio Económico Europeo o el Reino Unido, puede tener derechos adicionales bajo leyes de protección de datos aplicables, incluyendo el Reglamento General de Protección de Datos, cuando corresponda.',
        'Estos derechos pueden incluir acceso, rectificación, eliminación, restricción, oposición, portabilidad, retirada del consentimiento y presentación de reclamaciones ante una autoridad de protección de datos competente.',
        'FEI procurará atender las solicitudes de usuarios en dichas jurisdicciones conforme a la normativa aplicable.',
      ],
    },
    {
      title: '19. Nota final',
      paragraphs: [
        'FEI trata los datos personales con el objetivo de operar una plataforma educativa segura, útil y especializada en comunicación en inglés para el fútbol.',
        'Esta Política busca explicar de forma clara cómo FEI recopila, utiliza, protege y gestiona información personal en el contexto de sus servicios educativos, diagnósticos, pagos, cuentas institucionales y funciones tecnológicas.',
        'Antes de un lanzamiento comercial a gran escala, FEI podrá revisar esta Política con asesoría legal especializada, especialmente en materia de protección de datos, pagos, menores de edad, transferencias internacionales, inteligencia artificial y servicios institucionales.',
        'Gracias por confiar en FEI — Football English Intelligence.',
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
  )
}
