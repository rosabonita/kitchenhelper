"use strict";
const Alexa = require('alexa-sdk');
const SKILL_ID = 'amzn1.ask.skill.e5b77d98-2a9c-4170-9445-3c66578617d1';

const Yummly = require('ws-yummly');
Yummly.config({
	app_key: 'APP KEY GOES HERE',
	app_id: 'APP ID GOES HERE'
});

let handlers = {
    "LaunchRequest": function () {
        console.log("in LaunchRequest");
        this.response.speak("Welcome to Kitchen Helper. To begin, say 'recommend a recipe'.");
        this.response.listen("To begin, say 'recommend a recipe'.");
        this.emit(":responseReady");
    },
    "NoResponseIntent": function () {

        this.response.speak("Goodbye.");
        this.emit(":responseReady");
    },
    "RecommendationIntent": async function main () {
        // delegate to Alexa to collect all the required slots

        let filledSlots = delegateSlotCollection.call(this);

        if (!filledSlots) {
            return;
        }

        console.log("filled slots: " + JSON.stringify(filledSlots));
        // at this point, we know that all required slots are filled.
        let slotValues = getSlotValues(filledSlots);

        console.log(JSON.stringify(slotValues));

        const mainIngredientQuery = slotValues.mainIngredient.resolved;
				const courseQuery = slotValues.course.resolved;
				const resp = await Yummly.query(mainIngredientQuery)
		        .maxTotalTimeInSeconds(1400)
		        .maxResults(5)
						.allowedCourses(courseQuery)
		        .minRating(3)
		        .get();
		    const list_of_recipes = resp.matches.map(recipe => recipe.recipeName);

				if (list_of_recipes.length === 0){
					var speechOutput = {
						speech: speech_preamble + "I did not find any recipes using " + mainIngredientQuery + ". Goodbye.",
						type: AlexaSkill.speechOutputType.PLAIN_TEXT
				};
			}

				var speech_addendum = ". ";
				var title_addendum = "";
				if (list_of_recipes.length > 5){
					speech_addendum = ". Here are the first five. "
				};
				if (list_of_recipes.length > 1){
					title_addendum = "s";
				};

				var speechText = "I've found " + list_of_recipes.length + " recipe" + title_addendum + " using " + mainIngredientQuery + speech_addendum;
				var cardContent = "";
				var start_list = 0;
				var end_list = 5;

				for (var i = start_list,length = list_of_recipes.length; i < length; i++ ) {
					var name = list_of_recipes[i];
					if ( i<end_list ){
						speechText = speechText + " " + name + " . ";
					};
				};


				var speechOutput = speechText;
				var repromptSpeech = "To hear more recipes, say 'recommend a recipe'";

				this.emit(':ask', speechOutput, repromptSpeech);
			},

    "SessionEndedRequest": function () {
        console.log("Session ended with reason: " + this.event.request.reason);
    },
    "AMAZON.StopIntent": function () {
        this.response.speak("Goodbye");
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function () {
        this.response.speak("This is Kitchen Helper. I can provide recipe suggestions based on ingredients. " +
           "You can say, 'recommend a recipe'.").listen("Would you like me to match you with a recipe? Say 'yes' or 'no'.");
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak("Goodbye");
        this.emit(":responseReady");
    },
    "Unhandled": function () {
        this.response.speak("Sorry, I didn't get that. You can try: 'Alexa, tell Kitchen Helper to" +
            " recommend a recipe.'");
    }
};

exports.handler = function (event, context) {

    // Each time your lambda function is triggered from your skill,
    // the event's JSON will be logged. Check Cloud Watch to see the event.
    // You can copy the log from Cloud Watch and use it for testing.
    console.log("====================");
    console.log("REQUEST: " + JSON.stringify(event));
    console.log("====================");
    let alexa = Alexa.handler(event, context);

    // Part 3: Task 4
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const REQUIRED_SLOTS = [
    "mainIngredient",
		"course"
];

// ***********************************
// ** Dialog Management
// ***********************************

function getSlotValues(filledSlots) {
    //given event.request.intent.slots, a slots values object so you have
    //what synonym the person said - .synonym
    //what that resolved to - .resolved
    //and if it's a word that is in your slot values - .isValidated
    let slotValues = {};

    console.log("The filled slots: " + JSON.stringify(filledSlots));
    Object.keys(filledSlots).forEach(function (item) {

        // console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));

        let name = filledSlots[item].name;
        //console.log("name: "+name);

        if (filledSlots[item] &&
             filledSlots[item].resolutions &&
             filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
             filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
             filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            case "ER_SUCCESS_MATCH":
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                    "isValidated": true
                };
                break;
            case "ER_SUCCESS_NO_MATCH":
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved": filledSlots[item].value,
                    "isValidated":false
                };
                break;
            }
        } else {
            slotValues[name] = {
                "synonym": filledSlots[item].value,
                "resolved": filledSlots[item].value,
                "isValidated": false
            };
        }
    },this);

    //console.log("slot values: "+JSON.stringify(slotValues));
    return slotValues;
}

