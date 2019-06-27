
/////////////////////////////////////////////////////////////////////////////////////
/////////////keys////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////


const zomatoApiKey = "fa98004f276593934a49dc034a5e717f";
const youtubeApiKey = 'AIzaSyD1RYnw85nJRJt6DSqi9gN9TYb3Enqyj80'; 
const searchURL = 'https://www.googleapis.com/youtube/v3/search';



////////////////////////////////*Submit Events* Collect search terms and values and clear forms//////
function watchRestForm(){
    
    $('#out-search-form').submit(event =>{
        console.log("rest form submitted")
        event.preventDefault();
        let cityEntered = $('#city-entered').val();
        let cuisineEntered = $('#js-rest-drop').val();
        $('#results-banner').removeClass('hidden');
        $('#results-space-3').addClass('hidden')   
        getCityCode(cityEntered, cuisineEntered);
        $('#city-entered').val("");
        $('#js-rest-drop').val("");
        scrolls();
    })
}

function watchHomeForm(){

    $('#home-search-form').submit(event =>{
        console.log("recipe form submitted")
        event.preventDefault();
        let recipeTerm = $('#js-recipe-term').val();
        let cuisineType = $('#js-home-drop').val();
        $('#results-space-1').removeClass('hidden')
        $('#results-space-2').removeClass('hidden')
        $('#results-banner').removeClass('hidden')
        getYouTubeVideos(cuisineType, recipeTerm, maxResults=10)
        getRecipe(recipeTerm, cuisineType);
        $('#rest-results').empty();
        $("#js-home-drop").val("");
        $('#js-recipe-term').val("");
        scrolls();
    })

}


///////////////////////////////////////////////////////////////////
/////////get restaurants by city and state/////////////////////////
///////////////////////////////////////////////////////////////////



