import React, { useState, useRef } from 'react';
import './Canvas.css';

type Point = {
  x: number;
  y: number;
};

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePointRef = useRef<Point>({ x: 0, y: 0 });
  const clickPressedRef = useRef<boolean>(false);

  return (
    <div className='canvasWrapper'>
      <canvas
        ref={canvasRef}
        className='canvas'
        color='red'
        width={1600}
        height={800}
        onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) => {
          if (e.button != 0) {
            return;
          }
          clickPressedRef.current = true;
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            lastMousePointRef.current = { x, y };
          }
        }}
        onMouseMove={(e: React.MouseEvent<HTMLCanvasElement>) => {
          if (e.button != 0) {
            return;
          }
          if (clickPressedRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const context = canvasRef.current.getContext('2d');
            if (context && lastMousePointRef.current) {
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
        }}
        onMouseUp={() => {
          clickPressedRef.current = false;
        }}
      ></canvas>
    </div>
  );
}

export default Canvas;

