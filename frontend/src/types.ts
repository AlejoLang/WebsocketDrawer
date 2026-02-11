// Tipos básicos
export type Point = {
  x: number;
  y: number;
};

export const CanvasTools = {
  PEN: 'pen',
  ERASER: 'eraser',
  SELECT: 'select',
} as const;

export type CanvasTool = (typeof CanvasTools)[keyof typeof CanvasTools];

