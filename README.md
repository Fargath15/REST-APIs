# Technologies Used

1. NodeJs
2. ExpressJs
3. RESTful APIs
4. Typescript
5. Postgresql

# Tables Used

User: user_id, user_name, email, mobile_number, password
Feed: feed_id, feed_name, feed_url, feed_description
User Role access: role_access_id, user_id, user_access_level, controller, feed_id
User Log: user_id, log_file

# Common Table

created_at, created_by, updated_at, updated_by

# User Types and Roles

1. Super Admin-
   a) There can be only 1 super Admin, and it has got access to every feed. Super admin can create other 2 types of users & manage them and provide the access to certain feeds. Super admin can perform CRUD operations on the feeds.
   b) Super admin can choose to provide "delete" access to admin on the feeds.
   c) It's the only one that can access the logs
2. Admin- can create/delete basic users & provide access to feeds which they have access, not other feeds. They can delete the feed only if they have the permission to do so. An admin can't create/update/delete other "admin" users
3. Basic users- can just read the feed details that the user has been provided the access to, not other feeds. They cannot access other users.

# Getting Started

1.  Firstly, npm to be installed.
2.  Then, tables can be created using npm run create-tables.
3.  Then, you can run the code using npm start.
4.  Super admin will be created on server startup.
5.  User info and credentials are configured as environment variables
6.  For authentication used Json Web Token(JWT) sign Method.
7.  Can create different user types with access to feeds by different users like "admin", "super-admin".
8.  Can perform CRUD operations on users by different users based on their roles.
9.  Can perform CRUD operations on feeds by different users based on their roles.
10. Can get the logs from the files

# Node Scheduler

Used node scheduler npm package to schedule a cron to auto delete the files which is older than 30 minutes.