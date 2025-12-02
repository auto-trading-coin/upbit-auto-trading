# Node.js 공식 이미지를 기반으로 설정
FROM node:20.11.1

# 작업 디렉토리 설정
WORKDIR /app

# 앱 의존성 설치
COPY package*.json ./
RUN npm install

# 앱 소스 복사
COPY . .

# 앱 빌드
RUN npm run build

# 3000 포트 노출
EXPOSE 3000

CMD ["npm", "run", "start"]
