const express = require('express');
const bodyParser = require('body-parser');
// const request = require('request');
const https = require('https');

const dotEnv = require("dotenv").config();
// console.log(process.env.API_Key);

var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){
  res.sendFile(__dirname + "/signup.html");
});

app.post('/', function(req, res){
  // 解析提交的数据
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  // console.log(firstName + lastName + '\n' + email);

  // 按邮件订阅服务器api文档的要求，构建要post的数据
  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ],
    update_existing: true // update existing member
  };
  const jsonData = JSON.stringify(data);

  // request方法的参数：url，post请求，鉴权APIKey
  const url = 'https://us19.api.mailchimp.com/3.0/lists/c4e01751f6';
  const options = {
    // hostname: "us19.api.mailchimp.com",
    // path: "/3.0/lists/c4e01751f6",
    method: "POST",
    auth: process.env.API_Key
  };

  // create a post request for the external server 向邮件订阅服务器发post请求
  const request = https.request(url, options, function(response){
    // console.log(typeof(response.statusCode));
    if(response.statusCode===200){
      res.sendFile(__dirname + '/success.html');
    } else {
      res.sendFile(__dirname + '/failure.html');
    }

    response.on('data', function(d){
      console.log(JSON.parse(d));
    });
  });

  // Use the above defined request to write json data into Mailchimp 使用请求，向邮件订阅服务器写数据
  request.write(jsonData);
  request.end(); // 结束post请求
});

app.post('/failure', function(req, res){
  res.redirect('/');
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Server is running ...');
});