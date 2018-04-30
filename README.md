# Kitchen Helper - Meal Recommendation Life Hack with Amazon Alexa using Yummly API
Kitchen Helper allows users to engage the Yummly API through Amazon Alexa to answer the age-old question "What should I eat for dinner?". Kitchen Helper takes advantage of the Yummly API vast recipe database to provide meal suggestions based on dynamic user input. This speedy life hack provides helpful meal suggestions based off of user-provided slot-data. 

## Inspiration
The inspiration for this Life Hack came from my own personal experience with a fridge of leftover ingredients as well as many a conversation of "What do you want to eat?" "I don't know?". 'Kitchen Helper' is designed to provide fast, easy meal inspiration and quickly resolve those disputes. I did extensive market research on the Alexa Skills store to determine what was most downloaded and what the main complaints were to try and see if I could meet a need. The full functionality of Kitchen Helper is designed to meet these needs, as is evidenced in the Alexa skill JSON, but I wasn't able to fully flesh out the back end in the alloted time period.

## What it does
'Kitchen Helper' Takes in a Main Ingredient from the user, accesses the Yummly API and returns a list of meal ideas. The goal is to provide the user with quick and easy meal inspiration. 

## How I built it
I built it primarily using Alexa Skills Kit and AWS Lambda. To get some of the Dialogue prompts working, I based it off of the Decision Tree skill from the Alexa SDK github (https://github.com/alexa/skill-sample-nodejs-decision-tree). I also used the ws-yummly module to access the Yummly API (https://www.npmjs.com/package/ws-yummly). I used the Hackathon Access for the Yummly API for the recipe calls (https://developer.yummly.com/documentation). Inspiration for moving through the list was drawn from the Virtual Librarian skill (https://github.com/darianbjohnson/VirtualLibrarian). 

## Challenges I ran into
The biggest challenge was returning the information from the API. Debugging that process took the majority of the allotted time. Now that I've overcome that hurdle, I'll be able to greatly improve this project for the next hackathon, but I simply ran out of time. 

## Accomplishments that I'm proud of
This is my first published Alexa skill, my first major foray into Node.JS, first major API access. A lot of firsts in this project. Its a great foundational project for me. I had hoped to accomplish more, but I'm extremely proud of it.

## What I learned
I learned how to access an API from Lambda, how to publish an Alexa skill, how to have Alexa prompt the user for information, how to test javascript locally. One of the biggest learning projects for me. I'm very proud of what I've accomplished, though I wish I could have delivered the full Kitchen Helper experience.

## What's next for Kitchen Helper
If I can maintain API access, I want to get the Alexa Echo and Spot components working. I have it to where the API call is retreiving the recipies and the final skill is supposed to display the pictures in list form on the Show and then click to see the recipe. 

