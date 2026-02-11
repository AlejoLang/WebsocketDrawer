import React, { useState, useRef } from 'react';
import './Canvas.css';
import type { Point, CanvasTool } from '../types';
import { CanvasTools } from '../types';
import Toolbar from './Toolbar';

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePointRef = useRef<Point>({ x: 0, y: 0 });
  const clickPressedRef = useRef<boolean>(false);
  const mouseLeavedRef = useRef<boolean>(false);
  const [toolSize, setToolSize] = useState<number>(1);
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [toolType, setToolType] = useState<CanvasTool>(CanvasTools.PEN);

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

  const useTool = (canvasRelX: number, canvasRelY: number) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (canvasRelX - rect.left) * scaleX;
      const y = (canvasRelY - rect.top) * scaleY;
      const context = canvasRef.current.getContext('2d');
      if (context && lastMousePointRef.current) {
        context.strokeStyle = strokeColor;
        context.lineWidth = toolSize;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        if (toolType == CanvasTools.PEN) {
          context.globalCompositeOperation = 'source-over';
        } else if (toolType == CanvasTools.ERASER) {
          context.globalCompositeOperation = 'destination-out';
        }

        context.beginPath();
        context.moveTo(
          lastMousePointRef.current.x,
          lastMousePointRef.current.y,
        );
        context.lineTo(x, y);
        context.stroke();
        context.closePath();
      }
      lastMousePointRef.current = { x, y };
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
        onClear={handleClear}
      />
      <canvas
        ref={canvasRef}
        className='canvas'
        width={1600}
        height={800}
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
          useTool(e.clientX, e.clientY);
        }}
        onMouseUp={(e: React.MouseEvent<HTMLCanvasElement>) => {
          useTool(e.clientX, e.clientY);
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

