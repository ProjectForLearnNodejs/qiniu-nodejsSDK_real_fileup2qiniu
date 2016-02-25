
var crypto = require('crypto');

crypto.sha1Hash = function(str, addSalt) {
    var salt = (addSalt) ? new Date().getTime() : "";
    return crypto.createHmac('sha1', salt + "").update(str + "").digest('hex');
}

crypto.md5Hash = function(str) {
    return crypto.createHash('md5').update(str + "").digest('hex');
}

module.exports = crypto;