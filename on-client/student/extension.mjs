// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions }) {
      const root = document.createElement('section');
      const addText = (parent, tag, value) => {
        const element = document.createElement(tag);
        element.textContent = value;
        parent.append(element);
        return element;
      };
      const value = (input, fallback) => typeof input === 'string' && input.length > 0 ? input : fallback;
      const deviceStatus = (status) => {
        const labels = {
          compliant: '보안 기준 충족 (compliant)',
          noncompliant: '보안 기준 미충족 (noncompliant)',
          unknown: '확인 불가 (unknown)',
        };
        return Object.hasOwn(labels, status) ? labels[status] : '확인 불가 (알 수 없는 기기 상태)';
      };
      const sessionStatus = (status) => {
        const labels = {
          active: '활성 (active)',
          expired: '만료 (expired)',
          revoked: '철회됨 (revoked)',
          unknown: '확인 불가 (unknown)',
        };
        return Object.hasOwn(labels, status) ? labels[status] : '확인 불가 (알 수 없는 세션 상태)';
      };
      const modeText = (mode) => {
        const labels = {
          connected: '연결됨',
          demo: '예제 자료',
          disconnected: '연결 없음',
          unknown: '확인 불가',
        };
        return Object.hasOwn(labels, mode) ? labels[mode] : '연결 상태 확인 불가';
      };
      const showResource = (title, resource, showData, requiresIdentity = false) => {
        const section = document.createElement('section');
        addText(section, 'h3', title);
        addText(section, 'p', `연결 모드: ${modeText(resource?.mode)}`);
        if (resource?.status === 'loading') {
          addText(section, 'p', '불러오는 중');
        } else if (resource?.status === 'error') {
          addText(section, 'p', `연결 실패 또는 확인 불가: ${value(resource.error?.message, '오류 내용을 확인할 수 없습니다.')}`);
        } else if (resource?.status === 'ok') {
          if (requiresIdentity && me?.status !== 'ok') {
            addText(section, 'p', '현재 로그인 확인 전에는 목록을 표시할 수 없습니다.');
          } else {
            showData(section, resource.data);
          }
        } else {
          addText(section, 'p', '자료 상태 확인 불가');
        }
        root.append(section);
      };

      showResource('현재 로그인 사용자·기기·세션', me, (section, data) => {
        if (!data || typeof data !== 'object') {
          addText(section, 'p', '현재 로그인 정보를 확인할 수 없습니다.');
          return;
        }
        addText(section, 'p', `사용자: ${value(data.user?.label, '이름 확인 불가')} · ID: ${value(data.user?.id, 'ID 확인 불가')}`);
        addText(section, 'p', `현재 기기: ${value(data.device?.label, '이름 확인 불가')} · ID: ${value(data.device?.id, 'ID 확인 불가')} · 상태: ${deviceStatus(data.device?.status)}`);
        addText(section, 'p', `현재 세션 ID: ${value(data.session?.id, 'ID 확인 불가')} · 상태: ${sessionStatus(data.session?.status)}`);
      });
      showResource('기기 목록', devices, (section, data) => {
        if (!Array.isArray(data)) {
          addText(section, 'p', '기기 목록을 확인할 수 없습니다.');
        } else if (data.length === 0) {
          addText(section, 'p', '표시할 기기가 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const device of data) addText(list, 'li', `${value(device?.label, '이름 확인 불가')} · ID: ${value(device?.id, 'ID 확인 불가')} · 상태: ${deviceStatus(device?.status)}`);
          section.append(list);
        }
      }, true);
      showResource('세션 목록', sessions, (section, data) => {
        if (!Array.isArray(data)) {
          addText(section, 'p', '세션 목록을 확인할 수 없습니다.');
        } else if (data.length === 0) {
          addText(section, 'p', '표시할 세션이 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const session of data) addText(list, 'li', `ID: ${value(session?.id, 'ID 확인 불가')} · 상태: ${sessionStatus(session?.status)}`);
          section.append(list);
        }
      }, true);
      return root;
    },
    renderDecision({ status, mode, data, error, appId }) {
      const root = document.createElement('section');
      const addText = (tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        root.append(element);
      };
      const supplied = (text) => typeof text === 'string' && text.length > 0 ? text : '확인 불가';
      const modes = {
        connected: '실제 연결 모드',
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      addText('p', `연결 모드: ${Object.hasOwn(modes, mode) ? modes[mode] : '확인 불가'}`);

      if (status === 'idle') {
        addText('p', '앱을 골라 접속을 요청하세요.');
      } else if (status === 'loading') {
        addText('p', `대상 앱 ID: ${supplied(appId)}`);
        addText('p', '판정 확인 중');
      } else if (status === 'error') {
        addText('p', `대상 앱 ID: ${supplied(appId)}`);
        addText('p', `접근 요청 실패: ${supplied(error?.message)}`);
        addText('p', '요청 실패는 정책상 접근 거부 판정이 아닙니다.');
      } else if (status === 'ok') {
        const requestedId = typeof appId === 'string' && appId.length > 0 ? appId : null;
        const returnedId = typeof data?.appId === 'string' && data.appId.length > 0 ? data.appId : null;
        addText('p', `대상 앱 ID: ${supplied(returnedId)}`);
        if (!requestedId || !returnedId || requestedId !== returnedId) {
          addText('p', '판정 확인 불가 (unknown): 요청 앱과 응답 앱을 일치시킬 수 없습니다.');
        } else {
          switch (data.decision) {
            case 'allow':
              addText('p', '접근 허용 (allow)');
              addText('p', '서버 정책상 허용 판정입니다. 실제 업무 앱 접속 완료를 뜻하지 않습니다.');
              break;
            case 'deny':
              addText('p', '접근 거부 (deny)');
              break;
            case 'challenge':
              addText('p', '추가 인증 또는 확인 필요 (challenge)');
              addText('p', '추가 확인이 필요합니다. AEGIS가 인증 절차를 대신 수행하지는 않습니다.');
              break;
            case 'unknown':
            default:
              addText('p', '판정 확인 불가 (unknown): 접근 허용 여부를 확인할 수 없습니다.');
              break;
          }
          addText('p', `판정 이유: ${supplied(data.reason)}`);
          addText('p', `판정 시각: ${supplied(data.checkedAt)}`);
        }
      } else {
        addText('p', '접근 요청 상태 확인 불가');
      }
      return root;
    },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
