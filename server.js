const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-3';

//const awsConfig = require('aws-config');
/*const awsConfig =  {
  'region': 'eu-west-3',
  'endpoint': 'http://localhost:8000',
  'accessKeyId': 'BLBLBLBLBLBLB',
  'secratAccessKey': 'BLBLBLBLBLLBLBLBLB'
};
AWS.config.update(awsConfig);
*/
//const s3 = new AWS.S3({});

const PORT = process.env.HTTP_PORT || 8081;
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the app root !');
});

app.get('/test', (req, res) => {
  res.send('Test route ! ! ! ');
});


//---------------------------------- ACCOUNT -----------------------------------------------

app.get('/account', (req, res) => {
  console.log('IN /account');
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Account',
    KeyConditionExpression: 'emailAccount = :valEmail',
    FilterExpression: 'passwordAccount = :valPassword',
    ExpressionAttributeValues: {
      ':valEmail': req.query.login,
      ':valPassword': req.query.password
    }
  };

  docClient.query(params, (error, data) => {
    if (error) {
      console.log('ERROR : '+ JSON.stringify(error, null, 2) );
    }
    else {
      res.send( { result: data.Items } );
      console.log('SUCCESS : '+ JSON.stringify(data, null, 2) );
    }
  });
});

app.post('/account', (req,res) => {
  console.log('IN create account');
  console.log('req.body : '+JSON.stringify(req.body, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Account',
    Item: {
      emailAccount: req.body.email,
      passwordAccount: req.body.password,
      restaurantName: req.body.nameRestaurant,
      type: req.body.accountType,
    }
  }
  docClient.put(params, (error, data) => {
    if (error) {
      console.log('ERROR DURING ADD NEW ACCOUNT : '+error);
    }
    else {
      console.log('SUCCESS CREATE account : '+ JSON.stringify(params.Item, null, 2) );
      res.send({ result: params.Item });
    }
  });
});


app.put('/account', (req,res) => {
  console.log('IN update account');
  console.log('req.body : '+JSON.stringify(req.body, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Account',
    Key: {
        emailAccount: req.body.email,
    },
    ConditionExpression: 'passwordAccount = :valPassword',
    UpdateExpression: 'set passwordAccount = :value',
    ExpressionAttributeValues: { // a map of substitutions for all attribute values
        ':value': req.body.new,
        ":valPassword": req.body.old,
    },
    ReturnValues: 'ALL_NEW',
  };
  docClient.update(params, function(error, data) {
    if (error) {
      console.log('ERROR DURING update account : '+error);
    }
    else {
      console.log('SUCCESS update account : '+ JSON.stringify(data, null, 2) );
      res.send({ result: data });
    }
  });
});

//---------------------------------- CLIENT -----------------------------------------------

app.get('/clients', (req, res) => {
  console.log('IN /clients');
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Client',
    Key: {  }
  }

  docClient.scan(params, (error, data) => {
    if (error) {
      console.log('ERROR : '+ JSON.stringify(error, null, 2) );
    }
    else {
      res.send( { result: data.Items } );
      console.log('SUCCESS : '+ JSON.stringify(data, null, 2) );
    }
  });
});

app.post('/client', (req, res) => {
  console.log('IN POST CLIENT');
  console.log('req.body : '+JSON.stringify(req.body, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Client',
    Item: req.body
  }

  docClient.put(params, (error, data) => {
    if (error) {
      console.log('ERROR DURING ADD NEW CLIENT : '+error);
    }
    else {
      console.log('SUCCESS CREATE client : '+ JSON.stringify(data, null, 2) );
      //res.send( { result: data.Items } );
      res.send({ result: params.Item });
    }
  });
});

//---------------------------------- CONTRACT -----------------------------------------------

app.get('/client/:clientName/contracts', (req, res) => {
  console.log('IN /contrats ');
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: "Contract",
      IndexName: "clientNameIndex",
      KeyConditionExpression: "clientName = :name",
      ExpressionAttributeValues: {
          ":name": req.params.clientName
      }
  };
  docClient.query(params, function(err, data) {
      if (err){
        console.log("ERROR IN GET CONTRAT : "+JSON.stringify(err, null, 2));
        res.send(err);
      }
      else {
        console.log('SUCESS IN GET CONTRAT')
        res.send(data);
      }
  });
});

app.post('/client/:clientName/contract', (req, res) => {
  console.log('IN POST CONTRAT');
  console.log('req.body : '+JSON.stringify(req.body, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Contract',
    Item: req.body
  }

  docClient.put(params, (error, data) => {
    if (error) {
      console.log('ERROR DURING ADD NEW CONTRAT : '+error);
    }
    else {
      console.log('SUCCESS CREATE contract : '+ JSON.stringify(params.Item, null, 2) );
      //res.send( { result: data.Items } );
      res.send({ result: params.Item });
    }
  });
});

//---------------------------------- RESTAURANT -----------------------------------------------

app.get('/contract/:contractName/restaurants', (req, res) => {
  console.log('IN /restaurants for :'+req.params.contractName);
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: "Restaurant",
      IndexName: "contractNameIndex",
      KeyConditionExpression: "contractName = :name",
      ExpressionAttributeValues: {
          ":name": req.params.contractName
      }
  };
  docClient.query(params, function(err, data) {
      if (err){
        console.log("ERROR IN GET RESTAURANT : "+JSON.stringify(err, null, 2));
        res.send(err);
      }
      else {
        console.log('SUCCESS IN GET RESTAURANT')
        res.send(data);
      }
  });
});

app.post('/contract/:contractName/restaurant', (req, res) => {
  console.log('IN POST RESTAURANT');
  console.log('req.body : '+JSON.stringify(req.body, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Restaurant',
    Item: req.body
  }

  console.log('The Item : '+JSON.stringify(params.Item, null, 2));

  docClient.put(params, (error, data) => {
    if (error) {
      console.log('ERROR DURING ADD NEW RESTAURANT : '+error);
    }
    else {
      console.log('SUCCESS CREATE restaurant : '+ JSON.stringify(params.Item, null, 2) );
      //res.send( { result: data.Items } );
      res.send({ result: params.Item });
    }
  });
});


// ----------------------------------- FOOD ----------------------------------------------

app.get('/food/:foodName', (req,res) => {
  console.log('IN GET FOOD ! : '+ req.params.foodName);
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: 'Food',
    KeyConditionExpression: 'nameFood = :name',
    ExpressionAttributeValues: {
      ':name': req.params.foodName
    }
  };
  docClient.query(params, function(err, data) {
      if (err){
        res.send(err);
      }
      else {
        console.log('succes get food : '+JSON.stringify(data, null, 2));
        res.send(data);
      }
  });
});


app.get('/category/:nameCategory/foods', (req,res) => {
  console.log('IN GET FOOD ! : '+ req.params.nameCategory);
  const docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: 'Food',
    IndexName: 'categoryIndex',
    KeyConditionExpression: 'categoryFood = :nameCategory',
    ExpressionAttributeValues: {
      ':nameCategory': req.params.nameCategory
    }
  };
  docClient.query(params, function(err, data) {
      if (err){
        res.send(err);
      }
      else {
        console.log('succes get food fo category : '+JSON.stringify(data, null, 2));
        res.send(data);
      }
  });
});



