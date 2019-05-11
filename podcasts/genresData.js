const logger = require("../useful/logger");
const constants = require("../useful/const");
const genres = require("./genres");

// Translate genre ids to to names
function getGenresStringsFromArray(ids){

     let genresStrings = [];
     let genresById = createPodcastGenresById(genres.genres);
     if (Array.isArray(ids)){
        
        ids.forEach(function(id){

            genresStrings.push(genresById[id].name.replace(" & ", " and "))
        })
    }
    else {
        genresStrings.push(genresById[id].name.replace(" & ", " and "));
    }
     
    logger.trace(constants.LOG_MESSAGES.SUCCESS_TRANSLATE_GENRES_IDS_TO_NAMES + genresStrings.length);

    return (genresStrings.sort())
}

// Translate genre names to to ids
function getGenresIdsFromArray(genres){

    let genresIds = [];

    genres.forEach(function(genre){

        genresIds.push(genre.id);
    });

    logger.trace(constants.LOG_MESSAGES.SUCCESS_TRANSLATE_GENRES_NAMES_TO_IDS + genresIds.length);
    
    return (getGenresStringsFromArray(genresIds));
}

// Use only once for creating a genres object by id
function createPodcastGenresById(genres){

    let genresById = {};

    genres.forEach(function(genre){

        genresById[genre.id] = genre;
    });

    logger.trace(constants.LOG_MESSAGES.INIT_GENRES_BY_ID_OBJECT + genres.length);

    return(genresById);
}

function findGenreId(genreName){

    let genreFounded = false;
    let genreCount = 0;
    let genreId = 0;

    while (!genreFounded){

        if (genres.genres[genreCount].name.toLowerCase().replace(" & ", " and ") === genreName.toLowerCase().replace(" & ", " and ")){

            genreId = genres.genres[genreCount].id;
            genreFounded = true;

            logger.trace(constants.LOG_MESSAGES.SUCCESS_FIND_GENRE_BY_ID + genreName + " - " + genreId);
        }
        genreCount++;
    }   

    return genreId;
}

module.exports = {createPodcastGenresById, getGenresStringsFromArray, getGenresIdsFromArray, findGenreId};