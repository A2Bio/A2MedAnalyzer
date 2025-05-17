import React, { useState } from 'react';
import { FloatButton, message, Alert } from 'antd';
import { FileTextOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './Annotation.css';
import Loader from '../../blocks/Components/Loaders/Loader';

const Annotation = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Локальный или продакшен URL
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
      console.log('Отправка файла на:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Ответ от /api/annotation/:', data);

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
    console.log('Клик по кнопке загрузки');
    document.getElementById('file-input').click();
  };

  const handleDownload = async (url, name) => {
    console.log('Попытка скачать:', { url, name });
    const downloadUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    console.log('Полный URL для скачивания:', downloadUrl);

    // Попробуем fetch без Cache-Control
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
      });
      console.log('Статус ответа:', response.status, response.statusText, {
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Blob получен:', { type: blob.type, size: blob.size });

      if (!blob.type.includes('image')) {
        throw new Error(`Неверный тип файла: ${blob.type}`);
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      console.log('Скачивание инициировано для:', name);
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      message.success(`Файл ${name} скачан`);
    } catch (error) {
      console.error('Ошибка fetch:', error);
      message.warning(`Fetch не сработал: ${error.message}. Пробуем альтернативный способ.`);

      // Fallback: используем <a download>, как в Filtrate.js
      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        console.log('Альтернативное скачивание инициировано для:', name);
        document.body.removeChild(link);
        message.success(`Файл ${name} скачан (альтернативный способ)`);
      } catch (fallbackError) {
        console.error('Ошибка альтернативного скачивания:', fallbackError);
        message.error(`Не удалось скачать ${name}: ${fallbackError.message}`);
      }
    }
  };

  console.log('Текущее состояние imageUrls:', imageUrls);
  console.log('Состояние loading:', loading);

  return (
    <div className="annotation-container">
      <div className="description-block">
        <h2>
          Аннотация генов по <a href="https://geneontology.org/" target="_blank" rel="noopener noreferrer">GO</a> и <a href="https://www.kegg.jp/kegg/pathway.html" target="_blank" rel="noopener noreferrer">KEGG</a>
        </h2>
        <p className="description">
          Здесь вы можете загрузить CSV-файл с результатами дифференциальной экспрессии генов, чтобы получить автоматическую аннотацию с помощью GO (Gene Ontology) и KEGG (Kyoto Encyclopedia of Genes and Genomes) анализов.
        </p>
        <p className="description">
          После загрузки:
        </p>
        <ul className="features-list">
          <li>🔍 Ваш файл будет обработан сервером</li>
          <li>📊 В течение нескольких секунд вы получите наглядные графики, отражающие обогащённые биологические процессы, клеточные компоненты, молекулярные функции и пути.</li>
        </ul>

        <Alert
          message="Примечание"
          description="Убедитесь, что файл содержит корректные данные — .csv файл с названиями генов."
          type="warning"
          showIcon
          style={{ marginTop: 24 }}
        />
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
          <h3>Результаты аннотации</h3>
          {imageUrls.map((img, index) => (
            <div key={index} className="image-item">
              <h4>{img.name}</h4>
              <img src={img.url} alt={img.name} className="result-image" />
              <button
                className="download-button"
                onClick={() => {
                  console.log('Клик по кнопке Скачать для:', img.name);
                  handleDownload(img.url, img.name);
                }}
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
      {loading && <Loader />}
    </div>
  );
};

export default Annotation;