import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '20px',
    color: 'white',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  }}>
    {children}
  </div>
);

export default function Game() {
  const [resources, setResources] = useState(0);
  const [mineLevel, setMineLevel] = useState(1);

  // Логика автоматической добычи 24/7 (пассивный доход)
  useEffect(() => {
    const timer = setInterval(() => {
      setResources(prev => prev + mineLevel);
    }, 1000);
    return () => clearInterval(timer);
  }, [mineLevel]);

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', height: '100vh', padding: '20px' }}>
      <h2 style={{ color: 'white' }}>Glass Mine</h2>
      
      <GlassCard>
        <h3>Ресурсы: {resources}</h3>
        <p>Добыча: {mineLevel} / сек</p>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setResources(resources + 1)}
          style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#fff', color: '#764ba2' }}
        >
          Добывать вручную
        </motion.button>
      </GlassCard>

      <br />

      <GlassCard>
        <h4>Постройки</h4>
        <button onClick={() => {
          if(resources >= 50) {
            setResources(resources - 50);
            setMineLevel(mineLevel + 1);
          }
        }}>
          Улучшить шахту (Цена: 50)
        </button>
      </GlassCard>
    </div>
  );
}