-- Atomic inventory usage logger for Savor
-- Run in Supabase SQL editor or via Supabase migrations.

create or replace function public.log_partial_usage(
  p_item_id uuid,
  p_amount_used numeric,
  p_action_type action_type_enum
)
returns void
language plpgsql
as $$
declare
  v_current numeric;
  v_next numeric;
  v_amount_changed numeric;
begin
  if p_amount_used is null or p_amount_used <= 0 then
    raise exception 'p_amount_used must be > 0';
  end if;

  select current_quantity
  into v_current
  from public.inventory
  where id = p_item_id
  for update;

  if not found then
    raise exception 'inventory item not found: %', p_item_id;
  end if;

  v_next := greatest(coalesce(v_current, 0) - p_amount_used, 0);

  v_amount_changed := case
    when p_action_type = 'consumed' then -p_amount_used
    else p_amount_used
  end;

  update public.inventory
  set current_quantity = v_next
  where id = p_item_id;

  insert into public.inventory_logs (item_id, amount_changed, action_type)
  values (p_item_id, v_amount_changed, p_action_type);
end;
$$;
