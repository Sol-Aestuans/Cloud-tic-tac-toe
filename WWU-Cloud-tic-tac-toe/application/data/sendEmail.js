// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const ses = new AWS.SES({region: "us-east-1"});
const sendEmail = async ({message, emailAddress }) => {
  var params = {
  Destination: {
      ToAddresses: [emailAddress],
    },
    Message: { 
      Body: { 
        Html: {
         Charset: "UTF-8",
         Data: message
        },
       },
       Subject: {
        Charset: 'UTF-8',
        Data: 'Tic Tac Toe Notification'
       }
      },
    Source: 'wassonr@wwu.edu',
  };
  console.log("Email: ", emailAddress);
  return ses.sendEmail(params).promise();
};

module.exports = sendEmail;
