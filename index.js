var express    = require('express');
var bodyParser = require('body-parser');
var request    = require('request');
var mysql = require('mysql');

var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'admin123!@#',
  database: 'logos_veiculos'
});
conn.connect();

const API_URL = 'https://www.rdstation.com.br/api/1.3/conversions';
const TOKEN_API = '62d9c778fa41b8ad8d694143731ceb6d'; 
const CHAVE = '41802ca9f25a956fe22f';
const URL = 'http://localhost:3021/api/ofertas';
const GAT = 'http://localhost:3021/api/apis';
// const URL = `https://api.awsli.com.br/v1/categoria/?format=json&chave_api=41802ca9f25a956fe22f`;

var app = express();
app.use(bodyParser.json());

app.listen(3099, function() {
    console.log('Estamos Activo en el puerto 3099');
    setInterval(function() {
      Read();
    }, 5000);
});

app.get('/', function(req, res) {
  
  console.log(url);
  console.log(res.statusCode);
  res.send('Bem vindos ao palestra');
});

function Read () {
  console.log(URL);
  request(URL, function (error, response, body) {
    var text = JSON.parse(body);
    var pop = text.pop();
    console.log('Oferta statusCode é => ', response.statusCode)
    countViaMySQL(pop);
  });
}

function countViaMySQL(pop) {
  var sql = `SELECT count(id) As cadastrado FROM api WHERE oferta_id=${pop.id}`;
  conn.query(sql, function(err, rows, fields) {
    if(err) throw err;
    if(rows[0].cadastrado == 0) {
      console.log(`El Id ${ rows[0].cadastrado} pode se cadastrado`);
      Add(pop);
    } else {
      console.log('Já está cadastrado');
    }
  });
}

function countViaAPI(pop) {
  request(`${GAT}/count?where[oferta_id]=${pop.id}`, function(err, res, body2) {
    if(JSON.parse(body2).count == 0) {
      console.log(`El Id ${pop.id} pode se cadastrado`);
      Add(pop);
    } else {
      console.log('Já está cadastrado');
    }
  })
}

function Add(pop) {
  var Form = {
    oferta_id: pop.id,
      nome: pop.nome,
      ativo: pop.ativo
  };

  var sql2 = `INSERT INTO api (oferta_id, nome, ativo) VALUES (${pop.id}, '${pop.nome}', ${pop.ativo});`;
  console.log(sql2);
  conn.query(sql2, function(err, rows) {
    if(err) throw err;
    console.log('Linha Afetada: ', rows.affectedRows);
    console.log('Id: ', rows.insertId);
  
  });

  RdStation(Form);
  console.log(`Cadastro feito pra id => ${pop.id}`);
}

function RdStation(pop) {
  const data = {
    token_rdstation: TOKEN_API,
    identificador: "Test API",
    email: 'test@gmail.com',
    oferta_id: pop.id,
    nome: pop.nome,
    ativo: pop.ativo
  }; 

  request({
    'method': 'POST', 
    'url': API_URL,
    'headers': {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    'json': data
  });
  console.log(`Cadastro feito pra id => ${pop.id}`);
}