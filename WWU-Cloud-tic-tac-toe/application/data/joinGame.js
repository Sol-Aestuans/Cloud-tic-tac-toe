const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const joinGame = async ({ gameId, newPlayer}) => {


  const params = {
    TableName: "turn-based-game",
    Key: {
      gameId: gameId
    },
    UpdateExpression: `SET user2 = :newPlayer`,
    ExpressionAttributeValues: {
      ":newPlayer": newPlayer
    },
    ReturnValues: "ALL_NEW"
  };
  try {
    const resp = await documentClient.update(params).promise();
    return resp.Attributes;
  } catch (error) {
    console.log("Error updating item: ", error.message);
    throw new Error('Could not add player')
  }
};

module.exports = joinGame