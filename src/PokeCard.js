import { getImageUrl } from './Data';

function PokeCard(props) {
  return (
    <div className="pokemon-card" style={props.style} onClick={props.onClick}>
      {!props.hide && <img src={getImageUrl(props.pokemon)} alt={props.pokemon} />}
    </div>
  );
}

export default PokeCard;