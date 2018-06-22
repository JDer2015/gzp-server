var express = require('express');
const md5 = require('blueimp-md5')
const {UserModel} = require('../db/models')

const filter = {password:0,__v:0}
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//注册路由
router.post('/register',function (req,res,next) {
    const {username,password,type} = req.body
    UserModel.findOne({username},function (err,user) {
        if(user){
          //注册失败
          res.send({code:1,msg:'此用户名已存在！'})
        }else{
            //注册成功，保存到数据库
            UserModel.create({username,password:md5(password),type},function (err,user) {
                res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
                res.send({code:0,data:{id:user._id,username,type}})
            })
        }
    })
})

//登录路由
router.post('/login',function(req,res,next){
    const {username,password} = req.body
    UserModel.findOne({username,password:md5(password)},filter,function (err,user) {
        if(user){
            res.cookie('userid',user._id,{maxAge:1000*60*60*24*7})
            res.send({code:0,data:user})
        }else{
            res.send({code:1,msg:'用户名或密码错误！'})
        }
    })
})
module.exports = router;
