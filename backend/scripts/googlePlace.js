const axios = require('axios')
const googlePlaceUri = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?'
const googleApiKey = process.env.googleApiKey

exports.findFromAddress = function findFromAddress (address) {
    let searchResults = []

    let config = {
        method: 'get',
        url: `${googlePlaceUri}fields=formatted_address&input=${address}&inputtype=textquery&key=${googleApiKey}`,
        headers: {}
    };

    axios(config)
    .then( response => {
        searchResults.push(JSON.stringify(response.data))
        console.log(response.data)
    })
    .catch(err => {
        console.error(err)
    })
    return searchResults;
}