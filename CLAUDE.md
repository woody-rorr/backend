# backend

`backend-migration-mcp`의 `new-project` 도메인이 생성하는 **NestJS API 서버**. ECS Fargate에서 ALB로 노출됩니다.
현재는 placeholder(Express + /health)만 들어있고, 실제 도메인 코드는 MCP의 `scaffold_new_project_api`가 채웁니다.

## 명세 위치 (진실의 원천)

- `backend-migration-mcp/resources/new-project/*.md`
- 코드 변경 전 반드시 .md 먼저 갱신 (spec-first).

## AWS 배포 환경 (고정)

| 항목 | 값 |
|---|---|
| AWS Profile | `rorr-dev` |
| AWS Account | `239460481239` |
| Region | `us-east-1` |

## 리소스 네이밍 (고정)

| 리소스 | 이름 |
|---|---|
| ECR 레포 | `backend-api` |
| ECS Cluster | `mcp-agents-staging-cluster` (공유) |
| ECS Service | `backend-api-service` |
| ECS Task Definition | `backend-api-task` |
| ALB | `mcp-agents-staging-alb` (공유) |
| Target Group | `backend-api-tg` |
| ALB 리스너 포트 | `5013` |
| 컨테이너 포트 | `5013` |
| CloudWatch 로그 그룹 | `/ecs/backend-api` |
| Task Execution Role | `ecsTaskExecutionRole` (공유) |
| Task Role | `backend-api-task` |

## 코드 출처

- `src/`는 `backend-migration-mcp`의 `scaffold_new_project_api` 툴이 생성/갱신.
- 사람이 직접 수정도 가능, 단 .md 먼저 갱신 후 코드 수정 원칙.
- add/commit/push/PR은 GitHub MCP가 담당.

## 도메인

- ALB DNS 직접 접근: `http://<ALB DNS>:5013/...`
- Swagger: `http://<ALB DNS>:5013/api-docs`

## 배포

```bash
export AWS_PROFILE=rorr-dev
bash deploy/deploy.sh
```
