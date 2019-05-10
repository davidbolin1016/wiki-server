# Automated Personal Wiki - Server

## Summary

This is an Express server for my [Automated Personal Wiki](https://github.com/davidbolin1016/wiki-client) and a general description may be found there.

## API documentation

### POST /api/login

For user login. Requires a body with "username" and "password" as keys with appropriate string values.

Invalid login will receive a 400 response and an error message describing the problem.

Valid login will receive a 200 response with a body containing "authToken" with a jwt token as well as a "homepage" with the id of the user's personal homepage. 

### POST /api/refresh

Returns a refreshed jwt token.

### POST /api/pages

For submitting a new page. Requires a body with "page_name" and "page_content" as strings. A valid submission will receive a 201 response with a body containing "page_id" with the numerical id for the new page.

### GET /api/pages/:page_id

For retrieving a particular page. Returns page with all attributes, namely: "id", "user_id", "page_name", "page_content", "date_created", and "date_modified". This will return 401 unauthorized if the user requests a page that does not belong to them.

### DELETE /api/pages/:page_id

For deleting a page. Returns 204 if successful, 401 unauthorized if page does not belong to user.

### PATCH /api/pages/:page_id

For updating a page. Requires a body with page_name, page_content, or both. This will automatically update "date_modified".

### POST /api/users

For creating a new user. Requires a body with "username" and "password" as strings. The password must have both letters and numbers. Will return 400 with an error message if username is taken, one of the fields is missing, or the password is invalid.

### GET /api/users

For retrieving current username and homepage id using a valid jwt token, mainly in order for the client to refresh state if the browser page is reloaded. Response body contains "home_page_id" (a number) and "username".