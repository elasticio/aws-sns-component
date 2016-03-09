module.exports = verify;

function verify(credentials, cb) {

    console.log('About to verify credentials');

    var accessKeyId = credentials.accessKeyId;
    var accessKeySecret = credentials.accessKeySecret;

    if (!accessKeyId || !accessKeySecret) {
        console.log('Invalid credentials');

        return cb(null, {verified: false});
    }

    console.log('Successfully verified credentials');

    cb(null, {verified: true});
}

