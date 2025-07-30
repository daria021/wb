localup:
	@echo "Building and running local compose setup"
	docker compose stop
	docker compose -f local.compose.yml up --build -d


LOAD_COMPOSE := loadtest.compose.yml
USERS        ?= 300      # одновременных виртуальных юзеров
SPAWN_RATE   ?= 30       # сколько юзеров/сек добавляем
TG_INIT_DATA ?= hash=ABCDEFG&user=123   # валидная Telegram initData

loadtest-build:
	docker compose -f $(LOAD_COMPOSE) build

loadtest-up: loadtest-build
	@echo "▶️  Запускаю нагрузочное окружение…"
	TG_INITDATA=$(TG_INIT_DATA) \
	USERS=$(USERS) SPAWN_RATE=$(SPAWN_RATE) \
	docker compose -f $(LOAD_COMPOSE) up -d

# интерактивная Web-GUI Locust (порт 8089)
loadtest-gui: loadtest-build
	TG_INITDATA=$(TG_INIT_DATA) \
	docker compose -f $(LOAD_COMPOSE) up locust

# собрать CSV + HTML-отчёт и сразу выключить всё
loadtest-run: loadtest-build
	@echo "▶️  Headless-тест $(USERS) users × $(SPAWN_RATE)/s, 10 минут"
	TG_INITDATA=$(TG_INIT_DATA) \
	USERS=$(USERS) SPAWN_RATE=$(SPAWN_RATE) \
	docker compose -f $(LOAD_COMPOSE) run --rm locust \
	  -f /mnt/locust/locustfile.py \
	  --headless -u $$USERS -r $$SPAWN_RATE -t 10m \
	  --csv /mnt/locust/report --html /mnt/locust/report.html
	@echo "📄  Готово: tests/report.html  и  tests/report_stats.csv"

loadtest-down:
	docker compose -f $(LOAD_COMPOSE) down -v

.PHONY: localup localdown loadtest-build loadtest-up loadtest-gui loadtest-run loadtest-down