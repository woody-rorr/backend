# backend

NestJS API 서버 (ECS Fargate, port 5013).

명세는 `backend-migration-mcp/resources/new-project/*.md` 참조.
코드는 MCP의 `scaffold_new_project_api` 툴이 생성.

## 로컬 실행 (placeholder)

```bash
npm install
node src/server.js
# http://localhost:5013/health
```

## 배포

```bash
export AWS_PROFILE=rorr-dev
bash deploy/deploy.sh
```
