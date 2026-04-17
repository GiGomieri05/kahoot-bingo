import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ThemeManager from './pages/host/ThemeManager';
import Lobby from './pages/host/Lobby';
import GameControl from './pages/host/GameControl';
import Results from './pages/host/Results';
import JoinSession from './pages/player/JoinSession';
import WaitingRoom from './pages/player/WaitingRoom';
import BingoBoard from './pages/player/BingoBoard';
import PlayerResults from './pages/player/PlayerResults';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Navigate to="/host/themes" replace />} />
        <Route path="/host/themes" element={<ThemeManager />} />
        <Route path="/host/lobby/:themeId" element={<Lobby />} />
        <Route path="/host/game/:code" element={<GameControl />} />
        <Route path="/host/results/:code" element={<Results />} />
        <Route path="/play" element={<JoinSession />} />
        <Route path="/play/:code" element={<JoinSession />} />
        <Route path="/waiting/:code" element={<WaitingRoom />} />
        <Route path="/board/:code" element={<BingoBoard />} />
        <Route path="/player-results/:code" element={<PlayerResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
