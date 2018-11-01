BEGIN

delete
from changes
where changed_item_id = id
	and changed_item_type = "event";

insert
into changes
	(changed_item_id, changed_item_type, change_user, change_object)
values (id, "event", user, changeObject);

END
