const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const check_auth = require('./check_auth');

const app = express();

mongoose //YnwLdH8guBV9EOam
  .connect(
    //"mongodb://ladder:YnwLdH8guBV9EOam@cluster0-shard-00-00-cvuiq.mongodb.net:27017,cluster0-shard-00-01-cvuiq.mongodb.net:27017,cluster0-shard-00-02-cvuiq.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"
    "mongodb://localhost:27017/myapp"
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(error => {
    console.log(error);
  });

app.use(express.json());

const Player = require('./models/player');
const Match = require('./models/match');


app.get((req, res, next) =>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
})

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

// Ladder Table
function predicateBy(prop) {
  return (a, b) => {
    if (a[prop] > b[prop]) {
      return -1;
    } else if (a[prop] < b[prop]) {
      return 1;
    }
    return 0;
  };
}
// Squash Data
app.get('/api/table/squash', (req, res, next) => {
  const squashData = [];
  Player.find().then(documents => {
    for (let i = 0; i < documents.length; i++) {
      squashData.push({
        id: documents[i]["_id"],
        rank: null,
        username: documents[i]["name"],
        points: documents[i]["squash_score"],
        category: documents[i]["category"]
      });
    }
    squashData.sort(predicateBy("points"));

    for (let i = 0; i < squashData.length; i++) {
      squashData[i].rank = i + 1;
    }
    res.status(200).json(squashData);
  });
});
// Table Tennis Data
app.get('/api/table/tt', (req, res, next) => {
  const ttData = [];
  Player.find().then(documents => {
    for (let i = 0; i < documents.length; i++) {
      ttData.push({
        id: documents[i]["_id"],
        rank: null,
        username: documents[i]["name"],
        points: documents[i]["tt_score"],
        category: documents[i]["category"]
      });
    }
    ttData.sort(predicateBy("points"));

    for (let i = 0; i < ttData.length; i++) {
      ttData[i].rank = i + 1;
    }
    res.status(200).json(ttData);
  });
});
// Lawn Tennis Data
app.get('/api/table/tennis', (req, res, next) => {
  const tennisData = [];
  Player.find().then(documents => {
    for (let i = 0; i < documents.length; i++) {
      tennisData.push({
        id: documents[i]["_id"],
        rank: null,
        username: documents[i]["name"],
        points: documents[i]["tennis_score"],
        category: documents[i]["category"]
      });
    }
    tennisData.sort(predicateBy("points"));

    for (let i = 0; i < tennisData.length; i++) {
      tennisData[i].rank = i + 1;
    }
    res.status(200).json(tennisData);
  });
});
// Badminton Data
app.get('/api/table/badminton', (req, res, next) => {

  const badmintonData = [];
  Player.find().then(documents => {
    for (let i = 0; i < documents.length; i++) {
      badmintonData.push({id: documents[i]['_id'], rank: null, username: documents[i]['name'], points: documents[i]['baddy_score'], category: documents[i]['category']});
    }
    badmintonData.sort(predicateBy("points"));

    for (let i = 0; i < badmintonData.length; i++) {
      badmintonData[i].rank = i + 1;
    }
    res.status(200).json(badmintonData);
  });
});

// Add a challenge
app.post('/api/addMatch', (req, res, next) => {
  const match = new Match({
    p1_id: req.body.p1_id,
    p1_name: req.body.p1_name,
    p2_id: req.body.p2_id,
    p2_name: req.body.p2_name,
    sport: req.body.sport,
    message: req.body.message,
    date: req.body.date,
    time: req.body.time,
    set_score: "",
    match_score: "",
    winner_1: false,
    winner_2: false,
    confirm_1: false,
    confirm_2: false,
    report_secy: false,
    rejected: false
  });
  match.save().then((data) => {
    res.status(200).json(data);
  }).catch((error) => {
    console.log(error);
  });
});

// Display match raw data
app.get("/api/matches/1434", (req, res, next) => {
  Match.find().then(documents => {
    res.status(200).json(documents);
  });
});

// Display Challenges
app.post('/api/challengesN', (req, res, next) => {
  Match.find( { $or: [ {p1_id: req.body.id} , {p2_id: req.body.id} , {rejected: false} ]} )
    .then(documents => {
      length = documents.length;
      res.status(200).json(length);
    });
});

app.post('/api/challengesR', (req, res, next) => {
  Match.find( { p1_id: req.body.id } )
    .then(documents => {
      documents = documents.filter(document_s => document_s.rejected == false && document_s.accepted == false);
      res.status(200).json(documents);
    });
});

app.post("/api/challengesS", (req, res, next) => {
  Match.find({ p2_id: req.body.id })
    .then(documents => {
      documents = documents.filter(document_s => document_s.ok == false);
      res.status(200).json(documents);
  });
});

app.delete("/api/matches/:id", (req, res, next) => {
  Match.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Match deleted!" });
  });
});

app.get("/api/matches/R/:id", (req, res, next) => {
  Match.updateOne({ _id: req.params.id }, {rejected: true}).then(result => {
    console.log(result);
    res.status(200).json({ message: "Match rejected!" });
  });
});

app.get("/api/challenges/1434", (req, res, next) => {
  Match.find({ p2_id: "5d665cd79d24ce3fca88fe1a" }).then(documents => {
    res.status(200).json(documents);
  });
});


