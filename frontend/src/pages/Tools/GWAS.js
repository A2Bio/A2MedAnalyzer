import React, { useState } from 'react';

const Gwas = () => {
  const [trait, setTrait] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const normalizedTrait = trait.trim().toLowerCase();
    if (!normalizedTrait) {
      setError('Введите признак для поиска');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    console.log("Отправляется запрос для:", normalizedTrait);

    try {
      const response = await fetch(
        `https://a2medanalyzer.onrender.com/api/traits/studies-by-disease-trait/${encodeURIComponent(normalizedTrait)}/`
      );
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Ошибка запроса');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gwas-search">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <input
          type="text"
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
          placeholder="Введите признак"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Загружается...' : 'Поиск'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="results">
          <h2>Результаты поиска:</h2>
          <ul>
            {results.map((study) => (
              <li key={study.id}>
                <h3>{study.title}</h3>
                <p><strong>Автор:</strong> {study.author || 'Не указан'}</p>
                <p><strong>Журнал:</strong> {study.publication}</p>
                <p><strong>Размер выборки:</strong> {study.initialSampleSize}</p>
                <p><strong>Платформа:</strong> {study.platform}</p>
                {study.pubmedId && (
                  <p>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${study.pubmedId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Читать статью
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Gwas;
