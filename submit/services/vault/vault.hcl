api_addr = "https://vault:8200"
ui = "true"
# ca_file = "/certs/ca/ca.crt"

listener "tcp" {
    address = "0.0.0.0:8200"
    tls_cert_file = "/certs/vault.crt"
    tls_key_file = "/certs/vault.key"
    #tls_require_and_verify_client_crt = "false"
    #tls_client_ca_file = "/certs/ca/ca.crt"
}

storage "file" {
    path = "/vault/data"
}

# Enable vault to emit prometheus metrics at /sys/metrics endpoint
telemetry {
    disable_hostname = true
    usage_gauge_period = "1m" # default is 10 min, this is to show to evaluator without waiting
    prometheus_retention_time = "12h"
}
