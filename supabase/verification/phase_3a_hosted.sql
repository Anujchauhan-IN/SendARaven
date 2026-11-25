select exists (
  select 1
  from pg_catalog.pg_trigger
  join pg_catalog.pg_class on pg_class.oid = pg_trigger.tgrelid
  join pg_catalog.pg_namespace as relation_namespace
    on relation_namespace.oid = pg_class.relnamespace
  join pg_catalog.pg_proc on pg_proc.oid = pg_trigger.tgfoid
  join pg_catalog.pg_namespace as function_namespace
    on function_namespace.oid = pg_proc.pronamespace
  where relation_namespace.nspname = 'auth'
    and pg_class.relname = 'users'
    and pg_trigger.tgname = 'on_auth_user_created_create_account_standing'
    and not pg_trigger.tgisinternal
    and pg_trigger.tgenabled = 'O'
    and pg_trigger.tgtype = 5
    and pg_trigger.tgnargs = 0
    and function_namespace.nspname = 'private'
    and pg_proc.proname = 'handle_new_auth_user'
    and pg_proc.pronargs = 0
    and pg_proc.prorettype = 'pg_catalog.trigger'::pg_catalog.regtype
    and pg_proc.prosecdef
) as phase_3a_auth_trigger_valid;
