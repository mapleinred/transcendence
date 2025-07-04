FROM grafana/grafana:11.5.2
# Dashboards must have .json in their filenames to be recognized by Grafana
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/12904/revisions/2/download \
    /etc/dashboards/vault-dashboard.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/10619/revisions/1/download \
    /etc/dashboards/docker-dashboard.json
#ADD --chown=grafana:grafana https://github.com/vegasbrianc/grafana_dashboard.git \
#    /etc/dashboards/docker-dashboard2.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/1860/revisions/37/download \
    /etc/dashboards/node-dashboard.json
#ADD --chown=grafana:grafana https://grafana.com/api/dashboards/13659/revisions/1/download \
#    /etc/dashboards/blackbox-dashboard.json
#ADD --chown=grafana:grafana https://grafana.com/api/dashboards/266/revisions/4/download \
#    /etc/dashboards/elasticsearch-dashboard.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/14191/revisions/1/download \
    /etc/dashboards/elasticsearch-dashboard.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/21420/revisions/1/download \
    /etc/dashboards/kibana-dashboard.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/18628/revisions/2/download \
    /etc/dashboards/logstash-dashboard.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/11159/revisions/1/download \
    /etc/dashboards/nodejs-dashboard.json
ADD --chown=grafana:grafana https://grafana.com/api/dashboards/10826/revisions/1/download \
    /etc/dashboards/golangapp-dashboard.json
COPY --from=nginx-exporter --chown=grafana:grafana /grafana/dashboard.json /etc/dashboards/waf-dashboard.json
# value of "uid/name" of datasources can be found with curl http://GRAFANA_ADDR/api/datasources
# This resolves mountpoint error: datasource DS_PROMXY not found in Grafana dashboards ui
USER root
RUN apk upgrade --update-cache && \
	apk add --no-cache jq && \
	sed -i 's/${DS_PROMXY}/Prometheus/g' /etc/dashboards/vault-dashboard.json && \
    find /etc/dashboards -type f | xargs sed -i 's/${DS_PROMETHEUS}/Prometheus/g' && \
    sed -i 's/vdMvd744z/Prometheus/g' /etc/dashboards/logstash-dashboard.json && \
    sed -i -e 's/node_disk_bytes_written/node_nfsd_disk_bytes_written_total/g' \
        -e 's/node_disk_bytes_read/node_nfsd_disk_bytes_read_total/g' \
        -e "s/node_memory\w*/&_bytes/g" \
        -e 's/container_last_seen{[^}]*}/container_last_seen{name=~\\".+\\"}/g' \
        /etc/dashboards/docker-dashboard.json && \
    sed -i -e 's/elasticsearch_indices_docs_primary/elasticsearch_indices_docs/g' \
        -e 's/elasticsearch_indices_store_size_bytes_primary/elasticsearch_indices_store_size_bytes/g' \
        -e 's/elasticsearch_indices_store_size_bytes_total/elasticsearch_indices_store_size_bytes/g' \
        -e 's/elasticsearch_indices_segment_doc_values_memory_bytes_primary/elasticsearch_indices_segments_doc_values_memory_in_bytes/g' \
        -e 's/elasticsearch_indices_segment_fields_memory_bytes_primary/elasticsearch_indices_segments_stored_fields_memory_in_bytes/g' \
        -e 's/elasticsearch_indices_segment_doc_values_memory_bytes_total/elasticsearch_indices_segments_memory_bytes/g' \
        -e 's/elasticsearch_indices_segment_fields_memory_bytes_total/elasticsearch_indices_fielddata_memory_size_bytes/g' \
        -e's/elasticsearch_indices_segment_fields_memory_bytes_total/elasticsearch_indices_segments_stored_fields_memory_in_bytes/g' \
        /etc/dashboards/elasticsearch-dashboard.json

# For docker-dashboard, some of the node exporter metrics that they are looking for have slightly different names
# as to what my node exporter is giving me, hence the above adjustments
# '\w' means all non-word characters
# '&' means the whole part of the input that was matched by the pattern
# {[^}]*} just means match characters from start up till the first '}' char
USER grafana
# To add .json extension to all files in a folder: find /etc/dashboards -type f -exec mv '{}' '{}'.json \;
