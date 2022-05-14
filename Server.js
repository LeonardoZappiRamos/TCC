const express = require('express');
const Router = require('./src/routes');

const app = express();

//const clientDir = path.join(__dirname, '../client');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//app.use(express.static(`${clientDir}/public`));

app.use(Router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, 'localhost', () => {
  console.log('listening on port ' + PORT)
});