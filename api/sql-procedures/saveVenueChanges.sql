BEGIN

if id > 0 then
	delete
	from changes
	where changed_item_id = id
		and changed_item_type = "venue"
		and change_status = "submitted";
end if;

insert
into changes
	(changed_item_id, changed_item_type, change_user, change_object)
values (id, "venue", user, changeObject);

END
