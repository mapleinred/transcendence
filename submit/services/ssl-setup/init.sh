#!/bin/bash

bin/elasticsearch-certutil ca --silent --pem -out /certs/ca.zip
unzip /certs/ca.zip -d /certs

if [ ! -f /certs/certs.zip ]; then
    bin/elasticsearch-certutil cert --silent --pem -out /certs/certs.zip --in /instances.yml \
        --ca-cert /certs/ca/ca.crt --ca-key /certs/ca/ca.key
    unzip /certs/certs.zip -d /certs
fi

# To resolve InvalidKey error that logstash reports when specifying ssl_key in elasticsearch output plugin
# in pipeline/logstash.conf file, convert a PEM encoded PKCS1 private key to a PEM encoded, non-encrypted
# PKCS8 key
#https://www.elastic.co/guide/en/logstash/current/plugins-outputs-elasticsearch.html#plugins-outputs-elasticsearch-ssl_key
# Logstash requires pkcs12 format for ssl certs when enabling tls for its HTTP(s) api endpoint

pushd /certs/logstash
openssl pkcs8 -inform PEM -in logstash.key -topk8 -nocrypt -outform PEM -out logstash.pkcs8.key
openssl pkcs12 -export -out logstash.p12 -in logstash.crt -inkey logstash.key --passout pass: # empty password
popd

#for name in /certs/*; do
#    if [[ -d $name && $(basename $name) != "ca" ]]; then
#        fname="$name/$(basename $name)"
#        echo "fname = $fname"
#        openssl pkcs8 -inform PEM -in $fname.key -topk8 -nocrypt -outform PEM -out $fname.pkcs8.key
#        openssl pkcs12 -export -out $fname.p12 -in $fname.crt -inkey $fname.key --passout pass: # empty password
#    fi
#done

# docker logs give this error - chown: changing ownership of '/certs/waf/waf.key': Invalid argument,
# but the chown is still successful. || exit 0 forces ssl-setup to always end with successful exit status
chown -R $UID:$GID /certs 2> /dev/null || exit 0
