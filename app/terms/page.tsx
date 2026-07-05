'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'

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

const sectionsByLang = {
  en: [
    {
      title: 'Introduction',
      paragraphs: [
        'These Terms of Service, together with our Privacy Policy and any other applicable policy or condition, govern access to and use of the FEI — Football English Intelligence platform, available at https://www.feifootball.com and any other website, application, digital tool, service, content, diagnostic, plan, product, or platform operated by FEI or on its behalf, collectively referred to as the “Platform”.',
        'FEI is an educational platform specialized in English for football. Its purpose is to support the development of English communication skills for players, coaches, scouts, analysts, fitness coaches, physiotherapists, sports psychologists, nutritionists, academy directors, clubs, academies, educational institutions, and other professionals connected to football.',
        'By creating an account, accessing the Platform, making a payment, completing a diagnostic, using educational content, or browsing our services, the user confirms that they have read, understood, and accepted these Terms.',
        'If the user does not agree with these Terms, they must not access, register for, or use the Platform.',
      ],
    },
    {
      title: '1. Acceptance of the Terms',
      paragraphs: [
        'By using FEI, the user declares that they have the legal capacity to accept these Terms; that the information they provide is true, current, and complete; that they will use the Platform in a lawful, responsible, and respectful manner; that they accept these Terms, our Privacy Policy, and any linked policy; that they understand FEI may update these Terms when necessary; and that they are responsible for ensuring that any person accessing the Platform through their account or authorization is aware of and complies with these Terms.',
        'If a person accesses FEI on behalf of a club, academy, school, university, federation, company, institution, or team, they declare that they have sufficient authority to accept these Terms on behalf of that entity.',
      ],
    },
    {
      title: '2. Eligibility and minors',
      paragraphs: [
        'The Platform is primarily intended for adult users and sports, educational, or professional institutions.',
        'Minors may use FEI only with express authorization from their parents, legal guardians, club, academy, school, educational institution, or responsible entity, as applicable.',
        'When an institution creates, manages, or assigns an account to a minor, that institution is responsible for obtaining the necessary consents before allowing the use of the Platform or the processing of the minor’s personal data.',
        'If FEI discovers that an account belongs to a minor without the required consent, FEI may suspend or delete the account and take any necessary measures under applicable law.',
        'Minors who use the Platform with authorization must comply with these Terms.',
      ],
    },
    {
      title: '3. Account registration',
      paragraphs: [
        'To access certain FEI features, the user must create an account.',
        'When registering, the user agrees to provide accurate information, including, where applicable, name, email address, football role, institution, country, level, login details, or any other information necessary to operate and personalize the experience within the Platform.',
        'The user is responsible for keeping their password and access credentials confidential; not sharing their account with unauthorized third parties; keeping their account information up to date; notifying FEI if they suspect unauthorized access, loss of credentials, or misuse of their account; and being responsible for activities carried out through their account, unless there is clear evidence of unauthorized access beyond their control.',
        'FEI may suspend, restrict, or cancel an account if it reasonably considers that the user has breached these Terms; that the information provided is false, incomplete, or misleading; that the account is being misused; that there is a security risk; that fraudulent, abusive, or unauthorized use has occurred; or that the account negatively affects FEI, other users, or third parties.',
      ],
    },
    {
      title: '4. Institutional accounts',
      paragraphs: [
        'FEI may offer accounts, licenses, plans, or access for clubs, academies, schools, universities, federations, companies, sports programs, or other institutions.',
        'When an institution purchases, manages, or assigns access to its members, students, players, employees, coaches, staff, or collaborators, that institution is responsible for properly managing access; informing its users about FEI; obtaining the necessary consents, especially where minors are involved; paying applicable fees; ensuring that users comply with these Terms; notifying FEI when an account must be modified, suspended, or deleted; and using data, reports, or results responsibly and in accordance with applicable regulations.',
        'FEI may establish specific conditions for institutional accounts through commercial proposals, contracts, purchase orders, service agreements, or other separate documents.',
        'In the event of a conflict between these Terms and a signed institutional contract, the institutional contract will prevail where applicable.',
      ],
    },
    {
      title: '5. Plans, payments, and billing',
      paragraphs: [
        'FEI may offer free plans, paid plans, monthly subscriptions, annual subscriptions, institutional access, individual purchases, free trials, promotions, personalized services, or other commercial models.',
        'The prices, features, usage limits, access duration, included benefits, renewal conditions, and any applicable restrictions will be shown on the Platform or communicated by FEI before purchase.',
        'By purchasing a plan or making a payment, the user or institution agrees to pay the corresponding amounts, including taxes, processing fees, commissions, or other applicable costs.',
        'Payments may be processed by external payment providers. FEI does not directly store full credit or debit card information unless expressly stated otherwise and always in accordance with applicable regulations.',
        'FEI may modify prices, plans, features, or commercial conditions. When a change significantly affects users or institutions with an active subscription, FEI will attempt to provide reasonable prior notice.',
      ],
    },
    {
      title: '6. Renewals, cancellations, and refunds',
      paragraphs: [
        'If a plan operates as a subscription, it may renew automatically according to the contracted period unless the user or institution cancels before the renewal date.',
        'The user or institution is responsible for canceling the subscription within the applicable period if they do not wish to continue the service.',
        'Unless applicable law provides otherwise, payments will not be refundable once the user has accessed content, completed diagnostics, used digital services, received access to the contracted plan, or consumed a substantial part of the service.',
        'FEI may review exceptional refund requests on a case-by-case basis, without this creating any future obligation to grant similar refunds.',
        'Specific cancellation, renewal, or refund conditions may vary depending on the plan, country, payment provider, institutional contract, or applicable promotion.',
      ],
    },
    {
      title: '7. Free access, trials, and promotions',
      paragraphs: [
        'FEI may offer free access, trials, discounts, promotional codes, scholarships, temporary access, or commercial benefits.',
        'These benefits may be subject to specific conditions, usage limits, expiration dates, or restrictions by user, institution, country, or account type.',
        'FEI may modify, suspend, or cancel promotions at any time if it detects abuse, fraudulent use, technical error, breach of conditions, or a reasonable commercial need.',
      ],
    },
    {
      title: '8. License to use',
      paragraphs: [
        'While the account is active and the user complies with these Terms, FEI grants a limited, personal, non-exclusive, non-transferable, revocable license, subject to the contracted plan, to access and use the Platform.',
        'This license allows the user to use FEI only for authorized educational, professional, institutional, or learning purposes.',
        'This license does not allow the user to copy, reproduce, or extract content; resell, sublicense, or transfer access; modify, adapt, or create derivative works; commercially exploit the Platform without authorization; use bots, scrapers, abusive automation, or unauthorized methods; access content, data, or features outside the permissions granted; or use FEI materials to train external systems, artificial intelligence models, or competing products without express authorization.',
        'FEI reserves all rights not expressly granted in these Terms.',
      ],
    },
    {
      title: '9. FEI intellectual property',
      paragraphs: [
        'All rights in FEI, including its name, brand, logo, visual identity, design, interface, texts, diagnostics, questions, model answers, educational content, methodology, learning pathways, level structure, reports, graphics, code, software, databases, documentation, and materials, belong to FEI or its licensors.',
        'Access to the Platform does not transfer to the user any intellectual property rights in FEI or its content.',
        'Unless expressly authorized in writing, the user may not reproduce, copy, or distribute FEI content; publish diagnostics, questions, modules, pathways, or internal materials; create derivative products based on FEI; sell, sublicense, or redistribute FEI resources; use the FEI brand without permission; extract content at scale; alter, remove, or hide intellectual property notices; use FEI materials to develop competing products; or use FEI materials to train external systems or AI models.',
        'FEI may take technical, contractual, or legal measures to protect its intellectual property rights.',
      ],
    },
    {
      title: '10. User-submitted content',
      paragraphs: [
        'FEI may allow users to submit written responses, oral responses, voice recordings, exercises, assignments, comments, profile information, files, or other content.',
        'The user retains the rights they may have over the content they submit.',
        'By submitting content to FEI, the user grants FEI a limited, non-exclusive, worldwide license necessary to store, process, analyze, technically reproduce, and use that content only for the purpose of operating the Platform; delivering diagnostics; generating results; providing feedback; personalizing the learning experience; improving services; providing support; ensuring security; and complying with legal or contractual obligations.',
        'The user guarantees that the submitted content does not infringe third-party rights; is not illegal, offensive, discriminatory, defamatory, false, harmful, or abusive; does not contain viruses, malware, or harmful code; does not violate another person’s privacy, image, reputation, or rights; and complies with these Terms and applicable law.',
        'FEI may remove, restrict, or review user-submitted content if it reasonably considers that the content breaches these Terms or creates risk for FEI, other users, or third parties.',
      ],
    },
    {
      title: '11. Permitted use',
      paragraphs: [
        'The user agrees to use FEI only for lawful, educational, professional, institutional, or learning purposes.',
        'The user may use FEI to improve English communication skills; complete diagnostics; access results and recommendations; study modules or educational content; receive feedback; manage individual or institutional progress; support football training programs; download reports when permitted by the plan; and use authorized resources within the Platform.',
      ],
    },
    {
      title: '12. Prohibited use',
      paragraphs: [
        'The user may not use FEI to violate laws, regulations, or third-party rights; access accounts, systems, servers, or data without authorization; copy, resell, sublicense, or distribute content; share their account with unauthorized third parties; use bots, scrapers, abusive automation, or unauthorized methods; alter, damage, overload, or interfere with the Platform; upload viruses, malware, trojans, worms, or harmful code; impersonate another person, institution, or entity; provide false, incomplete, or misleading information; harass, threaten, discriminate against, defame, or harm other users; share offensive, sexual, violent, discriminatory, illegal content or content contrary to FEI’s educational purpose; manipulate, attempt to manipulate, or alter diagnostics, assessments, results, or measurement systems; use FEI results in a misleading or out-of-context manner; attempt to bypass access, security, payment, or authorization controls; or use FEI for purposes other than those permitted.',
        'FEI may investigate, restrict, suspend, or cancel accounts that breach these rules.',
      ],
    },
    {
      title: '13. FEI diagnostics',
      paragraphs: [
        'FEI diagnostics are designed to provide educational guidance on English communication skills applied to specific football contexts.',
        'Results may include levels, scores, analyses, recommendations, strengths, areas for improvement, suggested pathways, and learning comments.',
        'FEI diagnostics must not be interpreted as an official language certification; a guarantee of professional performance; the sole criterion for hiring, selection, or promotion; a medical, psychological, or clinical evaluation; a substitute for external certified tests; a promise of employment, sports, academic, or institutional opportunities; or a guarantee of professional advancement or employability.',
        'FEI does not issue official language certifications unless a specific product, certificate, contract, or agreement expressly states otherwise.',
        'Results are educational and guidance-oriented. The user, club, academy, or institution is responsible for interpreting and applying the information appropriately and in context.',
        'FEI may update the structure, criteria, questions, levels, algorithms, methodology, or presentation of diagnostics to improve the educational quality of the Platform.',
      ],
    },
    {
      title: '14. Results, recommendations, and insights',
      paragraphs: [
        'FEI may generate results, reports, recommendations, personalized comments, or educational insights based on the user’s responses, role, level, progress, performance, or interactions with the Platform.',
        'These results are educational and guidance-oriented. They should not be considered definitive professional advice or a replacement for human, pedagogical, institutional, sporting, medical, psychological, or legal judgment.',
        'FEI does not guarantee that a recommendation will be perfect, complete, accurate, or applicable to every personal, professional, sporting, or institutional situation.',
      ],
    },
    {
      title: '15. Technology-assisted or artificial intelligence features',
      paragraphs: [
        'FEI may use automated systems, language models, data analysis, artificial intelligence, or other technologies to support features such as response evaluation, feedback generation, level classification, communication performance analysis, learning recommendations, content personalization, individual or institutional reports, and improvement of the educational experience.',
        'Although FEI aims for these tools to be useful, accurate, and safe, automated results may contain errors, limitations, biases, or imperfect interpretations.',
        'The user understands that technology-assisted or artificial intelligence features do not replace human professional, pedagogical, institutional, sporting, medical, psychological, or legal judgment.',
        'FEI may review, improve, adjust, limit, or replace these tools at any time.',
      ],
    },
    {
      title: '16. Availability, maintenance, and platform changes',
      paragraphs: [
        'FEI aims to keep the Platform available, secure, and functional. However, it does not guarantee that the service will always be available, error-free, uninterrupted, compatible with all devices, or accessible from all territories.',
        'FEI may perform maintenance, updates, improvements, technical changes, or security adjustments at any time.',
        'FEI may also modify, suspend, replace, or withdraw features, content, diagnostics, plans, prices, learning pathways, or services for technical, commercial, pedagogical, legal, operational, or security reasons.',
        'Where reasonable, FEI will attempt to minimize interruptions and communicate relevant changes.',
      ],
    },
    {
      title: '17. Third-party services and links',
      paragraphs: [
        'FEI may integrate with or link to external services, including payment providers, authentication providers, hosting, analytics, email, communication, video, storage, support, or other technology services.',
        'These third parties may have their own terms, conditions, and privacy policies.',
        'FEI does not control and is not responsible for external services that are not directly operated by FEI, even if they are integrated into or linked from the Platform.',
        'Access to or use of third-party services is the responsibility of the user and is subject to the applicable terms of those third parties.',
      ],
    },
    {
      title: '18. Privacy and data protection',
      paragraphs: [
        'The processing of personal data is governed by FEI’s Privacy Policy.',
        'By using the Platform, the user understands that FEI may process personal data for purposes such as account creation and management, authentication, service delivery, diagnostics, result generation, learning personalization, payments and billing, support, security, Platform improvement, service-related communications, and compliance with legal or contractual obligations.',
        'Where applicable, FEI will process personal data in accordance with applicable data protection laws and principles of transparency, security, minimization, purpose limitation, and respect for user rights.',
        'The use of cookies and similar technologies is governed by FEI’s Privacy Policy and, where applicable, FEI’s Cookie Policy.',
      ],
    },
    {
      title: '19. Suspension and cancellation of access',
      paragraphs: [
        'FEI may suspend, restrict, or cancel access for a user or institution if they breach these Terms; fail to pay applicable fees; misuse the Platform; create security risks; infringe FEI’s or third-party rights; provide false or misleading information; use FEI in an abusive, fraudulent, or illegal manner; or negatively affect the experience, security, or operation of the Platform.',
        'The user may stop using FEI or request account deletion, subject to legal, accounting, contractual, tax, or security obligations that may require certain information to be retained for a specific period.',
        'After cancellation, access to content, results, reports, diagnostics, or services may end unless FEI states otherwise or a legal or contractual obligation applies.',
      ],
    },
    {
      title: '20. Disclaimers and warnings',
      paragraphs: [
        'FEI provides an educational platform and learning support tools.',
        'Although FEI works to provide high-quality content, it does not guarantee that results will be accurate in all cases; that the user will reach a specific level; that the user will obtain employment, sporting, academic, or institutional opportunities; that the Platform will be available without interruptions; that all content will be error-free; that recommendations will apply to every circumstance; or that diagnostics will fully reflect all linguistic, professional, or personal abilities of the user.',
        'The use of FEI and the interpretation of results, reports, or recommendations are the responsibility of the corresponding user, club, academy, or institution.',
      ],
    },
    {
      title: '21. Limitation of liability',
      paragraphs: [
        'To the extent permitted by law, FEI will not be liable for indirect, incidental, special, consequential, punitive, or derivative damages, including loss of revenue, loss of opportunities, loss of data, business interruption, reputational damage, loss of access, decisions made based on results or recommendations, or improper use of the Platform.',
        'FEI will also not be liable for losses or damages arising from inability to use the Platform; interruptions, errors, or technical failures; unauthorized access caused by user negligence; third-party services; user-submitted content; or sporting, academic, employment, or institutional decisions made based on FEI information.',
        'Nothing in these Terms excludes or limits liabilities that cannot legally be excluded.',
      ],
    },
    {
      title: '22. Indemnification',
      paragraphs: [
        'The user agrees to hold FEI harmless from claims, damages, liabilities, losses, costs, or expenses arising from misuse of the Platform; breach of these Terms; user-submitted content; infringement of third-party rights; violation of applicable laws; or unauthorized use of FEI accounts, materials, results, or services.',
      ],
    },
    {
      title: '23. Trademarks',
      paragraphs: [
        '“FEI”, “Football English Intelligence”, its logos, trade names, designs, brand messages, and other identifiers are the property of FEI or their respective owners.',
        'The user may not use FEI trademarks, names, logos, designs, or identity elements without prior written authorization, except for lawful, descriptive, and good-faith references.',
      ],
    },
    {
      title: '24. Changes to these Terms',
      paragraphs: [
        'FEI may review and update these Terms when necessary to reflect legal, technical, commercial, operational, pedagogical, or product changes.',
        'Changes will be published on this page with a new update date.',
        'When changes are significant, FEI may attempt to notify users by email, within the Platform, or through another reasonable channel.',
        'Continued use of FEI after the publication of changes implies acceptance of the updated Terms.',
      ],
    },
    {
      title: '25. Governing law',
      paragraphs: [
        'These Terms will be interpreted in accordance with the applicable laws based on the headquarters, operation, or legal entity responsible for FEI, unless mandatory rules provide otherwise.',
        'When FEI establishes a formal legal entity, legal domicile, or specific jurisdiction, this section may be updated to reflect the applicable law and competent courts.',
      ],
    },
    {
      title: '26. Contact',
      paragraphs: [
        'For questions, comments, or reports related to these Terms, the user may contact FEI at contact@feifootball.com or through the official channels available on the Platform.',
        'If FEI enables specific emails for privacy, sales, support, or institutional accounts, those channels may be indicated on the Platform or in the relevant policies.',
      ],
    },
    {
      title: '27. Final note',
      paragraphs: [
        'These Terms describe the intended operation of FEI and seek to adequately protect the Platform, its users, institutions, content, and services.',
        'Before a large-scale commercial launch, FEI may review these documents with specialized legal counsel, especially regarding payments, data protection, minors, jurisdiction, artificial intelligence, and international services.',
        'Thank you for using FEI — Football English Intelligence.',
      ],
    },
  ],
  es: [
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
              {t.legal}
            </p>

            <h1 className="text-3xl font-black tracking-tight text-fei-text sm:text-4xl lg:text-5xl">
              {t.title}
            </h1>

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
