/*
 * 文件上传下载处理
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');     // fs为nodejs的核心模块
var RestMsg = require('../../common/restmsg');
var multer = require('multer');
var fileService = require('../../services/file/fileuploadservice');
var qiniu = require('qiniu');

// 上传文件
// TODO multer 0.1.8 版本这样写，不方便控制上传， 高版本的multer测试使用不行（还没有找到原因！！）
router.post('/uploadtolocal', multer({
    dest: 'public/uploadfiles/' ,
    rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function (file, req, res) {
        console.log(file.originalname + ' is starting ...');
        var rm = new RestMsg();
        fs.readdir('public/uploadfiles/', function(err, files) {   // 判断是否重复上传文件
            var repeatFlag = false; // 文件重复标识位
            for (var i = 0; i < files.length; i++) {
                if (files[i] == file.originalname) {
                    repeatFlag = true;
                }
            }
            if(repeatFlag) {
                rm.errorMsg('请勿重复上传文件！');
                res.send(rm);
            }
        });
    },
    onFileUploadComplete: function (file, req, res) {
        var rm = new RestMsg();
        rm.successMsg();
        rm.setResult(req.files.file);
        res.send(rm);
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    },
    onError: function (error, next) {
        console.log(error)
        var rm = new RestMsg();
        rm.errorMsg(error);
        res.send(rm);
        next(error);
    }
}), function(req, res, next) {
    //默认存在mdfiles目录下
    if (!fs.existsSync('public/uploadfiles')) {
        fs.mkdirSync('public/uploadfiles');
    }
}).post('/uploadtoqiniu', function(req, res, next) {
    /*
     1、获取参数
     2、根据客户端指定的文件上传文件至七牛
     */
    var uptoken = fileService.uptoken();
    console.log('token'+uptoken);
    var fileArr = req.body.fileArr.split(',');   // 将获取的参数字符串转换为数组
    var extra = new qiniu.io.PutExtra();
    var msg = new RestMsg();
    /*for(var i=0; i<fileArr.length; i++) {
        // TODO 如果是多个文件上传，这儿的返回信息该怎么返回给客户端？？  暂时只考虑单个文件的上传
        msg = fileService.fileUpload('public/uploadfiles/'+fileArr[i], fileArr[i], uptoken);
    }
    res.send(msg);*/
    // TODO 暂时考虑只做单文件的上传
    qiniu.io.putFile(uptoken, fileArr[0], 'public/uploadfiles/'+fileArr[0], extra, function (err, ret) {
        // 将七牛返回的信息，返回给客户端
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
        // 将业务服务器上的文件删除
        fs.unlink('public/uploadfiles/'+fileArr[0], function(err){
            fs.exists('public/uploadfiles/'+fileArr[0], function(exists){
                console.log(exists ? "删除失败" : "删除成功");
            });
        });
        res.send(msg);
    });

});

module.exports = router;