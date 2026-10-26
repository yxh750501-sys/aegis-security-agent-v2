# AEGIS (이지스) 학생 실행 설명서와 구성도

이 문서는 ALEPH 0.2.11 시작 틀 위에 구현한 AEGIS V2를 다른 사람이 실행하고, 화면 결과의 의미와 확인하지 못한 연결을 구분하도록 돕습니다. 제공 [README](../README.md)와 [시작 안내](STUDENT_LAUNCH_GUIDE.md)를 보존한 채 학생 작업을 설명합니다. 앱이 켜진 것, 기존 SDP/XDR 연결, AI 연결, ALEPH 단계 판정은 각각 별개의 결과입니다.

## 목적과 현재 기능

브라우저의 **보호 현황**, **업무 앱**, **보안 기록**에서 로그인 사용자·기기·세션, 앱 접근 판정, 접속/XDR 기록을 확인합니다. 학생 표시 코드는 AI 연결 점검과 사건 설명, 조치 진행 상태, 설치 패키지 취약점 조회 결과도 구분해 보여 줍니다. 연결이 없거나 응답을 확인할 수 없을 때는 이를 성공 또는 안전한 상태로 표시하지 않습니다. 제공 서버가 요청·검증·외부 연동을 맡고, 학생 코드는 전달된 결과를 DOM에 표시합니다.

## 작업 위치와 지원 환경

| 항목 | 이 저장소에서 확인한 값 |
|---|---|
| Git 저장소 | `yxh750501-sys/aegis-security-agent-v2`; Git 최상위는 `on-client`의 부모 폴더 |
| 이 검증 환경의 Git 최상위 | `/workspace/aegis-security-agent-v2` (Linux; 다른 사람의 Windows 경로가 아님) |
| Windows 폴더 위치 | PC마다 다릅니다. **본인이 복제한 저장소의 최상위 폴더**를 탐색기에서 열어 확인합니다. 예전 Workbench 폴더가 최신 복제본이라고 가정하지 않습니다. |
| 앱 폴더 | Git 최상위 아래 `on-client` |
| 실제 확인한 도구 버전 | Linux 검증 환경 Node.js `v24.19.0`, npm `11.9.0`; 사용자 Windows 화면에서는 Node.js `v24.22.0` 실행을 확인함 |
| Node.js 버전 | `package.json`은 수업 기준 `24.19.0`을 적고, 제공 시작 스크립트는 22~24를 허용합니다. `24.19.0`과 다르다는 **참고 메시지만** 나오면 실행 실패가 아닙니다. |
| 의존성/실행 설정 | `package.json`에 외부 npm 의존성 없음; 추적된 `package-lock.json` 없음; `npm start`, `npm run demo`, `npm run check` 제공 |
| 기본 브라우저 주소 | `http://127.0.0.1:5189/` (현재 PC의 로컬 서버) |

Node.js와 npm, Windows에서는 PowerShell, 앱 화면 확인용 브라우저가 필요합니다. 별도 `npm install`이나 `npm ci` 절차는 이 저장소의 현재 설정에 없습니다. 회사 계정·SDP/XDR·CLCO 접근은 운영자가 준비한 연결과 권한이 있어야 합니다.

## 처음 실행하기: 폴더 확인부터

1. 파일 탐색기에서 **본인이 받은 AEGIS V2 Git 저장소의 최상위 폴더**를 엽니다. 그 폴더에는 `on-client` 폴더가 있어야 합니다. 아직 복제본이 없다면 기존 폴더를 옮기거나 지우지 말고, 새 위치의 **상위 폴더**에서 `git clone https://github.com/yxh750501-sys/aegis-security-agent-v2.git AEGIS-V2-new`를 실행합니다. 새로 생긴 `AEGIS-V2-new` 폴더를 엽니다. 탐색기의 주소 표시줄에 `powershell`을 입력해 그 위치에서 PowerShell을 엽니다. `Downloads\on-client`처럼 이름만 같은 다른 폴더에서는 시작하지 않습니다.
2. 아래 명령을 **한 줄씩** 실행합니다. `git rev-parse`가 `not a git repository`라고 하면 아직 저장소 밖입니다. 탐색기에서 실제 복제본 폴더를 다시 열어 1번부터 진행합니다. `origin`이 다른 저장소를 가리키거나 `Test-Path`가 `False`이면 계속 실행하지 않습니다.
3. `npm.cmd run check`가 오류 없이 끝나면 시작 스크립트를 실행합니다. `npm.cmd`는 PowerShell의 `npm.ps1` 실행 정책 오류를 피하며, PC의 실행 정책을 바꾸지 않습니다.

