# Full portfolio and client lifecycle

This model separates the work required to launch a portfolio product from the work required to onboard and operate each customer of that product.

## Record hierarchy

1. **Portfolio project** — for example Dishbee or Merqano.
2. **Direct client** — the contracting customer of that project.
3. **Sub-client** — a franchisee, merchant, managed customer or business beneath the direct client.
4. **Site or branch** — an individual restaurant, shop, venue, office or operating location.

Every client and sub-client remains linked to the portfolio project delivering the service. A parent account is optional, allowing direct customers and multi-level client structures.

## Portfolio project master brief

Each project records:

- approved brand name and slogan;
- plain-English service description;
- business plan and milestones;
- target customers and users;
- the single paying side and pricing model;
- primary territory;
- owning legal entity;
- trademark status;
- UI/UX approval status;
- features and functionality approval status;
- launch owner.

## Project lifecycle gates

| Workstream        | Required controls                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Strategy          | Project details, business plan, customers, payer, pricing, territory, delivery, risks and milestones                 |
| Brand             | Name, slogan, colours, fonts, logo, favicon, social graphics, app-store graphics and usage rules                     |
| Product           | UI/UX approval, accessibility, feature scope, roles, permissions, acceptance criteria and deferred scope             |
| Build             | SaaS/web build, persistent data, dashboards, configuration, native/Capacitor builds, signing and permissions         |
| Testing           | Unit, integration, E2E, RLS/role, browser, device, accessibility, security, privacy, regression and UAT evidence     |
| Legal             | Legal owner, trading name, incorporation, domains, DNS, SSL, trademarks, classes, territories and renewals           |
| Compliance        | Product classification, regulators, permissions, policies, terms, privacy, cookies, consent, retention and DSAR      |
| Marketing         | SEO, content, PPC, analytics, directories, social channels, direct mail, visits, calls, events, agents and referrals |
| Sales             | Ideal customer, lead sources, scripts, calls, visits, demos, proposals, targets, handover and cross-selling          |
| Client operations | Commercial onboarding, KYB/KYC, compliance onboarding, setup, migration, training, acceptance and support            |
| Integrations      | Provider contract, named owner, credentials, sandbox, webhooks, API tests, production approval and renewal           |
| Communications    | Email addresses, SPF/DKIM/DMARC, sender templates, phone numbers, WhatsApp, routing and consent                      |
| Finance           | Pricing, tax, invoicing, payments, reconciliation, refunds, failed payments and reporting                            |
| Administration    | Registers, statutory calendar, documents, suppliers, insurance, renewals and access records                          |
| People            | Roles, hiring, checks, contracts, payroll, onboarding, training, performance and offboarding                         |

Each gate has an owner, reviewer, status, priority, deadline, evidence and approval state. Approval-required work must be submitted to the separate approval queue. The approver’s identity, decision time and decision note are retained.

## Client and sub-client onboarding

Every new client automatically receives:

1. Signed agreement and approved pricing.
2. Business, owner and representative verification.
3. Risk, sanctions, licence and regulatory assessment.
4. Privacy, data-processing, consent and retention agreement.
5. Account, user, role, branch and product configuration.
6. Data import, mapping, validation and deletion controls.
7. Merchant IDs, payments, third-party credentials, endpoints and webhook testing.
8. Email, telephone and WhatsApp setup.
9. Staff training and acceptance evidence.
10. Client UAT covering roles, workflows, payments, alerts, reporting and mobile devices.
11. Formal go-live approval.
12. Support, adoption, incidents, compliance reviews and renewal.
13. Permission-aware cross-selling and referral attribution.

The same plan applies to downstream businesses. Sites and branches record trading/legal names, location, local manager, contact channels, external references, operating status and target go-live date.

## Administration, finance and HR

### Administration

- UK and German entity and statutory filing calendars.
- Company, licence, insurance, domain and trademark renewals.
- Document ownership, versions, signatures and evidence.
- Supplier, adviser and authority records.
- System access, equipment and leaver removal.

### Finance

- Bookkeeping and bank/payment-provider reconciliation.
- Management accounts, cash forecasting and runway.
- Accounts payable, receivable and credit control.
- Corporation Tax, VAT, PAYE, German tax and payroll calendars.
- Client trials, subscriptions, invoices, settlements, refunds and failed payments.
- Budget, cost, revenue and management reporting.

### HR and people

- Approved organisation structure, role and headcount.
- Recruitment, candidates, offers and qualification checks.
- Identity, right-to-work, contracts and background checks.
- Payroll, equipment, policies, training and least-privilege access.
- Objectives, performance, absence and mandatory training.
- Offboarding, equipment return and immediate access removal.

Finance users can read only finance records. HR and general administration remain restricted to administrators and project managers. All changes are audited; operational records are archived rather than hard-deleted.

## Operating rhythm

- **Daily:** overdue work, blocked onboarding, incidents and pending approvals.
- **Weekly:** launch readiness, client pipeline, go-lives, third-party blockers, sales, marketing and cash collection.
- **Monthly:** management accounts, statutory calendar, access review, HR review, compliance renewals and portfolio prioritisation.
- **Per release:** scope approval, build evidence, security/privacy test, client UAT, release approval, rollback plan and post-release review.
