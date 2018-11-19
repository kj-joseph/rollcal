BEGIN

select user_id, user_name
from users
where user_email = email
	and user_status = "active";

END