```powershell
git rev-parse --show-toplevel
git remote get-url origin
git status --short --branch
git log -1 --oneline
Test-Path -LiteralPath '.\on-client\src\server.mjs'
Set-Location -LiteralPath '.\on-client'
node --version
npm.cmd run check
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

`git remote get-url origin`은 `https://github.com/yxh750501-sys/aegis-security-agent-v2.git`(끝의 `.git`은 없어도 됨)를 가리켜야 합니다. 자신에게 접근 권한이 있는 **본인 복제본**이라면 같은 저장소의 다른 합법적인 원격 URL도 가능합니다. `git status`에 미커밋 변경이 있거나 `git log`의 버전이 기대한 제출본과 다르면 작업을 덮어쓰지 말고 소유자에게 현재 복제본을 확인받습니다. `Test-Path`는 `True`여야 합니다. `node --version`은 22~24 범위여야 하며, `v24.22.0`처럼 수업 기준과 다른 24 버전은 참고 문구가 나올 수 있습니다.

제공 [실행 스크립트](../tools/start-alekov.ps1)가 성공하면 `케셰브가 켜졌습니다. 브라우저에서 http://127.0.0.1:5189/ 을 여세요.`와 `서버가 응답한 것만 확인했습니다. AI 연결 상태는 화면에서 따로 확인해 주세요.`를 표시합니다. **이 창을 열어 둔 채** 브라우저에서 `http://127.0.0.1:5189/`를 열어 보호 현황·업무 앱·보안 기록의 세 메뉴를 확인합니다. HTTP 응답은 앱 서버가 켜졌다는 뜻이며 SDP/XDR·AI 연결 성공을 뜻하지 않습니다.

앱을 실행한 PowerShell 창에서 `Ctrl+C`로 종료합니다. 같은 `on-client` 폴더에서 시작 스크립트를 다시 실행하면 재시작합니다. 브라우저에 `ERR_CONNECTION_REFUSED`가 나오면 서버 창이 열려 있고 성공 문구가 보였는지 먼저 확인합니다. 포트 5189를 다른 프로그램이 사용하면 그 프로그램을 종료하지 말고 `powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Port 5190`으로 켜고 `http://127.0.0.1:5190/`을 엽니다. 제공 스크립트를 사용할 수 없을 때 같은 폴더에서 `npm.cmd start`가 기본 미연결 서버를 실행합니다.

실제 PC의 CPU·메모리·디스크·Windows 기록은 **이 앱 서버가 실행 중인 PC에서 읽은 값**이며, 읽지 못한 항목은 `확인 불가`와 이유로 남깁니다. SDP 서버가 없으면 `SDP 미연결`로 따로 표시합니다. `npm.cmd run demo`는 기존 SDP/XDR용 **설명용 예제 자료**를 보여 주는 별도 실행입니다. 기본 실행을 끈 뒤에만 같은 포트에서 demo를 켜고, 예제 결과를 실제 연결이나 PC 측정값으로 보고하지 않습니다.

**검증 범위:** 이 문서의 이전 Linux 검증에서는 `npm run check`와 `npm start`, 페이지 HTTP 200 및 기본 `/api/me`의 `ENGINE_NOT_CONNECTED`를 확인했습니다. 사용자 Windows 화면에서는 로컬 PC 값과 3·4일차 표시·재조회 동작을 확인했습니다. **다른 사람이 이 문서만 보고 처음부터 끝까지 실행하는 시험은 아직 완료됐다고 기록하지 않습니다.**

## 실제 코드와 데이터 흐름

