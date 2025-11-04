import { useState } from 'react';

function Button(props) {
  const [isDown, setDown] = useState(false);
  const buttonStyle= {
    ...props.style,
    backgroundColor: props.disabled ? '#abababff' : props.color ?? "#4CAF50",
    boxShadow: !props.disabled && `${isDown ? 'inset' : ''} 2px 2px 5px rgba(0, 0, 0, 0.5)`
  };
  const classname = "my-button " + (props.className ?? "");
  return <div style={buttonStyle} className={classname} onClick={props.onClick} 
              onTouchStart={() => !props.disabled && setDown(true)}
              onTouchEnd={() => !props.disabled && setDown(false)}>
      {props.text}
  </div>;
}

function Waiting(props) {
  const waitImgStyle = {
    width: '100vw',
    translate: props.right ? '100vw' : props.left ? '-100vw' : 0,
    transition: 'translate 1s linear'
  };
  const waitingStyle = {
    backgroundColor: `rgba(0, 0, 0, ${!props.left ? 0.5 : 0})`,
    zIndex: !props.left ? 1 : -1
  };
  const waitingUrl = 'https://i.pinimg.com/originals/4a/47/01/4a470171c6cbe593049dad75a7ac0548.gif';
  return <div className='waiting' style={waitingStyle}>
    <img style={waitImgStyle} src={waitingUrl} alt={props.pokemon} />
    {!props.left && <div>{props.text ?? <>Waiting for<br/>the opponent...</>}</div>}
  </div>;
}

export { Button, Waiting };