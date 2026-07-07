import React, { forwardRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateRoomModal.css";

const CreateRoomModal = forwardRef<HTMLDialogElement>((props, ref) => {
  const roomNameInputRef = useRef<HTMLInputElement>(null);
  const widthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = roomNameInputRef.current?.value;
    const width = parseInt(widthInputRef.current?.value || "0");
    const height = parseInt(heightInputRef.current?.value || "0");
    const ownerId = 1; // Replace with actual owner ID if needed

    if (!name || !width || !height) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/room/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, ownerId, width, height }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to create room");
      }
      const roomId = await response.text();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    }
  };

  return (
    <dialog className="modal" ref={ref}>
      <h2>Create Room</h2>
      <div className="roomCreationInputs">
        <input
          type="text"
          placeholder="Room Name"
          className="modalRoomNameInput"
          ref={roomNameInputRef}
          maxLength={50}
        />
        <div>
          <label className="modalLabel">Canvas Size:</label>
          <div className="modalSizeInputs">
            <input
              type="number"
              placeholder="Width"
              defaultValue={1600}
              min={100}
              max={1920}
              ref={widthInputRef}
              onWheel={(e: React.WheelEvent<HTMLInputElement>) => {
                if (!widthInputRef.current) {
                  return;
                }
                const step = 100;
                const value = parseInt(widthInputRef.current.value) || 0;
                if (e.deltaY > 0 && value > 100) {
                  widthInputRef.current.value = (value - step).toString();
                } else if (e.deltaY < 0 && value < 1920) {
                  widthInputRef.current.value = (value + step).toString();
                }
              }}
            />
            x
            <input
              type="number"
              placeholder="Height"
              defaultValue={900}
              min={100}
              max={1080}
              ref={heightInputRef}
              onWheel={(e: React.WheelEvent<HTMLInputElement>) => {
                if (!heightInputRef.current) {
                  return;
                }
                const step = 100;
                const value = parseInt(heightInputRef.current.value) || 0;
                if (e.deltaY > 0 && value > 100) {
                  heightInputRef.current.value = (value - step).toString();
                } else if (e.deltaY < 0 && value < 1080) {
                  heightInputRef.current.value = (value + step).toString();
                }
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="modalCreateRoomButton"
          onClick={handleSubmit}
        >
          Create
        </button>
      </div>
    </dialog>
  );
});

export default CreateRoomModal;