```mermaid
flowchart LR
    B["브라우저<br/>public/index.html · public/app.js<br/>http://127.0.0.1:5189/"]
    S["AEGIS 로컬 앱 서버<br/>src/server.mjs<br/>127.0.0.1:5189"]
    D["기존 접속·XDR 서버 연결<br/>src/engine/sdp-host.mjs<br/>운영자 설정 필요"]
    A["CLCO 수업용 AI<br/>src/ai/service.mjs<br/>vendor/clco-http.mjs"]
    B -->|"로컬 /api 요청"| S
    S -.->|"설정된 경우에만"| D
    S -.->|"AI 권한·연결 준비 시"| A
```

브라우저의 [제공 UI](../public/app.js)는 로컬 서버의 `/api/me`, `/api/apps`, `/api/events`, `/api/devices`, `/api/sessions`, `/api/access`, `/api/ai/explain`, `/api/vulnerabilities` 등을 호출하고, 받은 자료를 [학생 표시 함수](../student/extension.mjs)에 전달합니다. `src/server.mjs`는 요청을 검증해 기존 SDP/XDR 연결 코드와 AI 서비스에 필요한 경로를 연결합니다. SDP/XDR과 CLCO 상자의 점선은 **실제 연결이 확인됐다는 표시가 아닙니다.** 기본 실행은 미연결입니다. 설치 패키지 조회는 별도로 `src/vulnerabilities/project-scan.mjs`의 경로를 사용합니다. 이 설명서는 공개 가능한 로컬 주소와 저장소 내 파일 경로만 적습니다.

## 제공 코드와 학생 구현의 경계

[공식 manifest](../.on-starter-manifest.json)의 제공 파일을 기준으로, `public/index.html`과 `public/app.js`는 메뉴·버튼·요청·렌더링 교체를 담당하고, `src/server.mjs`, `src/engine/`, `src/ai/`, `src/vulnerabilities/`, `vendor/`, `tools/`는 제공 서버·연결·실행 경로입니다. `student/engine-adapter.mjs`는 제공 경계의 어댑터입니다. 학생이 구현한 표시 함수는 `student/extension.mjs`의 `createStudentView()`가 반환합니다. 21단계에서는 이 코드와 제공 코드를 수정하지 않았습니다.

| 학생 함수 | 표시 내용 |
|---|---|
| `renderIdentity` | 현재 로그인 사용자·기기·세션과 각각의 목록, 자료별 연결 상태 |
| `renderDecision` | 선택한 업무 앱의 접근 요청·판정 상태와 대상 일치 여부 |
| `renderEvents` | 접속/XDR 기록의 최신순 목록, 필터와 기록 상세 |
| `renderStatus` | 기기·세션 상태, 알림 및 도움정보의 상태 |
| `renderVulnerabilities` | 설치 패키지 조회 상태, 패키지·OSV 응답과 미조회/불확실 상태 |
| `renderAiConnection` | AI 연결 점검의 `idle/loading/ok/error`, `test/verified`, 오류 안내; 사건 설명 실행과 구분 |
| `renderExplanation` | 선택한 사건의 AI 설명, 원문 근거·규칙과 제안; 실패 시 기존 기록 유지 안내 |
| `renderAction` | 미실행·준비·전달·ACK·관측 결과·결과 불명 구분; 준비나 ACK를 효과로 간주하지 않음 |

## 장애별 확인 순서

