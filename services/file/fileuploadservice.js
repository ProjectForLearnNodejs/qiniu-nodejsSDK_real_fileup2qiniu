/**
 * �ļ�ģ������,���ļ���ʱû���õ�
 * @type {*|exports|module.exports}
 */
var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var qiniu = require('qiniu');
var fs = require('fs');     // fsΪnodejs�ĺ���ģ��
var RestMsg = require('../../common/restmsg');

// ���ù�Կ��˽Կ
qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;


function FileService(){

}

/**
 * ��ȡ�ϴ�ƾ֤
 * @type {FileService}
 */
FileService.uptoken = function() {
    var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);
    return uptoken.token();
}

/**
 * �ļ��ϴ�
 * @type {FileService}
 * params localFile: ��Ҫ�ϴ����ļ���·���� uptoken: �ϴ�ƾ֤�� key: �ϴ��ļ���
 */
FileService.fileUpload = function(localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    var msg = new RestMsg();
    // ���п��ƣ�ʹ��async����������  ��ţ������Ϣ---��ҵ�������---���ͻ���
    async.series([
        function(cb) {
            qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
                if (!err) {
                    // �ϴ��ɹ��� ������ֵ
                    msg.successMsg();
                    msg.setResult({
                        "key": ret.key,
                        "hash": ret.hash,
                    });
                } else {
                    // �ϴ�ʧ�ܣ� �����ش���
                    msg.errorMsg(err);
                }
                cb(null, msg);
            });
        },
        function(cb) {
            cb(null, msg);
        },
    ]);
    // TODO ��ţ���صĲ�������������Żظ��ͻ��ˣ�ֻ�н�����ļ��ϲ�
    return msg;
}

module.exports = FileService;