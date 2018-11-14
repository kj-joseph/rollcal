BEGIN

select ch.change_id, ch.changed_item_id, ch.change_submitted, ch.change_object, ch.change_user,
	u.user_name as change_user_name, e.*

from changes ch
	join users u
		on ch.change_user = u.user_id
	left join
		(select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name,
			(select group_concat(distinct derbytype_id) as list
				from derbytypes dt, event_derbytypes edt
				where edt.event = e.event_id
				and edt.derbytype = dt.derbytype_id
				order by dt.derbytype_id
			) as derbytypes,
			(select group_concat(distinct sanction_id) as list
				from sanctions s, event_sanctions es
				where es.event = e.event_id
				and es.sanction = s.sanction_id
				order by s.sanction_id
			) as sanctions,
			(select group_concat(distinct track_id) as list
				from tracks t, event_tracks et
				where et.event = e.event_id
				and et.track = t.track_id
				order by t.track_id
			) as tracks
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
