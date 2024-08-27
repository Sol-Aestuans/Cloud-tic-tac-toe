// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const express = require("express");
const bodyParser = require("body-parser");
const { createGame, fetchGame, performMove, handlePostMoveNotification, joinGame } = require("./data");
const {
  createCognitoUser,
  login,
  fetchUserByUsername,
  verifyToken
} = require("./auth");
const { validateCreateUser, validateCreateGame, validatePerformMove } = require("./validate");

const app = express();
app.use(bodyParser.json());

function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}
// Login
app.post("/login", wrapAsync(async (req, res) => {
  const idToken = await login(req.body.username, req.body.password);
  res.json({ idToken });
}));

// Create user
app.post("/users", wrapAsync(async (req, res) => {
  const validated = validateCreateUser(req.body);
  if (!validated.valid) {
    throw new Error(validated.message);
  }
  const user = await createCognitoUser(
    req.body.username,
    req.body.password,
    req.body.email,
    //req.body.phoneNumber
  );
  res.json(user);
}));

// Create new game
app.post("/games", wrapAsync(async (req, res) => {
  const validated = validateCreateGame(req.body);
  if (!validated.valid) {
    throw new Error(validated.message);
  }
  const token = await verifyToken(req.header("Authorization"));
  const opponentEmail = req.body.opponentEmail;
  const game = await createGame({
    creator: token["cognito:username"],
    opponentEmail: opponentEmail
  });
  res.json(game);
}));

// Join game
app.post("/games/:gameId/join", wrapAsync(async (req, res) => {
  const token = await verifyToken(req.header("Authorization"));
  const gameId = req.params.gameId;
  
  const game = await fetchGame(gameId);
  if (!game || game.user2 !== null) {
    throw new Error("Unable to join game.");
  }
  await joinGame({ 
    gameId,
    newPlayer: token["cognito:username"] 
  });

  res.json({ message: "Player Joined Succesfully" });
}));

// Fetch game
app.get("/games/:gameId", wrapAsync(async (req, res) => {
  const game = await fetchGame(req.params.gameId);
  res.json(game);
}));

// Perform move
app.post("/games/:gameId", wrapAsync(async (req, res) => {
  const validated = validatePerformMove(req.body);
  if (!validated.valid) {
    throw new Error(validated.message);
  }
  const token = await verifyToken(req.header("Authorization"));
  const game = await performMove({
    gameId: req.params.gameId,
    user: token["cognito:username"],
    newGameBoard: req.body.newGameBoard
  });
  let opponentUsername
  if (game.user1 !== game.lastMoveBy) {
    opponentUsername = game.user1
  } else {
    opponentUsername = game.user2
  }
  const opponent = await fetchUserByUsername(opponentUsername);
  const mover = await fetchUserByUsername(token['cognito:username']);

  await handlePostMoveNotification({ game, mover, opponent })
  res.json(game);
}));

app.use(function(error, req, res, next) {
  res.status(400).json({ message: error.message });
});

module.exports = app;
