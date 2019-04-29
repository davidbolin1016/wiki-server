CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  page_name TEXT,
  page_content TEXT,
  date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_modified TIMESTAMP WITH TIME ZONE
);