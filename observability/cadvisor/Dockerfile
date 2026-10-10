FROM alpine:3.22

# Binary is the official v0.54.0 release. v0.49 cannot read Docker's
# containerd snapshotter, so database containers never get a name label.
COPY cadvisor /usr/bin/cadvisor

RUN apk add --no-cache libc6-compat thin-provisioning-tools \
    && chmod +x /usr/bin/cadvisor

EXPOSE 8080

ENTRYPOINT ["/usr/bin/cadvisor"]
