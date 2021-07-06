ifneq ("$(wildcard /.dockerenv)", "")
	INSIDE_DOCKER = 1
else
	INSIDE_DOCKER = 0
endif

# Global variables that we're using
HOST_UID := $(shell id -u)
HOST_GID := $(shell id -g)
DOCKER := $(shell which docker)

ifdef DOCKER
	IS_RUNNING := $(shell docker ps -f name=angular-ngrx-frontend | grep angular-ngrx-frontend)
else
	IS_RUNNING := '';
endif

WARNING_HOST = @printf "\033[31mThis command cannot be run inside docker container!\033[39m\n"
WARNING_DOCKER = @printf "\033[31mThis command must be run inside docker container and it's not running!\nUse 'make start' command to get container running and after that run this command again.\033[39m\n"
NOTICE_HOST = @printf "\033[33mRunning command from host machine by using 'docker-compose exec' command\033[39m\n"

.DEFAULT_GOAL := help
.PHONY: help
help:
	@grep -E '^[a-zA-Z-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "[32m%-27s[0m %s\n", $$1, $$2}'

bash: ## Get bash inside Node container
ifeq ($(INSIDE_DOCKER), 1)
	$(WARNING_HOST)
else
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose exec node bash
endif

start: ## Start application in development mode
ifeq ($(INSIDE_DOCKER), 1)
	$(WARNING_HOST)
else
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose up
endif

stop: ## Stop application containers
ifeq ($(INSIDE_DOCKER), 1)
	$(WARNING_HOST)
else
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose down
endif

start-build: ## Start application in development mode and build containers
ifeq ($(INSIDE_DOCKER), 1)
	$(WARNING_HOST)
else
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose up --build
endif

start-yarn: ## Run start command with yarn
ifeq ($(INSIDE_DOCKER), 1)
	@yarn run start
else
	$(WARNING_DOCKER)
endif

lint: ## Lint TypeScript and SCSS files
ifeq ($(INSIDE_DOCKER), 1)
	@make lint-ts
	@make lint-scss
else ifeq ($(strip $(IS_RUNNING)),)
	$(WARNING_DOCKER)
else
	$(NOTICE_HOST)
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose exec node make lint
endif

lint-ts: ## Lint TypeScript files
ifeq ($(INSIDE_DOCKER), 1)
	@echo "\033[32mLinting TypeScript files\033[39m"
	@yarn run lint:ts
else ifeq ($(strip $(IS_RUNNING)),)
	$(WARNING_DOCKER)
else
	$(NOTICE_HOST)
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose exec node make lint-ts
endif

lint-scss: ## Lint SCSS files
ifeq ($(INSIDE_DOCKER), 1)
	@echo "\033[32mLinting SCSS files\033[39m"
	@yarn run lint:scss
else ifeq ($(strip $(IS_RUNNING)),)
	$(WARNING_DOCKER)
else
	$(NOTICE_HOST)
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose exec node make lint-scss
endif

extract-translations: ### Extract translations from TypeScript and HTML template files
ifeq ($(INSIDE_DOCKER), 1)
	@echo "\033[32mExtracting translations\033[39m"
	@yarn run extract-translations
else ifeq ($(strip $(IS_RUNNING)),)
	$(WARNING_DOCKER)
else
	$(NOTICE_HOST)
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose exec node make extract-translations
endif

check-translations: ### Check missing translations
ifeq ($(INSIDE_DOCKER), 1)
	@echo "\033[32mChecking translations\033[39m"
	@yarn run check-translations
else ifeq ($(strip $(IS_RUNNING)),)
	$(WARNING_DOCKER)
else
	$(NOTICE_HOST)
	@HOST_UID=$(HOST_UID) HOST_GID=$(HOST_GID) docker-compose exec node make check-translations
endif
