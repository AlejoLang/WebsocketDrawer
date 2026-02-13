import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CanvasRoomPage from './pages/CanvasRoomPage.tsx';

function App() {
  return (
    <>
      <h1>Canvas</h1>
      <BrowserRouter>
        <Routes>
          <Route path='/room/:roomId' element={<CanvasRoomPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

