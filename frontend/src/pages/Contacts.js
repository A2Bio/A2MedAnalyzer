import React from 'react';

const Contacts = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Контакты</h1>

      <section className="space-y-6 text-base leading-relaxed">
        <p>Мы — команда студенток 4 курса, обучающихся на направлении <strong>«Биоинформатика»</strong>. Проект A2MedAnalyzer является частью нашей производственной практики и дипломной работы.</p>

        <div>
          <h2 className="text-xl font-semibold mb-2">Разработчицы:</h2>
          <ul className="list-disc list-inside">
            <li><strong>Ангелина</strong> — фронтенд, UI/UX, визуальные компоненты</li>
            <li><strong>Алина</strong> — бэкенд, обработка данных, API и биоинформатика</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Контактная информация:</h2>
          <ul className="list-disc list-inside">
            <li>📨 Email: <a href="mailto:kolesniko@sfedu.ru" className="text-blue-600 hover:underline">kolesniko@sfedu.ru</a></li>
            <li>📢 Telegram: <a href="https://t.me/gnom_genome" className="text-blue-600 hover:underline">@gnom_genome</a></li>
          </ul>
        </div>

        <p>Если у вас есть предложения, идеи или вы нашли баг — напишите нам!</p>
      </section>
    </div>
  );
};

export default Contacts;
