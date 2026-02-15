alter policy "Enable all actions for users based on user_id"
on "public"."{table_name}"
to authenticated
using (
     (( SELECT auth.uid() AS uid) = user_id)
);