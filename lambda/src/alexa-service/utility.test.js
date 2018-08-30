const _util = require('./utility');

let _utils_ = new _util

test('Get Data From XML RSS Feed getDataFromXml()', done => {
    function callback(data) {
        expect(data).toMatchObject({
            "item": expect.any(Array)
        });
        done();
    }
    _utils_.getDataFromXml(1).then(res => {
        callback(res);
    })

});

test('Get Data From GraphQL Topic List getTopicQuery()', done => {
    function callback(data) {        
        expect(data).toMatchObject({
            "data": expect.any(Object)
        });
        done();
    }
    _utils_.getTopicQuery().then(res => {
        callback(JSON.parse(res));
    })

});

test('Get Data From GraphQL Get TegID getTegID()', done => {
    function callback(data, tegID) {
        expect(data).toEqual(tegID);
        done();
    }    
    _utils_.getTopicQuery().then(topicObject => {
        topicObject = JSON.parse(topicObject)
        let res = _utils_.getTegID(1, topicObject, topicObject.data.canonical.hasPart.parts[0].headline);
        callback(res, topicObject.data.canonical.hasPart.parts[0].tegID);
    })

});


test('Get Data From GraphQL Get Data By TegID getDataByTegID()', done => {
    function callback(data) {        
        expect(data).toMatchObject({
            "item": expect.any(Array)
        });
        done();
    }
    _utils_.getTopicQuery().then(topicObject => {
        topicObject = JSON.parse(topicObject)
        _utils_.getDataByTegID(1, topicObject.data.canonical.hasPart.parts[0].tegID).then(res => {
            callback(res);
        });
    })
});

test('Get Data From GraphQL By TopicDetail getDataFromGraphQLEconomist()', done => {
    function callback(data) {
        if (data.response) {
            expect(data).toMatchObject({
                "response": expect.any(Object)
            });
            done();
        } else {
            expect(data).toMatchObject({
                "data": expect.any(Object)
            });
            done();
        }

    }

    _utils_.getTopicQuery().then(topicObject => {
        topicObject = JSON.parse(topicObject)
        _utils_.getDataFromGraphQLEconomist(topicObject.data.canonical.hasPart.parts[0].tegID).then(res => {
            callback(JSON.parse(res));
        });
    })

});

test('Get Data From GraphQL By TopicDetail getDataByTopics()', done => {
    function callback(data) {
        expect(data).toMatchObject({
            "item": expect.any(Array)
        });
        done();
    }
    _utils_.getDataByTopics(1, "China").then(res => {
        callback(res);
    })

});






