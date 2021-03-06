BEGIN

select ch.change_id, ch.changed_item_id, ch.change_submitted, ch.change_object,
	ch.change_user, u.user_name as change_user_name,
    v.*, c.*, r.*, tz.*

from changes ch
	join users u
		on ch.change_user = u.user_id
    left join venues v
		on ch.changed_item_id = v.venue_id
    left join countries c
    	on v.venue_country = c.country_code
    left join regions r
    	on v.venue_region = r.region_id
    left join timezones tz
    	on v.venue_timezone = tz.timezone_id

where ch.changed_item_type = "venue"
	and change_status = "submitted"
	-- and u.user_id != user
	and ch.change_id = changeId;

END