// This function delegates multi-turn dialogs to Alexa.
// For more information about dialog directives see the link below.
// https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html
function delegateSlotCollection() {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);

    if (this.event.request.dialogState === "STARTED") {
        console.log("in STARTED");
        console.log(JSON.stringify(this.event));
        let updatedIntent = this.event.request.intent;
        // optionally pre-fill slots: update the intent object with slot values
        // for which you have defaults, then return Dialog.Delegate with this
        // updated intent in the updatedIntent property

        disambiguateSlot.call(this);
        console.log("disambiguated: " + JSON.stringify(this.event));
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        let updatedIntent = this.event.request.intent;
        //console.log(JSON.stringify(this.event));

        disambiguateSlot.call(this);
        this.emit(":delegate", updatedIntent);
    } else {
        console.log("in completed");
        //console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent.slots;
    }
    return null;
}

// If the user said a synonym that maps to more than one value, we need to ask
// the user for clarification. Disambiguate slot will loop through all slots and
// elicit confirmation for the first slot it sees that resolves to more than
// one value.
function disambiguateSlot() {
    let currentIntent = this.event.request.intent;
    let prompt = "";
    Object.keys(this.event.request.intent.slots).forEach(function (slotName) {
        let currentSlot = currentIntent.slots[slotName];
        // let slotValue = slotHasValue(this.event.request, currentSlot.name);
        if (currentSlot.confirmationStatus !== "CONFIRMED" &&
            currentSlot.resolutions &&
            currentSlot.resolutions.resolutionsPerAuthority[0]) {

            if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                // if there's more than one value that means we have a synonym that
                // mapped to more than one value. So we need to ask the user for
                // clarification. For example if the user said "mini dog", and
                // "mini" is a synonym for both "small" and "tiny" then ask "Did you
                // want a small or tiny dog?" to get the user to tell you
                // specifically what type mini dog (small mini or tiny mini).
                if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                    prompt = "Which would you like";
                    let size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                    currentSlot.resolutions.resolutionsPerAuthority[0].values.forEach(function (element, index, arr) {
                        prompt += ` ${(index === size - 1) ? " or" : " "} ${element.value.name}`;
                    });

                    prompt += "?";
                    let reprompt = prompt;
                    // In this case we need to disambiguate the value that they
                    // provided to us because it resolved to more than one thing so
                    // we build up our prompts and then emit elicitSlot.
                    this.emit(":elicitSlot", currentSlot.name, prompt, reprompt);
                }
            } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_NO_MATCH") {
                // Here is where you'll want to add instrumentation to your code
                // so you can capture synonyms that you haven't defined.
                console.log("NO MATCH FOR: ", currentSlot.name, " value: ", currentSlot.value);

                if (REQUIRED_SLOTS.indexOf(currentSlot.name) > -1) {
                    prompt = "What " + currentSlot.name + " are you looking for";
                    this.emit(":elicitSlot", currentSlot.name, prompt, prompt);
                }
            }
        }
    }, this);
}

// Given the request an slot name, slotHasValue returns the slot value if one
// was given for `slotName`. Otherwise returns false.
function slotHasValue(request, slotName) {

    let slot = request.intent.slots[slotName];

    // uncomment if you want to see the request
    // console.log("request = "+JSON.stringify(request));
    let slotValue;

    // if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        // we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        // we didn't get a value in the slot.
        return false;
    }
}
/*
function getRecipeList(intent, session, response){

	var mainIngredient;

	sessionAttributes.listName = "recipe_name";

		const mainIngredientQuery = slotValues.mainIngredient.resolved;
		const resp = await Yummly.query(mainIngredientQuery)
				.maxTotalTimeInSeconds(1400)
				.maxResults(20)
				.minRating(3)
				.get();
		const listOfRecipes = resp.matches.map(recipe => recipe.recipeName);

		if (listOfRecipes.length === 0){
			var speechOutput = {
				speech: speech_preamble + "I did not find any recipes using " + mainIngredient + ". Goodbye.",
				type: AlexaSkill.speechOutputType.PLAIN_TEXT
			};
			response.tell(speechOutput);
		}

			var speech_addendum = ". ";
			var title_addendum = "";
			if (listOfRecipes.length > 5){
				speech_addendum = ". Here are the first five. "
			}
			if (listOfRecipes.length > 1){
				title_addendum = "s";
			}

			var speechText = speech_preamble + "I've found " + listOfRecipes.length + " title" + title_addendum + " by " + mainIngredient + speech_addendum;
			var cardContent = ""
			var start_list = 0;
			var end_list = 5;

			for (var i = start_list,length = listOfRecipes.length; i < length; i++ ) {

				name = listOfRecipes[i];

				}


				sessionAttributes.listOfRecipes = listOfRecipes;
				sessionAttributes.start_list= start_list;
				sessionAttributes.end_list= end_list;
				session.attributes = sessionAttributes;

				if ( i<end_list ){
					speechText = speechText;
				}

			}

			//response formatting based on the number of items in the list
			if (listOfRecipes.length > 5){
				var repromptText = "To continue, say 'next'. To hear more about a recipe, tell me the number. To go back, say 'previous'.";
			}else{
				var repromptText = "To hear more about a recipe, tell me the number.";
			}

			//formats the responses based on the number of times the user has interacted with the skill
			handleUserSessionCount(session,function (count){

				if (count < 5) {
					speechText = speechText + '<p>' + repromptText + '</p>';
				}

				var speechOutput = {
					speech: "<speak>" + speechText + "</speak>",
					type: AlexaSkill.speechOutputType.SSML
				};
				var repromptOutput = {
					speech: repromptText,
					type: AlexaSkill.speechOutputType.PLAIN_TEXT
				};

				response.ask(speechOutput, repromptOutput);

			});
		});

	}

}
*/
