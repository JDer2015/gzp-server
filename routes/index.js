var express = require('express');
const md5 = require('blueimp-md5')
const {UserModel,ChatModel} = require('../db/models')

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
                res.send({code:0,data:{_id:user._id,username,type}})
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

//保存路由
router.post('/update',function (req,res) {
    const userid = req.cookies.userid
    if(!userid){
        return res.send({code:1,msg:'请先登录'})
    }
    UserModel.findByIdAndUpdate({_id:userid},req.body,function (err,user) {
        const {_id, username, type} = user
        const data = Object.assign(req.body,{_id, username, type})
        res.send({code: 0, data})
    })


})

//自动登录
router.get('/user',function (req,res) {
    const userid = req.cookies.userid
    if(!userid){
        return res.send({code:1,msg:'请先登录'})
    }
    UserModel.findOne({_id:userid},filter,function (err,user) {
        return res.send({code:0,data:user})
    })
})

//获取用户列表
router.get('/userlist',function (req,res) {
    const type = req.query.type
    UserModel.find({type},filter,function (err,users) {
        return res.json({code:0,data:users})
    })
})

//
router.get('/msglist',function (req,res) {
    const userid = req.cookies.userid
    UserModel.find(function (err,docs) {
        let users = {}
        docs.forEach(doc=>{
            users[doc._id] = {username:doc.username,header:doc.header}
        })
        ChatModel.find({'$or':[{from:userid},{to:userid}]},function (err,chatMsgs) {
            console.log(chatMsgs)
            return res.send({code:0,data:{users,chatMsgs}})
        })
    })
})
module.exports = router;
