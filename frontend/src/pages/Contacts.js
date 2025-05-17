import React from 'react';
import { Button, message, Avatar } from 'antd';
import { GithubOutlined, SendOutlined } from '@ant-design/icons';
import './Contacts.css';

const Contacts = () => {
  const handleLinkClick = (platform) => {
    message.success(`Переход в ${platform}`);
  };

  // Имена, роли, фото, Telegram
  const team = [
    {
      name: 'Ангелина',
      role: 'Фронтенд, UI/UX, визуальные компоненты',
      photo: '/images/Лина.jpg',
      telegram: 'https://t.me/gnom_genome',
    },
    {
      name: 'Алина',
      role: 'Бэкенд, обработка данных, API и биоинформатика',
      photo: '/images/Алина.jpg',
      telegram: 'https://t.me/your_alin',
    },
  ];

  return (
    <div className="contacts-container">
      {/* Фон с ДНК */}
      <div className="dna-background">
        <svg className="dna-svg" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet">
          <path
            d="M200,400 C300,250 500,550 700,400 C900,250 1100,550 1200,400"
            stroke="#0077B6"
            strokeWidth="5"
            fill="none"
            opacity="0.3"
            className="dna-strand"
          />
          <path
            d="M200,400 C300,550 500,250 700,400 C900,550 1100,250 1200,400"
            stroke="#0077B6"
            strokeWidth="5"
            fill="none"
            opacity="0.3"
            className="dna-strand"
          />
          <circle cx="300" cy="400" r="6" fill="#0077B6" className="dna-particle" />
          <circle cx="700" cy="400" r="6" fill="#0077B6" className="dna-particle" />
          <circle cx="1100" cy="400" r="6" fill="#0077B6" className="dna-particle" />
        </svg>
      </div>

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