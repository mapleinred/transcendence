#!/bin/bash

echo "start of init.sh script."
until curl --cacert /etc/ssl/certs/ca.crt --fail -s https://grafana:3000/api/health; do
    echo "waiting for grafana server to start..."
    sleep 1
done

creds=$(curl --cacert /etc/ssl/certs/ca.crt -H "X-Vault-Token: $(cat /run/secrets/grafana-token)" $VAULT_ADDR/v1/kv/grafana-acc-creds)
admin_password=$(curl --cacert /etc/ssl/certs/ca.crt -H "X-Vault-Token: $(cat /run/secrets/grafana-token)" $VAULT_ADDR/v1/kv/grafana-creds \
    | jq '.data."grafana-password"' | tr -d '"')
acc_username=$(echo $creds | jq '.data."acc-username"' | tr -d '"')
acc_password=$(echo $creds | jq '.data."acc-password"' | tr -d '"')

echo "about to create non-admin user"
tee payload.json > /dev/null << EOF
{
    "name": "User",
    "login": "$acc_username",
    "password": "$acc_password",
    "email": "fake@gmail.com",
    "role": "No basic role"
}
EOF
curl --cacert /etc/ssl/certs/ca.crt -s -o /dev/null -X POST -H "Content-Type: application/json" -d @payload.json \
    https://admin:$admin_password@grafana:3000/api/admin/users

echo "waiting for output..."
output=$(curl -s --cacert /etc/ssl/certs/ca.crt https://admin:$admin_password@grafana:3000/api/search)

# Restrict access to these dashboards, only for users with Editor role and above
for str in "Node Exporter Full" "Hashicorp Vault" "Docker Container & Host Metrics"; do
    uid=$(echo $output | jq ".[] | select(.\"title\"==\"$str\") | .\"uid\"" | tr -d '"')
    echo "uid is $uid"
    tee > payload.json << EOF
{
    "items": [
        {
            "role": "Editor",
            "permission": 2
        }
    ]
}
EOF
    curl --cacert /etc/ssl/certs/ca.crt -s -X POST -H "Content-Type: application/json" \
	https://admin:$admin_password@grafana:3000/api/dashboards/uid/$uid/permissions -d @payload.json
done

echo grafana init.sh is done
rm payload.json
