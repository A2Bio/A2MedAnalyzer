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
            } catch (err) {
              console.error("Ошибка при получении SNP для", study.accessionId, err);
              return { ...study, snps: [] };
            }
          })
        );

        setResults(studiesWithSnps);
      } else {
        setError('Не найдено исследований по введённому признаку');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
          placeholder="Введите признак (например, obesity)"
          style={{
            padding: '10px',
            width: '60%',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Загрузка...' : 'Поиск'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      {results.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={thStyle}>Название</th>
                <th style={thStyle}>Автор</th>
                <th style={thStyle}>Журнал</th>
                <th style={thStyle}>Выборка</th>
                <th style={thStyle}>Платформа</th>
                <th style={thStyle}>SNPs</th>
                <th style={thStyle}>PubMed</th>
              </tr>
            </thead>
            <tbody>
              {results.map((study) => (
                <tr key={study.accessionId}>
                  <td style={tdStyle}>{study.publicationInfo?.title || '—'}</td>
                  <td style={tdStyle}>{study.publicationInfo?.author?.fullname || '—'}</td>
                  <td style={tdStyle}>{study.publicationInfo?.publication || '—'}</td>
                  <td style={tdStyle}>{study.initialSampleSize || '—'}</td>
                  <td style={tdStyle}>{study.platforms?.[0]?.manufacturer || '—'}</td>
                  <td style={tdStyle}>
                    {study.snps?.length > 0
                      ? study.snps.slice(0, 5).join(', ') + (study.snps.length > 5 ? '...' : '')
                      : '—'}
                  </td>
                  <td style={tdStyle}>
                    {study.publicationInfo?.pubmedId ? (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${study.publicationInfo.pubmedId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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

// Стили
const thStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
  backgroundColor: '#f9f9f9'
};

const tdStyle = {
  padding: '8px',
  border: '1px solid #ddd',
  verticalAlign: 'top'
};

export default Gwas;
