FROM node:20
WORKDIR /
COPY yarn.lock package.json tsconfig.json ./
COPY frontend/tsconfig.vite.json frontend/vite.config.ts ./frontend/
RUN yarn install --frozen-lockfile
RUN yarn docker:build
COPY . .
CMD 

