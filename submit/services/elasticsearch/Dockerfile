ARG STACK_VERSION
FROM elasticsearch:${STACK_VERSION}
USER root
RUN apt-get update && apt-get upgrade -y && apt-get install jq -y && apt-get clean
# Can only set supported sysctl kernel parameters in docker compose
# vm.max_map_count for elasticsearch to use mmap effectively
# Note: setting this will result in different exceptions when running ES
#&& sysctl -w vm.max_map_count=262144
USER elasticsearch
