require('dotenv').load();
const cool = require('cool-ascii-faces');
const express = require('express');
//const stripJs = require('strip-js');
//const bcrypt = require('bcrypt');
const path = require('path');
const PORT = process.env.PORT;
const week09logic = require('./week09logic.js');
const week10logic = require('./week10logic.js');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
// week 09 render the form page
  .get('/week09', (req, res) => res.render('pages/week09form.ejs'))
// handle the form
  .get('/getRate', week09logic.getRate)
// week 10 project 2 account creation page and checking page
//  .get('/createShopper', week10logic.createShopper)
//  .get('/authenticateShopper', week10logic.authenticateShopper)
// project 2 proof of concept
  .get('/week10', (req, res) => res.render('pages/week10signin.ejs'))
  .post('/week10authenticate', week10logic.authenticateShopperPost)
  .get('/week10table', week10logic.exampleTable)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
