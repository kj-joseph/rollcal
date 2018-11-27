BEGIN

insert into forgotPassword (forgot_user, forgot_code)
	values (user,  code)
    on duplicate key update forgot_code = code;

END
