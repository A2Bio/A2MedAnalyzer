import React from 'react';
import '../blocks/ButtonAnimations/fuzzibullfrog.css';
import './Home.css';

import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Добро пожаловать в A2MedAnalyzer</h1>
        <p className="text-lg text-gray-600">
          Платформа для анализа омных данных человека. Инструменты для клинической практики и исследовательских задач.
        </p>
      </header>

      <section className="max-w-3xl mx-auto text-base leading-relaxed space-y-6 mb-16">
        <p><strong>A2MedAnalyzer</strong> — это веб-приложение, созданное студентками направления «Биоинформатика» как часть дипломного проекта. Оно предназначено для биоинформатического анализа данных человека с возможностью фильтрации, аннотации и визуализации.</p>
        <p>На данный момент реализована поддержка работы с GWAS-данными: их загрузка, фильтрация по статистическим критериям, аннотация по базам GO и KEGG, а также визуализация в виде таблиц и графиков.</p>
        <p>Проект направлен на то, чтобы сделать сложные методы анализа доступными для студентов, исследователей и специалистов в области медицины.</p>
        <p><strong>Что уже реализовано:</strong></p>
        <ul className="list-disc list-inside pl-4">
          <li>Импорт и отображение GWAS-данных</li>
          <li>Фильтрация по p-value, эффекту и частоте</li>
          <li>Аннотация по базам данных GO/KEGG</li>
          <li>Интерактивная визуализация</li>
          <li>Экспорт таблиц и графиков</li>
        </ul>
        <p>Платформа продолжает развиваться, и в будущем мы планируем добавить поддержку данных протеомики и метаболомики.</p>
      </section>

      <div className="button-grid">
        <Link to="/gwas">
          <button>
            <div className="tool">
              <h2>🧬 GWAS-исследования</h2>
              <p>Поиск исследований по заболеваниям.</p>
            </div>
          </button>
        </Link>

        <Link to="/annotation">
          <button>
            <div className="tool">
              <h2>📖 Аннотация</h2>
              <p>GO/KEGG аннотация выбранных генов или вариантов.</p>
            </div>
          </button>
        </Link>

        <Link to="/filtrate">
          <button>
            <div className="tool">
              <h2>📊 GWAS-фильтрация</h2>
              <p>Интерактивные таблицы с возможностью фильтрации и скачивания.</p>
            </div>
          </button>
        </Link>

        <Link to="/gene_info">
          <button>
            <div className="tool">
              <h2>📊 База данных NCBI</h2>
              <p>Поиск информации о генах в базе данных NCBI.</p>
            </div>
          </button>
        </Link>

        <Link to="/metabolic_network">
          <button>
            <div className="tool">
              <h2>📊 Метаболические сети</h2>
              <p>Анализ и построение метаболических сетей для генов.</p>
            </div>
          </button>
        </Link>

      </div>

      <footer className="mt-20 text-center text-sm text-gray-500">
        © 2025 A2Bio. Все права защищены.
      </footer>
    </div>
  );
};

export default Home;
