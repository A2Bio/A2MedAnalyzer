import React, { useState } from 'react';
import { FloatButton, message, Collapse, Typography } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import './MetabolicNetwork.css';

const { Panel } = Collapse;

const MetabolicNetwork = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plotUrl, setPlotUrl] = useState('');
  const [csvUrl, setCsvUrl] = useState('');
  const [debugData, setDebugData] = useState(null);

  const debugMode = true;

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://a2medanalyzer.onrender.com/api/metabolic_network/'
    : 'http://localhost:8000/api/metabolic_network/';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setPlotUrl('');
    setCsvUrl('');
    setDebugData(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      message.error('Пожалуйста, выберите CSV-файл для загрузки.');
      return;
    }

    setLoading(true);
    setError('');
    setPlotUrl('');
    setCsvUrl('');
    setDebugData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (debugMode) {
        setDebugData(data);
        console.log('API Debug:', data);
      }

      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Ошибка при обработке');
      }

      setPlotUrl(data.plot_url || '');
      setCsvUrl(data.csv_url || '');
      message.success('Сеть успешно построена');
    } catch (err) {
      setError('Ошибка при получении данных: ' + err.message);
      message.error('Ошибка: ' + err.message);
      if (debugMode) {
        setDebugData({ error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvUrl) {
      message.info('Сначала загрузите и постройте сеть');
      return;
    }

    const link = document.createElement('a');
    link.href = csvUrl;
    link.setAttribute('download', 'metabolic_network_edges.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadClick = () => {
    document.getElementById('network-file-input').click();
  };

  return (
    <div className="network-wrapper">
      <h1 className="network-title">🧬 Метаболическая сеть KEGG</h1>

      <input
        type="file"
        id="network-file-input"
        accept=".csv,.tsv,text/csv,text/tsv"
        onChange={handleFileChange}
        className="network-file-input"
        disabled={loading}
      />

      <button
        onClick={handleSubmit}
        className="network-button"
        disabled={loading}
      >
        {loading ? 'Загрузка...' : 'Построить сеть'}
      </button>

      {error && <p className="network-error">Ошибка: {error}</p>}

      {csvUrl && (
        <p className="network-download">
          <a href={csvUrl} target="_blank" rel="noopener noreferrer" download>
            Скачать CSV с рёбрами сети
          </a>
        </p>
      )}

      {plotUrl && (
        <div className="network-plot" style={{ minHeight: 600, border: '1px solid #ccc' }}>
          <object
            data={plotUrl}
            type="text/html"
            width="100%"
            height="600px"
            aria-label="Metabolic Network Visualization"
          >
            <p>
              ❗️Визуализация не может быть встроена в страницу.{' '}
              <a href={plotUrl} target="_blank" rel="noopener noreferrer">
                Открыть в новой вкладке
              </a>
            </p>
          </object>
        </div>
      )}

      {/* Float Buttons */}
      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
        <FloatButton
          icon={<UploadOutlined />}
          onClick={handleUploadClick}
          tooltip="Загрузить CSV"
        />
        <FloatButton
          icon={<DownloadOutlined />}
          onClick={handleDownloadCSV}
          tooltip="Скачать рёбра сети"
          disabled={!csvUrl}
        />
        <FloatButton
          icon={<QuestionCircleOutlined />}
          type="primary"
          tooltip="Загрузите файл и нажмите 'Построить сеть'"
        />
      </FloatButton.Group>

      {/* Debug Block */}
      {debugMode && debugData && (
        <div style={{ marginTop: 40 }}>
          <Collapse defaultActiveKey={['1']} style={{ background: '#f9f9f9' }}>
            <Panel header="🛠️ Debug информация от API" key="1">
              <Typography.Paragraph copyable style={{ fontSize: 13 }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </Typography.Paragraph>
            </Panel>
          </Collapse>
        </div>
      )}
    </div>
  );
};

export default MetabolicNetwork;
