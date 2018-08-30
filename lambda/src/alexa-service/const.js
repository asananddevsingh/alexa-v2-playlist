
module.exports = Object.freeze({
  xmlFromUrl: "https://acast.azure-api.net/rssEconomist/theeconomisttastingmenu?subscription-key=d67d08ad7d2f4843835cf50c3f280890",
  graphQlUrl: {
    "stage": "https://stage.economist.com/graphql?version=v1&query=",
    "prod": "https://www.economist.com/graphql?version=v1&query="
  },
  getTopicGraphQuery: '{ canonical(ref: "/xref/stage.economist.com/topics") { tegID  headline hasPart{ parts{ tegID headline url { canonical } } } } }',
  getTopicDetailGraphQuery: function (tegID) {
    let query = '{ canonical(ref: "/content/'+tegID+'") { title: headline lastModified: dateModified hasPart(size: 100) { parts { tegID title: headline flyTitle: subheadline published: datePublished description audio { main { id url { canonical } } } } } } }';
    return query;
  },

  cloudwatchLogger : {
    'logGroupName': '/Alexa/TheEconomistService',
    'region': 'us-east-1'
  }
});