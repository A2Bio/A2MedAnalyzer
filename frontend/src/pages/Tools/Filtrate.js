import React, { useState } from 'react';
import { Table, FloatButton, message, Checkbox } from 'antd';
import { FileTextOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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

  const generateFilters = (dataIndex) => {
    const uniqueValues = [...new Set(tableData.map(item => item[dataIndex]))].filter(Boolean);
    return uniqueValues.map(val => ({ text: val, value: val }));
  };

  const allColumns = [
    {
      title: 'Ген',
      dataIndex: 'mappedGenes',
      key: 'mappedGenes',
      filters: generateFilters('mappedGenes'),
      onFilter: (value, record) => record.mappedGenes === value,
      sorter: (a, b) => (a.mappedGenes || '').localeCompare(b.mappedGenes || ''),
    },
    {
      title: 'Аллель',
      dataIndex: 'riskAllele',
      key: 'riskAllele',
      filters: generateFilters('riskAllele'),
      onFilter: (value, record) => record.riskAllele === value,
    },
    {
      title: 'Частота',
      dataIndex: 'riskFrequency',
      key: 'riskFrequency',
      filters: generateFilters('riskFrequency'),
      onFilter: (value, record) => record.riskFrequency === value,
      sorter: (a, b) => parseFloat(a.riskFrequency || 0) - parseFloat(b.riskFrequency || 0),
    },
    {
      title: 'Кол-во генов',
      dataIndex: 'Count_Genes',
      key: 'Count_Genes',
      filters: generateFilters('Count_Genes'),
      onFilter: (value, record) => record.Count_Genes === value,
      sorter: (a, b) => parseInt(a.Count_Genes || 0) - parseInt(b.Count_Genes || 0),
    },
    {
      title: 'Кол-во аллелей',
      dataIndex: 'Count_Alleles',
      key: 'Count_Alleles',
      filters: generateFilters('Count_Alleles'),
      onFilter: (value, record) => record.Count_Alleles === value,
      sorter: (a, b) => parseInt(a.Count_Alleles || 0) - parseInt(b.Count_Alleles || 0),
    },
  ];

  const filteredColumns = allColumns.filter(col => visibleColumns[col.dataIndex]);

  const toggleColumn = (colKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
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
        <FloatButton icon={<FileTextOutlined />} onClick={handleFileInputClick} tooltip="Загрузить TSV-файл" disabled={loading} />
        <FloatButton icon={<DownloadOutlined />} onClick={handleDownload} tooltip="Скачать гены" disabled={!csvUrl || loading} />
        <FloatButton icon={<QuestionCircleOutlined />} type="primary" tooltip="Загрузите .tsv-файл для фильтрации" />
      </FloatButton.Group>

      {tableData.length > 0 ? (
        <div className="content-with-sidebar">
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
          <div className="settings-panel">
            <h3>Настройки столбцов</h3>
            <div className="checkbox-group">
              {allColumns.map(col => (
                <Checkbox
                  key={col.key}
                  checked={visibleColumns[col.dataIndex]}
                  onChange={() => toggleColumn(col.dataIndex)}
                >
                  {col.title}
                </Checkbox>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="no-data">Загрузите TSV-файл для отображения результатов</p>
      )}
    </div>
  );
};

export default Filtrate;
