BEGIN

select v.*, c.*, r.*, u.user_id, u.user_name
from venues v
	join users u
		on v.venue_user = u.user_id
	left join regions r
    	on v.venue_region = r.region_id
    left join countries c
    	on v.venue_country = c.country_code
where venue_user = user
order by venue_name;

END
