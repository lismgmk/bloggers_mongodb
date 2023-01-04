// admin = db.getSiblingDB('admin');
// admin.createUser({
//   user: 'root',
//   pwd: 'example',
//   customData: { description: 'DB SuperAdmin' },
//   roles: [
//     { role: 'dbOwner', db: 'admin' },
//     { role: 'dbAdminAnyDatabase', db: 'admin' },
//     { role: 'userAdmin', db: 'admin' },
//     { role: 'root', db: 'admin' },
//   ],
// });

// db = db.getSiblingDB('bloggers_posts');
// db.auth('root', 'example');

// db.createCollection('blogs');
// db.createCollection('users');
// первый вариант
db = db.getSiblingDB('admin');
db.createUser({
  user: 'root',
  pwd: 'example',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    'readWriteAnyDatabase',
  ],
});

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

// ./data/db/mongo -username root --password example --authenticationDatabase bloggers_posts --host mongo --port 27017
// mongo --host mongodb0.example.com:28015
// cat ~/.mongodb/mongosh/63b49e1ff7c0cee8a839c22c_log
// 63b49e1ff7c0cee8a839c22c

// docker exec --tty $(docker ps -aqf "name=bloggers_nest_1") mongo -p example  -u root  --eval "db=db.getSiblingDB('bloggers_posts');db.createCollection('default');db.default.insert({default:'defualt'});
// try{db.createUser({
//   user: 'root',
//   pwd: 'example',
//   roles: [{ role: \"readWrite\", db: \"bloggers_posts\" }]
// });}catch(err){if(!String(err).includes('already exists')){throw err}}"