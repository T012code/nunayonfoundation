-- my_access() only reads the caller's own admins row, which RLS already allows.
alter function public.my_access() security invoker;
