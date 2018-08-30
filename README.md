# Audio Player
The Alexa Skills Kit now allows developers to build skills that play long-form audio content on Alexa devices. This project demonstrates how to use the new interfaces for triggering playback of audio and handling audio player input events.

## About the product
1. To have an upper hand and to be a leader in market, we always tries to be best in industry, and Alexa is perfect Solution .

2. Alexa Cohesively interact with Voice assistant and query per subscribed person.

3. We Global Business Review is a new bilingual digital app from the editors of We Group.

4. Each month, the best business, finance and technology articles from the weekly publication are selected and translated, and delivered to our mobile device with an intuitive and attractive user interface.

5. We Global Business Review can be accessed either via an iPhone or Android Smartphone or tablet & now Alexa. Person can easily subscribed to Alexa skill in just few steps. & by simple invocation “Alexa, open We”.

## How to Run the Sample
You will need to comply to the prerequisites below and to change a few configuration files before creating the skill and upload the lambda code.

### Pre-requisites
This is a NodeJS Lambda function and skill definition to be used by [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html).

0. You need to have NodeJS and ```npm``` installed.  
You can download NodeJS for your platform and follow instructions from [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

1. You need an [AWS account](https://aws.amazon.com) and an [Amazon developer account](https://developer.amazon.com) to create an Alexa Skill.

2. You need to install and configure the [AWS CLI](https://aws.amazon.com/cli/)

```bash
$ pip install awscli
$ aws configure // https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html
```

3. You need to install and to initialize [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html) with

```bash
$ ask init
```

4. You need to download this skill dependencies :

```bash
$ (cd lambda/src/alexa-interface && npm install)
```

### Deployment
ASK will create the skill and the lambda function for you.

Lambda function will be created in ```us-east-1``` (Northern Virginia) by default.

You deploy the skill and the lambda function in one step :

```bash
$ ask deploy
```

IMPORTANT : ask CLI will create an ```index.handler``` lambda entry point by default.  This projects uses ```lambda/src/alexa-interface``` directory to keep source code separated, so it is important to update the Lambda function configuration with the correct code entry point.  You can do this using the AWS command line :

```bash
aws lambda update-function-configuration --function-name <name_of_the_lambda_function> --handler <index.handler> --runtime nodejs8.10
```


#### Add DynamoDB permission to your Lambda function
After deploying, you will need to add DynamoDB permission to the IAM Role created to execute your function :

- connect to AWS Console : https://console.aws.amazon.com/iam/home?region=us-east-1#/roles
- select the role created to execute your lambda function (it is named "AlexaFullAccess" or the name of the role you have cerated for the skill)
- click "Attach Policy"
- locate and select "DynamoDBFullAccessPolicy" role and click "Attach Policy"

#### Change the skill id in lambda code. (Optional but recommended)
Once the skill and lambda function is deployed, do not forget to add the skill id to ```lambda/src/alexa-interface/constants/constants.js``` to ensure your code is executed only for your skill.

Uncomment the ```appId``` line and change it with your new skill id.  You can find the skill id by typing :

```bash
$ ask api list-skills
```
```json
{
  "skills": [
    {
      "apis": [
        "custom"
      ],
      "lastUpdated": "2017-10-08T08:06:34.835Z",
      "nameByLocale": {
        "en-GB": "Multi Stream Audio Player",
        "en-US": "Multi Stream Audio Player"
      },
      "skillId": "amzn1.ask.skill.123",
      "stage": "development",
      "publicationStatus": "DEVELOPMENT"      
    }
  ]
}
```

Then copy/paste the skill id to ```lambda/src/constants.js```    

```javascript
export const constants = {
  appId: '<< PASTE YOUR SKILL ID HERE >>',
  dynamoDBTableName: 'TheEconomist',
};
```

### Testing from command line
When done, you are ready to test from the command line, or using the Alexa developer console.

```bash
 $ ask simulate -l en-US -t "alexa, open audio player"

 ✓ Simulation created for simulation id: 4a7a9ed8-94b2-40c0-b3bd-fb63d9887fa7
◡ Waiting for simulation response{
  "status": "SUCCESSFUL",
  ...
 ```

You should see the code of the skill's response after the SUCCESSFUL line.

## How it Works
Alexa Skills Kit now includes a set of output directives and input events that allow you to control the playback of audio files or streams.  There are a few important concepts to get familiar with:

* **AudioPlayer directives** are used by your skill to start and stop audio playback from content hosted at a publicly accessible secure URL.  You  send AudioPlayer directives in response to the intents you've configured for your skill, or new events you'll receive when a user controls their device with a dedicated controller (see PlaybackController events below).
* **PlaybackController events** are sent to your skill when a user selects play/next/prev/pause on dedicated hardware controls on the Alexa device, such as on the Amazon Tap or the Voice Remote for Amazon Echo and Echo Dot.  Your skill receives these events if your skill is currently controlling audio on the device (i.e., you were the last to send an AudioPlayer directive).
* **AudioPlayer events** are sent to your skill at key changes in the status of audio playback, such as when audio has begun playing, been stopped or has finished.  You can use them to track what's currently playing or queue up more content.  Unlike intents, when you receive an AudioPlayer event, you may only respond with appropriate AudioPlayer directives to control playback.

You can learn more about the new [AudioPlayer interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference) and [PlaybackController interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference).

## Solution structure
The codebase of the skill starts with lambda folder at the root and the lambda fuction code starts from ```lambda/src/alexa-interface``` and below are the available directories:

* **constants :** Contains the ```constants.js``` file that holds all the constants used in the skill.
* **controller :** Contains the ```controller.js``` file that contains playback controller events (play/next/prev/pause etc.).
* **handlers :** This folder contains all the handlers used in the skill. Each handler is written separately in the files named same as the handler name.
* **services :** This folder contains ```helperFunction.js``` file which holds the named functions that are used by handlers.
* **services :** This folder contains ```graphqlServices.js``` file which holds the GraphQL end-points serving data to the skill.
* **utilities :** This folder contains the utility files that has been used within the skill such as ```cloudwatchLogger.js```, ```timeZoneUtil``` etc.  
* **index.js:** This file contians ```index.handler``` lambda entry point.