| 오류 또는 화면 메시지 | 의미 | 사용자가 확인할 사항과 다음 행동 | 현재 검증 상태 |
|---|---|---|---|
| `ENGINE_NOT_CONNECTED`, `연결 없음` | 기본 서버는 켜졌으나 기존 SDP/XDR 연결이 없음. 실제 자료나 승인 결과가 아님. | 운영자가 제공한 SDP 설정 유무를 확인하고 [SDP 연결 안내](SDP_HOST_CONNECTION.md)를 따릅니다. 임의 설정을 만들지 않습니다. | 기본 `/api/me` 응답 직접 확인; 화면 문구는 코드 확인 |
| `NATIVE_HOST_DISABLED` | 이 실행에 계정 연결 설정이 없음. | 운영자가 제공한 Native Host 설정 유무를 확인합니다. 서버 기동만 보고 로그인 완료로 판단하지 않습니다. | 코드 확인; 실제 계정 연결 미확인 |
| `ALEKOV_CONNECT_UNAVAILABLE` | 앱 내부 AI 승인 연결을 사용할 수 없음. | [연결 문제 안내](CONNECTION_TROUBLESHOOT.md)의 코드별 절차로 배포본·운영자 준비 상태를 확인합니다. | 코드 확인; 실제 AI 연결 미확인 |
| `ON_AI_PROVISIONING_PENDING` | 현재 계정 또는 앱의 AI 이용 권한이 준비 중이거나 확인 불가. | 계정 연결과 AI 앱 승인을 확인하고, 계속되면 담당자에게 권한 상태를 문의합니다. | 코드 확인; 실제 운영 권한 미확인 |
| `CONTRACT_MISMATCH`, `확인 불가(unknown)` | 응답 형식·확인 범위·상태를 신뢰할 수 없음. 빈 결과나 성공으로 처리하지 않음. | 상단 **다시 불러오기**를 한 번 눌러 재조회하고, 계속되면 도움정보를 담당자에게 전달합니다. | 코드 확인; 실제 계약 오류 재현 미확인 |
| `기록을 불러오지 못했습니다` | 보안 기록 요청 오류. 빈 기록과 다름. | 오류 문구를 읽고 연결 상태를 확인한 뒤 **다시 불러오기**를 직접 누릅니다. | `renderEvents` 코드 확인; 실제 조회 실패 미확인 |
| `AI 연결 점검 실패`, `AI 설명 실패` | 점검과 사건 설명은 별도 요청이며 실패도 구분됨. | 표시된 안전한 오류 코드·안내를 읽고 계정·권한·시간 제한을 확인합니다. 필요하면 사용자가 해당 버튼으로 직접 다시 요청합니다. | 표시 코드 확인; 실제 CLCO 호출 미확인 |
| `설치 패키지 조회 실패(error)` | 취약점 조회 요청 실패. 이전 결과를 현재 결과로 보지 않음. | 오류 문구를 확인하고 제공 화면의 조회 버튼을 직접 다시 누릅니다. | `renderVulnerabilities` 코드 확인; 실제 OSV 조회 미확인 |
| `아직 조회 안 함 (not_checked)`, `일부 조회 실패 (partial)` | 미조회는 취약점 없음이 아니며, 일부 조회는 전체 결과를 확정할 수 없음. | 조회 대상 설정과 각 패키지의 조회 상태를 확인합니다. 확인된 취약점 ID만 사용합니다. | 표시 코드 확인; 실제 OSV 조회 미확인 |
| `결과 불명(unknown)` | 조치 효과나 실패를 확정할 수 없음. | 준비·ACK를 효과 확인으로 보지 말고 원천 결과만 다시 조회합니다. | `renderAction` 코드 확인; 실제 조치 미실행 |
| `fatal: not a git repository` | 현재 PowerShell 위치가 Git 저장소 밖임. | 탐색기에서 `on-client`과 `.git`이 들어 있는 실제 AEGIS V2 저장소 최상위 폴더를 열고 다시 시작합니다. 기존 폴더를 삭제하거나 이동하지 않습니다. | 다른 사람이 실행한 PowerShell 화면에서 확인 |
| `npm.ps1 ... 스크립트를 실행할 수 없으므로`, `UnauthorizedAccess` | PowerShell이 `npm.ps1` 실행을 차단함. 앱 검사나 Node 버전 실패가 아님. | 같은 앱 폴더에서 `npm.cmd run check`를 실행합니다. 전역 실행 정책을 바꾸지 않습니다. | 다른 사람이 실행한 PowerShell 화면에서 확인 |
| `참고: 지금 Node.js 는 v24.22.0` | 수업 기준 `24.19.0`과 다르다는 참고 메시지. 시작 스크립트는 Node 22~24를 허용함. | 이어지는 성공 또는 오류 줄을 확인합니다. 참고 메시지만으로 설치를 바꾸지 않습니다. | 스크립트 코드와 사용자 Windows 출력 확인 |
| 브라우저 `ERR_CONNECTION_REFUSED` | 지정한 로컬 포트에 앱 서버가 응답하지 않음. | 서버 PowerShell 창에서 `케셰브가 켜졌습니다`와 실제 포트를 확인하고 창을 열린 채 유지합니다. 실행이 끝났다면 같은 앱 폴더에서 다시 켭니다. | 사용자 Windows 화면에서 재현·재시작 확인 |
| `Node.js 가 없습니다`, `…초 안에 뜨지 않았습니다` | 제공 실행 스크립트가 서버 시작을 완료하지 못함. | Node.js 버전과 앱 폴더 위치를 확인하고, 계속되면 오류 메시지를 담당자에게 전달합니다. | 스크립트 코드 확인; Windows 실행 미확인 |
| `포트 5189 를 다른 프로그램이 쓰고 있습니다` | 로컬 주소 충돌. | 위 `-Port 5190` 명령으로 실행하고 브라우저 포트도 바꿉니다. | 스크립트 코드 확인; Windows 충돌 재현 미확인 |

