FROM node:18



#COPY app/package.json /app
#COPY app/index.js /app
#Copy the package.json file to the container
#COPY app/package.json /app is same as the COPY app/package.json ./ as the wroking directory is /app 


COPY app /app/
WORKDIR /app
RUN npm install

#npm install typescript @types/node @types/better-sqlite3 --save-dev #install typescript and types for node and better-sqlite3
#npx tsc --init #create tsconfig.json file

#VOLUME /app/public
#VOLUME /app/public #create a volume for the public folder

EXPOSE 3001

CMD ["node", "index.js"]
