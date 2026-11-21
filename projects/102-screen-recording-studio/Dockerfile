# Multi-stage production Dockerfile for Rust + Axum Screen Recording Studio
# =========================================================================
# Stage 1: Build binary
FROM rust:alpine AS builder

RUN apk add --no-cache musl-dev gcc libc-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

# =========================================================================
# Stage 2: Ultra-lightweight Alpine Runner (<25MB)
FROM alpine:latest AS runner

RUN apk add --no-cache ca-certificates wget

WORKDIR /app

COPY --from=builder /app/target/release/capflow-studio /app/capflow-studio
COPY static ./static

# Persistent storage mount point for SQLite database and video recordings
VOLUME /app/data

ENV PORT=3102
ENV RUST_LOG=info

EXPOSE 3102

CMD ["/app/capflow-studio"]
