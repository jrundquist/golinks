#build stage
FROM golang:alpine AS builder
RUN apk add build-base
RUN apk add --no-cache git
WORKDIR /app
COPY . .
ENV CGO_ENABLED=1
RUN go get -d -v ./...
RUN go build -o server -v ./...

# Use an official Node.js runtime as a parent image
FROM node:14 AS web_builder
# Set the working directory to /app
WORKDIR /app
# Copy the package.json and yarn.lock files to the container
COPY ./web/package.json ./web/yarn.lock ./
# Install the dependencies
RUN yarn install
# Copy the remaining source code to the container
COPY ./web/ .
# Build the web app
RUN yarn run build

# development stage
FROM golang:alpine AS development
ENV CGO_ENABLED=1
RUN apk add build-base
RUN apk add --no-cache git
WORKDIR /app
COPY . .
RUN go get -d -v ./...
# Specify a mount point for the volume.
VOLUME /data
RUN echo "To run the server, run: docker run -v /data:/data -p 8080:8080 golinks"
CMD go run server.go

#final stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
# Set the working directory to /app
WORKDIR /app
# Copy the built web app from the builder image to the container
COPY --from=web_builder /app/build ./build
# Copy the built Go binary to the container
COPY --from=builder /app/server .
# Specify a mount point for the volume.
VOLUME /data
LABEL Name=golinks Version=0.1.0
EXPOSE 8080
ENTRYPOINT ["/app/server"]

