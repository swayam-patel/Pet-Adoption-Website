function submitForm(){
    
    let form = document.forms["give_pet"]

    let pet = form["pet"].value
    let breed = form["breed"].value
    let age = form["age"].value
    let getAlong = getCheckBoxValue("pet_suitablity")
    let description = form["pet_description"].value
    let firstName = form["first_name"].value
    let familyName = form["family_name"].value
    let email = form["email"].value

    if (pet == "") {
        alert("Please select the type of pet.")
    } else if (breed == "") {
        alert("Please select the pet breed.")
    } else if (age == ""){
        alert("Please select the pet's age range.")
    } else if (getAlong.length < 1){
        alert("Please select whether it should get along with others.")
    } else if (description == ""){
        alert("Please enter the description of the pet.")
    } else if (firstName == ""){
        alert("Please enter the owner's first name.")
    } else if (familyName == ""){
        alert("Please enter the owner's family name.")
    } else if (email == ""){
        alert("Please enter the email address.")
    } else if (!isValidEmail(email)){
        alert("Please enter a valid email address.")
    } else {
        fetch('/give_pet_away', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: pet+":"+breed+":"+age+":"+getAlong+":"+description+":"+firstName+":"+familyName+":"+email
            
        })  
        .catch((error) => {
            console.error('Error:', error);
            // Optionally, handle the error
        });
        alert("Your pet has been added to the list successfully")
        clearForm()
    }
}

const isValidEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };  

function getCheckBoxValue(elementName) {
    let checkboxes =
        document.getElementsByName(elementName);
    let result = []
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            result.push(checkboxes[i].value)
        }
    }
    return result;
}

function clearForm(){
    let form = document.getElementById("give_pet")

    form.reset()
}