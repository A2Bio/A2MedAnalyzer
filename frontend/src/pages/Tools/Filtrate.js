import React, { useState } from 'react';
import { Table, FloatButton, message, Dropdown, Menu, Checkbox, Button } from 'antd';
import { FileTextOutlined, DownloadOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
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

  const handleFilteredDownload = () => {
    if (!tableData.length) {
      message.info('Нет данных для загрузки');
      return;
    }

    const filtered = tableData.map(row => {
      const visibleRow = {};
      Object.keys(visibleColumns).forEach(key => {
        if (visibleColumns[key]) {
          visibleRow[key] = row[key];
        }
      });
      return visibleRow;
    });

    const csvContent = convertToCSV(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_table.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header =>
        `"${(row[header] ?? '').toString().replace(/"/g, '""')}"`
      );
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
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

  const menu = (
    <Menu>
      {allColumns.map(col => (
        <Menu.Item key={col.key}>
          <Checkbox
            checked={visibleColumns[col.dataIndex]}
            onChange={() => {
              setVisibleColumns(prev => ({
                ...prev,
                [col.dataIndex]: !prev[col.dataIndex],
              }));
            }}
          >
            {col.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="filtration-container">
      <input
        type="file"
        id="file-input"
        accept=".tsv"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24, marginBottom: 12 }}>
        <FloatButton icon={<FileTextOutlined />} onClick={handleFileInputClick} tooltip="Загрузить TSV-файл" disabled={loading} />
        <FloatButton icon={<DownloadOutlined />} onClick={handleDownload} tooltip="Скачать гены с сервера" disabled={!csvUrl || loading} />
        <FloatButton icon={<DownloadOutlined />} onClick={handleFilteredDownload} tooltip="Скачать таблицу с фильтрацией" disabled={!tableData.length || loading} />
        <FloatButton icon={<QuestionCircleOutlined />} type="primary" tooltip="Загрузите .tsv-файл для фильтрации" />
      </FloatButton.Group>

      <div className="description-block">
        <h2>GWAS-исследования</h2>
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

      {tableData.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
            <Button icon={<SettingOutlined />}>Настройка столбцов</Button>
          </Dropdown>
        </div>
      )}

      {tableData.length > 0 ? (
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
      ) : (
        <p className="no-data">Загрузите TSV-файл для отображения результатов</p>
      )}
    </div>
  );
};

export default Filtrate;