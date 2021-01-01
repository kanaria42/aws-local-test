const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  endpoint: 'http://127.0.0.1:9000',
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

s3.createBucket({Bucket: 'testbucket'}, function(err, data) {
  if (err) {
    console.error("Unable to create bucket. Error JSON:", JSON.stringify(err, null, 2));
  } else {
    console.log("Created bucket. Bucket description JSON:", JSON.stringify(data, null, 2));
  }
});