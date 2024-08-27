// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0



const handlePostMoveNotification = async ({ game, mover, opponent }) => {
  const sendEmail = require('./sendEmail')
  // Handle when game is finished
  // if (game.heap1 == 0 && game.heap2 == 0 && game.heap3 == 0) {
  //   const winnerMessage = `You beat ${mover.username} in a game of Nim!`
  //   const loserMessage = `Ahh, you lost to ${opponent.username} in Nim.`
  //   await Promise.all([
  //     sendMessage({ phoneNumber: opponent.phoneNumber, message: winnerMessage }),
  //     sendMessage({ phoneNumber: mover.phoneNumber, message: loserMessage })
  //   ])

  //   return
  // }
  
  
  const winnerMessage = `You beat ${opponent.username} in a game of Tic-TacToe!`;
  const loserMessage = `Ahh, you lost to ${mover.username} in Nim.`;
  const moverTieMessage = `Game over! you and ${opponent.username} tied!`;
  const opponentTieMessage = `Game over! you and ${mover.username} tied!`;
  
  function checkWin(a, b , c){
    return a != -1 && b != -1 && c != -1 && a == b && b == c;
  }
  
  for(let i = 0; i < 3; i ++){ //check rows and columns
    let rowStart = i * 3;
    if(checkWin(game.gameBoard[rowStart], game.gameBoard[rowStart+1], game.gameBoard[rowStart+2])) { //check row
      await Promise.all([
        sendEmail({message: winnerMessage, emailAddress: mover.email}),
        sendEmail({message: loserMessage, emailAddress: opponent.email})
      ]);
      return;
    }    
    
    if(checkWin(game.gameBoard[i], game.gameBoard[i+3], game.gameBoard[i+6])) { // check column
      await Promise.all([
        sendEmail({message: winnerMessage, emailAddress: mover.email}),
        sendEmail({message: loserMessage, emailAddress: opponent.email})
      ]);
      return;
    }
  }
  
  if(checkWin(game.gameBoard[0], game.gameBoard[4], game.gameBoard[8])){  // check diagnols
    await Promise.all([
      sendEmail({message: winnerMessage, emailAddress: mover.email}),
      sendEmail({message: loserMessage, emailAddress: opponent.email})
    ]);
    return;
  }
  
  if(checkWin(game.gameBoard[2], game.gameBoard[4], game.gameBoard[6])){
    await Promise.all([
      sendEmail({message: winnerMessage, emailAddress: mover.email}),
      sendEmail({message: loserMessage, emailAddress: opponent.email})
    ]);
    return;
  }
  
  if(!game.gameBoard.includes(-1)){
    await Promise.all([
      sendEmail({message: moverTieMessage, emailAddress: mover.email}),
      sendEmail({message: opponentTieMessage, emailAddress: opponent.email})
    ]);
    return;
  }

  const message = `${mover.username} has moved. It's your turn next in Game ID ${game.gameId}!`
  await sendEmail({ message: message, emailAddress: opponent.email })
};

module.exports = handlePostMoveNotification;