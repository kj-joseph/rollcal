BEGIN

select ch.change_id, ch.changed_item_id, ch.change_submitted, ch.change_object, ch.change_user,
	u.user_name as change_user_name, e.*

from changes ch
	join users u
		on ch.change_user = u.user_id
	left join
		(select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name,
			(select group_concat(ft.feature_type_code, '-', f.feature_id) as list
			        from features f, feature_types ft, event_features ef
			        where ef.feature = f.feature_id
			            and ft.feature_type_id = f.feature_type
			            and ef.event = e.event_id
			    ) as event_features
		from events e, countries c, users u, timezones tz,
			(select * from venues left outer join regions on region_id = venue_region) as vr
		where venue_id = event_venue and country_code = venue_country
			and event_user = user_id and timezone_id = venue_timezone
		) as e
		on ch.changed_item_id = e.event_id

where ch.changed_item_type = "event"
	and change_status = "submitted"
	-- and u.user_id != user
	and ch.change_id = changeId;

END
