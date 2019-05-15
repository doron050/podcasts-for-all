const logger = require("../common/logger");
const constants = require("../common/const");
const countries = require("../resources/countries");

function getCountriesStringsArray(countries) {
    let countriesStringsArray = [];
    Object.keys(countries).forEach(function (countryCode) {

        countriesStringsArray.push(countries[countryCode]);
    });

    logger.info(constants.LOG_MESSAGES.SUCCESS_TRANSLATE_COUNTRIES_CODES_TO_NAMES + countriesStringsArray.length);
    return countriesStringsArray.sort();
}

function findCountryId(countryName) {
    let countryId = constants.API_CONSTANTS.DEFAULT_REGION;
    Object.keys(countries).forEach(function (countryCode) {

        if (countries[countryCode].toLowerCase() === countryName.toLowerCase()) {

            countryId = countryCode;
        }
    });

    return countryId;
}

module.exports = {
    getCountriesStringsArray,
    findCountryId
};