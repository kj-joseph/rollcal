BEGIN

select distinct user_id, user_email, user_name,
	group_concat(r.role_name separator ",") as user_roles
from users u
	left join user_roles ur
		on u.user_id = ur.user
	left join roles r
		on r.role_id = ur.role
where u.user_email = email
	and u.user_password = sha2(password, 256)
	and u.user_status = "active"
group by u.user_id;

END
