# Pokemon Guess Game

A multiplayer Pokemon guessing game built with React and Node.js, ready for deployment on Google Cloud Platform.

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Start development servers:**
   ```bash
   # Terminal 1: Start the backend server
   cd server
   npm start

   # Terminal 2: Start the React development server
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Configuration

The app is configured to work seamlessly in both development and production:

- **Development**: Uses proxy to connect React (port 3000) to Node.js server (port 3001)
- **Production**: Single server serves both React build files and API endpoints

### API Endpoints

- `POST /game/create` - Create a new game session
- `POST /game/join/:code` - Join an existing game
- `GET /game/check/:code` - Check if a game exists
- `GET /game/state/:code` - Get current game state
- `PUT /game/state/:code` - Update game state

## Google Cloud Deployment

### Prerequisites

1. **Install Google Cloud CLI:**
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Initialize gcloud:**
   ```bash
   gcloud init
   gcloud auth login
   ```

3. **Create a new project (or select existing):**
   ```bash
   gcloud projects create your-pokemon-game-project
   gcloud config set project your-pokemon-game-project
   ```

### Deployment Steps

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Deploy to App Engine:**
   ```bash
   gcloud app deploy
   ```

3. **View your deployed app:**
   ```bash
   gcloud app browse
   ```

### Environment Variables

Update `app.yaml` before deployment:

```yaml
env_variables:
  NODE_ENV: "production"
  SESSION_SECRET: "your-secure-random-session-secret-here"
```

## Project Structure

```
wtp/
├── src/                    # React frontend source
│   ├── api.js             # API configuration & utilities
│   ├── App.js             # Main React component
│   └── ...
├── server/                # Node.js backend
│   ├── server.js          # Express server
│   └── package.json       # Server dependencies
├── build/                 # Production build (generated)
├── app.yaml              # Google Cloud App Engine config
├── package.json          # Frontend dependencies & scripts
└── README.md
```

## Features

- ✅ **Development-ready**: Hot reload, proxy configuration
- ✅ **Production-ready**: Single server deployment
- ✅ **Session management**: Persistent game sessions
- ✅ **Error handling**: Graceful API error handling
- ✅ **Environment detection**: Automatic dev/prod configuration
- ✅ **Google Cloud ready**: App Engine configuration included

## Notes

- No code changes needed when moving from development to production
- API calls automatically route correctly in both environments
- Session data persists across page refreshes
- Ready for horizontal scaling on Google Cloud Platform