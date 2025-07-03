DCOMPOSE    	= docker compose
SHELL			= /bin/sh
DIRS		  	= certs secrets
SECRETS       	= prometheus-token grafana-token elastic-token kibana-token logstash-token vault-token unseal-key
SECRET_FILES  	= $(foreach secrets,$(SECRETS),secrets/$(secrets))
SETUP_CONTAINERS= ssl-setup elastic-setup vault-setup frontend

all:
	sed -i -e "/^UID/c\UID=$(shell id -u)" \
		-e "/^GID/c\GID=$(shell id -g)" \
		-e "/^HEAP_SIZE/c\HEAP_SIZE=$(shell expr $(shell free --giga | awk '$$1=="Mem:" { print $$2 }') / 4 + 2)g" .env
	sed -i "/^HEAP_SIZE/c\HEAP_SIZE=2g" .env
	mkdir -p $(DIRS) && touch $(SECRET_FILES)
	$(DCOMPOSE) up -d
	$(DCOMPOSE) rm -fv $(SETUP_CONTAINERS)

up:
	$(DCOMPOSE) up --no-recreate -d $(c)

ps:
	$(DCOMPOSE) ps

enter:
	$(DCOMPOSE) exec -it $(c) $(SHELL)

enter1:
	$(DCOMPOSE) exec -it $(c) /bin/bash

logs:
	$(DCOMPOSE) logs $(c)

clean:
	$(DCOMPOSE) down

fclean:
	-$(DCOMPOSE) down --volumes --remove-orphans --timeout 1
	rm -rf $(DIRS)

re: clean all

reset: fclean all

.PHONY: all ps enter logs down clean re reset
