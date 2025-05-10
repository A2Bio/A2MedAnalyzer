import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Contacts from './pages/Contacts';

import RotatingText from './blocks/TextAnimations/RotatingText/RotatingText';
import GooeyNav from './blocks/Components/GooeyNav/GooeyNav';

import { Link } from 'react-router-dom';

     // Замените href на to
     const items = [
       { label: "Главная", to: "/home" }, 
       { label: "Контакты", to: "/contacts" },
     ];


function App() {
  return (
    <Router>
      <div>
        <nav
          style={{
            padding: '30px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}>
            <span>A2</span>
            <RotatingText
              texts={['Bio', 'MedAnalyzer']}
              mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-200%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3500}
            />
          </div>

          <div style={{ height: '30px', position: 'relative' }}>
            <GooeyNav
              items={items}
              particleCount={15}
              particleDistances={[90, 10]}
              particleR={100}
              initialActiveIndex={0}
              animationTime={400}
              timeVariance={400}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />
          </div>
        </nav>

        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
