# Fetch build image
FROM node:13.10.1 as build

# Install correct version of Angular CLI tool
RUN npm install -g @angular/cli@9.1.0

# Copy sources to container
COPY ./ /src/

# Change working directory
WORKDIR /src/

# Install all dependencies and make production build
RUN yarn \
  && yarn build-prod

# Fetch nginx image to host application
FROM nginx:mainline-alpine

# Copy nginx configuration and build application inside the final container
COPY --from=build /src/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/angular-frontend /usr/share/nginx/html