// Display Confirmations
app.post('/api/confirmations/', (req, res, next) => {
  Match.find({
    $or: [
      {
        $and: [
          { p2_id: req.body.id },
          { confirm_1: true },
          { confirm_2: false }
        ]
      },
      {
        $and: [
          { p1_id: req.body.id },
          { confirm_1: false },
          { confirm_2: true }
        ]
      }
    ]
  }).then(documents => {
    res.status(200).json(documents);
  });
});

// User signup and login
app.get("/api/players/1434", (req, res, next) => {
  Player.find().then(documents => {
    res.status(200).json(documents);
  });
});

app.post('/api/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const player = new Player({
        name: req.body.name,
        roll: req.body.roll,
        hostel: req.body.hostel,
        gender: req.body.gender,
        category: req.body.category,
        preferred: req.body.preferred,
        contact: req.body.contact,
        password: hash
      });
      player.save()
        .then(result => {
          res.status(201).json({
            result: result
          });
        })
          .catch(err => {
            res.status(500).json({
              error: err
            });
          });
    });
});

app.post("/api/login", (req, res, next) => {
  let fetchedPlayer;
  Player.findOne({roll: req.body.roll})
    .then(player => {
      if (!player) {
        return res.status(401).json({
          messgae: 'Auth failed!'
        });
      }
      fetchedPlayer = player;
      return bcrypt.compare(req.body.password, player.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          messgae: "Auth failed!"
        });
      }
      const token = jwt.sign(
        { roll: fetchedPlayer.roll, playerId: fetchedPlayer._id },
        "harsh_is_god_he_is_invincible",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        id: fetchedPlayer._id,
        name: fetchedPlayer.name,
        sport: fetchedPlayer.preferred
      })
    })
    .catch(err => {
      console.log(err);
    });
});

// Get Profile

app.get('/api/profile/1434', (req, res, next) => {
  Player.findOne({_id: '5d665cd79d24ce3fca88fe1a'})
    .then((documents) => {
      res.status(200).json(documents);
    });
});


app.post('/api/profile', (req, res, next) => {
  Player.findOne({_id: req.body.id})
    .then((documents) => {
      const player = {
        id: documents._id,
        name: documents.name,
        roll: documents.roll,
        hostel: documents.hostel,
        gender: documents.gender,
        category: documents.category,
        preferred: documents.preferred,
        contact: documents.contact,
        squash_score: documents.squash_score,
        tennis_score: documents.tennis_score,
        baddy_score: documents.baddy_score,
        tt_score: documents.tt_score,
        match_played_squash: documents.match_played_squash,
        match_played_tennis: documents.match_played_tennis,
        match_played_baddy: documents.match_played_baddy,
        match_played_tt: documents.match_played_tt,
        match_won_squash: documents.match_won_squash,
        match_won_tennis: documents.match_won_tennis,
        match_won_baddy: documents.match_won_baddy,
        match_won_tt: documents.match_won_tt
      };
      res.status(200).json(player);
    });
});

app.post('/api/profileUpdate/', (req, res, next) => {
  Player.updateOne({_id: req.body.id}, {'name': req.body.name, 'hostel': req.body.hostel, 'gender': req.body.gender, 'preferred': req.body.preferred, 'contact': req.body.contact} )
    .then((result) => {
      res.status(200).json(result);
    });
});

app.post('/api/confirmChallenge/', (req, res, next) => {
  Match.updateOne({_id: req.body.id}, {'accepted': true})
    .then((result) => {
      res.status(200).json(result);
    });
});

app.post("/api/confirmOk/", (req, res, next) => {
  Match.updateOne({ _id: req.body.id }, { ok: true }).then(result => {
    res.status(200).json(result);
  });
});


app.post('/api/updateScore', (req, res, next) => {
  Match.updateOne({_id: req.body.id}, {match_score: req.body.matchScore, set_score: req.body.setScore, confirm_1: true})
    .then(result => {
      res.status(200).json(result);
    });
});

app.post('/api/finalResult/', (req, res, next) => {
  Match.findOne({_id: req.body.id})
    .then(match => {
      const score = match.match_score.split('-').map(Number);
      console.log(score);
      if (score[0] > score[1]){
        Match.updateOne(
          { _id: req.body.id },
          { confirm_2: true, winner_1: true }
        ).then(documents => {
          if (documents.nModified == 0) {
            Match.updateOne(
              { _id: req.body.id },
              { confirm_1: true, winner_1: true }
            ).then(docs => {
              res.status(200).json(documents);
            });
          }
          res.status(200).json(documents);
        });
      }
      else if (score[0] < score[1]) {
        Match.updateOne(
          { _id: req.body.id },
          { confirm_2: true, winner_2: true }
        ).then(documents => {
          if (documents.nModified == 0) {
            Match.updateOne(
              { _id: req.body.id },
              { confirm_1: true, winner_2: true }
            ).then(docs => {
              res.status(200).json(documents);
            });
          }
          res.status(200).json(documents);
        });
      }
      else {
        Match.updateOne(
          { _id: req.body.id },
          { confirm_2: true, winner_2: true, winner_1: true }
        ).then(documents => {
          if (documents.nModified == 0) {
            Match.updateOne(
              { _id: req.body.id },
              { confirm_1: true, winner_2: true, winner_1: true }
            ).then(docs => {
              res.status(200).json(documents);
            });
          }
          res.status(200).json(documents);
        });
      }
    });

});

app.post("/api/previousMatch", (req, res, next) => {
  Match.find({$and: [{$or: [ { p1_id : req.body.id }, {p2_id : req.body.id} ] }, {accepted: true} ] })
    .then(documents => {
      res.status(200).json(documents);
    });
});

module.exports = app;
