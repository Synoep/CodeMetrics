import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LeaderboardPage from './components/LeaderboardPage';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
