import React, { useState } from 'react';
import { FloatButton, message, Alert } from 'antd';
import { FileTextOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './Annotation.css';
import Loader from '../../blocks/Components/Loaders/Loader';

const Annotation = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://a2medanalyzer.onrender.com/api/annotation/'
    : 'http://localhost:8000/api/annotation/';
  const BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://a2medanalyzer.onrender.com'
    : 'http://localhost:8000';

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error('Выберите CSV-файл');
      return;
    }

    setLoading(true);
    setImageUrls([]);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setImageUrls(data.image_urls || []);
        message.success('Анализ завершён, изображения сгенерированы');
      } else {
        message.error(data.message || 'Ошибка при обработке файла');
      }
    } catch (error) {
      message.error('Ошибка при соединении с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputClick = () => {
    document.getElementById('file-input').click();
  };

  const handleDownload = async (url, name) => {
    const downloadUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);

      const blob = await response.blob();
      if (!blob.type.includes('image')) throw new Error(`Неверный тип файла: ${blob.type}`);

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      message.success(`Файл ${name} скачан`);
    } catch (error) {
      message.warning(`Ошибка загрузки: ${error.message}. Пробуем альтернативный способ.`);

      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success(`Файл ${name} скачан (альтернативный способ)`);
      } catch (fallbackError) {
        message.error(`Не удалось скачать ${name}: ${fallbackError.message}`);
      }
    }
  };

  return (
    <div className="annotation-container">
      <div className="description-block" style={{display: 'flex', justifyContent: 'left'}}>
        <h2>
          Аннотация генов с помощью <a href="https://geneontology.org/" target="_blank" rel="noopener noreferrer">GO</a> и <a href="https://www.kegg.jp/kegg/pathway.html" target="_blank" rel="noopener noreferrer">KEGG</a>
        </h2>
        <p className="description">
          Загрузите <strong>.csv</strong>-файл с результатами анализа экспрессии генов для автоматической аннотации через GO и KEGG.
        </p>
        <ul className="features-list">
          <li>🔍 Файл будет отправлен на сервер для обработки</li>
          <li>📊 Вы получите наглядные графики с обогащёнными биологическими процессами, молекулярными функциями и путями</li>
          <li>🕒 Обработка занимает всего несколько секунд</li>
          <li>📥 Вы сможете скачать сгенерированные изображения</li>
        </ul>
      </div>
      <div>
        <Alert
          message="Внимание"
          description="Убедитесь, что загружаемый CSV содержит корректные данные — названия генов в правильном формате."
          type="warning"
          showIcon
          style={{ marginTop: 24 }}
        />
        {loading && <Loader />}
      </div>
      <input
        type="file"
        id="file-input"
        accept=".csv"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton
          icon={<FileTextOutlined />}
          onClick={handleFileInputClick}
          tooltip="Загрузить CSV-файл"
          disabled={loading}
        />
        <FloatButton
          icon={<QuestionCircleOutlined />}
          type="primary"
          tooltip="Загрузите .csv-файл для аннотации (GO и KEGG анализ)"
        />
      </FloatButton.Group>

      {imageUrls.length > 0 ? (
        <div className="image-results">
          {imageUrls.map((img, index) => (
            <div key={index} className="image-item">
              <img src={img.url} alt={img.name} className="result-image" />
              <button
                className="download-button"
                onClick={() => handleDownload(img.url, img.name)}
                disabled={loading}
              >
                <DownloadOutlined /> Скачать
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">Загрузите CSV-файл для аннотации</p>
      )}
      
    </div>
  );
};

export default Annotation;
