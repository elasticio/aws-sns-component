/* eslint-disable consistent-return */
function verify(credentials, cb) {
  this.logger.info('About to verify credentials');

  const { accessKeyId, accessKeySecret } = credentials;

  if (!accessKeyId || !accessKeySecret) {
    this.logger.info('Invalid credentials');

    return cb(null, { verified: false });
  }

  this.logger.info('Successfully verified credentials');

  cb(null, { verified: true });
}

module.exports = verify;
