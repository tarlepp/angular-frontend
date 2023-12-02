# Fetch build image
FROM node:21.1.0 as build

# Copy sources to container
COPY ./ /src/

# Change working directory
WORKDIR /src/

# Install all dependencies and make production build
RUN yarn \
    && yarn build-prod

# Fetch nginx image to host application
FROM nginx:1.25.3-alpine3.18

# Copy nginx configuration and build application inside the final container
COPY --from=build /src/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/angular-frontend /usr/share/nginx/html
