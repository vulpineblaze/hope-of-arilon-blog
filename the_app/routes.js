const crypto = require("crypto");

module.exports = function(app, passport, db) {


  app.get('/', (req, res, next) => {
    var db_user="";
    var req_user="";
    var auth = false;
    
    if (req.isAuthenticated()) {
      db.collection('user').find().toArray((err, result) => {
        if (err) return console.log(err)
        db_user = result[0].user;
        // console.log("db_user:"+db_user);
        if(req.user){
          req_user = req.user.emails[0].value;
        }
        console.log("Found users: "+db_user+", and: "+req_user);
        if(db_user==req_user){
          auth=true;
        }
      });
      
    }
    var the_date = new Date().toISOString().replace(/T.+/, ' ').replace(/\..+/, '');
    // console.log("the_date:"+the_date);
    db.collection('hoa').find({"title" : {"$lt": the_date}}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('index.ejs', {hoa: result, auth:auth})
    })
  })

  app.get('/latest', (req, res, next) => {
    db.collection('hoa').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.redirect("/#"+result[result.length-1].title)
    })
  })

  app.get('/detail-:guid', (req, res) => {
    var db_user="";
    var req_user="";
    var auth = false;
    
    if (req.isAuthenticated()) {
      db.collection('user').find().toArray((err, result) => {
        if (err) return console.log(err)
        db_user = result[0].user;
        // console.log("db_user:"+db_user);
        if(req.user){
          req_user = req.user.emails[0].value;
        }
        console.log("Found users: "+db_user+", and: "+req_user);
        if(db_user==req_user){
          auth=true;
        }
      });
      
    }  
    db.collection('hoa').find({guid:req.params.guid}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('detail.ejs', {hoa: result, auth:auth})
    })
  })

  app.post('/hoa', (req, res) => {
    const id = crypto.randomBytes(16).toString("hex");
    req.body.guid = id.substring(0,7);
    db.collection('hoa').save(req.body, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
    })
  })

  app.post('/update-:guid', (req, res) => {
    db.collection('hoa')
    .findOneAndUpdate({guid: req.params.guid}, {
      $set: {
        title: req.body.title,
        text: req.body.text,
        guid: req.params.guid
      }
    }, {
      sort: {_id: -1}
    }, (err, result) => {
      if (err) return res.send(err)
      // res.send(result)
      res.redirect('/')
    })
  })

  // app.put('/hoa', (req, res) => {
  //   db.collection('hoa')
  //   .findOneAndUpdate({name: 'Yoda'}, {
  //     $set: {
  //       name: req.body.name,
  //       quote: req.body.quote
  //     }
  //   }, {
  //     sort: {_id: -1},
  //     upsert: true
  //   }, (err, result) => {
  //     if (err) return res.send(err)
  //     res.send(result)
  //   })
  // })

  // app.delete('/hoa', (req, res) => {
  //   db.collection('hoa').findOneAndDelete({guid: req.body.guid}, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('A darth vadar quote got deleted')
  //   })
  // })

  app.get('/delete-:guid', (req, res) => {
    db.collection('hoa').findOneAndDelete({guid: req.params.guid}, (err, result) => {
      if (err) return res.send(500, err)
      res.redirect('/')
    })
  })


  app.get('/logout', function(req, res){
    console.log('logging out');
    req.logout();
    res.redirect('/');
  })

  // we will call this to start the GitHub Login process
  app.get('/auth/github', passport.authenticate('github'));

  // app.get('/auth/github', function(req, res, next){
  //     req.passport.authenticate('github')(req, res, next);
  // });

  // GitHub will call this URL
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res, next) {
      res.redirect('/protected');
    }
  );



  app.get('/auth/google', passport.authenticate('google',{ scope : ['profile', 'email'] }));
  // app.get('/auth/google', passport.authenticate('google',{scope: 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}));

  app.get('/auth/google/callback', passport.authenticate('google', { 
            failureRedirect: '/',
            successRedirect : '/protected' })
  );



  app.get('/protected', ensureAuthenticated, function(req, res) {
    res.redirect('/')
  });


};



// Simple middleware to ensure user is authenticated.
// Use this middleware on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // req.user is available for use here
    return next(); }

  // denied. redirect to login
  res.redirect('/')
}