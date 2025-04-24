FROM rust:1.83.0-slim AS builder

WORKDIR /usr/src/

COPY . .

# Install Bun.js instead of Node.js
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Use Bun to install dependencies and build the frontend
RUN cd frontend && NODE_ENV=production bun install && bun run build
RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /usr/app

# Install necessary runtime dependencies
RUN apt-get update && apt-get install -y ca-certificates

COPY --from=builder /usr/src/frontend/dist frontend/dist
COPY --from=builder /usr/src/frontend/dist/index.html frontend/dist/index.html
COPY --from=builder /usr/src/config config
COPY --from=builder /usr/src/target/release/apkraft-cli apkraft-cli

# Set environment variables if needed
ENV RUST_LOG=info

# Start the API server and serve the frontend
CMD ["/usr/app/apkraft-cli", "start", "--environment", "production"]
