// Gwas.js
import React, { useState } from 'react';
import './Gwas.css';
import Loader from '../../blocks/Components/Loaders/Loader'
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

    try {
      const response = await fetch(
        `https://a2medanalyzer.onrender.com/api/traits/studies-by-disease-trait/${encodeURIComponent(normalizedTrait)}/`
      );
      const data = await response.json();

      if (response.ok && data._embedded?.studies?.length) {
        const studies = data._embedded.studies;

        const studiesWithSnps = await Promise.all(
          studies.map(async (study) => {
            try {
              const res = await fetch(`https://www.ebi.ac.uk/gwas/rest/api/studies/${study.accessionId}/associations`);
              const assocData = await res.json();
              const snps = assocData._embedded?.associations?.flatMap((assoc) =>
                assoc.loci?.flatMap((locus) =>
                  locus.strongestRiskAlleles?.map((allele) => allele.riskAlleleName)
                )
              ) || [];

              return {
                ...study,
                snps: snps.filter(Boolean),
              };
            } catch {
              return { ...study, snps: [] };
            }
          })
        );

        setResults(studiesWithSnps);
      } else {
        setError('Не найдено исследований по введённому признаку');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gwas-wrapper">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form">
        <input
          className="custom-input"
          type="text"
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
          placeholder="Введите признак (например, obesity)"
        />
        <button type="submit" disabled={loading} className="custom-button">
          Поиск
        </button>
      </form>
      {loading && (
        <div style={{display:'flex', justifyContent:'center'}}>
          <Loader/>
        </div>
        
        )}
      {error && <div className="error-message">{error}</div>}

      {results.length > 0 && (
        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Автор</th>
                <th>Журнал</th>
                <th>Выборка</th>
                <th>Платформа</th>
                <th>SNPs</th>
                <th>PubMed</th>
              </tr>
            </thead>
            <tbody>
              {results.map((study) => (
                <tr key={study.accessionId}>
                  <td>{study.publicationInfo?.title || '—'}</td>
                  <td>{study.publicationInfo?.author?.fullname || '—'}</td>
                  <td>{study.publicationInfo?.publication || '—'}</td>
                  <td>{study.initialSampleSize || '—'}</td>
                  <td>{study.platforms?.[0]?.manufacturer || '—'}</td>
                  <td>
                    {study.snps?.length > 0
                      ? study.snps.slice(0, 5).join(', ') + (study.snps.length > 5 ? '...' : '')
                      : '—'}
                  </td>
                  <td>
                    {study.publicationInfo?.pubmedId ? (
                      <a href={`https://pubmed.ncbi.nlm.nih.gov/${study.publicationInfo.pubmedId}`} target="_blank" rel="noopener noreferrer">
                        Открыть
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Gwas;
