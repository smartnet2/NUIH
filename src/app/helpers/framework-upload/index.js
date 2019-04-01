// Load module dependencies
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require("crypto");
let path = require("path");
let fs = require("fs");
let HttpStatus = require('http-status-codes')
let dateFormat = require('dateformat');
let uuidv1 = require('uuid/v1');
var morgan = require('morgan');
var winston = require('./config/winston');
// const express = require('express');
const router = express.Router();


// const indexControllerV1 = require('./app/v1/controllers/index.controller');


/**
 * Module dependencies.
 */

const async = require('async');
const request = require('request');
const XLSX = require('xlsx');
const appRoot = require('app-root-path');
const hash = require('object-hash');
const _ = require('lodash');
const _constants = require('./config/constants.js');
const logger = require('./config/winston');
const {
    performance
} = require('perf_hooks');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },

    filename: function (req, file, cb) {
        console.log("====================================================");

        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)
            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
        // cb(null, file.fieldname + '-' + Date.now(), file)
    }
})
const upload = multer({
    storage: storage
}).single('files')


/**
 * Global Varibles
 */

const isTranslation = _constants.translations;
const translationsCode = _constants.translations_lang;

var isTopicTerm = false;
var index = 0;
var regexPattern = /[^a-zA-Z0-9]/g;

var boardValue = '';
var gradeValue = '';
var subjectValue = '';
var mediumValue = '';
var L1conceptValue = '';
var L2conceptValue = '';
var L3conceptValue = '';

var L2conceptTmp = '';
var L3conceptTmp = '';

var L2conceptTmpRes = '';
var L3conceptTmpRes = '';

var identifierArray = [];
var topicIdentifierArray = [];

var L1Trasalation = '';
var L2Trasalation = '';
var L3Trasalation = '';

let catHashmap = new Set();
let termHashmap = new Map();
let subjectTermHashmap = new Map();
let termAssHashmap = new Map();
let subjectAssHashmap = new Map();
let L1TrasalationHashmap = new Map();



function clearGlobals() {
    catHashmap.clear();
    termHashmap.clear();
    subjectTermHashmap.clear();
    termAssHashmap.clear();
    subjectAssHashmap.clear();
    L1TrasalationHashmap.clear();
}


/**
 * Read a excel file and converting xlsx to json 
 * Returing a json data
 *
 * Options: 
 *       - `XLSX` library require()
 *       - `${appRoot}` library for global app path 
 *
 * @return {JSON} Response
 * 
 */

let readExcelFile = function (excelfile) {
    return new Promise(function (resolve, reject) {
        console.log("Reading a excel file");
        var workbook = XLSX.readFile(excelfile);
        var sheet_name_list = workbook.SheetNames;
        var result = [];
        sheet_name_list.forEach(function (y) {
            var worksheet = workbook.Sheets[y];
            var headers = {};
            var data = [];
            for (z in worksheet) {
                if (z[0] === '!') continue;
                //parse out the column, row, and value
                var col = z.substring(0, 1);
                var row = parseInt(z.substring(1));
                var value = worksheet[z].v;

                //store header names
                if (row == 1) {
                    headers[col] = value;
                    continue;
                }

                if (!data[row]) data[row] = {};
                data[row][headers[col]] = value;
            }
            //drop those first two rows which are empty
            data.shift();
            data.shift();

            data.forEach(function (item) {
                result.push(item);
            });
        });
        if (result.length > 0) {
            resolve(result);
        } else {
            logger.error('Excel ERROR : Excel file is empty!!');
            reject('Excel file is empty!!');
        }

    });

}


let frameworkFunc = function (done) {
    checkOrCreateFramework(function (error, response) {
        if (error) {
            return done(error);
        }
        done(null, response);
    });
}

let createHashmapOfFramework = function (res, next) {
    console.log('inside createHashmapOfFramework--------->>>>>', res)
    // return true;
    try {
        if (res && res.result && res.result.framework) {
            let categories = res.result.framework.categories || [];
            let count = categories.length;
            if (categories && count > 0) {
                for (let i = 0; i < count; i++) {
                    catHashmap.add(categories[i].name);
                    let term = categories[i].terms || [];
                    let termCount = term.length;
                    if (term && termCount > 0) {
                        for (let j = 0; j < termCount; j++) {
                            let termObj = term[j];
                            let obj = { 'identifier': termObj.identifier.toString(), 'category': termObj.category }
                            if (termObj.category == 'subject') {
                                subjectTermHashmap.set(termObj.code, obj);
                            } else {
                                termHashmap.set(termObj.code, obj);
                            }
                            if (termObj.category == 'topic' && !_.isEmpty(termObj.translations)) L1TrasalationHashmap.set(termObj.code, termObj.translations);
                        }
                    }
                }
            }
            next();
        } else {
            next();
        }
    } catch (err) {
        return next(err);
    }
}

