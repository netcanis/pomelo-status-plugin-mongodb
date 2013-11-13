pomelo-status-plugin-mongodb
====================

Modify original pomelo-status-plugin:

1, use mongodb to save user information with more attributes

2, can push message by organization or group

3, based on mongodb document saving, can easily extend more function

pomelo-status-plugin is a plugin for pomelo, it can be used in pomelo(>=0.6).

pomelo-status-plugin provides global status service for pomelo, which uses persistent storage to save users information.

##Installation

```
npm install pomelo-status-plugin
```

##Usage

```
var status = require('pomelo-status-plugin-mongodb');

app.use(status, {status: {
  dbHost:"127.0.0.1",
  dbPort:27017,
  dbName:"test",
  dbUser:"testuser",
  dbPassword:"123"
}});

```

##modify support org and groups
in StatusService.prototype.on_bind_session

```
  userInfoObj.orgs = [{orgId:"o1"}, {orgId:"o2"}];//TODO: get orgs by your business
  userInfoObj.groups = [{groupId:"g1"}, {groupId:"g2"}];//TODO: get groups by your business

```

##API

###pushByUids(uids, route, msg, cb)
####Arguments
+ uids - array of user ids
+ route - route string
+ msg - messages would be sent to clients
+ cb - callback function

####Return
+ err - error
+ fails - array of failed to send user ids

###pushByOrg(orgId, route, msg, cb)
####Arguments
+ orgId - organization id
+ route - route string
+ msg - messages would be sent to clients
+ cb - callback function

####Return
+ err - error

###pushByGroup(groupId, route, msg, cb)
####Arguments
+ groupId - group id
+ route - route string
+ msg - messages would be sent to clients
+ cb - callback function

####Return
+ err - error

