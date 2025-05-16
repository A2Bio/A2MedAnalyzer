import React from 'react';
import { QuestionCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

const Filtrate = () => {
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
    
          if (!response.ok) {
            alert('Ошибка при обработке файла');
            return;
          }
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'filtered_file.csv'; // Заменить по необходимости
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Ошибка загрузки файла:', error);
        }
      };
    
      const handleFileInputClick = () => {
        document.getElementById('file-input').click();
      };
    
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
            <FloatButton icon={<DownloadOutlined />} onClick={() => alert('Скачивание доступно после обработки')} />
            <FloatButton icon={<QuestionCircleOutlined />} type="primary" />
          </FloatButton.Group>
        </>
      );
};
export default Filtrate;