# Fetch build image
FROM node:23.8.0-slim as build

# Copy sources to container
COPY ./ /src/

# Change working directory
WORKDIR /src/

# Install all dependencies and make production build
RUN yarn \
    && yarn build-prod

# Fetch nginx image to host application
FROM nginx:mainline-alpine-slim

# Copy nginx configuration and build application inside the final container
COPY --from=build /src/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/angular-frontend /usr/share/nginx/html
