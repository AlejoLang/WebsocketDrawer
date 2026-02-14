import { forwardRef, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoomModal.css';

const CreateRoomModal = forwardRef<HTMLDialogElement>((props, ref) => {
  const roomNameInputRef = useRef<HTMLInputElement>(null);
  const widthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = roomNameInputRef.current?.value;
    const width = parseInt(widthInputRef.current?.value || '0');
    const height = parseInt(heightInputRef.current?.value || '0');

    if (!name || !width || !height) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/room/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, width, height }),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      const roomId = await response.text();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  return (
    <dialog className='modal' ref={ref}>
      <h2>Create Room</h2>
      <div className='roomCreationInputs'>
        <input
          type='text'
          placeholder='Room Name'
          className='modalRoomNameInput'
          ref={roomNameInputRef}
        />
        <div className='modalSizeInputs'>
          <input
            type='number'
            placeholder='Width'
            defaultValue={1600}
            min={100}
            max={1920}
            ref={widthInputRef}
          />
          x
          <input
            type='number'
            placeholder='Height'
            defaultValue={900}
            min={100}
            max={1080}
            ref={heightInputRef}
          />
        </div>
        <button
          type='submit'
          className='modalCreateRoomButton'
          onClick={handleSubmit}
        >
          Create
        </button>
      </div>
    </dialog>
  );
});

export default CreateRoomModal;

