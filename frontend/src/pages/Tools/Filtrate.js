import React, { useState } from 'react';
import { Table, FloatButton, message } from 'antd';
import { FileTextOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './Filtrate.css'; 

const Filtrate = () => {
  const [tableData, setTableData] = useState([]);
  const [csvUrl, setCsvUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Используем локальный URL для разработки, продакшен — для деплоя
  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://a2medanalyzer.onrender.com/api/filtrate/'
    : 'http://localhost:8000/api/filtrate/';

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error('Выберите TSV-файл');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTableData(data.table_data || []);
        setCsvUrl(data.csv_url || null);
        message.success('Файл успешно обработан');
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

  const handleDownload = () => {
    if (csvUrl) {
      // Создаём временную ссылку для скачивания
      const link = document.createElement('a');
      link.href = csvUrl;
      link.download = 'extracted_genes.csv'; // Имя файла при скачивании
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.info('Сначала загрузите и обработайте файл');
    }
  };

  const columns = [
    { title: 'Ген', dataIndex: 'mappedGenes', key: 'mappedGenes' },
    { title: 'Аллель', dataIndex: 'riskAllele', key: 'riskAllele' },
    { title: 'Частота', dataIndex: 'riskFrequency', key: 'riskFrequency' },
    { title: 'Кол-во генов', dataIndex: 'Count_Genes', key: 'Count_Genes' },
    { title: 'Кол-во аллелей', dataIndex: 'Count_Alleles', key: 'Count_Alleles' },
  ];  
  return (
    <div className="filtration-container">
      <h2>Фильтрация</h2>
      <input
        type="file"
        id="file-input"
        accept=".tsv"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton
          icon={<FileTextOutlined />}
          onClick={handleFileInputClick}
          tooltip="Загрузить TSV-файл"
          disabled={loading}
        />
        <FloatButton
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          tooltip="Скачать гены"
          disabled={!csvUrl || loading}
        />
        <FloatButton
          icon={<QuestionCircleOutlined />}
          type="primary"
          tooltip="Загрузите .tsv-файл для фильтрации"
        />
      </FloatButton.Group>

      {tableData.length > 0 ? (
        <div className="table-container">
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey={(record, index) => index}
            bordered
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        </div>
      ) : (
        <p className="no-data">Загрузите TSV-файл для отображения результатов</p>
      )}
    </div>
  );
};

export default Filtrate;