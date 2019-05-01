UPDATE pages
SET date_modified = date_created
WHERE date_modified IS NULL;


