# Руководство по развёртыванию UzMonopoly (DEPLOY.md)

Полное пошаговое руководство по развёртыванию игры **UzMonopoly** (UzBiznes) в продакшене с соблюдением минимального бюджета **$0–6 в месяц**.

---

## 1. Архитектура и бюджетная оценка

| Компонент                    | Сервис                                                                                                   | Тариф / Стоимость          | Задачи                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| **Клиент (Frontend)**        | [Cloudflare Pages](https://pages.cloudflare.com/)                                                        | **$0 / месяц** (Бесплатно) | Глобальный CDN, HTTPS, автоматический деплой при `git push`               |
| **Игровой сервер (Backend)** | [Hetzner Cloud CX22](https://www.hetzner.com/) или [DigitalOcean Droplet](https://www.digitalocean.com/) | **~€3.79 – $4–6 / месяц**  | Colyseus WebSocket-сервер в памяти, 1–2 vCPU, 1–2 ГБ RAM                  |
| **SSL & Reverse Proxy**      | [Caddy 2](https://caddyserver.com/) в Docker                                                             | **$0 / месяц**             | Автоматические Let's Encrypt SSL-сертификаты, HTTP/2 & HTTP/3, прокси WSS |
| **Домен** (опционально)      | `.uz` или `.com`                                                                                         | **~$10–15 / год**          | Красивый адрес (`uzmonopoly.uz` и `api.uzmonopoly.uz`)                    |
| **Итого:**                   |                                                                                                          | **~$4–6 / месяц**          |                                                                           |

> [!NOTE]
> Сервер полностью работает **in-memory** без тяжёлой базы данных в MVP. 1 ГБ оперативной памяти и 1–2 vCPU легко выдерживают до 200 одновременных комнат (до 1 200 игроков) благодаря компактным бинарным/JSON WebSocket пакетам и пошаговой механике.

---

## 2. Развёртывание фронтенда на Cloudflare Pages ($0/мес)

Cloudflare Pages предоставляет бесплатный хостинг статики с безлимитным трафиком и встроенным SSL.

### Шаг 2.1. Подключение репозитория в Cloudflare Dashboard

1. Войдите в аккаунт Cloudflare и перейдите в раздел **Workers & Pages** -> **Create application** -> **Pages**.
2. Подключите ваш GitHub/GitLab репозиторий с UzMonopoly.

### Шаг 2.2. Настройки сборки (Build settings)

Укажите следующие параметры:

- **Framework preset**: `Vite` (или `None`)
- **Build command**: `pnpm --filter @uzmonopoly/client run build`
- **Build output directory**: `packages/client/dist`
- **Root directory**: `/` (корень репозитория)

### Шаг 2.3. Переменные окружения (Environment Variables)

В разделе **Settings** -> **Environment variables** добавьте:

```ini
VITE_SERVER_URL = https://api.uzmonopoly.uz
```

_(Замените `https://api.uzmonopoly.uz` на реальный домен или IP вашего бэкенда)_.

Нажмите **Save and Deploy**. Ваш клиент станет доступен по адресу вида `https://uzmonopoly.pages.dev` и готов к привязке собственного домена.

---

## 3. Развёртывание бэкенда на VPS (Docker + Caddy)

### Шаг 3.1. Подготовка сервера

Арендуйте базовый сервер (Hetzner CX22, Ubuntu 24.04 LTS).
Подключитесь по SSH и установите Docker и Docker Compose:

```bash
# Обновление пакетов
sudo apt-get update && sudo apt-get upgrade -y

# Установка Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Проверка
docker --version
docker compose version
```

### Шаг 3.2. Настройка DNS-записи

В панели управления вашим доменом добавьте `A`-запись:

```
Тип: A
Имя: api (или game)
Значение: <IP_АДРЕС_ВАШЕГО_VPS>
TTL: Auto / 300
```

### Шаг 3.3. Клонирование репозитория и запуск

```bash
# Клонируем проект
git clone https://github.com/your-username/uzmonopoly.git /opt/uzmonopoly
cd /opt/uzmonopoly

# Создаём рабочий файл .env
cp .env.example .env

# Отредактируйте .env (укажите ваш домен)
nano .env
```

Пример `.env`:

```ini
DOMAIN=api.uzmonopoly.uz
PORT=2567
NODE_ENV=production
```

### Шаг 3.4. Запуск контейнеров

Запустите сервисы одной командой:

```bash
docker compose up -d --build
```

Caddy автоматически:

1. Выпустит бесплатный доверенный SSL-сертификат Let's Encrypt для указанного домена.
2. Настроит автопродление сертификата.
3. Проксирует все HTTP-запросы и WebSocket-соединения на игровой сервер `server:2567`.

---

## 4. Альтернатива: Развёртывание бэкенда на Fly.io

Если вы предпочитаете PaaS без необходимости настраивать сервер:

```bash
# Установка flyctl
curl -L https://fly.io/install.sh | sh

# Авторизация
fly auth login

# Запуск приложения
fly launch --no-deploy

# Развёртывание
fly deploy
```

Конфигурационный файл `fly.toml` уже включён в репозиторий:

- Отключено авто-засыпание (`auto_stop_machines = false`), чтобы не обрывать сессии игроков.
- Настроен встроенный healthcheck `/health`.
- Регион Франкфурт (`fra`) для минимального пинга до Узбекистана.

---

## 5. Мониторинг, Health-check и ограничения

### Эндпоинт `/health`

Игровой сервер предоставляет детальный статус:

```bash
curl -s https://api.uzmonopoly.uz/health | jq
```

Пример ответа:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptime": 14205.2,
  "activeRooms": 3,
  "maxRooms": 200,
  "memory": {
    "rssMb": 84,
    "heapUsedMb": 32,
    "heapTotalMb": 48
  },
  "timestamp": 1773177600000
}
```

### Встроенные защиты

1. **Лимит комнат (200 комнат)**: Сервер автоматически отклоняет создание новых комнат с ошибкой `Server room capacity reached`, если активных комнат ≥ 200. Статус в `/health` меняется на `capacity_reached`.
2. **Ограничение памяти контейнера**: В `docker-compose.yml` задан `mem_limit: 1024M` для предотвращения краха хост-системы.
3. **Ротация логов**: Задано ограничение `max-size: 10m`, `max-file: 3`.

### Просмотр логов

```bash
# Логи игрового сервера
docker compose logs -f server

# Логи Caddy (SSL, запросы)
docker compose logs -f caddy
```

---

## 6. Обновление версии в продакшене

Для обновления игры до свежего коммита:

```bash
cd /opt/uzmonopoly
git pull origin main
docker compose up -d --build
```

---

## 7. Чек-лист проверки готовности (Definition of Done)

- [x] Сервер собирается в легковесном мультистейдж-контейнере `node:22-alpine` без лишних зависимостей.
- [x] Caddy автоматически генерирует SSL и поддерживает WSS соединения.
- [x] Эндпоинт `/health` возвращает статус, потребление RAM и количество активных комнат.
- [x] Лимит в 200 комнат защищает VPS от переполнения памяти.
- [x] Клиент динамически определяет `VITE_SERVER_URL` или использует текущий хост.
- [x] Настроен CI в GitHub Actions (`.github/workflows/ci.yml`).
- [x] Стоимость инфраструктуры составляет от $0 (MVP) до ~$4–6/мес (1 VPS + Cloudflare Pages).