// ----------------------------------- SAMPLE ---------------------------------------------


app.get('/gaspillage/:restaurantName', (req,res) => {
  console.log('IN GET GASPILLAGE ! : '+ req.params.restaurantName+' - '+ JSON.stringify(req.query, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();

  if (req.query.food == undefined){
    var params = {
      TableName: 'Sample',
      IndexName: 'dateFoodIndex',
      KeyConditionExpression: 'dateTimeSample = :valDate',
      FilterExpression: 'restaurantName = :valRestaurant',

      ExpressionAttributeValues: {
        ':valDate': req.query.date,
        ':valRestaurant': req.params.restaurantName
      }
    };
  }
  else {
    var params = {
      TableName: 'Sample',
      IndexName: 'dateFoodIndex',
      KeyConditionExpression: 'dateTimeSample = :valDate and foodName = :valFood',
      FilterExpression: 'restaurantName = :valRestaurant',

      ExpressionAttributeValues: {
        ':valDate': req.query.date,
        ':valFood': req.query.food,
        ':valRestaurant': req.params.restaurantName
      }
    };
  }

  console.log('params : '+JSON.stringify(params.ExpressionAttributeValues, null, 2));
  docClient.query(params, function(err, data) {
      if (err){
        res.send(err);
      }
      else {
        console.log('result gaspi : '+JSON.stringify(data, null, 2));
        res.send(data);
      }
  });
});


// ------------------------ update restaurant after create account -----------------

app.put('/restaurant', (req,res) => {
  console.log('IN update restaurant');
  console.log('req.body : '+JSON.stringify(req.body, null, 2));
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'Restaurant',
    Key: {
        nameRestaurant: req.body.params.name,
    },
    UpdateExpression: 'set accountCreated = :value',
    ExpressionAttributeValues: { // a map of substitutions for all attribute values
        ':value': true
    },
    ReturnValues: 'ALL_NEW',
  };
  docClient.update(params, function(error, data) {
    if (error) {
      console.log('ERROR DURING update restaurant : '+error);
    }
    else {
      console.log('SUCCESS update restaurant : '+ JSON.stringify(data, null, 2) );
      res.send({ result: data });
    }
  });
});








/*
app.get('/sendS3', (req, res) => {
  console.log('Trying to send data to s3');
  const params = {
    Bucket: 'elasticbeanstalk-eu-west-3-147081556213',
    Key: 'myTestFile.json',
    Body: JSON.stringify({
      name: 'Meat',
      quantity: '52g'
    })
  };
  s3.upload(params, function(err, data) {
    console.log('IN CALLBACK');
    console.log(err, data);
  });
});
*/
/*
app.get('/getS3', (req, res) => {
  var file = 'myTestFile.json';
   console.log('Trying to download file');

   var s3 = new AWS.S3({});

   var options = {
       Bucket: 'elasticbeanstalk-eu-west-3-147081556213',
       Key: file,
   };

   s3.getObject(options, function(err, data) {
     console.log('Begin callback');
     res.attachment(file);
     //console.log(data.Body);
     //console.log('json? : '+JSON.parse(data.Body));
     res.json(JSON.parse(data.Body));
     console.log(JSON.parse(data.Body).name)
     console.log('End callback');
 });
});
*/



app.get('/repas', (req, res) => {
  res.json({
    name: 'Meat',
    quantity: '52g'
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});
