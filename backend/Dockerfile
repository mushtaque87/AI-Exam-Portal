FROM registry.access.redhat.com/ubi8/nodejs-18:latest

USER root
RUN mkdir -p /opt/app-root/src/uploads && chown -R 1001:0 /opt/app-root/src/uploads

USER 1001

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

ENV NODE_ENV=development
ENV PORT=8080

CMD ["npm", "start"]