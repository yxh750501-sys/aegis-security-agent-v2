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
    renderEvents({ status, mode, data, error }) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.append(element);
        return element;
      };
      const shown = (value, fallback = '확인 불가') => typeof value === 'string' && value.length > 0 ? value : fallback;
      const modeLabels = { connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      addText(root, 'p', `연결 모드: ${Object.hasOwn(modeLabels, mode) ? modeLabels[mode] : '확인 불가'}`);
      if (status === 'loading') {
        addText(root, 'p', '기록을 불러오는 중입니다.');
        return root;
      }
      if (status === 'error') {
        const failure = error?.code === 'CONTRACT_MISMATCH'
          ? '기록을 불러오지 못했습니다 (응답 형식 확인 불가)'
          : '기록을 불러오지 못했습니다';
        addText(root, 'p', `${failure}: ${shown(error?.message)}`);
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        addText(root, 'p', '기록을 확인할 수 없습니다.');
        return root;
      }
      if (data.length === 0) {
        addText(root, 'p', '표시할 기록이 없습니다.');
        return root;
      }

      addText(root, 'p', '현재 전달받은 본인의 최근 기록(최대 40건)만 표시합니다. 전체 이력이나 새로 탐지한 경보가 아닙니다.');
      // 받은 배열은 건드리지 않고 이 호출에 전달된 기록만 최신순으로 표시한다.
      const records = [...data].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      const filters = document.createElement('div');
      const makeFilter = (name, values, labelFor) => {
        const label = document.createElement('label');
        addText(label, 'span', name);
        const select = document.createElement('select');
        const all = document.createElement('option');
        all.value = 'all';
        all.textContent = '전체';
        all.dataset.all = 'true';
        select.append(all);
        for (const value of new Set(values)) {
          const option = document.createElement('option');
          option.value = value ?? '';
          option.textContent = labelFor(value);
          select.append(option);
        }
        label.append(select);
        filters.append(label);
        return select;
      };
      const kindFilter = makeFilter('기록 종류', records.map(event => event.kind), kind => kind === 'access' ? '접속 기록 (access)' : kind === 'xdr' ? 'XDR 경보 (xdr)' : shown(kind));
      const appFilter = makeFilter('업무 앱', records.map(event => event.appId), appId => shown(appId, '앱 확인 불가'));
      const accessFilter = makeFilter('접속 상태', records.map(event => event.state?.access), access => shown(access));
      root.append(filters);
      const count = addText(root, 'p', '');
      const list = document.createElement('ul');
      let selectedId = null;
      const stateLabels = {
        access: { allowed: '허용됨(allowed)', denied: '거부됨(denied)', unknown: '확인 불가(unknown)' },
        session: { active: '활성(active)', expired: '만료(expired)', revoked: '철회됨(revoked)', unknown: '확인 불가(unknown)' },
        device: { compliant: '보안 기준 충족(compliant)', noncompliant: '보안 기준 미충족(noncompliant)', unknown: '확인 불가(unknown)' },
      };
      const stateText = (kind, value) => Object.hasOwn(stateLabels[kind], value) ? stateLabels[kind][value] : '확인 불가(unknown)';
      const addFacts = (detail, title, facts) => {
        addText(detail, 'h4', title);
        if (!Array.isArray(facts) || facts.length === 0) {
          addText(detail, 'p', `${title} 없음`);
          return;
        }
        const factsList = document.createElement('ul');
        for (const fact of facts) addText(factsList, 'li', `ID: ${shown(fact?.id)} · 내용: ${shown(fact?.text)}`);
        detail.append(factsList);
      };
      const matches = (select, value) => select.selectedOptions[0].dataset.all === 'true' || select.value === (value ?? '');
      const renderRows = () => {
        list.replaceChildren();
        const visible = records.filter(event => matches(kindFilter, event.kind) && matches(appFilter, event.appId) && matches(accessFilter, event.state?.access));
        count.textContent = `표시 중 ${visible.length}건`;
        if (visible.length === 0) addText(list, 'li', '선택한 조건에 맞는 기록이 없습니다.');
        for (const event of visible) {
          const row = document.createElement('li');
          row.setAttribute('data-student-event-id', shown(event.id));
          const kind = event.kind === 'access' ? '접속 기록' : event.kind === 'xdr' ? 'XDR 경보' : '종류 확인 불가';
          addText(row, 'p', `사건 ID: ${shown(event.id)} · 시각: ${shown(event.at)} · 종류: ${kind} (${shown(event.kind)}) · 앱: ${shown(event.appId, '앱 확인 불가')} · 요약: ${shown(event.summary)}`);
          const button = addText(row, 'button', `${shown(event.id)} 상세`);
          button.type = 'button';
          button.addEventListener('click', () => {
            selectedId = selectedId === event.id ? null : event.id;
            renderRows();
          });
          if (selectedId === event.id) {
            const detail = document.createElement('section');
            detail.setAttribute('data-student-event-detail', shown(event.id));
            addText(detail, 'p', `사건 ID: ${shown(event.id)} · 앱: ${shown(event.appId, '앱 확인 불가')}`);
            addFacts(detail, '근거', event.evidence);
            addFacts(detail, '규칙', event.rules);
            addText(detail, 'p', `접속 상태: ${stateText('access', event.state?.access)}`);
            addText(detail, 'p', `세션 상태: ${stateText('session', event.state?.session)}`);
            addText(detail, 'p', `기기 상태: ${stateText('device', event.state?.device)}`);
            if (Array.isArray(event.supportedActions) && event.supportedActions.length > 0) {
              addText(detail, 'p', '조치 실행 연결은 준비 중입니다. 아래 조치는 아직 지원하지 않습니다.');
              for (const action of event.supportedActions) {
                const unsupported = addText(detail, 'button', `${shown(action)} 미지원`);
                unsupported.type = 'button';
                unsupported.disabled = true;
              }
            }
            row.append(detail);
          }
          list.append(row);
        }
      };
      for (const select of [kindFilter, appFilter, accessFilter]) select.addEventListener('change', () => { selectedId = null; renderRows(); });
      root.append(list);
      renderRows();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode }) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.append(element);
        return element;
      };
      const shown = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const labels = {
        device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
        session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
      };
      const stateText = (kind, status) => Object.hasOwn(labels[kind], status)
        ? `${labels[kind][status]} (${status})` : '확인 불가 (unknown)';
      const failureText = (error) => {
        const timeout = ['TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT'].includes(error?.code);
        return `${timeout ? '시간 초과: ' : ''}${shown(error?.message)}`;
      };
      const modes = { connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      addText(root, 'p', `연결 모드: ${Object.hasOwn(modes, mode) ? modes[mode] : '확인 불가'}`);
      const showList = (title, resource, kind) => {
        const section = document.createElement('section');
        addText(section, 'h3', title);
        if (resource?.status === 'loading') {
          addText(section, 'p', `${title} 불러오는 중`);
        } else if (resource?.status === 'error') {
          addText(section, 'p', `${title} 불러오지 못했습니다: ${failureText(resource.error)}`);
          addText(section, 'p', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.');
        } else if (resource?.status === 'ok' && Array.isArray(resource.data)) {
          if (resource.data.length === 0) {
            addText(section, 'p', kind === 'device' ? '등록된 기기가 없습니다.' : '현재 연결이 없습니다.');
          } else {
            const list = document.createElement('ul');
            for (const row of resource.data) addText(list, 'li', kind === 'device'
              ? `기기: ${shown(row?.label)} · 상태: ${stateText(kind, row?.status)}`
              : `세션 ID: ${shown(row?.id)} · 상태: ${stateText(kind, row?.status)}`);
            section.append(list);
          }
        } else {
          addText(section, 'p', `${title} 상태를 확인할 수 없습니다.`);
        }
        root.append(section);
      };
      showList('등록 기기', devices, 'device');
      showList('현재 세션', sessions, 'session');
      addText(root, 'p', '세션 정보는 지금 검증된 연결 한 개만 대상으로 하며 과거 세션 목록이 아닙니다.');
      const notificationSection = document.createElement('section');
      addText(notificationSection, 'h3', '상태 알림');
      if (!Array.isArray(notifications) || notifications.length === 0) {
        addText(notificationSection, 'p', '주의할 알림이 없습니다.');
      } else {
        const list = document.createElement('ul');
        for (const notice of notifications) addText(list, 'li', `자료: ${shown(notice?.resource)} · 코드: ${shown(notice?.code)} · 내용: ${shown(notice?.message)}`);
        notificationSection.append(list);
      }
      root.append(notificationSection);
      const diagnosticSection = document.createElement('section');
      addText(diagnosticSection, 'h3', '도움정보');
      let safe = null;
      if (diagnostics?.status === 'loading') addText(diagnosticSection, 'p', '도움정보 불러오는 중');
      else if (diagnostics?.status === 'error') {
        addText(diagnosticSection, 'p', `도움정보를 불러오지 못했습니다: ${failureText(diagnostics.error)}`);
        addText(diagnosticSection, 'p', '다시 시도는 위쪽 도움정보 불러오기 버튼을 직접 누르세요.');
      } else if (diagnostics?.status === 'ok' && diagnostics.data && typeof diagnostics.data === 'object') {
        const data = diagnostics.data;
        safe = {
          requestId: shown(data?.requestId),
          component: shown(data?.component),
          version: shown(data?.version),
          checkedAt: shown(data?.checkedAt),
          engine: { mode: shown(data?.engine?.mode), code: shown(data?.engine?.code) },
        };
        addText(diagnosticSection, 'p', `requestId: ${safe.requestId}`);
        addText(diagnosticSection, 'p', `component: ${safe.component}`);
        addText(diagnosticSection, 'p', `version: ${safe.version}`);
        addText(diagnosticSection, 'p', `checkedAt: ${safe.checkedAt}`);
        addText(diagnosticSection, 'p', `engine.mode: ${safe.engine.mode}`);
        addText(diagnosticSection, 'p', `engine.code: ${safe.engine.code}`);
        addText(diagnosticSection, 'p', '복사한 도움정보는 직접 확인한 뒤 도움 요청에 사용하세요.');
      } else if (diagnostics?.status === 'ok') {
        addText(diagnosticSection, 'p', '도움정보 내용을 확인할 수 없습니다.');
      } else {
        addText(diagnosticSection, 'p', '도움정보는 위쪽 도움정보 불러오기 버튼을 누르면 확인할 수 있습니다.');
      }
      const button = addText(diagnosticSection, 'button', '도움정보 복사');
      button.type = 'button';
      button.disabled = safe === null;
      const feedback = addText(diagnosticSection, 'p', '');
      button.addEventListener('click', async () => {
        if (safe === null) return;
        try {
          await navigator.clipboard.writeText(JSON.stringify(safe, null, 2));
          feedback.textContent = '도움정보를 복사했습니다.';
        } catch {
          feedback.textContent = '복사할 수 없습니다. 브라우저의 클립보드 권한을 확인하세요.';
        }
      });
      root.append(diagnosticSection);
      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
