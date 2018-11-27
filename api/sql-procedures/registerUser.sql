BEGIN

insert into users (user_name, user_email, user_password, user_validation_code)
values (username, email, sha2(password, 256), vcode);

select true;

END
