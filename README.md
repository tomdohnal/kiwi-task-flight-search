# Kiwi.com Modern JS weekend entry task: Flight Search Tool

## How to run the app?

To clone the repositary, run `git clone https://github.com/tomdohnal/kiwi-task-flight-search.git` or `git clone git@github.com:tomdohnal/kiwi-task-flight-search.git`

To install the dependencies, run `yarn install`

To run the app, run `yarn next`

## Features
* fetching results from a GraphQL endpoint (with the help of [Apollo](https://github.com/apollographql))
* "From" and "To" destinations suggestions
* pagination
* form input is pushed to the url so that when the page refreshes, it serverrenders the search results right away (with the help of [next.js](https://github.com/zeit/next.js/))
* prefetching next page when paginating
