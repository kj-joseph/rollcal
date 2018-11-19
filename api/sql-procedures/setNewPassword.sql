BEGIN

select u.user_id
into @id
from users u
	join forgotPassword fp
		on u.user_id = fp.forgot_user
where u.user_email = email
	and fp.forgot_code = vcode;

if @id = id then

	update users
	set user_password = sha2(password, 256)
	where user_id = id;

	delete from forgotPassword
	where forgot_user = id;

	select true as success;

else

	select false as success;

end if;

END
