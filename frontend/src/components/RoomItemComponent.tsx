import { useNavigate } from "react-router-dom";
import type { RoomInfo } from "../types";
import "./RoomItemComponent.css";
import { useAuth } from "../context/userContext";

function RoomItemComponent({
  room,
  roomsRef,
  onDeleted,
}: {
  room: RoomInfo;
  roomsRef: React.MutableRefObject<Array<RoomInfo>>;
  onDeleted: (roomId: string) => void;
}) {
  const navigate = useNavigate();
  const { id } = useAuth().user || { id: null };

  const handleDeleteRoom = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/room/${room.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      alert("Room deleted successfully");
      roomsRef.current = roomsRef.current.filter((r) => r.id !== room.id);
      onDeleted(room.id);
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room");
    }
  };

  return (
    <div className="roomItem">
      <div className="roomDetails">
        <span className="roomName">{room.name}</span>
        <span className="roomSize">
          {room.width}x{room.height}
        </span>
      </div>
      <button
        className="joinRoomButton"
        onClick={() => navigate(`/room/${room.id}`)}
      >
        Join
      </button>
      {room.ownerId === id && (
        <button className="deleteRoomButton" onClick={handleDeleteRoom}>
          Delete
        </button>
      )}
    </div>
  );
}

export default RoomItemComponent;

