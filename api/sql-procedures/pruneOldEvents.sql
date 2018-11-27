BEGIN

declare finished boolean default false;
declare event_id mediumint unsigned;
declare event_user mediumint unsigned;

declare event_cursor cursor for
	select e.event_id, e.event_user
	from events e
		join (
			select eventday_event, min(eventday_datetime) event_first_day, max(eventday_datetime) event_last_day
			from eventdays group by eventday_event
			) ed
			on ed.eventday_event = e.event_id
	where ed.event_last_day < date_sub(now(), interval 1 week);

declare continue handler for not found set finished = true;

declare exit handler for SQLEXCEPTION
	begin
		get diagnostics condition 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		select @sqlstate, @errno, @text;
		rollback;
	end;


open event_cursor;

delete_event: loop
	fetch event_cursor into event_id, event_user;
	if finished then
		leave delete_event;
	end if;

	call deleteEvent(event_id, event_user);
end loop delete_event;

close event_cursor;

END
