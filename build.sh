#!/usr/bin/env bash

# Перейти во фронтенд и установить зависимости
cd frontend
npm install
npm run build

# Вернуться в корень проекта и продолжить деплой Django
cd ..
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
