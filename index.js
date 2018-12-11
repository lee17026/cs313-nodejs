require('dotenv').load();
//const cool = require('cool-ascii-faces');
let express = require('express');
const stripJs = require('strip-js');
const bcrypt = require('bcrypt');
const path = require('path');
const PORT = process.env.PORT;
//const week09logic = require('./week09logic.js');
//const week10logic = require('./week10logic.js');
let bodyParser = require('body-parser');
let session = require('express-session');
let { Pool } = require("pg");
let connectionString = process.env.DATABASE_URL;
let pool = new Pool({connectionString: connectionString});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(session({
        secret: 'my secret string', // secret for signing session ID cookie
        resave: false, // session will not be resaved if no changes are made
        saveUninitialized: true, // new but unmodified sessions will still be saved
        cookie: { secure: false, // only set to true if we can use https
                  maxAge: 7200000} // 2 hours
      }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
//  .get('/', (req, res) => res.render('pages/index'))
//  .get('/cool', (req, res) => res.send(cool()))
// week 09 render the form page
//  .get('/week09', (req, res) => res.render('pages/week09form.ejs'))
// handle the form
//  .get('/getRate', week09logic.getRate)
// week 10 project 2 account creation page and checking page
//  .get('/createShopper', week10logic.createShopper)
//  .get('/authenticateShopper', week10logic.authenticateShopper)
// project 2 proof of concept
//  .get('/week10', (req, res) => res.render('pages/week10signin.ejs'))
//  .post('/week10authenticate', week10logic.authenticateShopperPost)
//  .get('/week10table', week10logic.exampleTable)
// week 12
  .get('/', (req, res) => res.sendFile(path.join(__dirname+'/views/pages/week12.html')))
  .post('/login', (req, res) => {
    console.log("Here we are in POST /login.");
    let username = stripJs(req.body.username);
    let rawPassword = stripJs(req.body.password);
    console.log(`Username == ${username} and rawPassword == ${rawPassword}.`); // don't do this in real life

    // prepare the sql statement and parameters
    let sql = 'SELECT id, password FROM shopper WHERE username = $1::text';
    let params = [username];

    // fire the query
    pool.query(sql, params, function (error, result) {
      if (error || result.rows.length == 0) {
        // this username might not exist
        console.log(`I think the username: ${username} does not exist.`);
        res.json({success: false});
      } else {
        console.log('Username found! Preparing to compare passwords.');
        // username was found so let's compare the password
        let hashedPassword = result.rows[0]['password'];
        let shopperID = result.rows[0]['id'];
        bcrypt.compare(rawPassword, hashedPassword, function (error, bResult) {
          if (bResult) {
            // passwords match!
            console.log('Come on in! The password is a match.');
            // keep track of our username and id (from shopper table)
            req.session.username = username;
            req.session.shopperID = shopperID;

            res.json({success: true});
          } else {
            // passwords do not match!
            console.log("The password was wrong. Uh oh.");
            res.json({success: false});
          }
        }); // end of bcyrpt.compare()
      } // end of else
    }); // end of pool.query()
  })
  .post('/addItem', (req, res) => {
    console.log("Here we are in POST /addItem.");
    let name = String(req.body.name);
    let brand = String(req.body.brand);
    let netWeight = Number(req.body.netWeight);
    let price = Number(req.body.price);
    let unitID = Number(req.body.unitID);
    let storeID = Number(req.body.storeID);
    let protein = Number(req.body.protein);
    let calories = Number(req.body.calories);
    let shopperID = req.session.shopperID;
  
    // convert units for gram_net_weight
    let gramNetWeight = netWeight;
    if (unitID == 3) { // ounce!
      gramNetWeight *= 28.3495;
    } else if (unitID == 5) { // pound!
      gramNetWeight *= 453.592;
    }

    // prepare the sql statement and parameters
    let sql = "INSERT INTO item (name, brand, net_weight, price, unit_id, store_id, protein, calorie, shopper_id, gram_net_weight) VALUES ($1::text, $2::text, $3, $4, $5::int, $6::int, $7::int, $8::int, $9::int, $10)";
    let params = [name, brand, netWeight, price, unitID, storeID, protein, calories, shopperID, gramNetWeight];
    console.log(params);

    // fire the query
    pool.query(sql, params, function (error, result) {
      if (error) {
        // could not insert new item
        res.json({success: false});
      } else {
        // inserted new item!
        res.json({success: true});
      } // end of else
    }); // end of pool.query()
  })
  .post('/getAllItems', (req, res) => {
    // prepare the sql statement and parameters
    let sql = 'SELECT i.name, i.brand, i.net_weight, i.price, u.name AS unit, s.name AS store, i.protein / i.price AS protein_per_dollar, i.calorie / i.price AS calorie_per_dollar, i.price / i.gram_net_weight AS unit_price FROM item i JOIN store s ON (i.store_id = s.id) JOIN unit u ON (i.unit_id = u.id) ORDER BY name';

    // fire the query
    pool.query(sql, function (error, results) {
      if (error || results.rows.length == 0) {
        // this is unlikely to happen, or maybe the database is gone
        console.log("Something went wrong in /getAllItems");
        res.json({success: false});
      } else {
        console.log('All items found!');
        res.json({success: true, "results": results});
      } // end of else
    }); // end of pool.query()
  })
  .post('/getFilteredItems', (req, res) => {
    console.log("Just entered POST /getFilteredItems.");
    let name = String(req.body.name);
    let brand = String(req.body.brand);
    let storeID = Number(req.body.storeID);
    console.log(name, brand, storeID);
  
    // prepare the sql statement and parameters
    let sql = 'SELECT i.name, i.brand, i.net_weight, i.price, u.name AS unit, s.name AS store, i.protein / i.price AS protein_per_dollar, i.calorie / i.price AS calorie_per_dollar, i.price / i.gram_net_weight AS unit_price FROM item i JOIN store s ON (i.store_id = s.id) JOIN unit u ON (i.unit_id = u.id)';
    let params = new Array();
    let numParams = 0;
  
    // append filter variable if needed
    if (name != null && name != '') {
      //sql += " WHERE i.name ILIKE '%" + name + "%'";
      //numParams++;
      sql += " WHERE i.name ILIKE $" + (++numParams).toString() + "::text";
      params.push('%' + name + '%');
    }
    if (brand != null && brand != '') {
      if (numParams > 0) {
        sql += " AND";
      } else {
        sql += " WHERE";
      }
      //sql += " i.brand ILIKE '%" + brand + "%'";
      //numParams++;
      sql += " i.brand ILIKE $" + (++numParams).toString() + "::text";
      params.push('%' + brand + '%');
    }
    if (storeID > 0) {
      if (numParams > 0) {
        sql += " AND";
      } else {
        sql += " WHERE";
      }
      sql += " s.id = $" + (++numParams).toString() + "::int";
      params.push(storeID);
    }
  
  console.log("About to query: ");
  console.log(sql);
  console.log(params);

    // fire the query
    pool.query(sql, params, function (error, results) {
      if (error || results.rows.length == 0) {
        // error or no results match
        console.log("Something went wrong in /getFilteredItems. Maybe no rows were returned.");
        console.log(error);
        res.json({success: false});
      } else {
        console.log('Filtered list created!');
        res.json({success: true, "results": results});
      } // end of else
    }); // end of pool.query()
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
