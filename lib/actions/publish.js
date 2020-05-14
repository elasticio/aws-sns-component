var Q = require('q');
var elasticio = require('elasticio-node');
var messages = elasticio.messages;
var AWS = require('aws-sdk');


exports.process = processAction;

/**
 *  This method will be called from elastic.io platform providing following data
 *
 * @param msg
 * @param cfg
 */
function processAction(msg, cfg) {
  var self = this;
  var accessKeyId = cfg.accessKeyId;
  var accessKeySecret = cfg.accessKeySecret;
  var topic = cfg.topicArn;
  var message = msg.body.message || JSON.stringify(msg.body);

  self.logger.info('Started processing with cfg=%j', cfg);

  AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: accessKeySecret,
    region: cfg.region || 'eu-west-1'
  });

  var sns = new AWS.SNS();

  function pushMessage() {
    var params = {
      Message: message,
      TopicArn: topic
    };
    self.logger.info('About to publish message params=%j', params);
    return Q.ninvoke(sns, 'publish', params);
  }

  function sendResponse(response) {
    self.logger.info('Received response respose=%j', response);
    var data = messages.newMessageWithBody(response);
    self.emit('data', data);
  }

  function emitError(e) {
    self.logger.info('Oops! Error occurred');
    self.emit('error', e);
  }

  function emitEnd() {
    self.logger.info('Finished execution');
    self.emit('end');
  }

  Q().then(pushMessage).then(sendResponse).fail(emitError).done(emitEnd);

}
