-- B-05: חותמות זמן לתזכורות, כדי שה-cron היומי של md-api לא ישלח את אותו מייל פעמיים.
alter table public.md_entitlements add column if not exists reminded_trial_at timestamptz;
-- סוף התקופה שעליה כבר נשלחה תזכורת חידוש שנתי (סעיף 13א). תקופה חדשה = תזכורת חדשה.
alter table public.md_entitlements add column if not exists reminded_renewal_for timestamptz;
