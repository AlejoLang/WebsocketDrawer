import { useEffect, useRef, useState } from 'react';
import type { RoomInfo } from '../types';
import './HomePage.css';
import RoomItemComponent from '../components/RoomItemComponent';
import CreateRoomModal from '../components/CreateRoomModal';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const roomsRef = useRef<Array<RoomInfo>>([]);
  const createRoomModalRef = useRef<HTMLDialogElement>(null);
  const [filteredRooms, setFilteredRooms] = useState<Array<RoomInfo>>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    const rooms = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
      credentials: 'include',
    }).then(
      (res) => {
        console.log(res.status);
        if(res.status === 401) {
          navigate("/login");
        }
        return res.json();
      },
    );
    roomsRef.current = rooms;
    searchRoom(searchInputRef.current?.value || '');
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const searchRoom = (name: string) => {
    setFilteredRooms(
      roomsRef.current?.filter((room) =>
        room.name.toLowerCase().includes(name.toLowerCase()),
      ),
    );
  };

  return (
    <div>
      <div className='homePageBar'>
        <input
          type='text'
          ref={searchInputRef}
          onChange={(e) => searchRoom(e.target.value)}
          className='searchInput'
        />
        <button className='refreshRoomsButton' onClick={fetchRooms}>
          {' '}
          Refresh Rooms
        </button>
        <button
          className='createRoomButton'
          onClick={() => createRoomModalRef?.current?.showModal()}
        >
          Create Room
        </button>
      </div>
      <div className='roomsList'>
        {filteredRooms?.map((room) => {
          return <RoomItemComponent key={room.id} room={room} />;
        })}
      </div>
      <CreateRoomModal ref={createRoomModalRef} />
    </div>
  );
}

export default HomePage;

