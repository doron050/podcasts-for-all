const logger = require("../useful/logger");
const constants = require("../useful/const");

function getGenres(ids){

    let genres = ['a','b'];
/*     if (Array.isArray(ids)){
        
        ids.forEach(function(id){

            genres.push(genres.genresById[id].name)
        })
    }
    else {
        genres.push(genres.genresById[id].name);

    } */
     
    return (genres)
}

function getGenresFromArray(genres){

    let genresIds = [];

    genres.forEach(function(genre){

        genresIds.push(genre.id);
    });

    return (getGenres(genresIds));
}

// Use only once for creating a genres object by id
function createPodcastGenresById(genres){

    let genresById = {};

    genres.forEach(function(genre){

        genresById[genre.id] = genre;
    });

    logger.info(constants.LOG_MESSAGES.INIT_GENRES_BY_ID_OBJECT + genresById.length);
    return(genresById);
}

module.exports = {createPodcastGenresById, getGenres, getGenresFromArray}