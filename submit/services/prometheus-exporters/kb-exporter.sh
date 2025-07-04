#!/bin/sh

ELASTIC_PASS=$(wget -q -O - --header "X-Vault-Token: $(cat /run/secrets/elastic-token)" $VAULT_ADDR/v1/kv/elastic-creds 2> /dev/null \
    | awk -f /JSON.awk "-" \
    | grep elastic-password \
    | awk '{print $2}' \
    | tr -d '"')

exec /bin/kibana_exporter -kibana.uri https://kibana:5601 -kibana.username elastic -kibana.password $ELASTIC_PASS -debug -wait
