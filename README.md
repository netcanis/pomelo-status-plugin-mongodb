pomelo-status-plugin-mongodb
====================

Modify original pomelo-status-plugin:

1, use mongodb to save user information with more attributes
2, can push message by organization or group
3, based on mongodb document saving, can easily extend more function.

pomelo-status-plugin is a plugin for pomelo, it can be used in pomelo(>=0.6).

pomelo-status-plugin provides global status service for pomelo, which uses persistent storage to save users information.

##Installation

```
npm install pomelo-status-plugin
```

##Usage

```
var status = require('pomelo-status-plugin');

app.use(status, {status: {
  host: '127.0.0.1',
  port: 6379
}});

```

##API

###getSidsByUid(uid, cb)
get frontend server id by user id
####Arguments
+ uid - user id
+ cb - callback function

####Return
+ err - error
+ list - array of frontend server ids

###pushByUids(uids, route, msg, cb)
####Arguments
+ uids - array of user ids
+ route - route string
+ msg - messages would be sent to clients
+ cb - callback function

####Return
+ err - error
+ fails - array of failed to send user ids

##Notice

status plugin use redis as a default persistent storage, you can change it with your own implementation. 

```
var status = require('pomelo-status-plugin');
var mysqlStatusManager = require('./mysqlStatusManager');

app.use(status, {status: {
  host: '127.0.0.1',
  port: 6379,
  channelManager: mysqlStatusManager
}});

```
