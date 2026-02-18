-- Seed temporary mock exhibition photos
-- NOTE: This is mock data intended for staging/demo use and can be deleted later.

insert into exhibitions (
  title,
  description,
  location,
  start_date,
  end_date,
  image_url,
  is_active
)
select
  'Mock Exhibition Photo 1',
  null,
  null,
  null,
  null,
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1400&auto=format&fit=crop',
  true
where not exists (
  select 1 from exhibitions where title = 'Mock Exhibition Photo 1'
);

insert into exhibitions (
  title,
  description,
  location,
  start_date,
  end_date,
  image_url,
  is_active
)
select
  'Mock Exhibition Photo 2',
  null,
  null,
  null,
  null,
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1400&auto=format&fit=crop',
  true
where not exists (
  select 1 from exhibitions where title = 'Mock Exhibition Photo 2'
);

insert into exhibitions (
  title,
  description,
  location,
  start_date,
  end_date,
  image_url,
  is_active
)
select
  'Mock Exhibition Photo 3',
  null,
  null,
  null,
  null,
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1400&auto=format&fit=crop',
  true
where not exists (
  select 1 from exhibitions where title = 'Mock Exhibition Photo 3'
);

insert into exhibitions (
  title,
  description,
  location,
  start_date,
  end_date,
  image_url,
  is_active
)
select
  'Mock Exhibition Photo 4',
  null,
  null,
  null,
  null,
  'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1400&auto=format&fit=crop',
  true
where not exists (
  select 1 from exhibitions where title = 'Mock Exhibition Photo 4'
);

insert into exhibitions (
  title,
  description,
  location,
  start_date,
  end_date,
  image_url,
  is_active
)
select
  'Mock Exhibition Photo 5',
  null,
  null,
  null,
  null,
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&auto=format&fit=crop',
  true
where not exists (
  select 1 from exhibitions where title = 'Mock Exhibition Photo 5'
);
