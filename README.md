# e스포츠 뉴스 피드 API

## 개요
e스포츠 뉴스와 실시간 경기 정보를 제공하는 백엔드 API

## 주요 기능
- 뉴스 목록 조회 (카테고리 필터)
- 실시간 경기 정보 조회
- Health check endpoint

## API Endpoints
- GET /health - 서비스 상태 확인
- GET /api/news - 뉴스 목록
- GET /api/news/:id - 뉴스 상세
- GET /api/matches/live - 라이브 경기 목록
- GET /api/matches/:id - 경기 상세

## 기술 스택
- NestJS
- TypeORM
- PostgreSQL
- TypeScript
