// APP related
const express = require('express');
const cors = require('cors');
// - APIs related
const superagent = require('superagent');
const methodOverride = require('method-override');


// - database related
const pg = require('pg');
require('dotenv').config();
const client = new pg.Client(process.env.DATABASE_URL);


const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(methodOverride('_method'));

function Fact(data){
  this.type = data.type;
  this.text = data.text;
}

// /home end point
app.get('/home', handleHome);
app.get('/facts', handleGettingFavFacts);
app.post('/facts', handleAddFact);
app.get('/facts/:id', handleFactDetails);
app.put('/facts/:id', handleUpdatingFact);
app.delete('/facts/:id', handleDeletingFact);
app.get('/test', handleGetTest);
app.post('/test', handlePostTest);

function handleGetTest(req,res){
  res.send(req.query);
}


function handlePostTest(req,res){
  res.send(req.body);
}




function handleHome(req,res){
  let dataArr = [];
  let url = 'https://cat-fact.herokuapp.com/facts';
  superagent.get(url).then(data =>{
    data.body.all.forEach(element => {
      dataArr.push(new Fact(element));
    });
    res.render('home-page',{result:dataArr});
  });
}

function handleAddFact(req,res){
  let query = 'INSERT INTO fact (type,text) VALUES ($1,$2);';
  let values = [req.body.type,req.body.text];

  client.query(query,values).then(()=>{
    res.redirect('/facts');
  });

}

function handleGettingFavFacts(req,res){
  let query = 'SELECT * FROM fact;';
  client.query(query).then(data =>{
    res.render('fav-facts',{result: data.rows});
  });
}

function handleFactDetails(req,res){
  let query = 'SELECT * FROM fact WHERE id = $1;';
  let values = [req.params.id];
  client.query(query,values).then(data=>{
    res.render('fact-details', {result: data.rows[0]});
  });
}

function handleUpdatingFact(req, res){
  let query = 'UPDATE fact SET type = $1, text = $2 WHERE id = $3;';
  let values = [req.body.type, req.body.text, req.params.id];
  client.query(query,values).then(()=>{
    res.redirect('/facts');
  });
}

function handleDeletingFact(req,res){
  let query = 'DELETE FROM fact WHERE id = $1;';
  let values = [req.params.id];
  client.query(query,values).then(()=>{
    res.redirect('/facts');
  });
}


client.connect().then(()=>{
  app.listen(PORT, ()=>{
    console.log(`app listening on port ${PORT}`);
  });
});
