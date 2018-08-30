const fs = require('fs')

const xml2js = require('xml2js');
const fetch = require('node-fetch');

const constObject = require('./const');
const cloudWatchLogger = require('./cloudwatchLogger')

class utility {

    constructor() { }

    //@ Function => which retrive from RSS data and convert into JSON format.
    //@ Data Will requested per size from frontend. 
    //@ Param => size: number

    getDataFromXml(size) {
        let returnData = { item: [] }
        return fetch(constObject.xmlFromUrl)
            .then(res => res.text())
            .then(body => {
                let parser = new xml2js.Parser();
                parser.parseString(body, function (err, result) {
                    result.rss.channel[0].item.map((item, index) => {                        
                        if (index < size) {
                            returnData.item.push({
                                "id": index,
                                "title": item.title[0],
                                "audio": item.enclosure[0].$.url,
                                "imageUrl": item['itunes:image'][0].$.href,
                                "description": item.description[0].replace(/<p>|<\/p>/g, ''),
                                "published": item.pubDate[0]
                            })
                            
                        }
                    })
                });
                
                cloudWatchLogger.log('LOG', {
                    'event': 'getDataFromXml',
                    'info': returnData
                });
               
                return returnData;
            }).catch(error => cloudWatchLogger.log('ERROR', {
                'event': 'getDataFromXml',
                'info': error
            }));
    }

    //@ Function get data from graphQL endpoint per topic e.g: China.
    //@ Param => size:number & topic:string

    getDataByTopics(size, topic) {
        return this.getTopicQuery().then(topicObject => {
            topicObject = JSON.parse(topicObject)
            let tegID = this.getTegID(size, topicObject, topic);
            return tegID;
        }).then(tegID => {
            let dataObj = this.getDataByTegID(size, tegID).then(res => {
                return res
            })
            return dataObj;
        })
    }

    //@Function() => Map tegID from topicObject per topic.
    //@Param => size:number, topicObject:Object, topic:string

    getTegID(size, topicObject, topic) {

        let returnTegID
        if (topicObject && topic) {

            topicObject.data.canonical.hasPart.parts.map((item, index) => {
                if (item.headline == topic) {
                    returnTegID = item.tegID
                }
            })
        }
        return returnTegID
    }

    //@Function => Get Data GraphQL Enpoint per TegID from '/contents/{tegID}'
    //@Param => size:number, tegID:string

    getDataByTegID(size, tegID) {
        let returnData = {
            item: []
        }
        if (tegID) {
            let dataFromGraph = this.getDataFromGraphQLEconomist(tegID).then(res => {

                cloudWatchLogger.log('LOG', {
                    'event': 'getDataByTegID',
                    'info': res
                });

                res = JSON.parse(res)
                if (res) {
                    if (res.response) {
                        let count = 0;
                        res.response.data.canonical.hasPart.parts.map((item, index) => {
                            if (item.audio) {
                                if (item.audio.main) {
                                    if (item.audio.main.url.canonical) {
                                        if (count < size) {
                                            count++;

                                            returnData.item.push({
                                                "id": count,
                                                "tegID": item.tegID,
                                                "title": item.title,
                                                "flyTitle": item.flyTitle,
                                                "audio": item.audio.main.url.canonical,
                                                "published": item.published,
                                                "description": item.description
                                            })
                                        }

                                    }
                                }
                            }

                        })
                    } else {
                        let count2 = 0;
                        
                        res.data.canonical.hasPart.parts.map((item, index) => {
                            if (item.audio) {
                                if (item.audio.main) {
                                    if (count2 < size) {
                                        count2++;
                                        returnData.item.push({
                                            "id": index,
                                            "tegID": item.tegID,
                                            "title": item.title,
                                            "flyTitle": item.flyTitle,
                                            "audio": item.audio.main.url.canonical,
                                            "published": item.published,
                                            "description": item.description
                                        })
                                    }
                                }
                            }
                        })
                    }

                }
                return returnData;
            })
            return dataFromGraph;
        }

    }

    //@Function => Get all topic from GraphQL Endpoint

    getTopicQuery() {
        let url = constObject.graphQlUrl.prod;
        const query = constObject.getTopicGraphQuery;

        let dataWithPromise = this.getDataNative(url, query)
            .then(res => {
                cloudWatchLogger.log('LOG', {
                    'event': 'getTopicQuery',
                    'info': res
                });
                return res

            }).catch(error => cloudWatchLogger.log('ERROR', {
                'event': 'getTopicQuery',
                'info': error
            }));

        return dataWithPromise;

    }

    //@Function => Get Data From GraphQL Endpoiint for Topic In detail, by TegID
    //@Para => tegID:string

    getDataFromGraphQLEconomist(tegID) {

        let url = constObject.graphQlUrl.prod;
        const query = constObject.getTopicDetailGraphQuery(tegID);

        let dataWithPromise = this.getDataNative(url, query)
            .then(res => {
                
                cloudWatchLogger.log('LOG', {
                    'event': 'getDataFromGraphQLEconomist',
                    'info': res
                });
                return res;
            }).catch(error => cloudWatchLogger.log('ERROR', {
                'event': 'getDataFromGraphQLEconomist',
                'info': error
            }));

        return dataWithPromise;
    }

    getDataNative(url, query) {
        let fetchUrl = url + query        
        let returnData = fetch(fetchUrl, {
            method: 'GET',
            body: null
        }).then(res => res.text())
            .then(body => {
                
                cloudWatchLogger.log('LOG', {
                    'event': 'getDataNative',
                    'info': body
                });
                return body
            }).catch(error => cloudWatchLogger.log('ERROR', {
                'event': 'getDataNative',
                'info': error
            }));
        return returnData;
    }

}
module.exports = utility;