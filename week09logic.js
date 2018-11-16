module.exports = {
    getRate: (req, res) => {
      // begin by stripping the input
      let result = compute(req.query);
      let weight = req.query.weight;
      let type = req.query.type;
      console.log("week09logic.getRate called. Returning " + result);
      
      // convert type to a user friendly string
      switch (type) {
        case 'stamp':
          type = "stamped letter";
            break;

        case 'meter':
          type = "metered letter";
            break;
        
        case 'flats':
          type = "flat large envelope";
            break;
        
        case 'retail':
          type = "retail package";
            break;
    }

      // pass it over to our result page
        res.render('pages/week09result.ejs', {
            result: result,
            weight: weight,
            type: type
        });
    }
};

function compute(query) {
    let weight = Number(query.weight);
    let type = query.type;
  console.log("week09logic.compute called for weight "
             + weight
             + " and type "
             + type);
    let result;

  // get the rate based on weight and type
    switch (type) {
        case 'stamp':
            if (weight < 1.0) {
              result = 0.50;
            } else if (weight < 2.0) {
              result = 0.71;
            } else if (weight < 3.0) {
              result = 0.92;
            } else {
              result = 1.13;
            }
            break;

        case 'meter':
            if (weight < 1.0) {
              result = 0.47;
            } else if (weight < 2.0) {
              result = 0.68;
            } else if (weight < 3.0) {
              result = 0.89;
            } else {
              result = 1.10;
            }
            break;
        
        case 'flats':
            if (weight < 1.0) {
              result = 1.0;
            } else if (weight < 12.0) {
              result = 1.0 + Math.floor(weight) * 0.21;
            } else {
              result = 3.52;
            }
            break;
        
        case 'retail':
            if (weight < 4.0) {
              result = 3.5;
            } else if (weight < 8.0) {
              result = 3.75;
            } else if (weight < 12.0) {
              result = 3.75 + (Math.floor(weight) - 7) * 0.35;
            } else {
              result = 5.50;
            }
            break;
    }

    return result.toFixed(2);
}