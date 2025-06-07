import React, { useState } from 'react';
import './MetabolicNetwork.css';

const MetabolicNetwork = () => {
  const [input, setInput] = useState('');
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNetwork = async () => {
    const geneList = input
      .split(/[\s,]+/)
      .map((g) => g.trim())
      .filter(Boolean);

    if (geneList.length === 0) {
      setError('Введите хотя бы один ген.');
      return;
    }

    setLoading(true);
    setError('');
    setNetworkData(null);

    try {
      const response = await fetch('http://localhost:8000/api/metabolic_network/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genes: geneList }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при запросе к API');
      }

      const data = await response.json();
      setNetworkData(data);
    } catch (err) {
      setError('Ошибка при получении данных: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="network-wrapper">
      <h1 className="network-title">🧬 Метаболическая сеть</h1>

      <textarea
        className="network-input"
        rows={4}
        placeholder="Введите названия генов (например, G6PD, HK1, PFKM)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={fetchNetwork} className="network-button">
        Построить сеть
      </button>

      {loading && <p className="network-loading">Загрузка...</p>}
      {error && <p className="network-error">{error}</p>}

      {networkData && (
        <div className="network-result">
          {/* Пример визуализации */}
          {networkData.reactions && networkData.reactions.length > 0 ? (
            <table className="network-table">
              <thead>
                <tr>
                  <th>Ген</th>
                  <th>Метаболит</th>
                  <th>Реакция</th>
                </tr>
              </thead>
              <tbody>
                {networkData.reactions.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.gene}</td>
                    <td>{item.metabolite}</td>
                    <td>{item.reaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Нет данных для отображения.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MetabolicNetwork;
