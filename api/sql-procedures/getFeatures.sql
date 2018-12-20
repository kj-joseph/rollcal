BEGIN

select f.*, ft.feature_type_code
from features f
	join feature_types ft
		on f.feature_type = ft.feature_type_id
order by ft.feature_type_code, f.feature_name;

select *
from feature_types ft
order by ft.feature_type_order;

END
