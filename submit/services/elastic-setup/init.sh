#!/bin/bash

ELASTIC_TOKEN=$(cat /run/secrets/elastic-token)
ELASTIC_PASSWORD=$(curl --cacert /etc/ssl/certs/ca.crt -H "X-Vault-Token: $ELASTIC_TOKEN" $VAULT_ADDR/v1/kv/elastic-creds \
	| jq . | grep "elastic-password" | awk '{print $2}' | tr -d '"')
KIBANA_PASSWORD=$(curl --cacert /etc/ssl/certs/ca.crt -H "X-Vault-Token: $ELASTIC_TOKEN" $VAULT_ADDR/v1/kv/kibana-creds \
	| jq . | grep "kibana-password" | awk '{print $2}' | tr -d '"')
LOGSTASH_PASSWORD=$(curl --cacert /etc/ssl/certs/ca.crt -H "X-Vault-Token: $ELASTIC_TOKEN" $VAULT_ADDR/v1/kv/logstash-creds \
	| jq . | grep "logstash-password" | awk '{print $2}' | tr -d '"')

creds=$(curl --cacert /etc/ssl/certs/ca.crt -H "X-Vault-Token: $ELASTIC_TOKEN" $VAULT_ADDR/v1/kv/elastic-acc-creds)
nonadmin_user=$(echo $creds | jq '.data."acc-username"' | tr -d '"')
nonadmin_pass=$(echo $creds | jq '.data."acc-password"' | tr -d '"')

curl --cacert /etc/ssl/certs/ca.crt -u elastic:$ELASTIC_PASSWORD https://elasticsearch:9200/_security/user/kibana_system/_password \
	-H "Content-Type: application/json" -d "{\"password\": \"$KIBANA_PASSWORD\"}"
curl --cacert /etc/ssl/certs/ca.crt -u elastic:$ELASTIC_PASSWORD https://elasticsearch:9200/_security/user/logstash_system/_password \
	-H "Content-Type: application/json" -d "{\"password\": \"$LOGSTASH_PASSWORD\"}"

# Apply Index Lifecycle Management policy for proper data retention and archiving policies

# As we can't be writing to our indices indefinitely and waste resource usage, we write to an
# index until a threshold is met and create a new index and sart writing to it instead -> Rollover
# Rollover the index when it reaches 10GB in size, and delete the index 10days after rollover
tee policy.json << EOF
{
    "policy": {
        "phases": {
            "hot": {
                "actions": {
                    "rollover": {
                        "max_primary_shard_size": "10GB"
                    }
                }
            },
            "delete": {
                "min_age": "10d",
                "actions": {
                    "delete": {}
                }
            }
        }
    }
}
EOF
curl --cacert /etc/ssl/certs/ca.crt -u elastic:$ELASTIC_PASSWORD -X PUT -H "Content-Type: application/json" \
    https://elasticsearch:9200/_ilm/policy/lifecycle-policy -d @policy.json

tee payload.json << EOF
{
    "index": {
        "lifecycle": {
            "name": "lifecycle-policy"
        }
    }
}
EOF
# Apply ILM policy to all indices that are not internal - *2025*
curl --cacert /etc/ssl/certs/ca.crt -u elastic:$ELASTIC_PASSWORD -X PUT -H "Content-Type: application/json" \
    https://elasticsearch:9200/*2025*/_settings -d @payload.json
# To check that all indices are currently using the newly-created policy
curl --cacert /etc/ssl/certs/ca.crt -u elastic:$ELASTIC_PASSWORD https://elasticsearch:9200/_ilm/policy/lifecycle-policy

# Create new non-admin user with no privileges
curl --cacert /etc/ssl/certs/ca.crt -X POST -H "Content-Type: application/json" -u elastic:$ELASTIC_PASSWORD \
    https://elasticsearch:9200/_security/user/$nonadmin_user -d "
{
    \"password\": \"$nonadmin_pass\",
    \"roles\": [\"\"],
    \"full_name\": \"read-only user\",
    \"email\": \"fake@example.com\"
}
"

rm policy.json payload.json

# References:
# https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-security-put-role
# https://www.elastic.co/docs/manage-data/lifecycle/index-lifecycle-management/configure-lifecycle-policy
# https://www.elastic.co/docs/api/doc/elasticsearch/v8/operation/operation-ilm-get-lifecycle
