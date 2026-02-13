import React, { useState, useRef, useEffect } from 'react';
import './Canvas.css';
import type { Point, CanvasTool } from '../types';
import { CanvasTools, CanvasActions } from '../types';
import Toolbar from './Toolbar';

function Canvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePointRef = useRef<Point>({ x: 0, y: 0 });
  const clickPressedRef = useRef<boolean>(false);
  const mouseLeavedRef = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [toolSize, setToolSize] = useState<number>(1);
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [toolType, setToolType] = useState<CanvasTool>(CanvasTools.PEN);

  useEffect(() => {
    // Connect to websocket
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/canvas/${roomId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to server');
    };

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);

        if (type === CanvasActions.INIT && data && canvasRef.current) {
          const img = new Image();
          canvasRef.current.width = data.width;
          canvasRef.current.height = data.height;
          img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
          };
          img.src = `data:image/png;base64,${data.image}`;
        } else if (type == CanvasActions.DRAW) {
          const { x1, y1, x2, y2, toolType, toolSize, strokeColor } = data;
          useTool(toolType, toolSize, strokeColor, x1, y1, x2, y2);
        } else if (type === CanvasActions.CLEAR) {
          handleClear();
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Error on WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('Disconnecting from server');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleClear = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );
      }
    }
  };

  const setStartingPoint = (canvasRelX: number, canvasRelY: number) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (canvasRelX - rect.left) * scaleX;
      const y = (canvasRelY - rect.top) * scaleY;
      lastMousePointRef.current = { x, y };
    }
  };

  const useTool = (
    toolType: CanvasTool,
    toolSize: number,
    strokeColor: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = toolSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (toolType === CanvasTools.PEN) {
        ctx.strokeStyle = strokeColor;
        ctx.globalCompositeOperation = 'source-over';
      } else if (toolType === CanvasTools.ERASER) {
        ctx.globalCompositeOperation = 'destination-out';
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
    }
  };

  const drawWithLastPoint = (canvasRelX: number, canvasRelY: number) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (canvasRelX - rect.left) * scaleX;
      const y = (canvasRelY - rect.top) * scaleY;

      useTool(
        toolType,
        toolSize,
        strokeColor,
        lastMousePointRef.current.x,
        lastMousePointRef.current.y,
        x,
        y,
      );
      const m = {
        action: CanvasActions.DRAW,
        toolType,
        toolSize,
        strokeColor,
        x1: lastMousePointRef.current.x,
        y1: lastMousePointRef.current.y,
        x2: x,
        y2: y,
      };

      lastMousePointRef.current = { x, y };
      wsRef.current?.send(JSON.stringify(m));
    }
  };

  return (
    <div className='canvasWrapper'>
      <Toolbar
        toolType={toolType}
        setToolType={setToolType}
        toolSize={toolSize}
        setToolSize={setToolSize}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        onClear={() => {
          handleClear();
          const m = {
            action: CanvasActions.CLEAR,
            toolType,
            toolSize,
            strokeColor,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
          };

          wsRef.current?.send(JSON.stringify(m));
        }}
      />
      <canvas
        ref={canvasRef}
        className='canvas'
        width={1600}
        height={900}
        onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) => {
          if (e.buttons !== 1) {
            return;
          }
          clickPressedRef.current = true;
          setStartingPoint(e.clientX, e.clientY);
        }}
        onMouseMove={(e: React.MouseEvent<HTMLCanvasElement>) => {
          if (
            e.buttons !== 1 ||
            mouseLeavedRef.current ||
            !clickPressedRef.current
          ) {
            return;
          }
          drawWithLastPoint(e.clientX, e.clientY);
        }}
        onMouseUp={(e: React.MouseEvent<HTMLCanvasElement>) => {
          if (e.buttons !== 1) {
            return;
          }
          drawWithLastPoint(e.clientX, e.clientY);
          clickPressedRef.current = false;
        }}
        onMouseLeave={() => {
          mouseLeavedRef.current = true;
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLCanvasElement>) => {
          mouseLeavedRef.current = false;
          if (e.buttons === 1) {
            clickPressedRef.current = true;
            setStartingPoint(e.clientX, e.clientY);
          }
        }}
      ></canvas>
    </div>
  );
}

export default Canvas;

