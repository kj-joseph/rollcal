BEGIN

select distinct user_id, user_email, user_name, user_status,
	group_concat(r.role_name separator ",") as user_roles
from users u
	left join user_roles ur
		on u.user_id = ur.user
	left join roles r
		on r.role_id = ur.role
where u.user_email like concat("%",search,"%")
	or u.user_id like concat("%",search,"%")
group by u.user_id
order by user_name;

END
