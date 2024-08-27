// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require("uuid/v4");
const sendMessage = require("./sendMessage");
const sendEmail = require("./sendEmail");

const createGame = async ({ creator, opponentEmail }) => {
  const params = {
    TableName: "turn-based-game",
    Item: {
      gameId: uuidv4().split('-')[0],
      user1: creator,
      user2: null,
      gameBoard: [-1, -1, -1, -1, -1, -1, -1, -1, -1],
      lastMoveBy: creator
    }
  };

  try {
    await documentClient.put(params).promise();
  } catch (error) {
    console.log("Error creating game: ", error.message);
    throw new Error("Could not create game");
  }

  const message = `Hi. Your friend ${creator} has invited you to a new game! Your game ID is ${params.Item.gameId}`;
  try {
    await sendEmail({ message, emailAddress: opponentEmail});
  } catch (error) {
    console.log("Error sending email: ", error.message);
    throw new Error("Could not send email to user");
  }

  return params.Item;
};

module.exports = createGame;
