import { useNavigate } from 'react-router-dom';
import type { RoomInfo } from '../types';
import './RoomItemComponent.css';

function RoomItemComponent({ room }: { room: RoomInfo }) {
  const navigate = useNavigate();
  return (
    <div className='roomItem'>
      <div className='roomDetails'>
        <span className='roomName'>{room.name}</span>
        <span className='roomSize'>
          {room.width}x{room.height}
        </span>
      </div>
      <button
        className='joinRoomButton'
        onClick={() => navigate(`/room/${room.id}`)}
      >
        Join
      </button>
    </div>
  );
}

export default RoomItemComponent;

