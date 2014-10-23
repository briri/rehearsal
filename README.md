# Cedilla Rehearsal

Cedilla_Reheasal is a test framework that tests all of the components of the cedilla system against a series of openURL test cases.

It downloads and installs the component code as defined in the config/sets.yml file. The sets.yml file allows you to swap environment specific configuration files for each component, and also allows you to specify what URL patterns to override in those config files.

The system currently only runs the tests against a LIVE stack of the cedilla framework. If a test has not been seen before it writes the results into the DB. If the test HAS been run before, it compares the current results to those stored in the DB.

When the system is finished testing, the Critic object writes out the 'review' of the tests to a review-play#-[date].log into the root of the project directory.

### Future development

We have already begun building off of this initial full stack test framework to all it to capture all of the inputs and outputs for each of the components so that for example we can see what JSON cedilla sends to cedilla_services and the JSON that cedilla_services sends back to cedilla.

This will allow the future system to run a full stack test, if the test fails, it can then run each component individually to isolate exactly where the issue occurred.

## Terminology
* Actor - A component of the Cedilla framework (e.g. cedilla or the sfx service)
* Play - A high level grouping of tests (e.g. 'Articles')
* Act - A test grouping level (e.g. 'Springer Articles')
* Scene - The openURL test itself (e.g. 'rft.genre=journal&rft.atitle=The ...')
* Script - The lines in/out for the components for each actor/scene.
* Stagehand - A service that downloads, builds, and starts up the pieces of the cedilla framework
* Writer - A service that writes new lines to the script
* Understudy - A service used to study the lines coming in and out for each actor
* Critic - A service that records the results of the tests and writes out the final review