function getCityCode(city, cuisine){
    let formattedCity = encodeURIComponent(city);
    let formattedCuisine = encodeURIComponent(cuisine);
    const zomatoCityURL = `https://developers.zomato.com/api/v2.1/cities?apikey=${zomatoApiKey}&q=${formattedCity}`
    console.log("fetching city code")
    fetch(zomatoCityURL)
        .then(response=>{
            if(response.ok){
                return response.json();
            } else{
                throw new Error(response.statusText)
            }
        })
        .then(responseJson => {return responseJson.location_suggestions[0].id})
        .then(id => {getRestaurants(id, formattedCuisine)})
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function getRestaurants(cityId, cuisine){
    let zomatoRestURL=`https://developers.zomato.com/api/v2.1/search?apikey=${zomatoApiKey}&entity_id=${cityId}&entity_type=city&radius=50&cuisines=${cuisine}&sort=rating`;
    console.log("fetching results")
    fetch(zomatoRestURL)
        .then(response =>{
            if(response.ok){
                return response.json()
            } else{
                throw new Error(response.statusText);
            }
        })
        .then(responseJson =>{
            displayRestaurantResults(responseJson)
        })
        .catch(err=>{
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
          });
        
}

function displayRestaurantResults(restJson){
    let results = restJson.restaurants
    $('#rest-results').empty();
    $('#results-space-1').addClass('hidden')
    $('#results-space-2').addClass('hidden')
    $('#results-space-3').removeClass('hidden');

    // make sure we received results back
    if(results.length === 0) {
        console.log('No results')
        
        $('#rest-results').append(`<img src="https://fakeimg.pl/210x130/d2691e/000/?text=No_Results_Available">`);
    } else {
        for(let i=0; i<restJson.restaurants.length; i++){
            $('#rest-results').append(
            `<div class="result-div">
                <h4>${results[i].restaurant.name}</h4>
                <div><img src="${results[i].restaurant.featured_image}" alt= "Picture of ${results[i].restaurant.name} if available" width="100" height="100" onError="imgError(this);"></div>
                <div>Address: ${results[i].restaurant.location.address}</div>
                <div>Phone: ${results[i].restaurant.phone_numbers}</div>
                <div>Rating: ${results[i].restaurant.user_rating.aggregate_rating}/5</div>
                <div><a href="${results[i].restaurant.menu_url}" target="_blank">Menu</a>
            </div>`)
            }
    }
    
    
}

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////get recipes/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

function getRecipe(term, cuisine){
    //because there are only two parameters string did not create an object to hold them
    $('#v-results').empty();
    const edamamAPIkey = "46be8d99438323770ae606f065931061";
    const edamamID = "977bf7f7";
    const recipeURL=`https://api.edamam.com/search?q=${cuisine}%20${term}&app_id=${edamamID}&app_key=${edamamAPIkey}`;
    
    const options = {
        mode: 'cors',
        headers: new Headers({
            "Access-Control-Allow-Origin": "*"
        })
    }
    console.log ("fetching recipes")

    fetch(recipeURL, options)
        .then(response => {
            if(response.ok){
                
                return response.json();
            }
        })
        .then(responseJson =>  displayRecipeResults(responseJson))
        .catch(err => {
            //need to add the error message space in results HTML
            $('#js-error-message').removeClass('hidden').text(`Something went wrong: ${err.message}`)
        });
}

function displayRecipeResults(responseJson){

    let results1 = responseJson.hits;
    let holdIngredient = ""
    // make sure we received results back
    if(results1.length === 0) {
      console.log('No results')

      $('#t-results').append(`<img src="https://fakeimg.pl/210x130/d2691e/000/?text=No_Results_Available">`);
      
    } else {

        console.log(results1);

        

        for(let i=0; i< results1.length; i++){
            // for(let n=0; n< results1[i].recipe.ingredientLines.length; n++){
            // holdIngredient += `<li> ${results[i].recipe.ingredientLines[n]} </li>`
            // }
            console.log("running through loop")
            $('#t-results').append(
                `<li class="result-box"><h4>${results1[i].recipe.label}</h4>
                <div class="recipe-img">
                <a href="${results1[i].recipe.shareAs}" target="_blank">
                    <img src="${results1[i].recipe.image}" alt="Picture of ${results1[i].recipe.label} if available" onError="imgError(this);" height="80" width="130"/>
                </a>
                </div>
                <a href="${results1[i].recipe.shareAs}" trget="_blank">Click Here to Go to the full recipe</a></li>`
            )
        }
    
    }
}

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////Youtube Search Functions /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayYoutubeResults(responseJson) {
  console.log(responseJson);
  if(responseJson.items.length === 0) {
    console.log('No results')
    $('#v-results').append(`<img src="https://fakeimg.pl/210x130/d2691e/000/?text=No_Videos_Available">`);
  } else {
    for (let i = 0; i < responseJson.items.length; i++){
        
        let description = responseJson.items[i].snippet.description.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,"").trim();
        
        $('#v-results').append(
        `<li><h4>${responseJson.items[i].snippet.title}</h4>
        <p class="text">${description}</p>
        <a href="https://youtube.com/watch?v=${responseJson.items[i].id.videoId}" target="_blank"><img src='${responseJson.items[i].snippet.thumbnails.default.url}'></a><br>
        <a href="https://youtube.com/watch?v=${responseJson.items[i].id.videoId}" target="_blank">Click Here To Go To Video</a>
        </li>`
        )};
  
    }
}

function getYouTubeVideos(cuisine, term, maxResults=10) {
    $('#t-results').empty();
    const params = {
    key: youtubeApiKey,
    q: `${cuisine}%20${term}%20recipe`,
    part: 'snippet',
    maxResults,
    type: 'video'
  };
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString;

  console.log("fetching youtube results");

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayYoutubeResults(responseJson))
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}



///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////Helper Functions///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

//Puts in alternate image for search if img is not available.
function imgError(image) {
    image.onerror = "";
    image.src = "https://fakeimg.pl/100x75/d2691e/000/?text=No_Pic_Available";
    return true;
}

function scrolls(){
    $('html, body').animate(
        {
          scrollTop: ($('#js-results').offset().top)
        },
        600,
        'linear'
      )
}


///////////////////////////////////////////////////////////////////////////////////////
///////////////////Invoke functions////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
watchRestForm();
watchHomeForm();



////////////////////////////end of code/////////////////////////////////////////////////