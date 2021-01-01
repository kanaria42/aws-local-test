const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://127.0.0.1:8000', 
  region: 'ap-northeast-1',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey'
});

const params = {
  AttributeDefinitions: [
    {
      AttributeName: "Name", 
      AttributeType: "S"
    }
  ],
  KeySchema: [
    {
      AttributeName: "Name", 
      KeyType: "HASH"
    }
  ], 
  ProvisionedThroughput: {
    ReadCapacityUnits: 5, 
    WriteCapacityUnits: 5
  },
  TableName: 'Image'
};

dynamodb.createTable(params, function(err, data) {
  if (err) {
    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
  }
});