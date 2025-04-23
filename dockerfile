FROM rust:1.83.0-slim as builder

WORKDIR /usr/src/

COPY . .

RUN apt-get update && apt-get install -y curl ca-certificates

# Install Node.js using the latest available version from NodeSource.
# In production, replace "setup_current.x" with a specific version
# to avoid unexpected breaking changes in future releases.
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
    apt-get install -y nodejs
RUN cd frontend && npm install && npm run build
RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /usr/app

COPY --from=builder /usr/src/frontend/dist frontend/dist
COPY --from=builder /usr/src/frontend/dist/index.html frontend/dist/index.html
COPY --from=builder /usr/src/config config
COPY --from=builder /usr/src/target/release/apkraft-cli apkraft-cli

ENTRYPOINT ["/usr/app/apkraft-cli"]