오류 코드별 상세 구분은 제공 [연결 문제 안내](CONNECTION_TROUBLESHOOT.md)에 있습니다. 도움정보를 공유하기 전에는 화면 내용을 직접 확인하고, 키·토큰·비밀번호·개인 설정 파일을 문서나 커밋에 넣지 않습니다.

## 확인한 범위와 기다림(UNV)

| 구분 | 근거와 범위 |
|---|---|
| 코드 확인 | 메뉴와 API 연결, 학생 함수 8개, PowerShell 실행 스크립트·오류 문구를 실제 파일에서 대조함. 이는 실행 성공 증거가 아님. |
| 직접 실행 확인 | Linux에서 Node.js `v24.19.0`, npm `11.9.0`, `npm run check` 통과, `npm start` 시작, `http://127.0.0.1:5189/` HTTP 200, 기본 `/api/me`의 `ENGINE_NOT_CONNECTED` 확인. |
| 앞 단계의 별도 검증 | 이전 단계에서 모의 DOM·Chromium 예제 화면을 점검했음. 이번 문서가 실제 회사 연결을 재검증한 것은 아님. |
| 기다림(UNV) | 다른 사람의 PC에서 이 문서만 보고 끝까지 재실행, 운영 계정 인증, 실제 SDP/XDR 자료·접근 판정, CLCO 모델 호출·사건 설명, 조치 집행·효과, 실제 OSV 응답·설치 패키지 대조. |

`npm run check`는 `student/extension.mjs`의 문법 검사만 합니다. HTTP 200은 앱 서버 응답 확인일 뿐, 위의 기다림(UNV)을 통과로 바꾸지 않습니다. ALEPH 공식 단계 판정은 제출 커밋의 원문을 별도로 검토합니다.

## 최종 과제 3일차: 연결과 Windows 기록 재현

아래는 3일차 기능을 다시 확인할 때의 절차입니다. 먼저 위 **처음 실행하기**의 저장소·현재 커밋 확인을 마칩니다. 이미 실행 중인 앱 서버는 해당 창에서 `Ctrl+C`로 끄고 재시작해야 새 코드가 적용됩니다. 명령은 본인의 Git 최상위 폴더에서 실행합니다. 미커밋 작업이 있거나 `main`이 아니라면 작업을 보존하고 소유자에게 확인받은 뒤 업데이트합니다.

```powershell
git pull --ff-only origin main
Set-Location -LiteralPath '.\on-client'
npm.cmd run check
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

1. 브라우저에서 `http://127.0.0.1:5189/`를 열고 **보호 현황 → 연결과 Windows 기록**을 확인합니다.
2. 활성 네트워크 인터페이스 주소, 방화벽 프로필, 최근 24시간 System·Application 경고·오류 건수 옆의 조회 시각을 확인합니다. 이 영역은 로컬 앱 서버가 읽은 **실제 조회값**만 표시하며 설명용 예시 수치를 넣지 않습니다.
3. 상단 **다시 불러오기**를 누르고 조회·집계 시각이 갱신되는지 확인합니다. 읽지 못하는 항목은 `확인 불가`와 이유로 남아야 합니다. 관리자 권한 상승이나 보안 설정 변경을 시도하지 않습니다.
4. 별도 **SDP 서버** 행을 확인합니다. 상단 `연결 없음`이라면 `SDP 미연결`이어야 합니다. PC 조회 성공은 SDP 연결 성공을 뜻하지 않습니다.

