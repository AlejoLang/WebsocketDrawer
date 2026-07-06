# WebSocket Drawer
Small project that implements temporary, collaborative drawing boards using WebSockets.

## Backend
The backend is built with [Bun](https://bun.com/) and [ElysiaJS](https://elysiajs.com/) and the use of its built-in WebSockets implementation.
It provides endpoints to create boards and get information on the active ones as well as endpoints to connect to the websocket sessions.

## Frontend
The frontend is built with [Bun](https://bun.com/), [React](https://react.dev/) and [Vite](https://vite.dev/) and provides support for the user interaction using the HTML Canvas.
