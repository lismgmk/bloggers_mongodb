db = db.getSiblingDB('admin');
// move to the admin db - always created in Mongo
db.auth('root', 'example');
// log as root admin if you decided to authenticate in your docker-compose file...
db = db.getSiblingDB('bloggers_posts');
// create and move to your new database
db.createUser({
  user: 'root',
  pwd: 'example',
  roles: [
    {
      role: 'readWrite',
      db: 'bloggers_posts',
    },
  ],
});
// user created
db.createCollection('blogs');
db.createCollection('users');
// add new collection
