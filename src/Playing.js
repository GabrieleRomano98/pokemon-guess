import { useEffect, useState } from 'react';
import { pokemonList, getRandomPokemon } from './Data';
import { Button, Waiting } from './MyLib';
import PokeCard from './PokeCard';
import api from './api';

const pokeballUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/500px-Pok%C3%A9_Ball_icon.svg.png';

function PokeGrid(props) {
  const [turning, setTurning] = useState([]);
  const [turned, setTurned] = useState([]);
  useEffect(() => {
    setTurning([]);
    setTurned([]);
  }, [props.selecting]);
  const getCardStyle = (i) => ({
    transform: turning.includes(i) ? 'rotateY(180deg)' : '',
    backgroundImage: turned.includes(i) ? `url("${pokeballUrl}")` : '',
    borderColor: props.selecting && props.selected === i ? '#ffde00' : ''
  });
  const handleTurn = (i) => {
    if (!turned.includes(i)) {
      setTurning(t => [...t, i]);
      setTimeout(() => {
        setTurned(t => [...t, i]);
      }, 150);
    } else {
      setTurning(t => t.filter(x => x !== i));
      setTimeout(() => {
        setTurned(t => t.filter(x => x !== i));
      }, 150);
    }
  };
  const handleSelect = (i) => {
    if(props.selected === i) {
      props.setSelected(null);
    } else {
      props.setSelected(i);
    }
  };
  const handleClick = (i) =>
    props.selecting? handleSelect(i) : handleTurn(i);
  
  const gridContent = (
    <div className="grid-container">
      {props.list.map((pokemon, i) =>
        <PokeCard key={pokemon} pokemon={pokemon}
                  style={getCardStyle(i)} hide={turned.includes(i)}
                  onClick={() => handleClick(i)} />
      )}
    </div>
  );

  return (
    props.selecting ? <div className='scrollable'>{gridContent}</div>
                    : gridContent
  );
}

function Playing(props) {
  const [list, setList] = useState([]);
  const [selecting, setSelecting] = useState(true);
  const [selected, setSelected] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [restarting, setRestarting] = useState(false);
  useEffect(() => {
    setSelecting(true);
    setSelected(null);
    setWaiting(false);
    setList([]);
    setRestarting(true);
    setTimeout(() => setRestarting(false), 1000);
    api.restart();
  }, [props.restart]);

  const selectedStyle = {
    backgroundColor: "#c4fcf0",
    height: "20vw",
    width: "20vw"
  };

  const handleConfirm = () => {
    setWaiting(true);
    setSelecting(false);
    api.sendSelected(selected);
    const interval = setInterval(() => {
      api.getOpponent().then(response => {
        if (response.success && response.opponent) {
          clearInterval(interval);
          setList(getRandomPokemon(response.opponent));
          setTimeout(() => setWaiting(false), 1000);
        }
      }).catch(() => { console.log("Error fetching opponent data"); });
    }, 1000);
  }

  return <>
    {!restarting && <Waiting left={!waiting} right={list.length > 0} />}
    <PokeGrid list={waiting ? [] : selecting ? pokemonList : list} selecting={selecting}
                    selected={selected} setSelected={setSelected} />
    {!waiting && <div className='selected' style={{boxShadow: !selecting && 'none'}}>
      {selecting ?
          <Button className="choose-button" text="I choose you!" color="#90d044"
                  disabled={selected===null} onClick={handleConfirm} />
        : <PokeCard pokemon={pokemonList[selected]} style={selectedStyle} />
      }
    </div>}
  </>
}

export default Playing;