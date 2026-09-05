-- Known launch traction imported as grouped accounts. These are operational
-- records, not booked revenue; teams should split them into individual legal
-- customers as names and contacts are verified.

WITH seed(name, account_type, territory, project_code, stage, volume_label, owner_label, next_action) AS (VALUES
  ('Three signed restaurant sites','client','UK','haccora-uk','Trial onboarding','3 sites','Client Onboarding Manager','Complete site, staff and HACCP configuration'),
  ('Restaurant opportunity pipeline','prospect','UK','haccora-uk','Qualified pipeline','30 sites','UK B2B Sales','Book demonstrations and confirm decision dates'),
  ('Cake franchise','client','UK','eventplanruk','Implementation planning','30 shops','Client Onboarding Manager','Agree franchise data, booking and rollout template'),
  ('Beauty studios','client','UK','eventplanruk','Trial onboarding','4 studios','UK B2B Sales','Confirm services, calendars and user access'),
  ('Gas Safe engineers, builders and property trades','prospect','UK','craftvaro-uk','Trial ready','Multiple trades','UK B2B Sales','Verify businesses and schedule onboarding'),
  ('Beauty salons','prospect','UK','stylesyncuk','Trial ready','6 salons','Client Onboarding Manager','Collect service menus, staff and opening hours'),
  ('Car dealers','prospect','UK','zivvouk','Trial ready','5 dealers','UK B2B Sales','Collect inventory feeds and dealer verification'),
  ('Live restaurant sites','client','UK','dishbee','Live','3 sites','Customer Success','Monitor orders, support and adoption'),
  ('Incoming restaurant sites','client','UK','dishbee','Onboarding','3 sites','Client Onboarding Manager','Menu, payment, till and ordering setup'),
  ('Driving instructors','prospect','UK','lessonahead','Trial ready','2 instructors','Client Onboarding Manager','Set up calendars, pupils and lesson workflows'),
  ('Childminders and families','prospect','UK','kinderstarsuk','Interest','Supply and demand','UK B2B Sales','Separate childminder onboarding from free family registration'),
  ('Accountancy firms','prospect','UK','taxnuvia','Trial ready','Multiple firms','UK B2B Sales','Confirm workflows, data scope and professional responsibilities'),
  ('Estate agencies','prospect','UK','gabley','Trial ready','Multiple agencies','UK B2B Sales','Verify agency details and configure branches'),
  ('Waste management and removal firms','prospect','UK','cirqiva','Trial ready','Multiple firms','UK B2B Sales','Verify licences, insurance, service areas and prices'),
  ('German launch prospecting','prospect','DE',NULL,'Pre-launch','Lead lists required','Germany Programme Manager','Localise materials and build verified sector lists')
)
INSERT INTO public.crm_accounts (name, account_type, territory, project_id, stage, volume_label, owner_label, next_action, notes)
SELECT seed.name, seed.account_type, seed.territory, projects.id, seed.stage, seed.volume_label, seed.owner_label, seed.next_action,
       'Seeded from the known launch pipeline. Replace grouped entries with verified individual accounts.'
FROM seed
LEFT JOIN public.projects ON projects.code = seed.project_code
WHERE NOT EXISTS (
  SELECT 1 FROM public.crm_accounts existing
  WHERE existing.name = seed.name
    AND existing.territory = seed.territory
    AND existing.project_id IS NOT DISTINCT FROM projects.id
);