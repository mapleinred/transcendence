#!/bin/sh

create_tokens() {
	vault token create -policy=elastic-policy -policy=kibana-policy -policy=logstash-policy | grep "token " | awk '{print $2}' > secrets/elastic-token
	vault token create -policy=kibana-policy | grep "token " | awk '{print $2}' > secrets/kibana-token
	vault token create -policy=elastic-policy -policy=logstash-policy | grep "token " | awk '{print $2}' > secrets/logstash-token
	vault token create -policy=grafana-policy | grep "token " | awk '{print $2}' > secrets/grafana-token
    vault token create -field=token -policy prometheus-metrics > secrets/prometheus-token
}

#if [ -s secrets/unseal-key ]; then
#    # Delay a bit so that vault-setup doesn't complete before elasticsearch starts
#    sleep 4
#    echo "vault has already been initialized, unseal-key = $(cat secrets/unseal-key), vault-token = $(cat secrets/vault-token)"
#    vault operator unseal $(cat secrets/unseal-key)
#    vault login -no-print $(cat secrets/vault-token)
#    # Renew lease of all tokens
#    create_tokens
#else
    echo "vault is not yet initialized"
    vault operator init -key-shares=1 -key-threshold=1 > creds.txt
    grep "Unseal Key" creds.txt | awk '{print $NF}' > secrets/unseal-key
    grep "Root Token" creds.txt | awk '{print $NF}' > secrets/vault-token
    rm creds.txt
    vault operator unseal $(cat secrets/unseal-key)
    vault login -no-print $(cat secrets/vault-token)

	vault secrets enable -version=1 kv
	# Create secrets in key/value secrets engine
	vault kv put kv/elastic-creds elastic-password=$ELASTIC_PASSWORD
    vault kv put kv/elastic-acc-creds acc-username=$ELK_ACC_USER acc-password=$ELK_ACC_PASS
	vault kv put kv/kibana-creds kibana-password=$KIBANA_PASSWORD
	vault kv put kv/logstash-creds logstash-password=$LOGSTASH_PASSWORD
	vault kv put kv/grafana-creds grafana-password=$GRAFANA_PASSWORD
    vault kv put kv/grafana-acc-creds acc-username=$GF_ACC_USER acc-password=$GF_ACC_PASS

    # Create policies that grant permissions to secrets
	vault policy write elastic-policy - << EOF
path "kv/elastic-creds" {
	capabilities = ["read"]
}
path "kv/elastic-acc-creds" {
    capabilities = ["read"]
}
EOF
	vault policy write kibana-policy - << EOF
path "kv/kibana-creds" {
	capabilities = ["read"]
}
EOF
	vault policy write logstash-policy - << EOF
path "kv/logstash-creds" {
	capabilities = ["read"]
}
EOF
	vault policy write grafana-policy - << EOF
path "kv/grafana-creds" {
	capabilities = ["read"]
}
path "kv/grafana-acc-creds" {
    capabilities = ["read"]
}
EOF
# Define a prometheus-metrics ACL policy that grants read capabilities to the metrics endpoint,
# so that prometheus can scrape vault metrics
    vault policy write prometheus-metrics - << EOF
path "sys/metrics" {
    capabilities = ["read", "list"]
}
EOF

    create_tokens
    # Send vault audit logs to logstash over tcp socket
    # -tls-skip-verify
    # Need to specify address of Vault server, as we are referring to another container to enable
    # the audit device there (defaults to 127.0.0.1:8200
    #vault audit enable -ca-cert "/etc/ssl/certs/ca.crt" -client-cert "/certs/vault.crt" -client-key "/certs/vault.key" \
	#	socket address="logstash:12345" socket_type="tcp"
    vault audit enable file file_path="stdout"

#    vault secrets enable -version=2 kv
#    vault kv put kv/grafana/admin-creds username=admin password=abc123
#
#    # To encrypt database secrets in grafana
#    vault secrets enable transit
#    # Create named encryption key
#    vault write -f transit/keys/grafana-enc-key | grep "keys " | awk '{print $2}' > tmp
#    sed "/^secret_key =/c\secret_key = $(cat tmp)" /vault/grafana.ini > tmp1
#    cat tmp1 > /vault/grafana.ini
#    rm tmp*
#    
#    vault policy write grafana-enc - << EOF
#path "transit/encrypt/enc-key" {
#    capabilities = ["update"]
#}
#path "transit/decrypt/enc-key" {
#    capabilities = ["update"]
#}
#path "kv/data/grafana/admin-creds" {
#    capabilities = ["read"]
#}
#EOF
#
#    echo "generating token for grafana..."
#    vault token create -policy=grafana-enc -period=30m | grep "token " | awk '{print $2}' > tmp
#    # sed -i creates new file, then replaces old file with new file, changing file inode from within docker container
#    # (which we are not allowed to do and results in resource or device busy error). Need to change content of original
#    # file only, methods include shell redirect, command cp, vim, ed
#    # https://unix.stackexchange.com/questions/404189/find-and-sed-string-in-docker-got-error-device-or-resource-busy
#    sed "/^token =/c\token = $(cat tmp)" /vault/grafana.ini > tmp1
#    cat tmp1 > /vault/grafana.ini
#    rm tmp*

#fi

vault status > /vault/file/status
