const fs = require('fs')
const util = require('./utility');

const constObject = require('./const');
const cloudwatchLogger = require('./cloudwatchLogger')

let returnData = {
    item: []
}

//@Handler: Entry Point for lambda and excute with event content and callback
//@events = >
//          @getAllDataFromXMLRSS
//          @getDataByTopics

exports.handler = (event, context, callback) => {

    let _utils_ = new util;
    if (event.field) {
        if (event.field == "getAllDataFromXMLRSS") {
            _utils_.getDataFromXml(event.arguments.size).then(data => {                
                cloudwatchLogger.log('LOG', {
                    'event': 'getAllDataFromXMLRSS',
                    'info': data
                });
                cloudwatchLogger.log('ServiceTimeLogLambdaExecution', {
                    'event': 'getAllDataFromXMLRSS',
                    'info': 10000 - context.getRemainingTimeInMillis()
                });                
                
                callback(null, data.item);
            }).catch(error => {
                cloudwatchLogger.log('ERROR', {
                    'event': 'getAllDataFromXMLRSS',
                    'info': error
                })                
                callback(error);
            })
        }

        if (event.field == "getDataByTopics") {
            _utils_.getDataByTopics(event.arguments.size, event.arguments.topic).then(data => {
                cloudwatchLogger.log('LOG', {
                    'event': 'getDataByTopics',
                    'info': data
                });
                cloudwatchLogger.log('ServiceTimeLogLambdaExecution', {
                    'event': 'getDataByTopics',
                    'info': 10000 - context.getRemainingTimeInMillis()
                });    
                callback(null, data.item);                
            }).catch(error => {
                cloudwatchLogger.log('ERROR', {
                    'event': 'getDataByTopics',
                    'info': error
                })               
                callback(error);
            })
        }
    }
};