let hashmapOfTermAssociation = function (next) {
    console.log('hashmapOfTermAssociation=============>')
    async.parallel([
        function (callback) {
            createAssociationHashmap(termHashmap, (err, res) => {
                if (err) return callback(err);
                callback(null, res);
            });
        },
        function (callback) {
            createAssociationHashmap(subjectTermHashmap, (err, res) => {
                if (err) return callback(err);
                callback(null, res);
            });
        }
    ],
        function (err, results) {
            if (err) return next(err);
            next();
        });

}

let createAssociationHashmap = async (termHasmapArray, cb) => {

    try {
        let hashmapSize = termHasmapArray.size;
        if (hashmapSize && hashmapSize > 0) {
            for (const [key, value] of termHasmapArray) {
                let code = key;
                let category = value.category;
                let identifier = value.identifier;
                console.log("Calling get term api :: " + code);
                var termPromise = checkOrCreateTerm(code, category, '');
                await termPromise.then(function (res) {
                    try {
                        var arr = res.result.term.associationswith;
                        arr = arr.map(obj => {
                            return { 'identifier': obj.identifier };
                        });

                        if (category == 'subject') {
                            subjectAssHashmap.set(code, arr);
                        } else {
                            termAssHashmap.set(code, arr);
                        }

                    } catch (error) {
                        logger.error("Associationswith Hashmap :: " + code + " does not have associationwith");
                    }

                }, (err) => {
                    return cb(err);
                });
            };
            cb(null, 'DONE');
        } else {
            cb(null, 'DONE');
        }

    } catch (err) {
        return cb(err);
    }
}

let categoryFunc = function (callback) {
    findOrCreateCategory((error, res) => {
        if (error) {
            return callback(error);
        }
        callback();
    });
}

let termAndAssociationFunc = function (data, done) {
    async.eachSeries(data, function (key, callback) {
        index = index + 1;
        identifierArray = [];
        isTopicTerm = false;
        console.log('-----------------------  READ ROW NO. ' + index + '--------------------');
        startTermAndAssociations(key, function (error, data) {
            if (error) {
                return callback(error);
            }
            callback();
        });
    }, function (error) {
        if (error) {
            return done(error);
        }
        done(null, true);
    });
}



/**
 * This function is used for read a framework.
 * 
 * @param {Function} callback
 * @return {Object} Response
 * @api public
 * 
 */

let checkOrCreateFramework = function (callback) {
    var options = {
        method: 'GET',
        url: _constants.api_base_url + 'framework/v1/read/' + frameworkId,
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'content Editor'
        },
        json: true
    }
    var startTime = performance.now();
    request(options, function (error, response, body) {
        // console.log('err, res, body=======>',error, response, body);

        if (!error && body) {
            try {
                if (body.responseCode === 'OK') {
                    // console.log('ROW NO >  ' + index + '  > READ FRAMEWORK : REQUEST : ' + JSON.stringify(options) + ' RESPONSE : ' + JSON.stringify(body));
                    callback(null, body);
                } else if (body.responseCode == 'SERVER_ERROR') {
                    logger.error('ROW NO >  ' + index + '  > READ FRAMEWORK ERROR :' + error);
                    callback(new Error('SERVER ERROR'), false);
                } else {
                    createFramework(function (error, response) {
                        if (response) {
                            callback(null, response);
                        } else {
                            callback(error, false);
                        }
                    });
                }
            } catch (error) {
                logger.error('ROW NO >  ' + index + '  > FRAMEWORK ERROR :' + error);
            }
        } else {
            callback(error, false);
        }
        var endTime = performance.now();
        console.log('ROW NO > ' + index + ' > READ FRAMEWORK : Took', (endTime - startTime).toFixed(4), 'milliseconds');
    });
}

let publishcaller = function (done) {
    publishFrameworkFunc(function (error, response) {
        if (error) {
            return done(error);
        }
        done(null, response);
    });
}


let publishFrameworkFunc = function (callback) {
    var options = {
        method: 'POST',
        url: _constants.api_base_url + 'framework/v1/publish/' + frameworkId,
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'content Editor',
            'X-Channel-Id': orgId
        },
        json: true
    }
    var startTime = performance.now();
    request(options, function (error, response, body) {
        // console.log('publish framework func ===  body=======>', body);

        if (!error && body) {
            try {
                if (body.responseCode === 'OK') {
                    // console.log('in response OK', body);
                    // console.log('ROW NO >  ' + index + '  > READ FRAMEWORK : REQUEST : ' + JSON.stringify(options) + ' RESPONSE : ' + JSON.stringify(body));
                    callback(null, body);
                } else if (body.responseCode == 'SERVER_ERROR') {
                    // console.log('in response server-err', body);
                    // logger.error('ROW NO >  ' + index + '  > READ FRAMEWORK ERROR :' + error);
                    callback(new Error('SERVER ERROR'), false);
                } else {
                    // console.log('in response err', body);
                    callback(error, false);
                 
                }
            } catch (error) {
                logger.error('ROW NO >  ' + index + '  > FRAMEWORK ERROR :' + error);
            }
        } else {
            callback(error, false);
        }

    });
}

