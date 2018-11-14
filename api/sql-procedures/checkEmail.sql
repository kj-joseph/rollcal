BEGIN

select count(user_email) as count from users where user_email = email;

END
