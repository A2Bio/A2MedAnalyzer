import React, { useState } from 'react';
import { Table, FloatButton, message } from 'antd';
import { QuestionCircleOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';

const Filtrate = () => {
  const [tableData, setTableData] = useState([]);
  const [csvUrl, setCsvUrl] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://a2medanalyzer.onrender.com/api/filtrate/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTableData(data.table_data);
        setCsvUrl(data.csv_url);
        message.success('Файл успешно обработан');
      } else {
        message.error(data.message || 'Ошибка при обработке файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      message.error('Ошибка при соединении с сервером');
    }
  };

  const handleFileInputClick = () => {
    document.getElementById('file-input').click();
  };

  const handleDownload = () => {
    if (csvUrl) {
      window.open(csvUrl, '_blank');
    } else {
      message.info('Сначала загрузите файл');
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
    <>
      <input
        type="file"
        id="file-input"
        accept=".tsv"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton icon={<FileTextOutlined />} onClick={handleFileInputClick} />
        <FloatButton icon={<DownloadOutlined />} onClick={handleDownload} />
        <FloatButton icon={<QuestionCircleOutlined />} type="primary" tooltip="Загрузите .tsv-файл для фильтрации" />
      </FloatButton.Group>

      {tableData.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey={(record, index) => index}
            bordered
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}
    </>
  );
};

export default Filtrate;
