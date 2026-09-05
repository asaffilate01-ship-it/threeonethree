-- Canonical project register reconciled from the investor portfolio plus the
-- additional named operating projects requested for Group Control.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS territory text NOT NULL DEFAULT 'INT'
  CHECK (territory IN ('UK','DE','INT','GROUP'));

WITH portfolio(code, name, territory) AS (VALUES
  ('haccora','HACCORA','DE'), ('kinderstars','KINDERSTARS','DE'), ('eventplanrger','EVENTPLANR','DE'),
  ('rettio','RETTIO','DE'), ('kiezio','KIEZIO','DE'), ('beratermarkt','BERATEMARKT','DE'),
  ('stellenxpert','STELLENXPERT','DE'), ('viazeno','VIAZENO','DE'), ('immoviq','IMMOVIQ','DE'),
  ('beinstandplus','BEINSTANDPLUS','DE'), ('traindirekt','TRAINDIREKT','DE'), ('zivvo','ZIVVO','DE'),
  ('omniqora','OMNIQORA','INT'), ('unipathway','UNIPATHWAY','INT'), ('zivvouk','ZIVVO UK','UK'),
  ('kinderstarsuk','KINDERSTARS UK','UK'), ('eventplanruk','EVENTPLANR UK','UK'), ('taxnuvia','TAXNUVIA','UK'),
  ('gabley','GABLEY','UK'), ('stylesyncuk','STYLESYNC UK','UK'), ('xpertjobs','XPERTJOBS','UK'),
  ('traderos','TRADEROS','UK'), ('amityos','AMITYOS','UK'), ('skillfinch','SKILLFINCH','UK'),
  ('formationgenie','FORMATION GENIE','UK'), ('merqano','MERQANO','INT'), ('stylesyncger','SCHONOVA','DE'),
  ('parkpunkt','PARKPUNKT','DE'), ('lawquo','LAWQUO','INT'), ('zoryn','ZORYN','DE'),
  ('marktpass','MARKTPASS','DE'), ('dishbee','DISHBEE','UK'), ('dubaitrips','DUBAITRIPS4U','INT'),
  ('marocways','MAROCWAYS','INT'), ('fleetsora','FLEETSORA','INT'), ('sharedbricks','SHAREDBRICKS','UK'),
  ('stemcoach','STEMCOACH','INT'), ('zorynnexus','ZORYN PAY','DE'), ('onyngo','ONYNGO','UK'),
  ('hmoflow','HMO FLOW','UK'), ('nafsi','NAFSI','INT'), ('haccora-uk','HACCORA UK','UK'),
  ('cirqiva','CIRQIVA','UK'), ('docuvera-de','DOKUVERA','DE'), ('docuvera-uk','DOKUVERA UK','UK'),
  ('bidlumo','BIDLUMO','INT'), ('saathera','SAATHERA','UK'), ('autohashi','AUTOHASHI','UK'),
  ('gableyretrofit','GABLEY RETROFIT','UK'), ('baytcircle','BAYTCIRCLE','INT'), ('taxcenda','TAXCENDA','INT'),
  ('nimah','NI''MAH','INT'), ('ilmvero','ILMVERO','INT'), ('dearnext','DEARNEXT','UK'),
  ('tareevo','TAREEVO','INT'), ('uzvoya','UZVOYA','INT'), ('recovrable','RECOVRABLE','UK'),
  ('merqora','MERQORA','INT'), ('lessonahead','LESSONAHEAD','UK'), ('motoresq','MOTORESQ','UK'),
  ('premisora','PREMISORA','UK'), ('hexareve','HEXARÊVE','UK'), ('bosporiva','BOSPORIVA','UK'),
  ('eastamira','EASTAMIRA','UK'), ('corazora','CORAZORA','INT'), ('fiftyroam','FIFTYROAM','INT'),
  ('canavelle','CANAVELLE','INT'), ('rangvaya','RANGVAYA','UK'), ('oceavela','OCEAVELA','INT'),
  ('savansea','SAVANSEA','UK'), ('nilevella','NILEVELLA','UK'), ('adrilume','ADRILUME','INT'),
  ('marelyra','MARELYRA','UK'), ('iberaviva','IBERAVIVA','INT'), ('euralume','EURALUME','INT'),
  ('farenivo','Farenivo','INT'), ('niyyahnoor','NIYYAHNOOR','INT'), ('travenexa','TraveNexa','INT'),
  ('craftvaro-uk','CRAFTVARO UK','UK'), ('craftvaro-de','CRAFTVARO','DE'), ('qiyavo','QIYAVO','INT'),
  ('criclume','CRICLUME','INT'), ('depotmesh','DepotMesh','INT'), ('pawivon','Pawivon','INT'),
  ('deskivon','Deskivon','INT'), ('formevyn','Formevyn','INT'), ('glowevyn','Glowevyn','INT'),
  ('fixorlyn','Fixorlyn','INT'), ('tripenvo','Tripenvo','INT'), ('drivaryn','Drivaryn','INT'),
  ('kidevia','Kidevia','INT'), ('gearivon','Gearivon','INT'), ('avenesto','Avenesto','INT'),
  ('tendryva','Tendryva','INT'), ('syndriva','Syndriva','INT'), ('kalethon','KALËTHON PLAY','UK'),
  ('auvaneone','AUVANE ONE','INT'), ('nearcura','NearCura','UK'), ('yetkiva','YETKIVA','INT'),
  ('affivon','AFFIVON','INT'), ('insure360','Insure360','UK'), ('domureva','Domureva','UK'),
  ('regulos','Regulos','INT'), ('fanzeno','Fanzeno','INT')
)
INSERT INTO public.projects (
  code, name, territory, short_description, industry, audience, revenue_model,
  stage, owner, is_active, notes
)
SELECT
  code,
  name,
  territory,
  'Portfolio project imported into Group Control. Complete the product, compliance, build, infrastructure, marketing, sales and support packs before launch.',
  'Portfolio',
  CASE territory WHEN 'UK' THEN 'United Kingdom' WHEN 'DE' THEN 'Germany' ELSE 'International' END,
  'Confirm the single paying side and approved pricing in the product plan',
  'inception'::public.project_stage,
  CASE territory WHEN 'UK' THEN 'UK Programme Manager' WHEN 'DE' THEN 'Germany Programme Manager' ELSE 'Portfolio Operations Director' END,
  true,
  'Source: reconciled investor portfolio and named operating projects. Do not store credentials in this record.'
FROM portfolio
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  territory = EXCLUDED.territory,
  is_active = true;