/**
 * This function is used for create a framework
 * 
 * @param {Function} callback
 * @return {Object} Response
 * @api public
 * 
 */

let createFramework = function (callback) {
    var options = {
        method: 'POST',
        url: _constants.api_base_url + _constants.framework_url.api_framework_create,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'content Editor',
            'X-Channel-Id': orgId
        },
        body: {
            "request": {
                "framework": {
                    "name": frameworkname,
                    "description": frameworkname,
                    "code": frameworkId,
                    "owner": orgId,
                    "channels": [{
                        "identifier": orgId
                    }],
                    "type": "K-12" // fixed
                }
            }
        },
        json: true
    }
    var startTime = performance.now();
    request(options, function (error, response, body) {
        // return true;
        if (!error && body && body.responseCode === 'OK') {
            callback(null, body);
        } else {
            callback(error, false);
            // return true;
            logger.error('ROW NO > ' + index + ' > CREATE FRAMEWORK API ERROR : REQUEST : ' + error);
        }
        var endTime = performance.now();
        console.log('ROW NO > ' + index + ' > CREATE FRAMEWORK : Took', (endTime - startTime).toFixed(4), 'milliseconds');
    });
}

/**
 * This function is used for Read framework categories.
 * 
 * @param {Function} callback
 * @return {Object} Response
 * @api public
 * 
 */

let findOrCreateCategory = function (callback) {
    async.eachSeries(_constants.framework_category, function (item, next) {

        if (catHashmap.has(item.name)) {
            console.log(item.name + ' category already created');
            return next();
        }
        var options = {
            method: 'GET',
            url: _constants.api_base_url + _constants.framework_url.api_framework_category_read + item.name + '?framework=' + frameworkId,
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + _constants.apiAuthToken,
                'user-id': 'content Editor',
                'X-Channel-Id': orgId
            },
            json: true
        }
        var startTime = performance.now();
        request(options, function (error, response, body) {
            if (!error && body) {
                try {
                    if (body.responseCode === 'OK') {
                        // console.log('ROW NO > ' + index + ' > RAED CATEGORY : REQUEST : ' + JSON.stringify(options) + ' RESPONSE : ' + JSON.stringify(body));
                        next(null, body);
                    } else if (body.responseCode == 'SERVER_ERROR') {
                        logger.error('ROW NO > ' + index + ' > RAED CATEGORY API ERROR : ' + error);
                        return next(new Error('CATEGORY SERVER ERROR'));
                    } else {
                        createCategory(item, function (error, response) {
                            if (response) {
                                catHashmap.add(item.name);
                                next(null, response);
                            } else {
                                return next(error);
                            }
                        });
                    }
                } catch (error) {
                    logger.error('ROW NO > ' + index + ' > READ CATEGORY CATCH ERROR : ' + error);
                }
            } else {
                if (error)
                    return next(error);
            }
            var endTime = performance.now();
            console.log('ROW NO > ' + index + ' > READ CATEGORY : Took', (endTime - startTime).toFixed(4), 'milliseconds');
        });
    }, function (error) {
        if (error) return callback(error);
        callback(null, 'DONE');
    });
}

/**
 * This function is used for Create Framework categories.
 * 
 * @param {Function} callback
 * @return {Object} Response
 * @api public
 * 
 */

let createCategory = function (item, callback) {
    var options = {
        method: 'POST',
        url: _constants.api_base_url + _constants.framework_url.api_framework_category_create + '=' + frameworkId,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'Vaibhav',
            'X-Channel-Id': orgId
        },
        body: {
            "request": {
                "category": {
                    "name": item.name,
                    "description": item.name,
                    "code": item.name,
                    "index": item.index
                }
            }
        },
        json: true
    }
    var startTime = performance.now();
    request(options, function (error, response, body) {
        console.log('============>', error, 'body=====>', body)
        if (!error && body && body.responseCode === 'OK') {
            // console.log('ROW NO > ' + index +' > CREATE CATEGORY : REQUEST : ' + JSON.stringify(options) + ' RESPONSE : ' + JSON.stringify(body));
            callback(null, body);
        } else {
            callback(error, false);
            logger.error('ROW NO > ' + index + ' > CREATE CATEGORY API ERROR : ' + error);
        }
        var endTime = performance.now();
        console.log('ROW NO > ' + index + ' > CREATE CATEGORY : Took', (endTime - startTime).toFixed(4), 'milliseconds');
    });
}

/**
 * This function is used for term and associations.
 *
 * @param {Object} row 
 * @param {Function} outerCallback
 * @return {Boolean} Response
 * @api public
 * 
 */

