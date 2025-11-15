create function is_admin(uid uuid)
returns boolean language sql stable as $$
  select role = 'admin' from profiles where id = uid;
$$;

create function is_customer(uid uuid)
returns boolean language sql stable as $$
  select role = 'customer' from profiles where id = uid;
$$;
