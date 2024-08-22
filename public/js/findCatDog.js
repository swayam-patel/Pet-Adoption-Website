const { response } = require("express")

function submitForm(){
    let form = document.forms["find_form"]

    let pet = form["pet"].value
    let breed = form["breed"].value
    let age = form["age"].value
    let gender = form["gender"].value
    // let getAlong = form["get_along"].value
    let getAlong = getCheckBoxValue("pet_suitablity")

    if (pet == "") {
        alert("Please select the type of the pet you want.")
    } else if (breed == "") {
        alert("Please select the pet breed you want.")
    } else if (age == ""){
        alert("Please select the pet's age range.")
    } else if (gender == ""){
        alert("Please select the gender of the pet you want.")
    } else if (getAlong.length < 1){
        alert("Please select whether it should get along with others.")
    } else {
        //Submit Form
        fetch('/filter_pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([pet,breed,age,getAlong])
            
        }).then(response => {

            response.json().then(json => {
               window.location = "/find_cat_dog?"+json.queryParams;
            });
        })
    }
}

function clearForm(){
    let form = document.getElementById("find_form")

    form.reset()
    window.location = "/find_cat_dog"
}
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