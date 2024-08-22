const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');


const app = express();
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.text());

app.use(
  express.json(),
  express.urlencoded({
    extended: true,
  })
);


// Make the session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

//Browse pets
app.get("/browse_pets", (req, res) => {
  res.render("pets");
});

//Find cat/dog
app.get("/find_cat_dog", (req, res) => {
  const { search, data } = req.query;
  let pets = [];

  var isSearch = false
  if (search === 'true') {
    isSearch = true;
    try {
      pets = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse data:', e);
    }
  }  
    
  res.render('find_cat_dog', { pets,isSearch });
});

//Dog care
app.get("/dog_care", (req, res) => {
  res.render("dog_care_page");
});

//Cat care
app.get("/cat_care", (req, res) => {
  res.render("cat_care_page");
});

//Pet Give Away
app.get("/pet_give_away", (req, res) => {
  res.render("pet_give_away");
});

//Contact us
app.get("/contact_us", (req, res) => {
  res.render("contact_us");
});

//Login/Create Account
app.get("/authenticate", (req, res) => {
  res.render("login_create_account");
});

//
app.post("/submit_form", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (req.body.action == "create") {

    if (!isValidUsername(username)) {
      res.send(
        '<script>alert("Please enter a valid username."); window.history.back();</script>'
      );
    }
    else if (doesUsernameExist(username)) {
      res.send(
        '<script>alert("This username is already taken."); window.history.back();</script>'
      );
    } else if (!isValidPassword(password)) {
      res.send(
        '<script>alert("Please enter a valid password."); window.history.back();</script>'
      );
    } else {
      createAccount(username, password);
      res.send(
        '<script>alert("Your account has been created and you can log in now. Just change the option to Login and press Submit"); window.history.back();</script>'
      );
    }
  } else {
    if (!isValidUsername(username)) {
      res.send(
        '<script>alert("Please enter a valid username."); window.history.back();</script>'
      );
    } else if (!isValidPassword(password)) {
      res.send(
        '<script>alert("Please enter a valid password."); window.history.back();</script>'
      );
    } else if (!doesUsernameExist(username)) {

      res.send(
        '<script>alert("There username does not exist."); window.history.back();</script>'
      );
      res.render("login_create_account");
    } else if (!doesPasswordMatch(username, password)) {

      res.send(
        '<script>alert("Your password is incorrect, please try again"); window.history.back();</script>'
      );
    } else {
      //start session
      req.session.username = username
      req.session.password = password
      req.session.loggedin = true
      res.render("login_create_account");
    }
  }
});

app.post('/log_out', (req, res) => {
  req.session.loggedin = false;
  req.session.username = ""
  req.session.password = ""

  res.redirect('/authenticate');
})

app.post('/give_pet_away', (req, res) => {

  try {
    const fileContent = fs.readFileSync('pet_info.txt', 'utf8');
    const lines = fileContent.split('\n');
    
    const data = (lines.length)+":"+req.session.username +":"+ req.body;
    
    fs.appendFile("pet_info.txt", data + "\n", (err) => {});

} catch (err) {
    console.error("Error reading file:", err);
}
})

app.post('/filter_pets', (req, res) => {
  // Read the data from the file
fs.readFile('pet_info.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Split the data into lines
  const lines = data.split('\n').filter(line => line.trim() !== '');

  // Filter the data based on the criteria
  const filteredData = filterAndFormatData(req.body, lines);

  const queryParams = new URLSearchParams({
    search: 'true',
    data: JSON.stringify(filteredData)
  });

  return res.send({
    queryParams: queryParams.toString(),
 });
});
})

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatGetAlong(getAlongArray) {
  return getAlongArray.map(item => item.split('_').map(word => capitalizeFirstLetter(word)).join(' ')).join(', ');
}

function compareArrays(arr1, arr2) {
  return arr1.every((element, index) => {
    if (element === 'Does not matter') {
      return true; // Skip checks if the criteria is "Does not matter"
    }
    if (Array.isArray(element)) {
      // If the element is an array, check if all items in the criteria array are included in the data array
      return element.every(e => arr2[index].includes(e));
    } else {
      // Otherwise, check for a direct match
      return element === arr2[index];
    }
  });
}

// Function to filter data based on the criteria
function filterAndFormatData(criteria, data) {
  return data.filter(line => {
    const parsedLine = line.split(':');
    // Extract fields, adjusting to include the description
    const petType = parsedLine[2];
    const breed = parsedLine[3];
    const age = parsedLine[4];
    const getAlong = parsedLine[5].split(',');
    return compareArrays(criteria, [petType, breed, age, getAlong]);
  }).map(line => {
    let parsedLine = line.split(':');
    let id = parsedLine[0]; // Extract the ID (first character of the line)
    let petType = capitalizeFirstLetter(parsedLine[2]);
    let breed = parsedLine[3].split('(')[0].trim();
    let age = parsedLine[4];
    let getAlong = formatGetAlong(parsedLine[5].split(','));
    let description = parsedLine[6]; // Extract the description (remaining part of the line)

    return {
      id,
      petType,
      breed,
      age,
      getAlong,
      description
    };
  });
}


function isValidUsername(username) {
  //Check username validity
  var usernamePattern = /^[a-zA-Z0-9]+$/;
  return username.length > 1 && usernamePattern.test(username);
}

function isValidPassword(password) {
  //Check username validity
  var passwordPattern = /^[a-zA-Z0-9]{4,}$/;
  return (
    passwordPattern.test(password) &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function doesUsernameExist(usernameToCheck) {
  try {
      const fileContent = fs.readFileSync('login.txt', 'utf8');
      const lines = fileContent.split('\n');
      
      for (let line of lines) {
          const [username, password] = line.split(':');
          
          if (username === usernameToCheck) {
              return true;
          }
      }
      
      return false;
  } catch (err) {
      console.error("Error reading file:", err);
      return false;
  }
}
   
function createAccount(username, password) {
  let write_options = {
    encoding: "utf-8",
    flag: "w",
    mode: 0o666,
  };

  fs.appendFile("login.txt", username + ":" + password + "\n", (err) => {});
}

function doesPasswordMatch(usernameToCheck, passwordToCheck){

  try {
    const fileContent = fs.readFileSync('login.txt', 'utf8');
    const lines = fileContent.split('\n');
    
    for (let line of lines) {
        const [username, password] = line.split(':');
        
        if (username === usernameToCheck) {
          if(password === passwordToCheck){
            return true;
          } else {
            return false;
          }
        }
    }
    
    return false;
} catch (err) {
    console.error("Error reading file:", err);
    return false;
}
};

app.listen(3000, () => {
  console.log("Server running on port 3000");
});