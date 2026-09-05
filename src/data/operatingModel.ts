export type Territory = 'UK' | 'DE' | 'INT' | 'GROUP';
export type HiringPhase = 'Day one' | 'First 90 days' | 'Scale';

export type PortfolioProject = {
  code: string;
  name: string;
  territory: Exclude<Territory, 'GROUP'>;
  source: 'Investor portfolio' | 'Additional operating project';
};

export type TeamPosition = {
  department: string;
  role: string;
  territory: Territory;
  headcount: number;
  phase: HiringPhase;
  engagement: 'Employee' | 'Employee or contractor' | 'Qualified external adviser';
  responsibilities: string[];
};

export type OperatingWorkstream = {
  department: string;
  territory: Territory;
  title: string;
  ownerRole: string;
  reviewerRole?: string;
  thirdParty?: string;
  output: string;
  frequency: string;
};

export type ThirdPartyAction = {
  organisation: string;
  category: string;
  territory: Territory;
  internalOwner: string;
  requiredFromThirdParty: string;
  evidence: string;
  escalation: string;
};

const coreProjects: Array<[string, string, Exclude<Territory, 'GROUP'>]> = [
  ['haccora', 'HACCORA', 'DE'], ['kinderstars', 'KINDERSTARS', 'DE'], ['eventplanrger', 'EVENTPLANR', 'DE'],
  ['rettio', 'RETTIO', 'DE'], ['kiezio', 'KIEZIO', 'DE'], ['beratermarkt', 'BERATEMARKT', 'DE'],
  ['stellenxpert', 'STELLENXPERT', 'DE'], ['viazeno', 'VIAZENO', 'DE'], ['immoviq', 'IMMOVIQ', 'DE'],
  ['beinstandplus', 'BEINSTANDPLUS', 'DE'], ['traindirekt', 'TRAINDIREKT', 'DE'], ['zivvo', 'ZIVVO', 'DE'],
  ['omniqora', 'OMNIQORA', 'INT'], ['unipathway', 'UNIPATHWAY', 'INT'], ['zivvouk', 'ZIVVO UK', 'UK'],
  ['kinderstarsuk', 'KINDERSTARS UK', 'UK'], ['eventplanruk', 'EVENTPLANR UK', 'UK'], ['taxnuvia', 'TAXNUVIA', 'UK'],
  ['gabley', 'GABLEY', 'UK'], ['stylesyncuk', 'STYLESYNC UK', 'UK'], ['xpertjobs', 'XPERTJOBS', 'UK'],
  ['traderos', 'TRADEROS', 'UK'], ['amityos', 'AMITYOS', 'UK'], ['skillfinch', 'SKILLFINCH', 'UK'],
  ['formationgenie', 'FORMATION GENIE', 'UK'], ['merqano', 'MERQANO', 'INT'], ['stylesyncger', 'SCHONOVA', 'DE'],
  ['parkpunkt', 'PARKPUNKT', 'DE'], ['lawquo', 'LAWQUO', 'INT'], ['zoryn', 'ZORYN', 'DE'],
  ['marktpass', 'MARKTPASS', 'DE'], ['dishbee', 'DISHBEE', 'UK'], ['dubaitrips', 'DUBAITRIPS4U', 'INT'],
  ['marocways', 'MAROCWAYS', 'INT'], ['fleetsora', 'FLEETSORA', 'INT'], ['sharedbricks', 'SHAREDBRICKS', 'UK'],
  ['stemcoach', 'STEMCOACH', 'INT'], ['zorynnexus', 'ZORYN PAY', 'DE'], ['onyngo', 'ONYNGO', 'UK'],
  ['hmoflow', 'HMO FLOW', 'UK'], ['nafsi', 'NAFSI', 'INT'], ['haccora-uk', 'HACCORA UK', 'UK'],
  ['cirqiva', 'CIRQIVA', 'UK'], ['docuvera-de', 'DOKUVERA', 'DE'], ['docuvera-uk', 'DOKUVERA UK', 'UK'],
  ['bidlumo', 'BIDLUMO', 'INT'], ['saathera', 'SAATHERA', 'UK'], ['autohashi', 'AUTOHASHI', 'UK'],
  ['gableyretrofit', 'GABLEY RETROFIT', 'UK'], ['baytcircle', 'BAYTCIRCLE', 'INT'], ['taxcenda', 'TAXCENDA', 'INT'],
  ['nimah', "NI'MAH", 'INT'], ['ilmvero', 'ILMVERO', 'INT'], ['dearnext', 'DEARNEXT', 'UK'],
  ['tareevo', 'TAREEVO', 'INT'], ['uzvoya', 'UZVOYA', 'INT'], ['recovrable', 'RECOVRABLE', 'UK'],
  ['merqora', 'MERQORA', 'INT'], ['lessonahead', 'LESSONAHEAD', 'UK'], ['motoresq', 'MOTORESQ', 'UK'],
  ['premisora', 'PREMISORA', 'UK'], ['hexareve', 'HEXARÊVE', 'UK'], ['bosporiva', 'BOSPORIVA', 'UK'],
  ['eastamira', 'EASTAMIRA', 'UK'], ['corazora', 'CORAZORA', 'INT'], ['fiftyroam', 'FIFTYROAM', 'INT'],
  ['canavelle', 'CANAVELLE', 'INT'], ['rangvaya', 'RANGVAYA', 'UK'], ['oceavela', 'OCEAVELA', 'INT'],
  ['savansea', 'SAVANSEA', 'UK'], ['nilevella', 'NILEVELLA', 'UK'], ['adrilume', 'ADRILUME', 'INT'],
  ['marelyra', 'MARELYRA', 'UK'], ['iberaviva', 'IBERAVIVA', 'INT'], ['euralume', 'EURALUME', 'INT'],
  ['farenivo', 'Farenivo', 'INT'], ['niyyahnoor', 'NIYYAHNOOR', 'INT'], ['travenexa', 'TraveNexa', 'INT'],
  ['craftvaro-uk', 'CRAFTVARO UK', 'UK'], ['craftvaro-de', 'CRAFTVARO', 'DE'], ['qiyavo', 'QIYAVO', 'INT'],
  ['criclume', 'CRICLUME', 'INT'], ['depotmesh', 'DepotMesh', 'INT'], ['pawivon', 'Pawivon', 'INT'],
  ['deskivon', 'Deskivon', 'INT'], ['formevyn', 'Formevyn', 'INT'], ['glowevyn', 'Glowevyn', 'INT'],
  ['fixorlyn', 'Fixorlyn', 'INT'], ['tripenvo', 'Tripenvo', 'INT'], ['drivaryn', 'Drivaryn', 'INT'],
  ['kidevia', 'Kidevia', 'INT'], ['gearivon', 'Gearivon', 'INT'], ['avenesto', 'Avenesto', 'INT'],
  ['tendryva', 'Tendryva', 'INT'], ['syndriva', 'Syndriva', 'INT'], ['kalethon', 'KALËTHON PLAY', 'UK'],
  ['auvaneone', 'AUVANE ONE', 'INT'], ['nearcura', 'NearCura', 'UK'], ['yetkiva', 'YETKIVA', 'INT'],
  ['affivon', 'AFFIVON', 'INT'],
];

