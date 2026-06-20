-- Add image_url column to products table (keep emoji for fallback)
alter table products
  add column if not exists image_url text;

-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public access to read product images
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Allow authenticated users (admin) to upload product images
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