var startTermAndAssociations = function (row, outerCallback) {
    var board = '';
    var grade = '';
    var subject = '';
    var medium = '';
    var L1concept = '';
    var L2concept = '';
    var L3concept = '';

    if (row.Board && row.Board != undefined) {
        boardValue = row.Board.toString();
        board = boardValue.replace(regexPattern, '').toLowerCase();
    }

    if (row.Grade && row.Grade != undefined) {
        gradeValue = row.Grade.toString();
        grade = gradeValue.replace(regexPattern, '').toLowerCase();
    }

    if (row.Subject && row.Subject != undefined) {
        subjectValue = row.Subject.toString();
        subject = subjectValue.replace(regexPattern, '').toLowerCase();
    }

    if (row.Medium && row.Medium != undefined) {
        mediumValue = row.Medium.toString();
        medium = mediumValue.replace(regexPattern, '').toLowerCase();
    }

    var L1key = Object.keys(row)[_constants.excel_column.L1_NO];
    var L1value = row[L1key];

    if (L1key != undefined && L1value != undefined && row.Subject != '' && L1value != 'NA') {
        L1conceptValue = L1value.toString();
        L1concept = subject + '_' + L1conceptValue.replace(regexPattern, '').toLowerCase();
        L1concept = hash(L1concept);

        let key = Object.keys(row)[_constants.transalation_column.L1_NO];
        L1Trasalation = row[key];
    }

    var L2key = Object.keys(row)[_constants.excel_column.L2_NO];
    var L2value = row[L2key];

    if (L2key != undefined && L2value != undefined && L1concept != '' && L2value != 'NA') {
        L2conceptValue = L2value.toString();
        L2concept = L1concept + '_' + L2conceptValue.replace(regexPattern, '').toLowerCase();
        L2concept = hash(L2concept);
        let key = Object.keys(row)[_constants.transalation_column.L2_NO];
        L2Trasalation = row[key];
    }

    var L3key = Object.keys(row)[_constants.excel_column.L3_NO];
    var L3value = row[L3key];

    if (L3key != undefined && L3value != undefined && L2concept != '' && L3value != 'NA') {
        L3conceptValue = L3value.toString();
        L3concept = L2concept + '_' + L3conceptValue.replace(regexPattern, '').toLowerCase();
        L3concept = hash(L3concept);

        let key = Object.keys(row)[_constants.transalation_column.L3_NO];
        L3Trasalation = row[key];
    }

    async.waterfall([
        async.apply(boardFunction, board, 'board'),
        async.apply(mediumFunction, medium, 'medium'),
        async.apply(gradeFunction, grade, 'gradeLevel'),
        async.apply(subjectFunction, subject, 'subject'),
        async.apply(L1TopicFunction, L1concept, 'topic'),
        async.apply(L2TopicFunction, L2concept, 'topic'),
        async.apply(L3TopicFunction, L3concept, 'topic'),
    ], function (err, result) {
        if (err) {
            outerCallback(err);
            logger.error('ERROR2 :' + err);
        } else {
            outerCallback(null, true);
        }

    });
}

