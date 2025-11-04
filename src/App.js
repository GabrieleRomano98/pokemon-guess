import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import Playing from './Playing';
import './App.css';
import { Button, Waiting } from './MyLib';
import api from './api';

const pokeCenterUrl = 'https://64.media.tumblr.com/2ebf328e6e4a2bc57b0dc5c1b1004a5b/tumblr_pyffs3pYjQ1ywnabyo1_500.png';

function InfoPopup(props) {
  const [page, setPage] = useState(0);
  const pages = [
    <>One player hosts the game and shares the code or link with the other.</>,
    <>Each player pick a pokemon that the other player will have to guess</>,
    <>During his turn, a player can ask for a yes/no question or make a guess.</>,
    <>Turn the pokémon cards that don't match the hints.</>
  ];
  return (
    <div className='info-popup' onClick={() => props.setShowInfo(false)}>
      <div className='info-content' onClick={e => e.stopPropagation()}>
        <h2>Pokémon Guess</h2>
        <div style={{display: 'flex', alignItems: 'center', marginTop: '10px'}}>
          <div style={{visibility: page === 0 ? 'hidden' : 'visible'}} onClick={() => setPage(p => Math.max(p-1, 0))}>{"<"}</div>
          <div style={{flex: 1, margin: '0 10px'}}>{pages[page]}</div>
          <div style={{visibility: page === 3 ? 'hidden' : 'visible'}} onClick={() => setPage(p => Math.min(p+1, 3))}>{">"}</div>
        </div>
        <Button color="#abababff" text="Close" onClick={() => props.setShowInfo(false)} style={{marginTop: '20px'}} />
      </div>
    </div>
  );
}

function Header(props) {
  const [showInfo, setShowInfo] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePath = location.pathname === '/' || location.pathname.startsWith('/join/');
  const restartStyle = {
    flex: 1,
    textAlign: 'end',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };
  const onClick = isBasePath ? (() => setShowInfo(true)) : props.onRestart;
  const handleHomeClick = () => {
    if (!isBasePath) {
      navigate('/');
    }
  };
  
  return <>
    {showInfo && <InfoPopup setShowInfo={setShowInfo} />}
    <header className="App-header">
      <div style={{textAlign: 'start', flex: 1, cursor: isBasePath ? 'default' : 'pointer'}} onClick={handleHomeClick}>
        {<img src={pokeCenterUrl} style={{visibility: isBasePath ? 'hidden' : 'visible'}} className="home-icon" alt="logo" />}
      </div>
      <div>Pokémon guess</div>
      <div style={restartStyle} onClick={onClick}>{isBasePath ? '?' : '↻'}</div>
    </header>
  </>;
}


function Copy(props) {
  const [down, setDown] = useState([false, false]);
  const handleStart = () => {
    setDown(props.link ? [true, false] : [false, true]);
  };
  const handleEnd = () => {
    setDown([false, false]);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href + 'join/' + props.serverCode);
    props.onCopy && props.onCopy();
  }
  const copyCode = () => {
    navigator.clipboard.writeText(props.serverCode);
    props.onCopy && props.onCopy();
  }
  return (
    <u  className='copy' style={down[props.link ? 0 : 1] ? {color: '#ffde00'} : {}}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onClick={props.link ? copyLink : copyCode}>
      {props.link ? "Copy link" : <>Copy code <b>{props.serverCode}</b></>}</u>
  );
};

function Home(props) {
  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [copied, setCopied] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  useEffect(() => {
    setStarting(true);
    if(params.id) {
      api.joinGame(params.id)
        .then(() => {
          setStarted(true);
          setTimeout(() => {
            props.setCode(params.id);
            props.setSelected("join");
            navigate('/playing');
          }, 950);
        })
        .catch(() => {
          setInvalid(true);
          setStarting(false);
        });
      return;
    }
    
    if (!props.selected && !props.serverCode) {
      api.createGame()
        .then(response => {
          setStarted(true);
          setTimeout(() => {
            props.setServerCode(response.gameCode);
          }, 1000);
        })
        .catch(error => {
          console.error("Failed to create game:", error);
          setStarting(false);
        });
    }
  }, [props.serverCode, props.code, props.selected, params.id, navigate, props, setInvalid, setStarted, setStarting]);
  const selectedColor = "#ffde00";
  const unselectedColor = '#fef0ca';
  const startDisabled = (props.selected === null) || (props.selected === "join" && !props.code);
  const navigation = useNavigate();
  const handleStart = async () => {
    if(props.selected === "join") {
      setChecking(true);
      try {
        await api.joinGame(props.code);
        navigation('/playing');
      } catch (error) {
        console.error("Failed to join game:", error);
        setInvalid(true);
        setChecking(false);
      }
      return;
    }
    navigation('/playing');
  };
  return <>
    {!props.code && !props.serverCode && <Waiting left={!starting} right={started} text="Connecting..." />}
    {copied && <div className='copy-notification'>Copied!</div>}
    <div className='home'>
      <Button className='home-button' text="Host game"
              onClick={() => props.setSelected("host")}
              color={props.selected === "host" ? selectedColor : unselectedColor} />
      <Button className='home-button' text="Join game"
              onClick={() => props.setSelected("join")}
              color={props.selected === "join" ? selectedColor : unselectedColor} />
      {props.selected === "join" ? <div className='home-input'>
        <div>Enter the code</div>
        <input type="text" className='input-code'
              value={props.code} onChange={e => props.setCode(e.target.value)} />
        <div style={{fontSize: "12px", color: invalid ? "#bf5846" : "inherit"}}>{invalid ? "Invalid code!" : "(or use a link)"}</div>
      </div>
      : <div className='home-instructions' style={{visibility: props.selected === "host" ? 'visible' : 'hidden'}}>
        <Copy link serverCode={props.serverCode} onCopy={handleCopy} />
        <br/>or<br/>
        <Copy serverCode={props.serverCode} onCopy={handleCopy} />
        <br/>And share it!
      </div>}
      <Button className='start-button'text={checking ? "..." : "Start"}
              onClick={handleStart}
              color="#90d044" disabled={startDisabled} />
    </div>
  </>;
}

function App() {
  const [restart, setRestart] = useState(false);
  const [code, setCode] = useState("");
  const [serverCode, setServerCode] = useState();
  const [selected, setSelected] = useState(null);
  const onRestart = () => setRestart(r => !r);
  
  return (
    <div className="App">
      <BrowserRouter>
        <Header onRestart={onRestart} />
        <Routes>
          <Route path="/" element={ 
            <Home code={code} setCode={setCode}
                  serverCode={serverCode} setServerCode={setServerCode}
                  selected={selected} setSelected={setSelected} />
          }/>
          <Route path="/join/:id" element={ 
            <Home code={code} setCode={setCode}
                  serverCode={serverCode} setServerCode={setServerCode}
                  selected={selected} setSelected={setSelected} />
          }/>
          <Route path="/playing" element={<Playing restart={restart} />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
