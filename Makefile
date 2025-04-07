localup:
	@echo "Building and running local compose setup"
	docker compose -f local.compose.yml up --build -d