/**
 * This function is used to read or create term for board category.
 *
 * @param {String} board 
 * @param {String} category 
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function boardFunction(board, category, callback) {
    console.log("Board value  :: " + board);
    if (board != '') {
        if (termHashmap.has(board)) {
            let identifier = termHashmap.get(board);
            let obj = processTermResponse(identifier, true);
            callback(null, obj);
        } else {
            var termPromise = createTerm(board, category, boardValue);
            termPromise.then(function (result) {
                let obj = processTermResponse(result);
                termHashmap.set(board, obj);
                callback(null, obj);
            }, function (err) {
                logger.error('BOARD FUNCTION ERROR :' + err);
                callback(err);
            });
        }
    } else {
        logger.error('Borad function - Somthing went wrong!!');
    }
}


/**
 * This function is used to read or create term for medium category as well as association with board.
 * Response pass it to next function 
 * @param {String} medium 
 * @param {String} category 
 * @param {Response} boardRes //  Response of board function
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function mediumFunction(medium, category, boardRes, callback) {
    if (medium != '') {
        console.log("Medium value :: " + medium);
        identifierArray.push(boardRes);
        if (termHashmap.has(medium)) {
            let identifier = termHashmap.get(medium);
            let obj = processTermResponse(identifier, true);
            let arr = termAssHashmap.get(medium);
            var associationArray = checkIfObjectExist(arr, identifierArray);
            if (associationArray != false) {
                var associationsPromise = associationsWithTerm(medium, category, associationArray);
                associationsPromise.then(function (response) {
                    termAssHashmap.set(medium, associationArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('MEDIUM ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            } else {
                callback(null, obj);
            }
        } else {
            var createTermPromise = createTerm(medium, category, mediumValue);
            createTermPromise.then(function (result) {
                let obj = processTermResponse(result);
                termHashmap.set(medium, obj);
                var associationsPromise = associationsWithTerm(medium, category);
                associationsPromise.then(function (response) {
                    termAssHashmap.set(medium, identifierArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('MEDIUM ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            }, function (err) {
                logger.error('MEDIUM FUNCTION ERROR :' + err);
                callback(err);
            });
        }

    } else {
        logger.error('Medium function - Something went wrong!!');
    }
}

/**
 * This function is used to read or create term for grade category as well as association with medium,board
 *  
 * @param {String} grade 
 * @param {String} category 
 * @param {Response} mediumRes //  Response of medium function
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function gradeFunction(grade, category, mediumRes, callback) {

    if (grade != '') {
        console.log("Grade Value :: " + grade);
        identifierArray.push(mediumRes);
        if (termHashmap.has(grade)) {
            let identifier = termHashmap.get(grade);
            let obj = processTermResponse(identifier, true);
            let arr = termAssHashmap.get(grade);
            var associationArray = checkIfObjectExist(arr, identifierArray);
            if (associationArray != false) {
                var associationsPromise = associationsWithTerm(grade, category, associationArray);
                associationsPromise.then(function (response) {
                    termAssHashmap.set(grade, associationArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('GRADE ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            } else {
                callback(null, obj);
            }
        } else {
            var createTermPromise = createTerm(grade, category, gradeValue);
            createTermPromise.then(function (result) {
                let obj = processTermResponse(result);
                termHashmap.set(grade, obj);
                var associationsPromise = associationsWithTerm(grade, category);
                associationsPromise.then(function (response) {
                    termAssHashmap.set(grade, identifierArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('GRADE ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            }, function (err) {
                logger.error('GRADE FUNCTION ERROR :' + err);
                callback(err);
            });
        }

    } else {
        logger.error('Grade Function - Something went wrong!!')
    }
}

/**
 * This function is used to read or create term for subject category as well as association with medium,board,grade
 *  
 * @param {String} subject 
 * @param {String} category 
 * @param {Response} gradeRes //  Response of grade function
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function subjectFunction(subject, category, gradeRes, callback) {

    if (subject != '') {
        console.log("Subject value :: " + subject);
        identifierArray.push(gradeRes);
        if (subjectTermHashmap.has(subject)) {
            let identifier = subjectTermHashmap.get(subject);
            let obj = processTermResponse(identifier, true);
            let arr = subjectAssHashmap.get(subject);
            var associationArray = checkIfObjectExist(arr, identifierArray);
            if (associationArray != false) {
                var associationsPromise = associationsWithTerm(subject, category, associationArray);
                associationsPromise.then(function (response) {
                    subjectAssHashmap.set(subject, associationArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('SUBJECT ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            } else {
                callback(null, obj);
            }
        } else {
            var createTermPromise = createTerm(subject, category, subjectValue);
            createTermPromise.then(function (result) {
                let obj = processTermResponse(result);
                subjectTermHashmap.set(subject, obj);
                var associationsPromise = associationsWithTerm(subject, category);
                associationsPromise.then(function (response) {
                    subjectAssHashmap.set(subject, identifierArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('SUBJECT ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            }, function (err) {
                logger.error('SUJECT FUNCTION ERROR :' + err);
                callback(err);
            });
        }
    } else {
        logger.error('Subject function - Something went wrong');
    }

}

/**
 * This function is used to read or create term for chepter concept category 
 * As well as association with medium,board,grade,subject
 *  
 * @param {String} L1concept 
 * @param {String} category 
 * @param {Response} subjectRes //  Response of subject function
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function L1TopicFunction(L1concept, category, subjectRes, callback) {
    console.log("<<==============L1TOPIC VALUE==============>> ", L1concept);
    if (L1concept != '') {
        console.log("L1Topic Value :: " + L1concept);
        identifierArray.push(subjectRes);
        if (termHashmap.has(L1concept)) {
            checkL1Transalations(L1concept, category, L1Trasalation);
            let identifier = termHashmap.get(L1concept);
            let obj = processTermResponse(identifier, true);
            let arr = termAssHashmap.get(L1concept);
            var associationArray = checkIfObjectExist(arr, identifierArray);
            if (associationArray != false) {
                var associationsPromise = associationsWithTerm(L1concept, category, associationArray);
                associationsPromise.then(function (response) {
                    termAssHashmap.set(L1concept, associationArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('L1CONCEPT ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            } else {
                callback(null, obj);
            }
        } else {
            var createTermPromise = createTerm(L1concept, category, L1conceptValue, L1Trasalation);
            createTermPromise.then(function (result) {
                let obj = processTermResponse(result);
                termHashmap.set(L1concept, obj);
                var associationsPromise = associationsWithTerm(L1concept, category);
                associationsPromise.then(function (response) {
                    termAssHashmap.set(L1concept, identifierArray);
                    callback(null, obj);
                }, function (err) {
                    logger.error('L1CONCEPT ASSOCIATION FUNCTION ERROR :' + err);
                    callback(err);
                });
            }, function (err) {
                logger.error('L1CONCEPT FUNCTION ERROR :' + err);
                callback(err);
            });
        }
    } else {
        callback(null, true);
    }
}

/**
 * This function is used to read or create term for Topic concept 
 * As well as map tree under category `chapter-concept`
 *  
 * @param {String} L2concept 
 * @param {String} category 
 * @param {Response} L1conceptRes //  Response of L1TopicFunction 
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function L2TopicFunction(L2concept, category, L1conceptRes, callback) {
    console.log('********L2TopicFunction********');
    console.log("L2Topic Value :: " + L2concept);
    if (L2concept != '' && L2conceptTmp != L2concept) {
        L2conceptTmp = L2concept;
        topicIdentifierArray = [];
        topicIdentifierArray.push(L1conceptRes);
        isTopicTerm = true;
        var termPromise = checkOrCreateTerm(L2concept, category, L2conceptValue, L2Trasalation);
        termPromise.then(function (result) {
            L2conceptTmpRes = result;
            checkTransalations(result, L2concept, category, L2Trasalation);
            callback(null, result);
        }, function (err) {
            logger.error('L2concept FUNCTION ERROR :' + err);
            callback(err);
        });
    } else {
        callback(null, L2conceptTmpRes);
    }
}

/**
 * This function is used to read or create term for Sub Topic 
 * As well as map tree under category `Topic concept`
 *  
 * @param {String} L3concept 
 * @param {String} category 
 * @param {Response} L2conceptRes //  Response of L2TopicFunction 
 * @param {Function} callback
 * @return {Response}
 * @api public
 * 
 */