const additionalProjects: Array<[string, string, Exclude<Territory, 'GROUP'>]> = [
  ['insure360', 'Insure360', 'UK'],
  ['domureva', 'Domureva', 'UK'],
  ['regulos', 'Regulos', 'INT'],
  ['fanzeno', 'Fanzeno', 'INT'],
];

export const portfolioProjects: PortfolioProject[] = [
  ...coreProjects.map(([code, name, territory]) => ({ code, name, territory, source: 'Investor portfolio' as const })),
  ...additionalProjects.map(([code, name, territory]) => ({ code, name, territory, source: 'Additional operating project' as const })),
];

export const teamPositions: TeamPosition[] = [
  { department: 'Leadership & PMO', role: 'Portfolio Operations Director', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Own the portfolio operating plan and budget', 'Set launch priorities and resolve cross-team blockers', 'Chair weekly delivery, risk and cash reviews'] },
  { department: 'Leadership & PMO', role: 'UK Programme Manager', territory: 'UK', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Coordinate UK launches, owners and deadlines', 'Maintain the UK risk, dependency and decision logs', 'Report readiness by project'] },
  { department: 'Leadership & PMO', role: 'Germany Programme Manager', territory: 'DE', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Coordinate German launches and localisation', 'Manage German advisers and authorities', 'Report readiness by project'] },
  { department: 'Compliance', role: 'UK Compliance Manager', territory: 'UK', headcount: 1, phase: 'Day one', engagement: 'Employee or contractor', responsibilities: ['Assess every B2B prospect and portfolio product', 'Maintain policies, registers and evidence', 'Own client compliance onboarding and annual reviews'] },
  { department: 'Compliance', role: 'Germany & EU Compliance Manager', territory: 'DE', headcount: 1, phase: 'Day one', engagement: 'Employee or contractor', responsibilities: ['Own German/EU product and client compliance', 'Coordinate GDPR, consumer and sector reviews', 'Maintain German evidence and renewal calendars'] },
  { department: 'Compliance', role: 'Independent Compliance Reviewer', territory: 'GROUP', headcount: 1, phase: 'First 90 days', engagement: 'Qualified external adviser', responsibilities: ['Approve high-risk cases independently', 'Sample-check completed files', 'Record exceptions, remediation and sign-off'] },
  { department: 'Corporate & Finance', role: 'Company Secretarial and Registrations Manager', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Coordinate incorporations and identity verification', 'Manage Companies House, HMRC, VAT and PAYE work', 'Coordinate German notary, register, tax and payroll applications', 'Maintain statutory calendars and evidence'] },
  { department: 'Corporate & Finance', role: 'Management Accountant / Finance Manager', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee or contractor', responsibilities: ['Bookkeeping, management accounts and cash reporting', 'Accounts payable, receivable and payroll controls', 'Coordinate UK accountant and German Steuerberater', 'VAT and tax packs for adviser submission'] },
  { department: 'Client Operations', role: 'Client Onboarding Manager', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Own client journey from signed to live', 'Allocate checks, training and implementation', 'Maintain SLA, blockers and acceptance evidence'] },
  { department: 'Client Operations', role: 'Onboarding & Verification Officer', territory: 'UK', headcount: 1, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Collect KYB/KYC and service information', 'Verify documents and escalate exceptions', 'Configure accounts and deliver training'] },
  { department: 'Client Operations', role: 'Onboarding & Verification Officer', territory: 'DE', headcount: 1, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Collect German onboarding evidence', 'Verify documents and escalate exceptions', 'Configure accounts and deliver German training'] },
  { department: 'Partnerships', role: 'Third-Party & Integrations Manager', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Own insurers, Adyen, Swan, councils and other providers', 'Track applications, contracts, API access and renewals', 'Chase third-party deliverables and escalate delays'] },
  { department: 'Sales', role: 'Head of B2B Sales', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Define pipeline stages, scripts and targets', 'Coach UK and Germany teams', 'Forecast signed, trial and paying accounts separately'] },
  { department: 'Sales', role: 'B2B Account Executive', territory: 'UK', headcount: 2, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Prospect, visit, demonstrate and close UK businesses', 'Keep CRM next actions complete', 'Hand signed customers to onboarding'] },
  { department: 'Sales', role: 'B2B Account Executive', territory: 'DE', headcount: 2, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Prospect, visit, demonstrate and close German businesses', 'Work in German and follow local sales rules', 'Hand signed customers to onboarding'] },
  { department: 'Sales', role: 'Sales Development Representative', territory: 'GROUP', headcount: 2, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Build verified lead lists', 'Run permission-aware email and calling sequences', 'Book qualified meetings and maintain data quality'] },
  { department: 'Sales', role: 'Agents & Referral Manager', territory: 'GROUP', headcount: 1, phase: 'Scale', engagement: 'Employee', responsibilities: ['Recruit and train agents', 'Manage referral agreements and attribution', 'Monitor conduct, conversion and commissions'] },
  { department: 'Marketing', role: 'Head of Growth', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Allocate budget by brand and market', 'Own acquisition economics and reporting', 'Coordinate brand, performance and launch calendars'] },
  { department: 'Marketing', role: 'SEO & Performance Marketing Manager', territory: 'GROUP', headcount: 1, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Technical SEO and search campaigns', 'Landing-page and conversion testing', 'Attribution, analytics and budget controls'] },
  { department: 'Marketing', role: 'Content, Social & Lifecycle Manager', territory: 'UK', headcount: 1, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['UK content and social calendars', 'Email, WhatsApp and referral journeys', 'Case studies, reviews and retention campaigns'] },
  { department: 'Marketing', role: 'German Localisation & Content Manager', territory: 'DE', headcount: 1, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Native German copy and campaigns', 'Local SEO and directory coverage', 'Review translations and cultural fit'] },
  { department: 'Product & Engineering', role: 'Head of Product & Engineering', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Own architecture, roadmap and release governance', 'Prioritise shared platform capabilities', 'Approve technical readiness and security gates'] },
  { department: 'Product & Engineering', role: 'Portfolio Product Manager', territory: 'GROUP', headcount: 2, phase: 'Day one', engagement: 'Employee', responsibilities: ['Own grouped product roadmaps and discovery', 'Write acceptance criteria and coordinate releases', 'Measure customer outcomes after launch'] },
  { department: 'Product & Engineering', role: 'Full-Stack Engineer', territory: 'GROUP', headcount: 4, phase: 'Day one', engagement: 'Employee or contractor', responsibilities: ['Finish SaaS and web applications', 'Implement integrations and shared services', 'Fix defects and maintain automated tests'] },
  { department: 'Product & Engineering', role: 'Mobile / Capacitor Engineer', territory: 'GROUP', headcount: 1, phase: 'First 90 days', engagement: 'Employee or contractor', responsibilities: ['Capacitor iOS and Android builds', 'Signing, permissions, push notifications and deep links', 'Store submissions, releases and device testing'] },
  { department: 'Product & Engineering', role: 'QA & Test Automation Engineer', territory: 'GROUP', headcount: 2, phase: 'Day one', engagement: 'Employee or contractor', responsibilities: ['Risk-based test plans and regression suites', 'Cross-browser, device, accessibility and payment testing', 'Release evidence and defect triage'] },
  { department: 'Product & Engineering', role: 'DevOps, Security & Data Engineer', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee or contractor', responsibilities: ['CI/CD, environments, backup and monitoring', 'Secrets, access, vulnerability and incident controls', 'Analytics, data quality and integration observability'] },
  { department: 'Product & Engineering', role: 'Product Designer', territory: 'GROUP', headcount: 1, phase: 'First 90 days', engagement: 'Employee or contractor', responsibilities: ['User journeys, prototypes and design system', 'Usability and accessibility reviews', 'Handoff and visual QA'] },
  { department: 'Customer Success', role: 'Customer Success & Support Specialist', territory: 'UK', headcount: 2, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Support, adoption and renewal management', 'Maintain knowledge base and SLA', 'Feed customer evidence into product priorities'] },
  { department: 'Customer Success', role: 'Customer Success & Support Specialist', territory: 'DE', headcount: 2, phase: 'Scale', engagement: 'Employee', responsibilities: ['German-language support and adoption', 'Maintain local knowledge base and SLA', 'Coordinate German customer feedback'] },
  { department: 'People & Administration', role: 'People Operations & Recruitment Manager', territory: 'GROUP', headcount: 1, phase: 'First 90 days', engagement: 'Employee', responsibilities: ['Hiring, contracts and onboarding', 'Training, capacity and performance cycles', 'Background checks and access offboarding'] },
  { department: 'People & Administration', role: 'Portfolio Administrator', territory: 'GROUP', headcount: 1, phase: 'Day one', engagement: 'Employee', responsibilities: ['Shared inboxes, phone numbers and records', 'Meeting actions, filing and renewals', 'CRM hygiene and document control'] },
];

export const operatingWorkstreams: OperatingWorkstream[] = [
  { department: 'Corporate & Finance', territory: 'UK', title: 'UK company formation and identity verification', ownerRole: 'Company Secretarial and Registrations Manager', reviewerRole: 'UK solicitor or accountant', thirdParty: 'Companies House / authorised corporate service provider', output: 'Incorporation, registered office, directors, PSCs and verified identities recorded', frequency: 'Per entity; annual confirmation statement' },
  { department: 'Corporate & Finance', territory: 'UK', title: 'HMRC registrations and finance setup', ownerRole: 'Company Secretarial and Registrations Manager', reviewerRole: 'UK accountant or tax adviser', thirdParty: 'HMRC', output: 'Corporation Tax, UTR, VAT assessment/registration, PAYE and filing calendar', frequency: 'Per entity; monthly/quarterly/annual filings' },
  { department: 'Corporate & Finance', territory: 'DE', title: 'German entity and tax registrations', ownerRole: 'Germany Programme Manager', reviewerRole: 'German lawyer, notary and Steuerberater', thirdParty: 'Notary, Handelsregister, Gewerbeamt, Finanzamt, IHK/HWK', output: 'Formation, beneficial-owner filings, tax number, VAT, payroll and trade registrations evidenced', frequency: 'Per entity; ongoing statutory filings' },
  { department: 'Compliance', territory: 'GROUP', title: 'Product compliance classification', ownerRole: 'Territory Compliance Manager', reviewerRole: 'Independent Compliance Reviewer', output: 'Each product classified by service, payer, data, geography, regulated activity and required controls', frequency: 'Before build approval and whenever scope changes' },
  { department: 'Compliance', territory: 'GROUP', title: 'B2B client compliance assessment', ownerRole: 'Territory Compliance Manager', reviewerRole: 'Independent Compliance Reviewer', output: 'Risk-rated client file, documents, sanctions/PEP where applicable, approvals and review date', frequency: 'Onboarding plus risk-based periodic review' },
  { department: 'Client Operations', territory: 'GROUP', title: 'Client onboarding and implementation', ownerRole: 'Client Onboarding Manager', reviewerRole: 'Customer acceptance owner', output: 'Contract, KYB, configuration, data import, training, testing, acceptance and go-live', frequency: 'Per client' },
  { department: 'Partnerships', territory: 'GROUP', title: 'Provider and authority onboarding', ownerRole: 'Third-Party & Integrations Manager', reviewerRole: 'Compliance and Product owners', output: 'Application, agreement, technical credentials, certification, test approval, production approval and renewal recorded', frequency: 'Per relationship; review at renewal' },
  { department: 'Product & Engineering', territory: 'GROUP', title: 'Finish application and SaaS readiness', ownerRole: 'Portfolio Product Manager', reviewerRole: 'Head of Product & Engineering', output: 'Roadmap, acceptance criteria, security, privacy, QA, support and release evidence complete', frequency: 'Every release' },
  { department: 'Product & Engineering', territory: 'GROUP', title: 'Native application delivery', ownerRole: 'Mobile / Capacitor Engineer', reviewerRole: 'QA & Test Automation Engineer', thirdParty: 'Apple App Store / Google Play', output: 'Capacitor builds, signing, permissions, store assets, privacy declarations and approved releases', frequency: 'Per mobile app and release' },
  { department: 'People & Administration', territory: 'GROUP', title: 'Domains, email, phone and WhatsApp setup', ownerRole: 'Portfolio Administrator', reviewerRole: 'DevOps, Security & Data Engineer', thirdParty: 'Registrar, DNS/CDN, email and telecom providers, Meta', output: 'Ownership, renewals, DNS, SPF/DKIM/DMARC, mailboxes, numbers, templates and access recorded', frequency: 'Per brand; monthly exception review' },
  { department: 'Corporate & Finance', territory: 'GROUP', title: 'Trademark and intellectual-property management', ownerRole: 'Company Secretarial and Registrations Manager', reviewerRole: 'Trademark attorney', thirdParty: 'UKIPO, EUIPO, DPMA and relevant international offices', output: 'Clearance, class strategy, applications, objections, renewals and evidence tracked', frequency: 'Per brand; renewal diary' },
  { department: 'Marketing', territory: 'GROUP', title: 'SEO and market launch', ownerRole: 'Head of Growth', reviewerRole: 'Portfolio Product Manager', output: 'Technical SEO, market pages, content, listings, analytics, campaigns, direct outreach, visits, calls, referrals and agents plan', frequency: '90-day launch sprint plus monthly optimisation' },
  { department: 'Sales', territory: 'GROUP', title: 'Sales pipeline and handover', ownerRole: 'Head of B2B Sales', reviewerRole: 'Client Onboarding Manager', output: 'Lead source, qualification, demo, proposal, decision, contract and onboarding handover complete', frequency: 'Continuous; weekly forecast' },
  { department: 'Customer Success', territory: 'GROUP', title: 'Service support and renewal', ownerRole: 'Customer Success & Support Specialist', reviewerRole: 'Client Onboarding Manager', output: 'SLA, support cases, adoption, risks, renewal and references managed', frequency: 'Daily service; monthly account review' },
];

export const thirdPartyActions: ThirdPartyAction[] = [
  { organisation: 'Insurance providers and brokers', category: 'Insurance', territory: 'GROUP', internalOwner: 'Third-Party & Integrations Manager', requiredFromThirdParty: 'Appointment/authority, product terms, eligibility, API or referral flow, training and complaints route', evidence: 'Signed agreement, approved scripts, test evidence, live authority and renewal date', escalation: 'Compliance review; reassign to employed qualified insurance adviser if brought in-house' },
  { organisation: 'Adyen', category: 'Payments', territory: 'GROUP', internalOwner: 'Third-Party & Integrations Manager', requiredFromThirdParty: 'Platform/account approval, merchant and legal-entity setup, capabilities, POS/e-commerce credentials, webhooks and production sign-off', evidence: 'Contracts, account identifiers in vault, test results, production approval and reconciliation owner', escalation: 'Finance, Compliance and Engineering joint escalation' },
  { organisation: 'Swan or banking-as-a-service provider', category: 'Banking', territory: 'GROUP', internalOwner: 'Third-Party & Integrations Manager', requiredFromThirdParty: 'Programme assessment, KYB/KYC requirements, account/card/payment capabilities, API access, safeguarding and support model', evidence: 'Approved programme, signed agreement, credentials in vault, test certification and incident contacts', escalation: 'Qualified payments counsel/compliance lead before regulated scope launches' },
  { organisation: 'Companies House and HMRC', category: 'Government', territory: 'UK', internalOwner: 'Company Secretarial and Registrations Manager', requiredFromThirdParty: 'Incorporation, identity verification, tax and payroll registrations, acknowledgements and filing access', evidence: 'Submission receipts, identifiers, authorisations and filing calendar', escalation: 'UK accountant/tax adviser or solicitor' },
  { organisation: 'German notary, registers and tax authorities', category: 'Government', territory: 'DE', internalOwner: 'Germany Programme Manager', requiredFromThirdParty: 'Notarial formation, commercial/trade/transparency registrations, tax/VAT/payroll setup and official confirmations', evidence: 'Notarial deeds, extracts, tax letters, IDs, powers of attorney and deadlines', escalation: 'German lawyer/notary/Steuerberater' },
  { organisation: 'Councils and sector regulators', category: 'Authority', territory: 'GROUP', internalOwner: 'Territory Compliance Manager', requiredFromThirdParty: 'Licences, registrations, inspections, data access or written scope confirmation', evidence: 'Licence/registration, conditions, inspection reports, named contact and renewal date', escalation: 'Qualified sector adviser and Portfolio Operations Director' },
  { organisation: 'Apple and Google', category: 'App distribution', territory: 'GROUP', internalOwner: 'Mobile / Capacitor Engineer', requiredFromThirdParty: 'Developer account verification, signing access, policy review and store approval', evidence: 'Account owner, role list, build identifiers, declarations, review outcome and release record', escalation: 'Head of Product & Engineering' },
  { organisation: 'Domain, email, telecom and Meta providers', category: 'Communications', territory: 'GROUP', internalOwner: 'Portfolio Administrator', requiredFromThirdParty: 'Domain ownership, DNS/email service, telephone/WhatsApp verification, approved templates and support route', evidence: 'Contracts, renewal dates, configuration checks and access owner; secrets remain in the vault', escalation: 'DevOps/Security owner' },
  { organisation: 'Trademark offices and attorneys', category: 'Intellectual property', territory: 'GROUP', internalOwner: 'Company Secretarial and Registrations Manager', requiredFromThirdParty: 'Clearance advice, filing, examination responses, opposition support and renewals', evidence: 'Search report, application/registration numbers, classes, territory and deadlines', escalation: 'Trademark attorney' },
  { organisation: 'Accountants, tax advisers, lawyers and DPO', category: 'Professional adviser', territory: 'GROUP', internalOwner: 'Portfolio Operations Director', requiredFromThirdParty: 'Written scope, named qualified lead, advice/deliverables, conflicts check, insurance and service levels', evidence: 'Engagement letter, qualifications, advice record, approvals, open actions and renewal', escalation: 'Replace or hire qualified in-house adviser; preserve full handover history' },
];

export const initialOperatingTasks = operatingWorkstreams.flatMap((stream, index) => [
  {
    id: `setup-${index + 1}`,
    title: stream.title,
    description: stream.output,
    workstream: stream.department,
    territory: stream.territory,
    owner: stream.ownerRole,
    reviewer: stream.reviewerRole ?? null,
    thirdParty: stream.thirdParty ?? null,
    status: index < 3 ? 'in_progress' : 'backlog',
    priority: index < 7 ? 'critical' : 'high',
    dueDate: null as string | null,
  },
]);

export const PROJECT_COUNT = portfolioProjects.length;
export const DAY_ONE_HEADCOUNT = teamPositions.filter((position) => position.phase === 'Day one').reduce((sum, position) => sum + position.headcount, 0);
export const FIRST_90_DAY_HEADCOUNT = teamPositions.filter((position) => position.phase !== 'Scale').reduce((sum, position) => sum + position.headcount, 0);
