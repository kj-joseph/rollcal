BEGIN

if id then
	select count(user_name) as count from users where user_name = username and user_id != id;
else
	select count(user_name) as count from users where user_name = username;
end if;

END