function L3TopicFunction(L3concept, category, L2conceptRes, callback) {
    console.log('********L3TopicFunction********');
    console.log("L3Topic Value :: " + L3concept);
    if (L3concept != '' && L3conceptTmp != L3concept) {
        L3conceptTmp = L3concept;
        topicIdentifierArray = [];
        var obj = processTermResponse(L2conceptRes);
        topicIdentifierArray.push(obj);
        console.log('-------------->topicIdentifierArray ', topicIdentifierArray)
        isTopicTerm = true;
        var termPromise = checkOrCreateTerm(L3concept, category, L3conceptValue, L3Trasalation);
        termPromise.then(function (result) {
            L3conceptTmpRes = result;
            checkTransalations(result, L3concept, category, L3Trasalation);
            callback(null, result);
        }, function (err) {
            logger.error('L3concept FUNCTION ERROR :' + err);
            callback(err);
        });
    } else {
        callback(null, L3conceptTmpRes);
    }
}

/**
 * This function function is used for Read Terms for each categories
 *
 * @param {String} term 
 * @param {String} category
 * @param {String} termValue
 * @return {Response}
 * @api public
 * 
 */

let checkOrCreateTerm = function (term, category, termValue, termTraslationValue) {
    var options = {
        method: 'GET',
        url: _constants.api_base_url + _constants.framework_url.api_framework_category_term_read + term + '?framework=' + frameworkId + '&category=' + category,
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'nuih',
            'X-Channel-Id': orgId
        },
        json: true
    }
    return new Promise(function (resolve, reject) {
        var startTime = performance.now();
        request(options, function (error, response, body) {
            console.log('error:::::::::::>', error, 'body:::::::>', body)
            if (error) {
                logger.error('READ TERM API ERROR : ' + error);
                reject(error);
            } else if (body && body.responseCode == 'OK') {
                resolve(body);
            } else {
                var createTermPromise = createTerm(term, category, termValue, termTraslationValue);
                createTermPromise.then(function (result) {
                    resolve(result);
                }, function (err) {
                    logger.error('CREATE TERM API ERROR1 : ' + err);
                    reject(err);
                });
            }
            var endTime = performance.now();
            console.log('ROW NO > ' + index + ' > READ TERM ' + category + ': Took', (endTime - startTime).toFixed(4), 'milliseconds');
        });
    });
}


/**
 * This function is used for Create Terms for each categories
 *
 * @param {String} term 
 * @param {String} category
 * @param {String} termValue
 * @return {Response}
 * @api public
 * 
 */

let createTerm = function (term, category, termValue, termTraslationValue = '') {
    console.log('term******=======>', term, 'category=======>', category, 'termValue=======>', termValue)
    var body = {
        "request": {
            "term": {
                "name": termValue,
                "label": termValue,
                "description": termValue,
                "code": term,
                "index": index
            }
        }
    }

    if (termTraslationValue && termTraslationValue != 'NA' && isTranslation) {
        body.request.term.translations = {
            [translationsCode]: termTraslationValue
        };
    }

    if (isTopicTerm) {
        console.log('isisTopicTerm==============>', isTopicTerm, '', )
        body.request.term.parents = topicIdentifierArray;
    }

    var options = {
        method: 'POST',
        url: _constants.api_base_url + _constants.framework_url.api_framework_category_term_create + '=' + frameworkId + '&category=' + category,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'Vaibhav',
            'X-Channel-Id': orgId
        },
        body: body,
        json: true
    }

    return new Promise(function (resolve, reject) {
        var startTime = performance.now();

        request(options, function (error, response, body) {
            console.log('Term============>', error, 'body=====>', body)
            console.log("TERM RES :: " + JSON.stringify(options));
            if (error) {
                logger.error('CREATE TERM API ERROR2 : ' + error);
                reject(error);
            } else if (body && body.responseCode == 'OK') {
                resolve(body);
            } else {
                let err = new Error('Create Term Error - ' + term);
                logger.error('CREATE TERM API ERROR3 : ' + err);
                reject(err);
            }
            var endTime = performance.now();
            console.log('ROW NO > ' + index + ' > CREATE TERM ' + category + ' : Took', (endTime - startTime).toFixed(4), 'milliseconds');
        });
    });
}

