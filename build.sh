#!/usr/bin/env bash

# Перейти во фронтенд и установить зависимости
cd frontend
npm install
npm run build

# Вернуться в корень проекта и продолжить деплой Django
cd ..
cd backend
pip3 install -r requirements.txt
python3 manage.py migrate
python3 manage.py collectstatic --noinput
