BEGIN

delete from forgotPassword
where forgot_submitted < date_sub(now(), interval 1 day);

END
