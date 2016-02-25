/**
 * 文件模块服务层,该文件暂时没有用到
 * @type {*|exports|module.exports}
 */
var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var qiniu = require('qiniu');
var fs = require('fs');     // fs为nodejs的核心模块
var RestMsg = require('../../common/restmsg');

// 配置公钥和私钥
qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;


function FileService(){

}

/**
 * 获取上传凭证
 * @type {FileService}
 */
FileService.uptoken = function() {
    var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);
    return uptoken.token();
}

/**
 * 文件上传
 * @type {FileService}
 * params localFile: 需要上传的文件的路径， uptoken: 上传凭证， key: 上传文件名
 */
FileService.fileUpload = function(localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    var msg = new RestMsg();
    // 串行控制，使用async来控制流程  七牛返回信息---》业务服务器---》客户端
    async.series([
        function(cb) {
            qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
                if (!err) {
                    // 上传成功， 处理返回值
                    msg.successMsg();
                    msg.setResult({
                        "key": ret.key,
                        "hash": ret.hash,
                    });
                } else {
                    // 上传失败， 处理返回代码
                    msg.errorMsg(err);
                }
                cb(null, msg);
            });
        },
        function(cb) {
            cb(null, msg);
        },
    ]);
    // TODO 七牛返回的参数不能在这儿放回给客户端，只有将这个文件合并
    return msg;
}

module.exports = FileService;