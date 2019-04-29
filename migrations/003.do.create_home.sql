CREATE TABLE home_pages (
  id SERIAL PRIMARY KEY,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  home_page_id int REFERENCES pages(id) ON DELETE RESTRICT
);

