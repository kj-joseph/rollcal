BEGIN

select u.user_id, u.user_name
from users u
	join forgotPassword fp
		on u.user_id = fp.forgot_user
where u.user_email = email
	and fp.forgot_code = vcode;

END
