# Веб-мессенджер (GitHub + Render)

Готовый репозиторий для загрузки на GitHub и мгновенного деплоя.

## Вариант 1: Всё на Render.com (рекомендуется, 1 минута)
1. Загрузите все файлы из этого архива в корень нового репозитория на GitHub.
2. Зайдите на [Render.com](https://render.com) → **New +** → **Web Service** и выберите ваш репозиторий.
3. Render автоматически подхватит настройки из `render.yaml` (или укажите вручную: Build Command `pip install -r requirements.txt`, Start Command `python server.py`).
4. После деплоя мессенджер сразу откроется по вашей ссылке `https://имя-сервиса.onrender.com`.

## Вариант 2: Фронтенд на GitHub Pages + Бэкенд на Render
Если вы хотите открывать сайт через GitHub Pages (`username.github.io/repo`):
1. Разверните бэкенд на Render по инструкции выше и скопируйте его URL (например, `https://my-messenger.onrender.com`).
2. В файле `app.js` в первой строке впишите этот URL:
   ```js
   const BACKEND_URL = "https://my-messenger.onrender.com";
   ```
3. В настройках репозитория GitHub перейдите в **Settings → Pages**, выберите ветку `main` и папку `/ (root)`.
