const express = require('express');
const router = express.Router();
const AWS = require("aws-sdk");
const awsConfig = {
  region: "us-east-2",
  endpoint: "http://localhost:8000",

};
AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = "Thoughts";

//route for getting all latest thoughts from users
router.get('/users', (req, res) => {
    const params = {
      TableName: table
    };
    //scan is a method for retrieval (similar to select *?)
    dynamodb.scan(params, (err, data) => {
        if (err) {
          res.status(500).json(err); // an error occurred
        }else {
          res.json(data.Items)
        }
      });
  });

//get throught from specific user
  router.get('/users/:username', (req, res) => {
    console.log(`Querying for thought(s) from ${req.params.username}.`);
    //setting parameters for the dynamodb query
    const params = {
        TableName: table,
        // "where" clause using abbreviations and ExpressionAttributeValues value for the user (comes from the get request route hit)
        KeyConditionExpression: "#un = :user",
        //attributes (table columns) listed with corresponding abbreviations
        ExpressionAttributeNames: {
          "#un": "username",
          "#ca": "createdAt",
          "#th": "thought"
        },
        //describes to aws the "variable" set as ":user" and what its value is
        ExpressionAttributeValues: {
          ":user": req.params.username
        },
        //what is returned
        ProjectionExpression: "#th, #ca, #un",
        //puts descending order
        ScanIndexForward: false
      };
      //sends query params to dynamodb
      dynamodb.query(params, (err, data) => {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          res.status(500).json(err); // an error occurred
        } else {
          console.log("Query succeeded.");
          res.json(data.Items)
        }
      });
    }); // closes the route for router.get(users/:username) 


// Create new user at /api/users
router.post('/users', (req, res) => {
    //defines params from front end sending form data using req.body
  const params = {
    TableName: table,
    Item: {
      "username": req.body.username,
      "createdAt": Date.now(),
      "thought": req.body.thought
    }
  };
  //call to post to the db using put method
  dynamodb.put(params, (err, data) => {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      res.status(500).json(err); // an error occurred
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.json({"Added": JSON.stringify(data, null, 2)});
    }
  });
});  // ends the route for router.post('/users')




  module.exports = router;