FROM hashicorp/vault:1.19
#ARG UID
#ARG GID
# (WSL?) If USER root is not specified, the RUN instruction below will not work as expected,
# and I will receive permission denied error when trying to create files in /vault directory as vault user
USER root
COPY ./init.sh /vault
WORKDIR /vault
# (WSL?) Error when trying to persist data via a docker mount, as the folder I was storing data in didn't have the
# vault user's UID:GID. Reference: https://github.com/hashicorp/vault/issues/20953
RUN apk upgrade --update-cache && \
    apk add --no-cache curl shadow

#    echo "user:x:$UID:$GID::/home/user:/bin/sh" >> /etc/passwd && \
#    echo "user:!:$(($(date +%s) / 60 / 60 / 24)):0:99999:7:::" >> /etc/shadow && \
#    echo "user:x:$GID:user" >> /etc/group && \
#    mkdir /home/user && \
#    chown -R user: /vault /home/user
