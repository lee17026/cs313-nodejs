const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const week09logic = require('./week09logic.js');

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
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
