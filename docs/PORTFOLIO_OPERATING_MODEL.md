# Group Control — UK, Germany and International Operating Model

## Purpose

Group Control is the internal system of record for the complete portfolio. It covers the work performed by employees, agents, contractors, professional advisers and third parties. A provider action is never left in an email thread: it must have an internal owner, outside owner, deliverable, due date, dependency, evidence, reviewer, renewal date and escalation route.

This document is an operating blueprint, not legal, tax or regulatory advice. Internal staff may prepare and coordinate work; filings, regulated activity and professional opinions must be submitted or approved by appropriately authorised people where the law or provider agreement requires it.

## Recommended capacity

The in-app **Team & Operations** section contains the role-by-role headcount, phase and responsibilities. The lean structure is:

- One Portfolio Operations Director, plus one UK and one Germany Programme Manager.
- Two territory compliance managers: one UK and one Germany/EU.
- One independent compliance reviewer for maker-checker approval and quality sampling.
- One company secretarial and registrations manager coordinating formations, verification, Companies House, HMRC, VAT, PAYE and German equivalents.
- One management accountant or finance manager, supported by a UK accountant/tax adviser and German Steuerberater.
- One client onboarding manager and one onboarding/verification officer per initial country.
- One third-party and integrations manager.
- A Head of B2B Sales, two UK account executives, two German account executives, two shared SDRs and a later agents/referrals manager.
- A Head of Growth, SEO/performance manager, UK content/social/lifecycle manager and German localisation/content manager.
- One Head of Product & Engineering, two portfolio product managers, four full-stack engineers, one mobile/Capacitor engineer, two QA engineers, one DevOps/security/data engineer and one product designer.
- UK and German customer-success/support capacity, plus People Operations and portfolio administration.

Specialist advice can begin externally and move in-house later. The CRM keeps the same task and evidence history when responsibility changes.

## Corporate and finance work

### United Kingdom

For each legal entity, create and maintain work items for:

1. Name clearance, incorporation route, registered office, articles, directors, shareholders and people with significant control.
2. Identity verification and any authorised corporate service provider relationship.
3. Companies House authentication/access, statutory registers, confirmation statement and accounts calendar.
4. HMRC Corporation Tax registration, UTR receipt and agent authorisation.
5. VAT threshold/voluntary-registration assessment, application where approved, scheme decision, MTD setup and return calendar.
6. PAYE registration, payroll provider, pension duties, starter/leaver controls and monthly submissions.
7. Bank and payment-provider KYB, beneficial-owner evidence, source-of-funds information and authorised users.
8. Bookkeeping chart, cost centres by project, purchase approval, billing, credit control, expenses and monthly close.
9. Management accounts, cash forecast, intercompany charging and documented transfer-pricing/tax advice where applicable.
10. Insurance assessment: employers’ liability, public/product/professional/cyber and sector-specific cover.
11. ICO/data-protection assessment and fee registration where required.
12. Trademark clearance, filing classes, territory, objections, proof of use and renewal diary.

### Germany

For each German entity or establishment, coordinate and evidence:

1. Legal-form decision with German professional advice, name check, articles and notarial formation.
2. Share capital/bank evidence, Handelsregister entry and beneficial-owner/Transparency Register work.
3. Gewerbeanmeldung and IHK/HWK classification as applicable.
4. Finanzamt tax-registration questionnaire, tax number and corporate/trade-tax setup.
5. VAT registration, VAT ID, invoicing rules and return calendar; assess OSS/cross-border obligations where relevant.
6. Payroll registration, Betriebsnummer, health-insurance reporting, wage tax and employment documentation.
7. Banking/payment KYB and authorised-user controls.
8. German bookkeeping, document retention, DATEV/finance workflow and Steuerberater handoff.
9. Datenschutz roles, records of processing, processor agreements, retention, deletion and international-transfer controls.
10. Impressum, privacy, cookie and consumer/business terms reviewed for the actual product and payer.
11. Sector permits, trade qualifications, insurance and local authority notifications.
12. DPMA/EUIPO trademark actions and renewal calendar.

## Compliance operating model

Every portfolio project and every potential B2B customer receives a risk-based classification before approval. At minimum record:

- What the service does in plain English and who pays.
- Countries served, legal entities involved and contracting entity.
- User types, age groups and vulnerable customers.
- Data collected, special-category data, identity checks, retention and processors.
- Payments, funds flow, refunds, chargebacks and whether regulated financial activity might arise.
- Sector rules, permissions, licences, insurance, professional qualifications and authority contacts.
- Marketing permissions, claims, pricing disclosures and consumer/business contract route.
- Required policies, agreements, training, controls, monitoring and complaint handling.
- Risk rating, preparer, independent reviewer, exceptions, evidence and next review date.

The UK Compliance Manager owns UK cases. The Germany/EU Compliance Manager owns German cases. High-risk or novel scope requires independent review. If a qualified adviser is hired, assign their user account as reviewer and retain the prior adviser’s advice and decisions in the audit history.

## Client onboarding workflow

1. **Qualified:** confirm problem, product fit, payer, decision maker, locations/users and expected timing.
2. **Commercial:** approved pricing, proposal, authority to contract and signed agreement.
3. **Verification:** legal business, owners/controllers where relevant, licences, qualifications, insurance and bank/payment details.
4. **Compliance approval:** risk rating, required controls, exclusions, reviewer decision and review date.
5. **Implementation:** tenant/account creation, permissions, configuration, data import and integrations.
6. **Training:** administrator and staff training, materials, attendance and support route.
7. **Testing:** agreed scenarios, defects, payment/communications tests and customer acceptance.
8. **Trial:** start/end dates, success measures, usage review, support and conversion decision.
9. **Go-live:** production approval, named service owners, SLA, billing and incident route.
10. **Success/renewal:** adoption, outcomes, complaints, risk changes, renewal and referral/case-study permission.

