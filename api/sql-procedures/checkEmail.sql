BEGIN

if id then
	select count(user_email) as count from users where user_email = email and user_id != id;
else
	select count(user_email) as count from users where user_email = email;
end if;

END
