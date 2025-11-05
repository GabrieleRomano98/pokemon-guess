const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true
  }));
}

app.use(express.json());

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../build')));
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key_change_in_production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const games = new Map();

function generateGameCode() {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
}

app.post('/api/game/create', (req, res) => {
  const gameCode = generateGameCode();
  const gameData = {
    code: gameCode,
    host: req.session.id,
    players: [],
    createdAt: new Date()
  };

  games.forEach((game, code) => {
    if(game.host !== req.session.id && game.createdAt > Date.now() - 24 * 60 * 60 * 1000) {
      games.delete(code);
    }
  });
  games.set(gameCode, gameData);
  req.session.gameCode = gameCode;
  req.session.isHost = true;
  
  res.json({ 
    success: true, 
    gameCode,
    message: 'Game created successfully' 
  });
});

app.post('/api/game/join/:code', (req, res) => {
  const gameCode = req.params.code.toUpperCase();
  const game = games.get(gameCode);
  
  if (!game) {
    return res.status(404).json({ 
      success: false, 
      message: 'Game not found' 
    });
  }

  if (game.host === req.session.id || game.players.some(p => p.sessionId === req.session.id)) {
    return  res.json({ 
      success: true, 
      gameCode,
      message: 'Joined game successfully' 
    });
  }

  if (game.players.length >= 1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Game is full' 
    });
  }
  
  game.players.push({
    sessionId: req.session.id,
    joinedAt: new Date()
  });
  
  req.session.gameCode = gameCode;
  req.session.isHost = false;
  
  res.json({ 
    success: true, 
    gameCode,
    message: 'Joined game successfully' 
  });
});

app.get('/api/game/check/:code', (req, res) => {
  const gameCode = req.params.code.toUpperCase();
  const game = games.get(gameCode);
  
  if (!game) {
    return res.status(404).json({ 
      success: false, 
      message: 'Game not found' 
    });
  }
  
  res.json({ 
    success: true,
    exists: true,
    playerCount: game.players.length,
    state: game.state
  });
});

app.get('/api/game/selected', (req, res) => {
  const game = games.get(req.session.gameCode);
  if (!game) {
    return res.status(404).json({ 
      success: false, 
      message: 'Game not found' 
    });
  }
  res.json({ 
    success: true, 
    opponent: req.session.isHost ? game.selectedGuest : game.selectedHost
  });
});

app.put('/api/game/selected/:selected', (req, res) => {
  const game = games.get(req.session.gameCode);
  if (!game) {
    return res.status(404).json({ 
      success: false, 
      message: 'Game not found' 
    });
  }
  if (req.session.isHost) {
    game.selectedHost = req.params.selected;
  } else {
    game.selectedGuest = req.params.selected;
  }
  games.set(req.session.gameCode, game);
  
  res.json({ 
    success: true, 
    message: 'Game state updated' 
  });
});

app.delete('/api/game/selected', (req, res) => {
  const game = games.get(req.session.gameCode);
  if (!game) {
    return res.status(404).json({ 
      success: false, 
      message: 'Game not found' 
    });
  }
  if (req.session.isHost) {
    game.selectedHost = undefined;
  } else {
    game.selectedGuest = undefined;
  }
  games.set(req.session.gameCode, game);
  
  res.json({ 
    success: true, 
    message: 'Game state updated' 
  });
});

if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});