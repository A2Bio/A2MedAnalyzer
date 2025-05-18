import React from 'react';
import { Button, message, Avatar } from 'antd';
import { GithubOutlined, SendOutlined } from '@ant-design/icons';
import './Contacts.css';
import AlinaImage from '../blocks/images/Alina.jpg';
import LinaImage from '../blocks/images/Lina.jpg';

const Contacts = () => {
  const handleLinkClick = (platform) => {
    message.success(`Переход в ${platform}`);
  };

  // Имена, роли, фото, Telegram
  const team = [
    {
      name: 'Ангелина',
      role: 'Фронтенд, UI/UX, визуальные компоненты',
      photo: LinaImage,
      telegram: 'https://t.me/gnom_genome',
    },
    {
      name: 'Алина',
      role: 'Бэкенд, обработка данных, API и биоинформатика',
      photo: AlinaImage,
      telegram: 'https://t.me/your_alin',
    },
  ];

  return (
    <div className="contacts-container">
      <div className="contacts-content">
        <h1 className="title">Контакты A2MedAnalyzer</h1>
        <p className="description">
          Мы — команда исследователей, работающих над анализом генетических данных для медицинских открытий.
          Свяжитесь с нами, чтобы узнать больше о проекте, предложить сотрудничество или задать вопросы!
        </p>

        {/* Команда */}
        <div className="team-section">
          <h2 className="team-title">Наша команда</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <Avatar src={member.photo} size={120} className="team-photo" />
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <Button
                  type="primary"
                  icon={<SendOutlined className="telegram-icon" />}
                  className="team-telegram"
                  onClick={() => handleLinkClick(`${member.name}'s Telegram`)}
                  href={member.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Сообщество */}
        <div className="community-section">
          <h2 className="community-title">Узнайте о нас</h2>
          <div className="contact-links">
            <Button
              type="default"
              icon={<GithubOutlined className="github-icon" />}
              size="large"
              className="contact-button github"
              onClick={() => handleLinkClick('GitHub')}
              href="https://github.com/a2bio/A2MedAnalyzer"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;