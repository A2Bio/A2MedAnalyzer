import React, { useState } from 'react';
import { FloatButton, message } from 'antd';
import { FileTextOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './Annotation.css';

const Annotation = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Локальный или продакшен URL
  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://a2medanalyzer.onrender.com/api/annotation/'
    : 'http://localhost:8000/api/annotation/';

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error('Выберите CSV-файл');
      return;
    }

    setLoading(true);
    setImageUrls([]); // Очищаем предыдущие изображения
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
      console.error('Ошибка загрузки файла:', error);
      message.error('Ошибка при соединении с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInputClick = () => {
    document.getElementById('file-input').click();
  };

  const handleDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="annotation-container">
      <h2>Аннотация</h2>
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
          <h3>Результаты аннотации</h3>
          {imageUrls.map((img, index) => (
            <div key={index} className="image-item">
              <h4>{img.name}</h4>
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