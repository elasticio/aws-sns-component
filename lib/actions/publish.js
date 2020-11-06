const Q = require('q');
const { messages } = require('elasticio-node');
const AWS = require('aws-sdk');

/**
 *  This method will be called from elastic.io platform providing following data
 *
 * @param msg
 * @param cfg
 */
function processAction(msg, cfg) {
  const self = this;
  const { accessKeyId, accessKeySecret } = cfg.accessKeyId;
  const topic = cfg.topicArn;
  const message = msg.body.message || JSON.stringify(msg.body);

  self.logger.info('Started publish action...');

  AWS.config.update({
    accessKeyId,
    secretAccessKey: accessKeySecret,
    region: cfg.region || 'eu-west-1',
  });

  const sns = new AWS.SNS();

  function pushMessage() {
    const params = {
      Message: message,
      TopicArn: topic,
    };
    self.logger.info('About to publish message...');
    return Q.ninvoke(sns, 'publish', params);
  }

  function sendResponse(response) {
    self.logger.info('Response received');
    const data = messages.newMessageWithBody(response);
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

  Q().then(pushMessage)
    .then(sendResponse)
    .fail(emitError)
    .done(emitEnd);
}

exports.process = processAction;