Parents, players or other free-side users must not be recorded as paying customers when the business side funds the product. Marketplace products may have distinct business and user journeys, but the approved payer model remains explicit.

## Third-party work

Create a CRM account and action register for each insurer, broker, payment provider, banking provider, council, authority, registrar, telecom provider, email provider, app store, accountant, lawyer, notary, tax adviser, DPO or trademark adviser.

Each action needs:

- Internal owner and named external contact.
- Requested deliverable and the information supplied to them.
- Contract/application reference; credentials must stay in the approved secrets vault.
- Dependency on another task or decision.
- Target date, last contact, next chase and escalation date.
- Test/certification result, production approval and service contacts.
- Evidence link, agreement expiry, licence/insurance expiry and renewal notice.
- Qualification/authorisation required and whether the role can be hired in-house.

For Adyen or another payment provider, separately track legal-entity approval, merchant/store identifiers, payment methods, terminals/POS, e-commerce credentials, API permissions, webhooks, split/marketplace capability, test certification, production approval, reconciliation, refunds, disputes and incident contacts. Do not store secret keys or passwords in CRM fields.

## Per-project delivery pack

Every project in the Portfolio Register must receive the following linked work items:

### Product and commercial

- Plain-language scope, customer, paying side, free side and territory.
- Approved pricing, trial, cancellation, refund and revenue-recognition rules.
- Product owner, roadmap, acceptance criteria and launch decision.

### Application and SaaS completion

- Public site, authenticated roles, admin tools and support tools.
- Database/RLS, audit history, data export/deletion and retention.
- Payment, email, SMS/WhatsApp, analytics, maps, AI or sector integrations.
- Error handling, monitoring, backup/restore, accessibility, browser/device and security tests.
- Staging acceptance, release approval, incident/rollback and service ownership.

### Native and Capacitor

- Native requirement decision; iOS/Android identifiers and signing ownership.
- Capacitor configuration, permissions, deep links, camera/files/location where needed.
- Push notification certificates, consent and message preferences.
- Device matrix, offline/network behaviour, privacy manifests and store data declarations.
- Store listing, screenshots, support/privacy links, review responses and release process.

### Communications and infrastructure

- Domain ownership, registrar, DNS/CDN, SSL, renewal and recovery access.
- Shared and role mailboxes, SPF, DKIM, DMARC, transactional sender and archive.
- Telephone and WhatsApp Business numbers, verification, templates, opt-outs and routing.
- Production/staging environments, CI/CD, secrets vault, access reviews, logs, monitoring and backups.

### Legal, compliance and intellectual property

- Contracting entity, terms, privacy, cookies, data-processing agreements and supplier agreements.
- Product/sector assessment, licences, insurance, complaints and authority actions.
- Trademark clearance, filing, brand assets, usage rules and renewals.
- Marketing claims and consent review for each channel/territory.

### Marketing, sales and service

- Technical SEO, search console, analytics, structured data and local/country pages.
- Social profiles, content calendar, direct marketing, calls, visits, referrals, agents and partnerships.
- Defined lead stages, qualification, demo, proposal, trial and handover.
- Onboarding pack, training, knowledge base, support SLA, customer success and renewals.

## Marketing and sales execution

Marketing is a separate gated workspace in the app. Each brand plan must specify whether it targets the paying business, the end user, or two distinct journeys. The minimum 90-day action plan contains:

- Audience segments, territory and verified contact sources.
- Offer, proof, objections, approved claims and call/email/visit scripts.
- SEO topics and landing pages; content, social and lifecycle calendar.
- Direct mail/email/calling rules and suppression management.
- Local visits, associations, events, councils, suppliers, referrals and agents.
- Paid search/social tests, budget caps, attribution and landing-page experiments.
- Owner and daily activity target; weekly pipeline and campaign review.
- Metrics from lead to meeting, trial, live and retained customer.
- Stop, fix or scale threshold based on service capacity and economics.

UK activity starts with existing warm demand and converts controlled trials into proof. Germany starts only after native-language, legal, administration and support readiness. International brands choose a small number of operationally supported countries before advertising broadly.

## CRM controls

- Role-based access with admin/project-manager/finance write access and authenticated read access; extend to department-specific roles before broad staff rollout.
- Maker-checker review for compliance, bank/payment changes, legal filings and high-risk onboarding.
- Immutable audit history for CRM, onboarding, compliance, campaigns, people, third parties and operating tasks.
- Evidence links instead of passwords; secrets remain in a managed vault.
- Due dates, renewal dates, dependency, blocker and escalation fields.
- No production personal data copied into development.
- MFA and periodic access reviews before production use.
- Reports must distinguish interest, qualified pipeline, signed, trial, live, paying and retained states.

## Management rhythm

- **Daily:** onboarding blockers, provider chases, production incidents, support SLA and sales next actions.
- **Weekly:** project readiness, compliance exceptions, pipeline forecast, campaign results, delivery capacity and decisions.
- **Monthly:** close and cash forecast, statutory calendar, access review exceptions, provider performance, customer retention and portfolio priorities.
- **Quarterly:** country/brand investment, risk appetite, adviser/employee mix, headcount, vendor renewals and stop/start decisions.

