const Q = require('q');
const AWS = require('aws-sdk');
const { messages } = require('elasticio-node');

/**
 *  This method will be called from elastic.io platform providing following data
 *
 * @param msg
 * @param cfg
 */
function processAction(msg, cfg) {
  const self = this;
  const { accessKeyId, accessKeySecret } = cfg;
  const topic = cfg.topicArn;
  const message = msg.body.message || JSON.stringify(msg.body);

  this.logger.debug('Started processing with cfg=%j', cfg);

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
    this.logger.debug('About to publish message params=%j', params);
    return Q.ninvoke(sns, 'publish', params);
  }

  function sendResponse(response) {
    this.logger.debug('Received response respose=%j', response);
    const data = messages.newMessageWithBody(response);
    self.emit('data', data);
  }

  function emitError(e) {
    this.logger.info('Oops! Error occurred');
    self.emit('error', e);
  }

  function emitEnd() {
    this.logger.info('Finished execution');
    self.emit('end');
  }

  Q().then(pushMessage).then(sendResponse).fail(emitError)
    .done(emitEnd);
}

exports.process = processAction;
