function login() {
  var username = $("#inputUsername").val();
  var password = $("#inputPassword").val();

  var params = {
    username: username,
    password: password
  };
  
  // check for empty input
  if (hasEmpty(params)) {
    alertWarning("Unable to log in.");
  } else {
    $.post("/login", params, function(result) {
      if (result && result.success) {
        $("#div-login").hide();
        buildFullTable();
        $("#div-table").show();
        $("#div-new-item").show();
        $("#div-filter-form").show();
        clearAlerts();
      } else {
        alertWarning("Unable to log in.");
      }
    });
  }
}

function addItem() {
  var name = $("#inputName").val();
  var brand = $("#inputBrand").val();
  var netWeight = $("#inputNetWeight").val();
  var unitID = $("#inputUnit").val();
  var price = $("#inputPrice").val();
  var protein = $("#inputProtein").val();
  var calories = $("#inputCalories").val();
  var serving = $("#inputServing").val();
  var storeID = $("#inputStore").val();
  
  // handle some conversions
  protein *= serving;
  calories *= serving;

  var params = {
    name: name,
    brand: brand,
    netWeight: netWeight,
    unitID: unitID,
    price: price,
    protein: protein,
    calories: calories,
    storeID: storeID,
    serving: serving
  };

  if (hasEmpty(params)) {
    alertWarning("All fields for the new item are required.");
  } else if (netWeight == 0 || price == 0 || serving == 0) {
    alertWarning("Some numerical fields cannot be zero.");
  } else {
      $.post("/addItem", params, function(result) {
        if (result && result.success) {
          alertSuccess("New item was added.");
          buildFullTable();
        } else {
          alertWarning("Unable to add new item.");
        }
      });
  }
}

function buildFullTable() {
  $.post("/getAllItems", function(result) {
    if (result && result.success) {
      let tableHTML = buildTableHTML(result);
      $('#div-table').html(tableHTML);
    } else {
      $("#div-table").text("Uh oh");
    }
  });
}

// alert creators
function alertSuccess(message) {
  let alertHTML = '<div class="alert alert-success alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Success!</strong> ' + message + '</div>';
  $("#status").html(alertHTML);
}

function alertWarning(message) {
  let alertHTML = '<div class="alert alert-warning alert-dismissible"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Warning!</strong> ' + message + '</div>';
  $("#status").html(alertHTML);
}

function clearAlerts() {
  $('#status').html(null);
}

// checks if any parameters in the JSON are empty
function hasEmpty(params) {
  console.log(params);
  for (member in params) {
    if (params[member] == '' || params[member] == null) {
      console.log("Whoah hold on --", member, "is empty!");
      return true;
    }
  }
  console.log("None of the parameters are empty.");
  return false;
}

function clearItemFields() {
  $("div#div-new-item :input").each(function() {
    $(this).val('');
  });
  $("#inputUnit").val(2);
  $("#inputStore").val(1);
}

function filter() {
  var name = $("#inputFilterName").val();
  var brand = $("#inputFilterBrand").val();
  var storeID = $("#inputFilterStore").val();

  var params = {
    name: name,
    brand: brand,
    storeID: storeID
  };

  $.post("/getFilteredItems", params, function(result) {
    if (result && result.success) {
      let tableHTML = buildTableHTML(result);
      $('#div-table').html(tableHTML);
    } else {
      $("#div-table").text("No results for that filter set. Please try again.");
    }
  });
}

function clearFilterFields() {
  $("div#div-filter-form :input").each(function() {
    $(this).val('');
  });
  $("#inputFilterStore").val(0);
}

function buildTableHTML(result) {
  // build header
  var tableHTML = '<table class="table table-striped"><tr><th scope="col">Name</th><th scope="col">Brand</th><th scope="col">Store</th><th scope="col">Net Weight</th><th scope="col">Unit</th><th scope="col">Price</th><th scope="col">Unit Price ($/gram)</th><th scope="col">Grams Protein Per Dollar</th><th scope="col">Calories Per Dollar</th></tr>';
  // build each row
  $.each(result.results.rows, function(index, row) {
    tableHTML += "<tr><td>";
    tableHTML += row.name;
    tableHTML += "</td><td>";
    tableHTML += row.brand;
    tableHTML += "</td><td>";
    tableHTML += row.store;
    tableHTML += "</td><td>";
    tableHTML += row.net_weight;
    tableHTML += "</td><td>";
    tableHTML += row.unit;
    tableHTML += "</td><td>$";
    tableHTML += String((row.price).toFixed(2)).padStart(1,0);
    tableHTML += "</td><td>";
    tableHTML += (row.unit_price).toFixed(6);
    tableHTML += "</td><td>";
    tableHTML += (row.protein_per_dollar).toFixed(3);
    tableHTML += "</td><td>";
    tableHTML += (row.calorie_per_dollar).toFixed(3);
    tableHTML += "</td></tr>";
  });
  // finish it off
  tableHTML += '</table>';
  return tableHTML;
}