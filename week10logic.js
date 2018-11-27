module.exports = {
  createShopper: (req, res) => {
    const stripJs = require('strip-js');
    const bcrypt = require('bcrypt');
    console.log('createShopper called.');
    
    // get user input
    let rawUsername = stripJs(req.query.username);
    let rawPassword = stripJs(req.query.password);
    console.log(`User is attempting to create ${ rawUsername } with password ${ rawPassword }.`);
    
    // treat usernames as lowercase to preserve uniqueness
    var username = rawUsername.toLowerCase();
    // hash the password
    let numRounds = 6;
    bcrypt.hash(rawPassword, numRounds, function (err, hash) {
      // set up our database connection
      const { Pool } = require("pg");
      // this bad boy will allow heroku to define this connectionString
      const connectionString = process.env.DATABASE_URL;
      // pass in the connectionString as a JSON
      const pool = new Pool({connectionString: connectionString});
      
      // prepare the sql statement and parameters
      let sql = 'INSERT INTO shopper (username, password) VALUES ($1::text, $2::text)';
      let params = [username, hash];
      
      // fire the insert statement!
      pool.query(sql, params, function (error, result) {
        if (error) {
          console.log('ERROR: ' + error);
        }
        console.log('New shopper row created.');
      }); // end of pool.query()
    }); // end of bcrypt.hash()
}, // end of createShopper()
  
  authenticateShopper: (req, res) => {
    const stripJs = require('strip-js');
    const bcrypt = require('bcrypt');
    console.log('authenticateShopper called.');
    
    // get user input
    let rawUsername = stripJs(req.query.inputUsername);
    let rawPassword = stripJs(req.query.inputPassword);
    console.log(`User is attempting to authenticate ${ rawUsername } with password ${ rawPassword }.`);
    
    // treat usernames as lowercase to preserve uniqueness
    var username = rawUsername.toLowerCase();
    
    // time to pull up the password
    const { Pool } = require("pg");
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({connectionString: connectionString});

    // prepare the sql statement and parameters
    let sql = 'SELECT password FROM shopper WHERE username = $1::text';
    let params = [username];
    
    // fire the query
    pool.query(sql, params, function (error, result) {
      if (error || result.rows.length == 0) {
        // this username might not exist
        console.log(`I think the username: ${ rawUsername } does not exist.`);
      } else {
        console.log('Username found! Preparing to compare passwords.');
        // username was found so let's compare the password
        let hashedPassword = result.rows[0]['password'];
        bcrypt.compare(rawPassword, hashedPassword, function (error, result) {
          if (result) {
            // passwords match!
            console.log('Come on in! The password is a match.');
          } else {
            // passwords do not match!
            console.log('Wrong password my friend!');
          }
        }); // end of bcyrpt.compare()
      } // end of else
    }); // end of pool.query()
}, // end of authenticateShopper
  
  authenticateShopperPost: (req, res) => {
    const stripJs = require('strip-js');
    const bcrypt = require('bcrypt');
    const qs = require('querystring');
    console.log('authenticateShopperPost called.');
    
    var body = '';
    
    // build the input data
    req.on('data', function (data) {
      body += data;
      
      // safeguard against massive amounts of data
      if (body.length > 1e6)
        req.connection.destroy();
    }); // end of req.on()
    
    // now we can handle the POSTed data
    req.on('end', function () {
      const post = qs.parse(body);
      console.log(post);
      
      // get user input
      let rawUsername = stripJs(post['inputUsername']);
      let rawPassword = stripJs(post['inputPassword']);
      console.log(`User is attempting to authenticate ${ rawUsername } with password ${ rawPassword }.`);
      
      // treat usernames as lowercase to preserve uniqueness
      var username = rawUsername.toLowerCase();

      // time to pull up the password
      const { Pool } = require("pg");
      const connectionString = process.env.DATABASE_URL;
      const pool = new Pool({connectionString: connectionString});

      // prepare the sql statement and parameters
      let sql = 'SELECT password FROM shopper WHERE username = $1::text';
      let params = [username];

      // fire the query
      pool.query(sql, params, function (error, result) {
        if (error || result.rows.length == 0) {
          // this username might not exist
          console.log(`I think the username: ${ rawUsername } does not exist.`);
        } else {
          console.log('Username found! Preparing to compare passwords.');
          // username was found so let's compare the password
          let hashedPassword = result.rows[0]['password'];
          bcrypt.compare(rawPassword, hashedPassword, function (error, result) {
            if (result) {
              // passwords match!
              console.log('Come on in! The password is a match.');
              res.statusCode = 302;
              res.setHeader("Location", "/week10table");
              res.end();
            } else {
              // passwords do not match!
              console.log('Wrong password my friend!');
            }
          }); // end of bcyrpt.compare()
        } // end of else
      }); // end of pool.query()
    }); // end of req.on()
}, // end of authenticateShopperPost
  
  exampleTable: (req, res) => {
    console.log('exampleTable called.');
    
    // get our table
    const { Pool } = require("pg");
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({connectionString: connectionString});
    
    // sql time
    let sql = "SELECT i.name, s.name AS store, i.price, i.protein FROM item i JOIN store s ON (i.store_id = s.id)";
    pool.query(sql, function (error, result) {
      if (error) {
        console.log("Error.", error.stack);
      } else {
        res.render('pages/week10table.ejs', {
          results: result.rows
        });
      }
    }); // end of pool.query()
    
} // end of exampleTable
};