System·Application 건수는 운영체제 경고·오류 기록의 개수이며 **침해나 공격 탐지 결과가 아닙니다.** 방화벽 조회는 프로필과 기본 정책을 읽기만 합니다. 이벤트 본문은 앱 서버 응답에 넣지 않습니다. 클라우드 Linux 환경에서는 Windows PowerShell·이벤트 로그를 실행할 수 없었습니다. 이후 사용자 Windows 화면에서 실제 PC 값과 기록 건수 표시를 확인했으며, 다른 사람의 PC에서 동일한 값을 얻는다고 주장하지 않습니다.

## 최종 과제 4일차: 학생 화면과 직접 다시 조회

아래 명령은 **병합 뒤** 본인의 Git 최상위 폴더에서 실행합니다. 먼저 위 **처음 실행하기**의 저장소·현재 커밋 확인을 마칩니다. 작업 중인 서버는 해당 창에서 `Ctrl+C`로 끄고 새 버전으로 다시 켭니다. 미커밋 작업이 있으면 보존하고 업데이트 전에 소유자에게 확인받습니다.

```powershell
git switch main
git pull --ff-only origin main
Set-Location -LiteralPath '.\on-client'
npm.cmd run check
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```

1. `http://127.0.0.1:5189/`의 보호 현황에서 학생 상태·알림 표시의 **핵심 기능 3가지**와 **내 PC와 연결·기록**을 확인합니다. `Tab`으로 「다시 조회」에 이동하고 `Enter` 또는 `Space`로 누릅니다.
2. 조회 중에는 버튼이 비활성화되고 `새로 읽는 중…`이 나타나는지, 완료 뒤 버튼으로 키보드 초점이 돌아오는지 확인합니다. PC·Windows 제공 카드의 시각도 새로 조회한 값으로 바뀌어야 합니다.
3. 읽지 못한 항목은 학생 영역에서도 항목 이름, `확인 불가` 또는 조회 실패 이유, 다음 행동을 표시해야 합니다. 실제 수치를 예시 수치로 채우지 않습니다. SDP가 미연결이면 PC 조회 성공과 구분합니다.

학생 영역의 PC·Windows 값은 로컬 앱 서버에서 실제로 조회한 경우에만 **실제 로컬 조회**로 표시합니다. `npm run demo`에서 제공되는 SDP 예제 자료는 `설명용 예제 자료`라고 별도로 표시합니다. 이 저장소에는 `student/appearance.json`을 읽는 코드와 설치 프로그램 생성 명령이 없으므로, 이 브라우저 확인만으로 별도 설치형 앱에 반영됐다고 판단하지 않습니다. 설치형 앱이 어느 학생 파일과 UI 버전을 포함하는지는 그 배포 구성에서 별도로 확인해야 합니다.

## 21단계 제출 시 확인할 것

학생 문서를 커밋한 **40자리 SHA**와 저장소 주소가 같은 커밋을 가리키는지 확인합니다. 현재 Workbench의 **포털 제출 준비**는 13~20단계용이므로 21단계는 과제 화면에서 저장소 주소와 커밋을 직접 입력합니다. 비공개 원문 묶음이 필요하면 과제 화면의 **비공개 저장소 원문 준비 방법**에 있는 도구를 프로젝트 밖에 풀고, Git 최상위에서 그 화면에 안내된 명령에 실제 도구 경로·출력 경로·커밋을 넣어 JSON을 생성합니다. JSON은 프로젝트 밖에 보관합니다. 원문 접수와 공식 판정 통과는 별개이며, 앱을 켜거나 이 문서를 쓴 것만으로 제출되지 않습니다.
