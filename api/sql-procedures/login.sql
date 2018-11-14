BEGIN

select user_id, user_email, user_roles, user_name from users
where user_email = email
	and user_password = sha2(password, 256)
	and user_status = "active";

END