/**
 * Each term associations to another term from another category 
 *
 * @param {String} term 
 * @param {String} category
 * @param {Array} identifier  // default value is null
 * @return {Response} 
 * @api public
 * 
 */

let associationsWithTerm = function (term, category, identifier = '') {
    var body = '';
    if (identifier != '') {
        body = {
            "request": {
                "term": {
                    "associationswith": identifier
                }
            }
        }
    } else {
        body = {
            "request": {
                "term": {
                    "associationswith": identifierArray
                }
            }
        }
    }

    var options = {
        method: 'PATCH',
        url: _constants.api_base_url + _constants.framework_url.api_framework_category_term_update + term + '?framework=' + frameworkId + '&category=' + category,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            //   'user-id': 'Vaibhav',
            'X-Channel-Id': orgId
        },
        body: body,
        json: true
    }

    return new Promise(function (resolve, reject) {
        var startTime = performance.now();
        request(options, function (error, response, body) {
            // console.log("REQ :: " +JSON.stringify(options));
            // console.log("RES :: " +JSON.stringify(response));
            if (error) {
                logger.error('ASSOCIATION TERM API ERROR : ' + error);
                reject(error);
            } else if (body && body.responseCode == 'OK') {
                resolve(body);
            } else {
                let err = new Error('Association Term Error - ' + term);
                logger.error('ASSOCIATION TERM API ERROR2 : ' + err);
                reject(err);
            }
            var endTime = performance.now();
            console.log('ROW NO > ' + index + ' > ASSOCIATION TERM ' + category + ' : Took', (endTime - startTime).toFixed(4), 'milliseconds');
        });
    });
}

/**
 * This function is used for Update Transaltions for each term
 *
 * @param {String} term 
 * @param {String} category
 * @param {String} termValue
 * @return {Response}
 * @api public
 * 
 */

let updateTermTransaltions = function (term, category, transaltionObj) {

    var body = {
        "request": {
            "term": transaltionObj
        }
    }

    if (isTopicTerm) {
        body.request.term.parents = topicIdentifierArray;
    }

    var options = {
        method: 'PATCH',
        url: _constants.api_base_url + _constants.framework_url.api_framework_category_term_update + term + '?framework=' + frameworkId + '&category=' + category,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _constants.apiAuthToken,
            'user-id': 'Vaibhav',
            'X-Channel-Id': orgId
        },
        body: body,
        json: true
    }

    return new Promise(function (resolve, reject) {
        var startTime = performance.now();
        request(options, function (error, response, body) {
            if (error) {
                logger.error('Update term transaltions error1 : ' + error);
                reject(error);
            } else if (body && body.responseCode == 'OK') {
                resolve(body);
            } else {
                let err = new Error('Update term transaltions error2 - ' + term);
                logger.error(err);
                reject(err);
            }
            var endTime = performance.now();
            console.log('ROW NO > ' + index + ' > UPDATE TERM TRANSALTIONS : Took', (endTime - startTime).toFixed(4), 'milliseconds');
        });
    });
}

/**
 * Check if a value is exists in an array 
 *
 * @param {Array} arr 
 * @param {Array} identifierArray
 * @return {Array} Response  - if flag is true than return an array else return false
 * @api public
 * 
 */


function checkIfObjectExist(arr, identifierArray) {
    let found = false;
    _.forEach(identifierArray, function (value, key) {
        let index = _.findIndex(arr, value);
        if (index == -1) {
            found = true;
            arr.push(value);
        }
    });
    if (found) {
        return arr;
    } else {
        return false;
    }
}

// filter the response data

function processTermResponse(response, flag = false) {
    if (flag) {
        return {
            'identifier': response.identifier
        };
    } else if (response.result.node_id && !_.isArray(response.result.node_id)) {
        return {
            'identifier': response.result.node_id
        };
    } else if (response.result.node_id) {
        return {
            'identifier': response.result.node_id[0]
        };
    } else {
        return {
            'identifier': response.result.term.identifier
        };
    }
}

function checkTransalations(res, term, category, termTransalation) {
    if (!isTranslation || termTransalation == 'NA') {
        return false;
    }

    if (res.result && res.result.term) { // termTransalation != '' If term transalation value is empty
        if (!res.result.term.translations) {
            var obj = {
                "translations": {
                    [translationsCode]: termTransalation
                }
            }
            var transalationPromis = updateTermTransaltions(term, category, obj);
            transalationPromis.then(function (response) {
                return true;
            }, function (err) {
                logger.error('checkTransalations function error1');
            });
        } else if (res.result.term.translations && !res.result.term.translations.hasOwnProperty(translationsCode)) {
            var existingTransalation = res.result.term.translations;
            existingTransalation[translationsCode] = termTransalation;
            var obj = {
                'translations': existingTransalation
            }
            var transalationPromis = updateTermTransaltions(term, category, obj);
            transalationPromis.then(function (response) {
                return true;
            }, function (err) {
                logger.error('checkTransalations function error2');
            });

        } else {
            return true;
        }
    }
}


