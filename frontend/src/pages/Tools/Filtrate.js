import React, { useState } from 'react';
import { Table, FloatButton, message, Checkbox, Dropdown, Button } from 'antd';
import { FileTextOutlined, DownloadOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './Filtrate.css';

const Filtrate = () => {
  const [tableData, setTableData] = useState([]);
  const [csvUrl, setCsvUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    mappedGenes: true,
    riskAllele: true,
    riskFrequency: true,
    Count_Genes: true,
    Count_Alleles: true,
  });

  const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://a2medanalyzer.onrender.com/api/filtrate/'
    : 'http://localhost:8000/api/filtrate/';

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
      const link = document.createElement('a');
      link.href = csvUrl;
      link.download = 'extracted_genes.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.info('Сначала загрузите и обработайте файл');
    }
  };

  const allColumns = [
    {
      title: 'Ген',
      dataIndex: 'mappedGenes',
      key: 'mappedGenes',
      sorter: (a, b) => (a.mappedGenes || '').localeCompare(b.mappedGenes || ''),
    },
    {
      title: 'Аллель',
      dataIndex: 'riskAllele',
      key: 'riskAllele',
      sorter: (a, b) => (a.riskAllele || '').localeCompare(b.riskAllele || ''),
    },
    {
      title: 'Частота',
      dataIndex: 'riskFrequency',
      key: 'riskFrequency',
      sorter: (a, b) => parseFloat(a.riskFrequency || 0) - parseFloat(b.riskFrequency || 0),
    },
    {
      title: 'Кол-во генов',
      dataIndex: 'Count_Genes',
      key: 'Count_Genes',
      sorter: (a, b) => (a.Count_Genes || 0) - (b.Count_Genes || 0),
    },
    {
      title: 'Кол-во аллелей',
      dataIndex: 'Count_Alleles',
      key: 'Count_Alleles',
      sorter: (a, b) => (a.Count_Alleles || 0) - (b.Count_Alleles || 0),
    },
  ];

  const filteredColumns = allColumns.filter(col => visibleColumns[col.key]);

  const columnToggleMenu = {
    items: allColumns.map(col => ({
      key: col.key,
      label: (
        <Checkbox
          checked={visibleColumns[col.key]}
          onChange={() =>
            setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))
          }
        >
          {col.title}
        </Checkbox>
      ),
    })),
  };

  return (
    <div className="filtration-container">
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

      <div className="description-block">
        <h2>GWAS-фильтрация данных</h2>
        <p className="description">
          Загрузите ваш <strong>.tsv</strong>-файл с данными генетических вариаций, чтобы отфильтровать информацию по частоте, аллелям и другим характеристикам. После обработки вы сможете:
        </p>
        <ul className="features-list">
          <li>🔍 Изучить упомянутые гены и аллели</li>
          <li>📊 Сортировать данные по частоте и количеству встречаемости</li>
          <li>🛠 Настроить отображение нужных столбцов</li>
          <li>📥 Скачать отфильтрованный результат</li>
        </ul>
      </div>

      {tableData.length > 0 ? (
        <>
          <div className="table-controls">
            <Dropdown menu={columnToggleMenu} placement="bottomLeft">
              <Button icon={<SettingOutlined />}>Настроить столбцы</Button>
            </Dropdown>
          </div>
          <div className="table-container">
            <Table
              dataSource={tableData}
              columns={filteredColumns}
              rowKey={(record, index) => index}
              bordered
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </div>
        </>
      ) : (
        <p className="no-data">Загрузите TSV-файл для отображения результатов</p>
      )}
    </div>
  );
};

export default Filtrate;
