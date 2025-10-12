.PHONY: init up down build

init:
	docker compose --profile dev build dev
	@echo "Creating temporary container to copy node_modules..."
	docker run --rm -v $(PWD):/host crop-tool-dev sh -c "rm -rf /host/node_modules && cp -r /app/node_modules /host/"
	@echo "Setup complete"

up:
	docker compose --profile dev up dev -d
	npx supabase start
	@echo "Development server started: http://localhost:3000" && echo "Supabase started: http://localhost:54321"

down:
	docker compose --profile dev down
	npx supabase stop
	@echo "Development environment and Supabase stopped"

build:
	docker build --target runner -t crop-tool:latest .
	@echo "Production image built"
