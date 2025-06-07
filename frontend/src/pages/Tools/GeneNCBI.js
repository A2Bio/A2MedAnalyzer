import React, { useState } from 'react';
import './GeneNCBI.css';

const GeneNCBI = () => {
  const [input, setInput] = useState("");
  const [genes, setGenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState(null);

  const fetchGeneInfo = async () => {
    const geneList = input
      .split(/[\s,]+/)
      .map((g) => g.trim())
      .filter(Boolean);

    if (geneList.length === 0) {
      setError("Введите хотя бы один ген.");
      return;
    }

    setLoading(true);
    setError("");
    setGenes([]);

    try {
      const response = await fetch("http://localhost:8000/api/ncbi_gene_info/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ genes: geneList }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при запросе к API");
      }

      const data = await response.json();
      setGenes(data.results || []);
    } catch (err) {
      setError("Ошибка при получении данных: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gene-wrapper">
      <h1 className="gene-header">🔬 Информация о генах (NCBI)</h1>

      <textarea
        className="gene-textarea"
        rows={4}
        placeholder="Введите гены через запятую или пробел (например, TP53, BRCA1)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={fetchGeneInfo} className="gene-button">
        Найти
      </button>

      {loading && <p className="gene-loading">Загрузка...</p>}
      {error && <p className="gene-error">{error}</p>}

      {genes.length > 0 && (
        <div className="gene-table-wrapper">
          <table className="gene-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>ID</th>
                <th>Описание</th>
                <th>Хромосома</th>
                <th>Карта</th>
                <th>Организм</th>
                <th>Геном</th>
                <th>Ссылка</th>
                <th>Подробнее</th>
              </tr>
            </thead>
            <tbody>
              {genes.map((gene, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td>{gene.name || "—"}</td>
                    <td>{gene.uid || "—"}</td>
                    <td>{gene.description || "—"}</td>
                    <td>{gene.chromosome || "—"}</td>
                    <td>{gene.maplocation || "—"}</td>
                    <td>{gene.organism?.scientificname || "—"}</td>
                    <td>{gene.genomicinfo?.[0]?.chraccver || "—"}</td>
                    <td>
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/gene/${gene.uid}`}
                        className="gene-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Перейти
                      </a>
                    </td>
                    <td>
                      <button
                        className="gene-toggle-btn"
                        onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      >
                        {expandedIdx === idx ? "Скрыть" : "Открыть"}
                      </button>
                    </td>
                  </tr>

                  {expandedIdx === idx && (
                    <tr>
                      <td colSpan="9">
                        <div className="gene-details">
                          <h3>🔍 Подробная информация о {gene.name}</h3>

                          <div className="gene-summary">
                            <p><strong>🧬 Сводка:</strong> {gene.summary || "Нет данных."}</p>
                            <p><strong>🧬 Синонимы:</strong> {gene.otheraliases || "—"}</p>
                            <p><strong>📘 Другие обозначения:</strong> {gene.otherdesignations || "—"}</p>
                            <p><strong>📚 MIM:</strong> {(gene.mim || []).join(', ') || "—"}</p>
                          </div>

                          <div className="gene-json">
                            <details>
                              <summary>📦 JSON-данные</summary>
                              <pre>{JSON.stringify(gene, null, 2)}</pre>
                            </details>
                          </div>

                          <div className="gene-iframe">
                            <h4>🌐 Страница на NCBI</h4>
                            <iframe
                              src={`https://www.ncbi.nlm.nih.gov/gene/${gene.uid}`}
                              title={`NCBI Gene ${gene.name}`}
                              width="100%"
                              height="600"
                              style={{
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                marginTop: '1em'
                              }}
                            ></iframe>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GeneNCBI;
