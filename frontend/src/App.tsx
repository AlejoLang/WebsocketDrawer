import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CanvasRoomPage from './pages/CanvasRoomPage.tsx';
import HomePage from './pages/HomePage.tsx';

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/room/:roomId' element={<CanvasRoomPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