function checkL1Transalations(term, category, termTransalation) {

    if (!isTranslation || termTransalation == 'NA') {
        return false;
    }

    if (L1TrasalationHashmap.has(term)) {
        let l1Trasalation = L1TrasalationHashmap.get(term);
        l1Trasalation = JSON.parse(l1Trasalation);
        if (!_.has(l1Trasalation, translationsCode)) {
            var existingTransalation = l1Trasalation;
            existingTransalation[translationsCode] = termTransalation;
            var obj = {
                'translations': existingTransalation
            }
            var transalationPromis = updateTermTransaltions(term, category, obj);
            transalationPromis.then(function (response) {
                console.log('L1 Transalation updated');
            }, function (err) {
                logger.error('checkL1Transalations function error1');
                throw new Error('checkL1Transalations function error1');
            });
        }

    } else {
        var obj = {
            "translations": {
                [translationsCode]: termTransalation
            }
        }
        var transalationPromis = updateTermTransaltions(term, category, obj);
        transalationPromis.then(function (response) {
            console.log('L1 Transalation updated');
        }, function (err) {
            logger.error('checkL1Transalations function error2');
            throw new Error('checkL1Transalations function error1');
        });
    }
}

function sendErrorResponse(res, id, message, httpCode = HttpStatus.BAD_REQUEST) {
    let responseCode = (httpCode)

    res.status(httpCode)
    res.send({
        'id': id,
        'ver': '1.0',
        'ts': dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss:lo', true),
        'params': {
            'resmsgid': uuidv1(),
            'msgid': null,
            'status': 'failed',
            'err': '',
            'errmsg': message
        },
        'responseCode': responseCode,
        'result': {}
    })
    res.end()
}

function sendSuccessResponse(res, id, result, code = HttpStatus.OK) {
    res.status(code)
    res.send({
        'id': 'api.framework.create',
        'ver': '1.0',
        'ts': dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss:lo', true),
        'params': {
            'resmsgid': uuidv1(),
            'msgid': null,
            'status': 'successful',
            'err': '',
            'errmsg': ''
        },
        'responseCode': 'OK',
        'result': result
    })
    res.end()
}


module.exports = function (req, res) {
    router.post('/getframework', function (req, res) {

        return upload(req, res, function (r, q) {


            console.log('Init framework ==============*************>>>>>>>>>>>>')
            console.log("Init Framework reqbody======>", req.body);

            console.log("Framework req.file.path:: " + req.file.path);

            var excelData = readExcelFile(req.file.path);


            global.frameworkId = req.body.id;
            global.frameworkname = req.body.frameworkname;
            global.orgId = req.body.orgId;
            console.log('frameworkId------------->', frameworkId);
            console.log('frameworkname------------->', frameworkname);
            console.log('global.orgId------------->', orgId);



            excelData.then(function (data) {
                console.log("converted excel file to json successfully!");
                var startTime = performance.now();

                async.waterfall([
                    frameworkFunc,
                    createHashmapOfFramework,
                    hashmapOfTermAssociation,
                    categoryFunc,
                    async.apply(termAndAssociationFunc, data),
                ], function (err, result) {
                    if (err) {
                        sendErrorResponse(res, '', err.message, err.status)
                        console.log('error of sendErrorrsponse========>', err);

                    } else {

                        if (req.body.publishFramework) {
                            console.log('called publish');
                            // console.log('res outside=========>', res);
                            publishcaller((err, response) => {
                                if (err) {
                                    sendErrorResponse(res, '', err.message, err.status)
                                    console.log('error in caller', err)
                                }
                                else {
                                    console.log('succ in caller', response)
                                    if (response.responseCode === 'OK') {
                                        console.log('response-----:::::::::>', response);
                                        sendSuccessResponse(res, 'api.publish.framework', response.result.publishStatus, HttpStatus.OK)
                                        clearGlobals();
                                    }
                                }
                            })
                        } else {
                            sendSuccessResponse(res, 'api.framework.create', '', HttpStatus.OK);
                            clearGlobals();
                        }
                    }
                    var endTime = performance.now();
                    console.log('TOTAL FRAMEWORK TIME : Took', (endTime - startTime).toFixed(4), 'milliseconds');
                    console.log('Successfully bulk data uplaod process done!!!');


                });
            }, function (error) {
                res.json(error);
            });

            const path =  req.file.path;

            fs.unlink(path, (err) => {
                if (err) {
                    console.log('Error in deleting the excel file',err)
                    return
                }
                console.log('file successfully deleted');
            })
        });
        // }
    })




    return router
}