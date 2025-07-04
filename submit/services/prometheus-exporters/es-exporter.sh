#!/bin/sh

ELASTIC_PASSWORD=$(wget -q -O - --header "X-Vault-Token: $(cat /run/secrets/elastic-token)" $VAULT_ADDR/v1/kv/elastic-creds \
    | awk -f /JSON.awk "-" \
    | grep "elastic-password" \
    | awk '{print $2}' \
    | tr -d '"')

exec /bin/elasticsearch_exporter \
  --es.uri=https://elastic:${ELASTIC_PASSWORD}@elasticsearch:9200 \
  --es.ca=/etc/ssl/certs/ca.crt \
  --es.client-cert=/certs/prom-exporter.crt \
  --es.client-private-key=/certs/prom-exporter.key \
  --es.ssl-skip-verify

      # These settings are causing massive slowdown
      # - '--es.all'
      # - '--collector.clustersettings'
      # #- '--es.cluster_settings'
      # - '--es.indices'
      # - '--log.level=debug'
