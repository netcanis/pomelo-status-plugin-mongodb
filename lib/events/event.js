var statusService = require('../service/statusService');
var logger = require('pomelo-logger').getLogger(__filename);

var Event = function(app) {
	this.app = app;
  this.statusService = app.get('statusService');
};

module.exports = Event;

Event.prototype.bind_session = function(session) {
	this.statusService.on_bind_session(session, function(err) {
    if(!!err) {
      logger.error('statusService add user failed: [%s] [%s], err: %j', session.uid, session.frontendId, err);
      return;
    }
  });
};

Event.prototype.close_session = function(session) {
  this.statusService.on_close_session(session, function(err) {
    if(!!err) {
      logger.error('failed to kick user in statusService: [%s] [%s], err: %j', session.uid, session.frontendId, err);
      return;
    }
  });
};