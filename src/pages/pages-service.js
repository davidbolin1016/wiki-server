'use strict';

const PagesService = {
  addPage(db, newPage) {
    return db
      .insert(newPage)
      .into('pages')
      .returning('*')
      .then(([page]) => page);
  },
  setHomePage(db, user_id, home_page_id) {
    return db
      .insert({
        user_id, home_page_id
      })
      .into('home_pages')
      .returning('*')
      .then(([entry]) => entry);
  }
};

module.exports = PagesService;