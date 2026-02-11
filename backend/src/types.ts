export enum CanvasTools {
  PEN = 'pen',
  ERASER = 'eraser',
}

export enum CanvasActions {
  INIT = 'init', // Set canvas to a certain image, sended from server to client
  DRAW = 'draw', // Draw a line of a color or erase a line, sended from server to client and client to server
  CLEAR = 'clear', // Clear the canvas, sended from server to client and client to server
}

