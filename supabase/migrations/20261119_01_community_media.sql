-- C-13: a picture and a link on a forum post or a board announcement (owner, 19.11).
-- The picture lives in a public storage bucket, under the author's own folder; the link must be http(s).

alter table public.md_threads add column if not exists image_path text
  check (image_path is null or (char_length(image_path) <= 300 and image_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]+$'));
alter table public.md_threads add column if not exists link_url text
  check (link_url is null or (char_length(link_url) <= 500 and link_url ~* '^https?://'));

-- the bucket: public to read (the pictures are shown on the forum page), 5MB, pictures only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community', 'community', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- a member uploads only into a folder named by their own user id
drop policy if exists "community_upload_own" on storage.objects;
create policy "community_upload_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "community_delete_own" on storage.objects;
create policy "community_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'community' and (storage.foldername(name))[1] = auth.uid()::text);
