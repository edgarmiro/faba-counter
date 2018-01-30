'use strict';

process.env.DEBUG = 'actions-on-google:*';

const Assistant = require('actions-on-google').ApiAiAssistant;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const know = admin.database().ref('/faba-counter');
const playersRef = know.child('players');

// Dialogflow Intent names
const ADD_FABA_INTENT = 'add-faba'
const COUNT_FABA_INTENT = 'count-faba'

// Context Parameters
const PLAYER_NAME_PARAM = 'faba_player';

exports.contafaba = functions.https.onRequest((request, response) => {
   console.log('headers: ' + JSON.stringify(request.headers));
   console.log('body: ' + JSON.stringify(request.body));

   const assistant = new Assistant({request: request, response: response});

   let actionMap = new Map();
   actionMap.set(ADD_FABA_INTENT, addFaba);
   actionMap.set(COUNT_FABA_INTENT, countFaba);
   assistant.handleRequest(actionMap);

   function addFaba(assistant) {
        console.log('addFaba');
        const playerName = assistant.getArgument(PLAYER_NAME_PARAM);

        playersRef.child(playerName).once('value', snap => {
            //(snap.val() || {}).count || 0
            var count = (snap.val() !== null) ? snap.val().count : 0;

            playersRef.child(playerName).set({
                count: count + 1
            });

            //const speech = `<speak>Faba añadida a ${playerName}</speak>`;
            //assistant.ask(speech);

            // TODO: Hola
        });
   }

   function countFaba(assistant) {
        console.log('countFaba');
        const playerName = assistant.getArgument(PLAYER_NAME_PARAM);

        playersRef.child(playerName).once('value', snap => {
            var count = (snap.val() !== null) ? snap.val().count : 0;

            const speech = `<speak>${playerName} lleva ${count} fabas</speak>`;
            assistant.ask(speech);
        });
   }
});