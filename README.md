# Group Control

Internal portfolio operations, delivery and CRM workspace for iTechLounge's UK, German and international projects.

The application now includes:

- A 104-project canonical portfolio register.
- UK/Germany staffing and responsibilities.
- An auditable operations board for employees, agents, advisers and third parties.
- Editable CRM accounts with contacts, deals, activity history and eight-stage client onboarding.
- Compliance and corporate-registration registers with risk, review, due-date and renewal tracking.
- Third-party/provider actions, evidence, dependencies, qualification needs and renewals.
- A management action centre combining overdue and upcoming CRM, compliance, provider and operating work.
- Editable hiring status and filled headcount against the UK, Germany and group staffing plan.
- Native-style mobile navigation, touch controls, responsive cards, bottom-sheet forms and safe-area support.
- An installable web-app manifest for a standalone mobile experience.
- Separate gated marketing and sales planning.
- Existing project, task, cost, infrastructure, integration, QA and reporting modules.
- A development-only login shortcut that pre-fills the local admin account.

See [the full operating model](docs/PORTFOLIO_OPERATING_MODEL.md) for the complete team, UK/Germany setup, client onboarding, third-party and per-project launch requirements.

## Local setup

```sh
npm install
npm run dev
```

Apply all Supabase migrations before using the CRM workspaces. Internal operations records are visible only to staff roles; administrators and project managers can edit them, while finance and viewer roles are read-only and partner accounts cannot access the portfolio-wide CRM data.

If a staff member reports missing access, an administrator should open **Users & Roles**, edit that user and assign the narrowest suitable role plus only the projects they need. User Management itself is administrator-only.

Deploy the authenticated `invite-staff-user` Supabase Edge Function before inviting new staff. It uses the project-provided Supabase service-role environment variable on the server; never place that key in browser environment variables.

The development login shortcut is compiled only when `import.meta.env.DEV` is true. It pre-fills `admin@groupcontrol.app` / `Admin123!`; the account itself must exist in the development Supabase project. Never create or use this credential in production.

## Project info

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
