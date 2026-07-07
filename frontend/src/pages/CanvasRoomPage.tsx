import { useParams } from "react-router-dom";
import Canvas from "../components/Canvas";
import { useState, useEffect } from "react";
import type { RoomInfo } from "../types";

function CanvasRoomPage() {
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/room/${roomId}/info`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Room not found");
          } else if (response.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to fetch room info");
        }

        const data = await response.json();
        setRoomInfo(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch room info",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !roomInfo) {
    return <div>Error: {error || "Room not found"}</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId ?? ""} />
    </div>
  );
}

export default CanvasRoomPage;

