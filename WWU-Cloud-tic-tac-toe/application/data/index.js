// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const createGame = require("./createGame");
const fetchGame = require("./fetchGame");
const performMove = require("./performMove");
const handlePostMoveNotification = require('./handlePostMoveNotification');
const sendEmail = require('./sendEmail');
const joinGame = require('./joinGame');

module.exports = {
  createGame,
  fetchGame,
  performMove,
  handlePostMoveNotification,
  sendEmail,
  joinGame
};
