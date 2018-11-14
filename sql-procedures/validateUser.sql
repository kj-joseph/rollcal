BEGIN

select user_id
into @id
from users
where user_email = email
	and user_validation_code = vcode;

if @id then
	set @validated = true;
	update users
	set user_status = "active",
		user_validation_code = null
	where user_id = @id;
else
	set @validated = false;
end if;

select @validated as validated;

END
