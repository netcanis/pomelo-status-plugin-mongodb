var DefaultStatusManager = require('../manager/statusManager');
var utils = require('../util/utils');
var util = require('util');
var logger = require('pomelo-logger').getLogger(__filename);
var mongoosedb = require('mongoose');
var dbSchema = mongoose.Schema;

var ST_INITED = 0;
var ST_STARTED = 1;
var ST_CLOSED = 2;

var DEFAULT_PREFIX = 'POMELO:STATUS';

var userInfoSchema = new Schema({
  uid:{ type: String, index: true },
  frontendId:String,
  orgs:[String],
  groups:[String],
//  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now }
});

var StatusService = function(app, opts) {
  this.app = app;
  this.opts = opts || {};
  this.prefix = opts.prefix || DEFAULT_PREFIX;
  this.host = opts.host;
  this.port = opts.port;
  this.dbHost = opts.dbHost;
  this.dbPort = opts.dbPort;
  this.dbName = opts.dbName;
  this.dbUser = opts.dbUser;
  this.dbPassword = opts.dbPassword;
  this.mongoose = null;
  this.state = ST_INITED;
};

module.exports = StatusService;

StatusService.prototype.start = function(cb) {
  if(this.state !== ST_INITED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  this.mongoose = mongoosedb.createConnection("mongodb://" + this.dbUser + ":" + this.dbPassword + "@" + this.dbHost + ":" + this.dbPort + "/" + this.dbName);
  this.mongoose.on('error', function(error) {
    console.log(error);
  });

  this.mongoose.model('userInfo', userInfoSchema);

  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

StatusService.prototype.stop = function(cb) {
  this.state = ST_CLOSED;

  if(this.mongoose) {
    this.mongoose.disconnect();
    this.mongoose = null;
  }
  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

StatusService.prototype.on_bind_session = function(session, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('on_bind_session: invalid state'));
    return;
  }

  var uid = session.uid || "";
  var frontendId =  session.frontendId || "";

  if(uid == "" || frontendId == ""){
    utils.invokeCallback(cb, new Error('on_bind_session: invalid session uid or frontendId'));
    return;
  }

  var userInfoModel = this.mongoose.model('userInfo');
  var userInfoObj;
  userInfoObj.uid = uid;
  userInfoObj.frontendId = frontendId;
  userInfoObj.orgs = [{orgId:"o1"}, {orgId:"o2"}];//TODO: get orgs by your business
  userInfoObj.groups = [{groupId:"g1"}, {groupId:"g2"}];//TODO: get groups by your business

  userInfoModel.findOneAndUpdate({uid: uid}, userInfoObj, {upsert:true}, function (err) {
    if (err)
      console.log('save userInfoObj error');
  });

  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

StatusService.prototype.on_close_session = function(session, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('on_close_session: invalid state'));
    return;
  }

  var uid = session.uid || "";
  var frontendId =  session.frontendId || "";

  if(uid == "" || frontendId == ""){
    utils.invokeCallback(cb, new Error('on_close_session: invalid session uid or frontendId'));
    return;
  }

  var userInfoModel = this.mongoose.model('userInfo');
  userInfoModel.findAndRemove({uid: uid});

  process.nextTick(function() {
    utils.invokeCallback(cb);
  });
};

StatusService.prototype.getRecordsByUids = function(uids, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  var userInfoModel = this.mongoose.model('userInfo');
  var records = [];
  userInfoModel.find().where('userInfo.uid').in(uids).exec(function (err, results) {
    var ret = results || [];
    if(ret == []){
      utils.invokeCallback(cb, new Error('getRecordsByUids: results is empty'));
    }
    else{
      for(var i=0; i< ret.length; i++) {
        records.push({uid: ret[i].uid, sid: ret[i].frontendId});
      }
      utils.invokeCallback(cb, null, records);
    }
  });
};


StatusService.prototype.pushByUids = function(uids, route, msg, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }
  var channelService = this.app.get('channelService');

  self.getRecordsByUids(uids,function (err, records) {
    if (err) {
      utils.invokeCallback(cb, new Error('pushByUids: cannot find records'));
      return;
    }
    channelService.pushMessageByUids(route, msg, records, cb);
  });
};

StatusService.prototype.getRecordsByOrg = function(orgId, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  var userInfoModel = this.mongoose.model('userInfo');
  var records = [];
  userInfoModel.find({"orgs":{"$elemMatch":{"orgId":orgId}}}).exec(function (err, results) {
    var ret = results || [];
    if(ret == []){
      utils.invokeCallback(cb, new Error('getRecordsByOrg: results is empty'));
    }
    else{
      for(var i=0; i< ret.length; i++) {
        records.push({uid: ret[i].uid, sid: ret[i].frontendId});
      }
      utils.invokeCallback(cb, null, records);
    }
  });
};


StatusService.prototype.pushByOrg = function(orgId, route, msg, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }
  var channelService = this.app.get('channelService');

  self.getRecordsByOrg(orgId,function (err, records) {
    if (err) {
      utils.invokeCallback(cb, new Error('pushByOrg: cannot find records'));
      return;
    }
    channelService.pushMessageByUids(route, msg, records, cb);
  });
};

StatusService.prototype.getRecordsByGroup = function(groupId, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }

  var userInfoModel = this.mongoose.model('userInfo');
  var records = [];
  userInfoModel.find({"groups":{"$elemMatch":{"groupId":groupId}}}).exec(function (err, results) {
    var ret = results || [];
    if(ret == []){
      utils.invokeCallback(cb, new Error('getRecordsByGroup: results is empty'));
    }
    else{
      for(var i=0; i< ret.length; i++) {
        records.push({uid: ret[i].uid, sid: ret[i].frontendId});
      }
      utils.invokeCallback(cb, null, records);
    }
  });
};


StatusService.prototype.pushByGroup = function(groupId, route, msg, cb) {
  if(this.state !== ST_STARTED) {
    utils.invokeCallback(cb, new Error('invalid state'));
    return;
  }
  var channelService = this.app.get('channelService');

  self.getRecordsByGroup(groupId,function (err, records) {
    if (err) {
      utils.invokeCallback(cb, new Error('pushByGroup: cannot find records'));
      return;
    }
    channelService.pushMessageByUids(route, msg, records, cb);
  });
};

