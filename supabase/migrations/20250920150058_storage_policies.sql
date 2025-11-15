-- Public can read product images
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Public can view lookbooks
create policy "Public can view lookbooks"
on storage.objects for select
using (bucket_id = 'lookbooks');

-- Users can manage their own uploads
create policy "Users can upload to user-uploads"
on storage.objects for insert
with check (
  bucket_id = 'user-uploads' and auth.role() = 'authenticated'
);

create policy "Users can read their own uploads"
on storage.objects for select
using (
  bucket_id = 'user-uploads' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own uploads"
on storage.objects for delete
using (
  bucket_id = 'user-uploads' and auth.uid()::text = (storage.foldername(name))[1]
);
