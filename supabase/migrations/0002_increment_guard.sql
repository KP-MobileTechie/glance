-- Guard increment_theme_use to only increment public themes.
-- Private or non-existent theme IDs are silent no-ops: the WHERE clause
-- filters them out so calling clients cannot probe for private theme IDs
-- or inflate counts on themes they do not own.
create or replace function increment_theme_use(theme_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update themes
  set use_count = use_count + 1
  where id = theme_id
    and is_public = true;
$$;
