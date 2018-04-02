// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

'use strict' // need this for 'let' to work 
 
const googleIms = require('google-ims');
 
let client = googleIms(process.env.GG_CX, process.env.GG_KEY);


const searchTerm = require('./models/searchTerm.js');

app.use(bodyParser.json());
app.use(cors());

var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       
 
var mongodbUri = 'mongodb://' + process.env.MLAB_USER +':'+ process.env.MLAB_PSW + '@ds113019.mlab.com:13019/image-search';
 

mongoose.connect(mongodbUri, options);
var conn = mongoose.connection; 

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

app.get("/api/recentsearchs/", (request, response) => {
  searchTerm.find({}, (err, data) => {
    response.json(data);
  });
});

app.get("/api/imagesearch/:searchVal*", (request, response) => {
  var { searchVal } = request.params;
  var { offset } = request.query;
  
  var data = new searchTerm({
    searchVal,
    searchDate: new Date()
  });

  data.save(err => {
    if (err) {
      console.log('error');
      response.send('error saving to db');
    }
    //response.json(data);
  });
  


  client.search(searchVal, {
      page: 1, // 10 results per page 
      size: 'large', // can be: icon, small, medium, large, xlarge, xxlarge, huge 
      safe: 'off', // high, medium, off 
      // these next three options don't seem to be working currently 
      imgType: 'face', // clipart, face, lineart, news, photo 
      colorType: 'color', // color, gray, mono 
      domColor: 'black', // black, blue, brown, gray, green, pink, purple, teal, white, yellow 
      dateRestrict: 'y[2]', // only show results from the last 2 years, can be d[#], w[#], m[#], y[#] for days, weeks, etc 
      fileType: 'png',
      gl: 'NZ', // country code for results, New Zealand in this case, http://www.spoonfork.org/isocodes.html 
      googlehost: 'google.co.nz', // google domain to use, in this case New Zealand 
      num: 100 // number of results per page, default 10 

  }).then(function (images) {
      images.forEach(function(i, e, a) {
          response.json(a)
      });
  });
 
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
