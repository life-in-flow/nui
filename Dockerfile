## be build
FROM --platform=$BUILDPLATFORM golang:1.21 AS build_be
ARG TARGETOS TARGETARCH
ARG VERSION
WORKDIR /src
RUN --mount=type=bind,target=. \
  GOOS=$TARGETOS GOARCH=$TARGETARCH \
  go build -ldflags "-X main.Version=$VERSION" -o /cmd/nui-web ./cmd/server/main.go

## frontend build
FROM --platform=$BUILDPLATFORM node:18 AS build_fe
WORKDIR /frontend
COPY --link frontend .
RUN npm install
RUN npm run build

### production image
FROM alpine:3
WORKDIR /
RUN apk add libc6-compat
COPY --from=build_be --link /cmd/nui-web /cmd/nui-web
COPY --from=build_fe --link /frontend/dist /frontend/dist
EXPOSE 31311/tcp
ENTRYPOINT ["/cmd/nui-web"]
CMD ["--db-path=/db"]
