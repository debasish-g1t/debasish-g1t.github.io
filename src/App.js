import './App.css';

// routes
import { Routes, Route, HashRouter as Router } from 'react-router-dom';

// theme + page
import { ThemeProvider } from './theme/ThemeProvider';
import HomePage from './pages/Home/home';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Only one page exists for now — any path falls back to the timeline home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
