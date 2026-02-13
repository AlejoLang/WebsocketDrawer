// Tipos básicos
export type Point = {
  x: number;
  y: number;
};

export const CanvasTools = {
  PEN: 'pen',
  ERASER: 'eraser',
} as const;

export type CanvasTool = (typeof CanvasTools)[keyof typeof CanvasTools];

export const CanvasActions = {
  INIT: 'init', // Set canvas to a certain image, sended from server to client
  DRAW: 'draw', // Draw a line of a color or erase a line, sended from server to client and client to server
  CLEAR: 'clear', // Clear the canvas, sended from server to client and client to server
} as const;

export type CanvasAction = (typeof CanvasActions)[keyof typeof CanvasActions];

export type RoomInfo = {
  id: string;
  name: string;
};

