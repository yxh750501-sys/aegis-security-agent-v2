// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView({ api } = {}) {
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
    renderStatus({ me, apps, events, devices, sessions, notifications, diagnostics, pcStatus, localSecurity, refreshing, mode }) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.append(element);
        return element;
      };
      const shown = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const shownTime = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value))
        ? new Date(value).toLocaleString('ko-KR') : shown(value);
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
      const overview = document.createElement('section');
      addText(overview, 'h3', '핵심 기능 3가지');
      const summary = (title, resource, okText) => {
        if (resource?.status === 'loading') addText(overview, 'p', `${title}: 새로 읽는 중…`);
        else if (resource?.status === 'error') {
          addText(overview, 'p', `${title}: 조회 실패 · ${shown(resource.error?.message)}`);
          addText(overview, 'p', `${title}: 아래 다시 조회를 누르고, 계속 실패하면 연결 상태를 확인하세요.`);
        } else if (resource?.status === 'ok') {
          addText(overview, 'p', `${title}: ${resource.mode === 'demo' ? '설명용 예제 자료 · ' : ''}${okText(resource.data)}`);
        } else addText(overview, 'p', `${title}: 확인 불가 · 다시 조회로 상태를 확인하세요.`);
      };
      summary('보호 현황', me, data => `현재 사용자 ${shown(data?.user?.label)}`);
      summary('업무 앱', apps, data => Array.isArray(data) ? `${data.length}개 앱 표시` : '자료 확인 불가');
      summary('보안 기록', events, data => Array.isArray(data) ? `${data.length}건 표시` : '자료 확인 불가');
      root.append(overview);
      addText(root, 'p', `연결 모드: ${Object.hasOwn(modes, mode) ? modes[mode] : '확인 불가'}`);

      const local = document.createElement('section');
      addText(local, 'h3', '내 PC와 연결·기록 · 실제 로컬 조회');
      const retry = addText(local, 'button', '다시 조회');
      retry.type = 'button';
      retry.setAttribute('data-student-refresh', '');
      retry.disabled = refreshing === true || typeof api?.refresh !== 'function';
      if (!retry.disabled) retry.addEventListener('click', () => { void api.refresh(); });
      const progress = addText(local, 'p', refreshing === true ? '새로 읽는 중…' : '자동 재시도 없이 버튼을 누를 때 다시 조회합니다.');
      progress.setAttribute('role', 'status');
      if (typeof api?.refresh !== 'function') addText(local, 'p', '이 실행판의 학생 다시 조회 연결을 확인할 수 없습니다. 상단 다시 불러오기를 사용하세요.');
      const pc = pcStatus?.data;
      if (pcStatus?.status === 'loading') addText(local, 'p', 'PC 상태: 새로 읽는 중…');
      else if (pcStatus?.status === 'error') addText(local, 'p', `PC 상태: 조회 실패 · ${shown(pcStatus.message)} · 다시 조회를 누르세요.`);
      else if (pcStatus?.status === 'ok' && pc) {
        for (const [name, item] of [['CPU 사용률', pc.cpu], ['메모리 사용량', pc.memory], ['디스크 남은 공간', pc.disk]]) {
          if (item?.status === 'ok') addText(local, 'p', `${name}: ${item.value}${item.unit === '%' ? '' : ' '}${item.unit} · 채집 시각 ${shownTime(item.measuredAt)} · 실제 로컬 조회`);
          else addText(local, 'p', `${name}: 확인 불가 · ${shown(item?.reason)} · 권한과 장치 상태를 확인한 뒤 다시 조회하세요.`);
        }
      } else addText(local, 'p', 'PC 상태: 확인 불가 · 다시 조회로 상태를 확인하세요.');
      if (mode === 'disconnected') addText(local, 'p', 'SDP 미연결 · PC 조회 성공과 별개입니다. 연결 설정을 확인하세요.');
      else if (mode === 'demo') addText(local, 'p', 'SDP는 예제 모드입니다. 실제 연결 결과가 아닙니다.');
      else if (mode !== 'connected') addText(local, 'p', 'SDP 연결 확인 불가 · 연결 상태를 확인하세요.');
      if (localSecurity?.status === 'loading') addText(local, 'p', '네트워크·방화벽·Windows 기록: 새로 읽는 중…');
      else if (localSecurity?.status === 'error') addText(local, 'p', `네트워크·방화벽·Windows 기록: 조회 실패 · ${shown(localSecurity.message)} · 다시 조회를 누르세요.`);
      else if (localSecurity?.status === 'ok' && localSecurity.data) {
        const data = localSecurity.data;
        const itemLine = (name, item, detail) => addText(local, 'p', item?.status === 'ok'
          ? `${name}: ${detail(item)} · 실제 로컬 조회`
          : `${name}: 확인 불가 · ${shown(item?.reason)} · 권한이나 서비스 상태를 확인한 뒤 다시 조회하세요.`);
        itemLine('네트워크 구성', data.network, item => `인터페이스 주소 ${item.interfaces?.length ?? '확인 불가'}개`);
        itemLine('방화벽 설정', data.firewall, item => `프로필 ${item.profiles?.length ?? '확인 불가'}개 확인`);
        for (const name of ['System', 'Application']) itemLine(`${name} 기록`, data.events?.[name], item => `최근 24시간 경고 ${item.warnings}건 · 오류 ${item.errors}건`);
        addText(local, 'p', 'Windows 경고·오류 건수는 침해나 공격 탐지 결과가 아닙니다.');
      } else addText(local, 'p', '네트워크·방화벽·Windows 기록: 확인 불가 · 다시 조회로 상태를 확인하세요.');
      root.append(local);
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
    renderVulnerabilities({ status, mode, data, error }) {
      const root = document.createElement('section');
      const addText = (parent, tag, value) => {
        const element = document.createElement(tag);
        element.textContent = value;
        parent.append(element);
        return element;
      };
      const shown = value => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const modes = { connected: '연결됨', demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      addText(root, 'p', `연결 모드: ${Object.hasOwn(modes, mode) ? modes[mode] : '확인 불가'}`);
      if (status === 'idle') {
        addText(root, 'p', '설치 패키지 조회 전(idle)입니다.');
        return root;
      }
      if (status === 'loading') {
        addText(root, 'p', '설치 패키지 조회 중(loading)입니다. 이전 결과는 현재 결과가 아닙니다.');
        return root;
      }
      if (status === 'error') {
        addText(root, 'p', `설치 패키지 조회 실패(error): ${shown(error?.message)}`);
        addText(root, 'p', '이전 조회 결과를 현재 결과로 보지 않습니다. 필요하면 조회 버튼을 직접 다시 누르세요.');
        return root;
      }
      if (status !== 'ok' || !data || typeof data !== 'object') {
        addText(root, 'p', '조회 상태와 결과를 확인할 수 없습니다.');
        return root;
      }

      const scanStatuses = {
        complete: '모두 조회',
        partial: '일부 조회 실패',
        not_checked: '아직 조회 안 함',
        not_configured: '조회 대상 프로젝트 설정 미완료',
        unverifiable: 'lock 파일 확인 불가',
      };
      if (!Object.hasOwn(scanStatuses, data.status)) {
        addText(root, 'p', '전체 조회 상태를 확인할 수 없습니다.');
        return root;
      }
      addText(root, 'h3', '설치 패키지·알려진 취약점 조회');
      addText(root, 'p', `전체 조회 상태: ${scanStatuses[data.status]} (${data.status})`);
      if (data.status === 'partial') addText(root, 'p', '일부 조회가 실패했습니다. 확인된 취약점 ID는 아래에 유지하며, 전체 결과는 확인할 수 없습니다.');
      if (data.status === 'not_checked') addText(root, 'p', '승인된 공개 조회 대상이 없어 아직 OSV 조회를 수행하지 않았습니다.');
      if (data.status === 'not_configured') addText(root, 'p', '조회 대상 프로젝트 설정이 필요합니다. 담당자가 설정을 확인해야 합니다.');
      if (data.status === 'unverifiable') addText(root, 'p', '설치 목록과 lock 파일을 확인할 수 없어 조회 결과를 확정할 수 없습니다.');
      if (data.lockfileVersion != null) addText(root, 'p', `package-lock.json 버전: ${data.lockfileVersion}`);
      if (typeof data.lockfileHash === 'string' && data.lockfileHash.length > 0) addText(root, 'p', `lock 파일 해시: ${data.lockfileHash}`);
      if (typeof data.checkedAt === 'string' && data.checkedAt.length > 0) addText(root, 'p', `전체 조회 시각: ${data.checkedAt}`);

      if (!Array.isArray(data.packages) || data.packages.length === 0) {
        addText(root, 'p', data.status === 'complete'
          ? '표시할 패키지 조회 결과가 없습니다. 앱 전체가 안전하다는 뜻은 아닙니다.'
          : '표시할 패키지 조회 결과가 없습니다. 미조회 또는 확인 불가를 취약점 없음으로 판단하지 마세요.');
        return root;
      }
      const packageStatuses = {
        known_vulnerabilities: '조회 범위에서 알려진 취약점 항목 있음',
        none_found: '조회 범위에서 알려진 취약점 항목 없음',
        unverifiable: '조회 확인 불가',
      };
      const list = addText(root, 'ul', '');
      for (const pkg of data.packages) {
        const row = document.createElement('li');
        if (typeof pkg?.name === 'string') row.setAttribute('data-student-package-name', pkg.name);
        if (typeof pkg?.version === 'string') row.setAttribute('data-student-package-version', pkg.version);
        addText(row, 'p', `패키지: ${shown(pkg?.name)} · 설치 버전: ${shown(pkg?.version)}`);
        addText(row, 'p', `조회 상태: ${Object.hasOwn(packageStatuses, pkg?.status) ? packageStatuses[pkg.status] : '확인 불가'} (${shown(pkg?.status)})`);
        addText(row, 'p', `출처: ${shown(pkg?.source)} · 패키지 조회 시각: ${shown(pkg?.checkedAt)}`);
        const findings = Array.isArray(pkg?.vulnerabilities) ? pkg.vulnerabilities : [];
        if (pkg?.status === 'unverifiable' && findings.length > 0) {
          addText(row, 'p', '일부 확인·전체 조회 확인 불가. 받은 취약점 ID만 표시합니다.');
        }
        if (findings.length === 0) {
          addText(row, 'p', pkg?.status === 'none_found'
            ? '이번 조회 범위에서 알려진 항목이 없습니다. 안전 보장은 아닙니다.'
            : '확인된 취약점 항목을 표시할 수 없습니다. 조회 미완료를 취약점 없음으로 판단하지 마세요.');
        } else {
          const findingList = addText(row, 'ul', '');
          for (const finding of findings) addText(findingList, 'li',
            `취약점 ID: ${shown(finding?.id)} · 수정 시각: ${shown(finding?.modified)}`);
        }
        list.append(row);
      }
      addText(root, 'p', 'OSV 조회 결과는 알려진 항목의 조회 시점 정보입니다. 패키지나 앱 전체의 안전을 보장하지 않습니다.');
      return root;
    },
    renderAiConnection({ status, mode, data, error, checkedAt }) {
      const root = document.createElement('section');
      const addText = (tag, value) => {
        const element = document.createElement(tag);
        element.textContent = value;
        root.append(element);
      };
      const shown = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const modes = { connected: '연결됨', demo: '예제 응답', disconnected: '연결 없음', unknown: '확인 불가' };
      addText('p', `연결 모드: ${Object.hasOwn(modes, mode) ? modes[mode] : '확인 불가'}`);
      if (status === 'idle') {
        addText('p', 'AI 연결 점검 전입니다.');
      } else if (status === 'loading') {
        addText('p', 'AI 연결 점검 중입니다.');
      } else if (status === 'ok') {
        if (data?.transportChecked === true && (data.audienceAuthorization === 'test' || data.audienceAuthorization === 'verified')
          && Number.isInteger(data.modelCount) && data.modelCount >= 0) {
          addText('p', data.audienceAuthorization === 'test'
            ? '시험 연결 점검(test): 실제 앱 권한 확인 결과가 아닙니다.'
            : '앱 권한 확인 후 점검(verified): 점검 시각 기준의 결과입니다.');
          addText('p', `응답 모델 수: ${data.modelCount}`);
          addText('p', `점검 시각: ${shown(checkedAt)}`);
          addText('p', '연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다. 사건 설명은 보안 기록에서 따로 요청해 확인하세요.');
        } else {
          addText('p', 'AI 연결 점검 결과를 확인할 수 없습니다. 사건 설명도 확인되지 않았습니다.');
        }
      } else if (status === 'error') {
        const guidance = {
          ON_AI_PROVISIONING_PENDING: '계정 연결과 앱 권한이 준비 중이거나 확인되지 않았습니다. 담당자에게 확인을 요청하세요.',
          ON_AI_TRANSPORT_PENDING: 'AI 연결이 준비 중입니다. 담당자에게 계정 연결과 앱 권한을 확인 요청하세요.',
          ON_AI_AUTHORIZATION_CHANGED: '점검 도중 앱 권한이 바뀌었습니다. 담당자에게 현재 권한을 확인 요청하세요.',
          SUBJECT_SCOPE_UNVERIFIED: '현재 계정 연결을 확인할 수 없습니다. 담당자에게 확인을 요청하세요.',
          WB_CLCO_AUTH_REQUIRED: 'AI 인증에 실패했습니다. 계정 연결을 다시 확인하고 담당자에게 문의하세요.',
          WB_CLCO_INVALID_TOKEN: 'AI 인증 설정을 확인할 수 없습니다. 담당자에게 문의하세요.',
          WB_CLCO_ACCESS_BLOCKED: 'AI 접근이 제한됐습니다. 계정 연결을 확인하고 담당자에게 문의하세요.',
          WB_CLCO_COHORT_BUDGET_EXHAUSTED: '반의 AI 사용량이 소진됐습니다. 담당자에게 문의하세요.',
          WB_CLCO_LIMIT_REACHED: 'AI 이용 한도에 도달했습니다. 담당자에게 문의하세요.',
          WB_CLCO_SESSION_CLOSED: '현재 AI 이용 시간이 아닙니다. 이용 시간을 확인하세요.',
          WB_CLCO_RATE_LIMITED: 'AI 요청이 제한됐습니다. 잠시 뒤 버튼을 눌러 직접 다시 점검하세요.',
          WB_CLCO_TIMEOUT: 'AI 요청 시간이 초과됐습니다. 잠시 뒤 직접 다시 점검하세요.',
          REQUEST_TIMEOUT: 'AI 요청 시간이 초과됐습니다. 잠시 뒤 직접 다시 점검하세요.',
          ENGINE_TIMEOUT: '연결 확인 시간이 초과됐습니다. 잠시 뒤 직접 다시 점검하세요.',
          TIMEOUT: 'AI 요청 시간이 초과됐습니다. 잠시 뒤 직접 다시 점검하세요.',
          WB_CLCO_NETWORK_ERROR: 'AI 네트워크 연결을 확인할 수 없습니다. 잠시 뒤 직접 다시 점검하세요.',
          WB_CLCO_SERVER_UNAVAILABLE: 'AI 서버가 응답하지 않습니다. 잠시 뒤 직접 다시 점검하세요.',
          WB_CLCO_CANCELLED: '점검이 취소됐습니다. 이전 결과는 현재 결과가 아닙니다.',
          REQUEST_CANCELLED: '점검이 취소됐습니다. 이전 결과는 현재 결과가 아닙니다.',
          CANCELLED: '점검이 취소됐습니다. 이전 결과는 현재 결과가 아닙니다.',
          MODEL_NOT_CONFIGURED: '사용할 AI 모델이 설정되지 않았습니다. 담당자에게 모델 허용 설정을 확인 요청하세요.',
          ON_AI_MODEL_LIST_EMPTY: '현재 쓸 수 있는 AI 모델이 없습니다. 담당자에게 모델 허용 설정을 확인 요청하세요.',
        };
        const code = typeof error?.code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code) ? error.code : 'AI_REQUEST_UNVERIFIED';
        const message = typeof error?.message === 'string' && error.message.length > 0 && error.message.length <= 500
          ? error.message : 'AI 연결 또는 응답을 확인할 수 없습니다.';
        addText('p', `AI 연결 점검 실패 · 코드: ${code} · 안내: ${message}`);
        addText('p', Object.hasOwn(guidance, code) ? guidance[code] : '원인을 확인할 수 없습니다. 담당자에게 계정 연결과 앱 권한을 확인 요청하세요.');
        addText('p', '다시 점검하려면 현재 API 연결 점검 버튼을 직접 누르세요. 자동으로 다시 점검하지 않습니다.');
      } else {
        addText('p', 'AI 연결 점검 상태를 확인할 수 없습니다.');
      }
      return root;
    },
    renderExplanation({ event, explanation, checkedAt }) {
      const root = document.createElement('section');
      const addText = (parent, tag, value) => {
        const element = document.createElement(tag);
        element.textContent = value;
        parent.append(element);
        return element;
      };
      if (explanation?.status === 'error') {
        const code = typeof explanation.error?.code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(explanation.error.code)
          ? explanation.error.code : 'AI_REQUEST_UNVERIFIED';
        const message = typeof explanation.error?.message === 'string' && explanation.error.message.length > 0
          && explanation.error.message.length <= 500 ? explanation.error.message : 'AI 설명 결과를 확인할 수 없습니다.';
        addText(root, 'p', `AI 설명 실패 · 코드: ${code} · 안내: ${message}`);
        if (code === 'ON_AI_INVALID_INPUT') addText(root, 'p', '근거 부족 또는 입력 오류로 이 사건을 설명할 수 없습니다.');
        if (code === 'ON_AI_INVALID_OUTPUT') addText(root, 'p', '근거가 맞지 않거나 실행됐다고 주장하는 설명은 사용할 수 없습니다.');
        addText(root, 'p', '기존 보안 기록은 그대로 유지됩니다. AI 설명 실패는 과제 실패가 아닙니다.');
        return root;
      }
      if (!event || typeof event.id !== 'string' || event.id.length === 0) {
        addText(root, 'p', '보안 기록에서 기록을 먼저 고르세요.');
        return root;
      }
      if (explanation?.status === 'loading') {
        addText(root, 'p', `사건 ID: ${event.id} · AI 설명 요청 중입니다.`);
        return root;
      }
      if (explanation?.status !== 'ok') {
        addText(root, 'p', 'AI 설명 요청 전입니다. 보안 기록에서 별도로 요청할 수 있습니다.');
        return root;
      }

      const data = explanation.data;
      if (!Array.isArray(event.evidence) || event.evidence.length === 0) {
        addText(root, 'p', '근거 부족으로 AI 설명을 사용할 수 없습니다. 기록은 그대로입니다.');
        return root;
      }
      if (event.evidence.some(row => !row || typeof row.id !== 'string' || typeof row.text !== 'string')) {
        addText(root, 'p', 'AI 설명을 사용할 수 없습니다. 현재 기록의 근거 형식을 확인할 수 없습니다.');
        return root;
      }
      const evidence = new Map(event.evidence.map(row => [row.id, row.text]));
      const ids = data?.evidenceIds;
      if (evidence.size !== event.evidence.length || !Array.isArray(ids) || ids.length !== evidence.size || new Set(ids).size !== ids.length
        || ids.some(id => !evidence.has(id))) {
        addText(root, 'p', 'AI 설명을 사용할 수 없습니다. 인용한 근거 ID가 현재 기록의 근거와 맞지 않습니다. 기록은 그대로입니다.');
        return root;
      }
      if (typeof data.summary !== 'string' || data.summary.length === 0 || !Array.isArray(event.rules)
        || event.rules.some(rule => !rule || typeof rule.id !== 'string' || typeof rule.text !== 'string')
        || !event.state || !Array.isArray(event.supportedActions) || !Array.isArray(data.proposals)
        || data.requiresHumanConfirmation !== true || data.executed !== false
        || data.proposals.some(proposal => !proposal || !event.supportedActions.includes(proposal.action)
          || !Array.isArray(proposal.evidenceIds) || proposal.evidenceIds.some(id => !evidence.has(id))
          || typeof proposal.reason !== 'string')) {
        addText(root, 'p', 'AI 설명의 현재 기록·조치·미실행 상태를 확인할 수 없어 사용할 수 없습니다. 기록은 그대로입니다.');
        return root;
      }

      root.setAttribute('data-student-explanation-event', event.id);
      addText(root, 'h3', 'AI 설명(참고용)');
      addText(root, 'p', `사건 ID: ${event.id}`);
      addText(root, 'p', 'AI 요약은 해석입니다. 사실은 기록의 근거와 원천 상태를 확인하세요.');
      addText(root, 'p', `AI 요약: ${data.summary}`);
      if (typeof checkedAt === 'string' && checkedAt.length > 0) addText(root, 'p', `확인 시각: ${checkedAt}`);
      if (explanation.mode === 'demo') addText(root, 'p', '예제 자료(demo)이며 실제 사건 설명 결과가 아닙니다.');

      addText(root, 'h4', '인용한 근거');
      const evidenceList = addText(root, 'ul', '');
      for (const id of ids) addText(evidenceList, 'li', `${id} — ${evidence.get(id)}`);
      addText(root, 'h4', '현재 규칙');
      if (event.rules.length === 0) addText(root, 'p', '표시할 규칙이 없습니다.');
      else {
        const rulesList = addText(root, 'ul', '');
        for (const rule of event.rules) addText(rulesList, 'li', `${rule.id} — ${rule.text}`);
      }

      const stateLabels = {
        access: { allowed: '허용됨', denied: '거부됨', unknown: '확인 불가' },
        session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
        device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
      };
      const names = { access: '접속', session: '세션', device: '기기' };
      addText(root, 'h4', '원천이 알려 준 현재 상태');
      const statesList = addText(root, 'ul', '');
      const unknown = [];
      for (const key of ['access', 'session', 'device']) {
        const code = event.state[key];
        const label = Object.hasOwn(stateLabels[key], code) ? stateLabels[key][code] : '확인 불가';
        addText(statesList, 'li', `${names[key]}: ${label}(${typeof code === 'string' ? code : 'unknown'})`);
        if (code === 'unknown' || !Object.hasOwn(stateLabels[key], code)) unknown.push(names[key]);
      }
      addText(root, 'p', unknown.length ? `확인할 수 없는 상태: ${unknown.join(', ')}` : '확인할 수 없는 상태: 없음');

      addText(root, 'h4', '조치 제안');
      if (data.proposals.length === 0) {
        addText(root, 'p', event.supportedActions.length === 0
          ? '원천이 지원하는 조치가 없어 제안이 없습니다. 이는 정상입니다.'
          : 'AI가 제안한 조치가 없습니다.');
      } else {
        const proposalList = addText(root, 'ul', '');
        for (const proposal of data.proposals) addText(proposalList, 'li',
          `${proposal.action} — ${proposal.reason} · 인용 근거: ${proposal.evidenceIds.join(', ')} · 사람 확인이 필요하며 실행되지 않았습니다.`);
      }
      addText(root, 'p', 'AI 설명과 제안만으로 보안 조치는 실행되지 않았습니다.');
      return root;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error }) {
      const root = document.createElement('section');
      const addText = (tag, value) => {
        const element = document.createElement(tag);
        element.textContent = value;
        root.append(element);
      };
      const present = value => typeof value === 'string' && value.length > 0;
      const eventId = present(event?.id) ? event.id : null;
      const currentActionId = present(actionId) ? actionId : null;
      const requestId = present(receipt?.requestId) ? receipt.requestId : null;

      const targetInvalid = target != null && (!present(target.id)
        || !Number.isSafeInteger(target.generation) || target.generation <= 0);
      const receiptMismatch = receipt && ((present(receipt.eventId) && receipt.eventId !== eventId)
        || (present(receipt.actionId) && receipt.actionId !== currentActionId)
        || (receipt.target != null && (receipt.target.id !== target?.id
          || receipt.target.generation !== target?.generation))
        || (['prepared', 'pending', 'succeeded', 'denied', 'failed'].includes(status)
          && present(receipt.status) && receipt.status !== status));
      const incompletePreparation = status === 'prepared' && (!eventId || !currentActionId
        || !target || !requestId || !present(confirmationExpiresAt));
      if (targetInvalid || receiptMismatch || incompletePreparation) {
        addText('p', '결과 불명(unknown). 영수증 또는 실제 대상이 현재 사건·조치와 일치하지 않습니다. 원천 결과만 다시 조회하세요.');
        return root;
      }

      if (status === 'idle') {
        addText('p', '아직 미실행(idle). AI 조치 제안만으로 집행되지 않습니다.');
        if (present(message)) addText('p', message);
        return root;
      }

      const confirmed = status === 'succeeded' && observation?.effectApplied === true
        && present(observation.observedAt) && present(receipt?.receiptId);
      const states = {
        loading: '조치 준비 또는 원천 결과 조회 중(loading). 아직 결과가 확인되지 않았습니다.',
        prepared: '준비됨·미실행(prepared). 제공 화면에서 실제 대상과 기한을 확인한 뒤 사람이 집행을 확인해야 합니다.',
        executing: '사람 확인 후 원천에 전달 중(executing). 결과가 아직 확인되지 않았습니다.',
        pending: '원천 접수·처리 중(pending). 접수 응답(ACK)은 실제 효과가 아닙니다.',
        denied: '원천에서 조치를 거절했습니다(denied).',
        failed: '원천의 조치 처리가 실패했습니다(failed).',
        unknown: '결과 불명(unknown). 성공이나 효과 없음으로 단정하지 말고 원천 결과만 다시 조회하세요.',
        expired: '사람 확인 기한이 지났습니다(expired). 현재 준비는 사용할 수 없으므로 다시 준비하세요.',
        error: '조치 요청을 처리하지 못했습니다(error).',
      };
      addText('p', status === 'succeeded'
        ? confirmed ? '원천 효과 확인(succeeded).' : '결과 불명(unknown). 효과 관측을 확인할 수 없습니다. 원천 결과만 다시 조회하세요.'
        : Object.hasOwn(states, status) ? states[status] : '조치 상태를 확인할 수 없습니다.');

      if (eventId) {
        if (currentActionId) root.setAttribute('data-student-action-event', eventId);
        addText('p', `사건 ID: ${eventId}`);
        if (Array.isArray(event.evidence)) {
          for (const row of event.evidence) if (present(row?.id)) addText('p', `근거 ID: ${row.id}`);
        }
      }
      if (currentActionId) addText('p', `조치 ID: ${currentActionId}`);
      if (present(target?.id)) addText('p', `실제 대상 ID: ${target.id}`);
      if (Number.isSafeInteger(target?.generation)) addText('p', `대상 세대: ${target.generation}`);
      if (status === 'prepared' && present(confirmationExpiresAt)) addText('p', `사람 확인 기한: ${confirmationExpiresAt}`);
      if (requestId) {
        if (eventId && currentActionId) root.setAttribute('data-student-action-request', requestId);
        addText('p', `요청 ID: ${requestId}`);
      }
      if (present(receipt?.receiptId)) addText('p', `영수증 ID: ${receipt.receiptId}`);
      if (Number.isSafeInteger(receipt?.version)) addText('p', `영수증 버전: ${receipt.version}`);
      if (receipt?.replayed === true) addText('p', '동일 요청의 재전달 응답(replayed)입니다. 새 조치를 집행했다는 뜻이 아닙니다.');
      if (receipt?.superseded === true) addText('p', '이전 조회 결과(superseded)는 최신 결과가 아닙니다. 원천 결과만 다시 조회하세요.');
      if (confirmed) {
        addText('p', `원천 관측 시각: ${observation.observedAt}`);
        addText('p', 'effectApplied: true');
      }
      if ((status === 'denied' || status === 'failed' || status === 'loading') && present(message)) addText('p', `안내: ${message}`);
      if (status === 'error' || status === 'expired' || status === 'unknown') {
        if (present(error?.code) && /^[A-Z][A-Z0-9_]{0,63}$/.test(error.code)) addText('p', `오류 코드: ${error.code}`);
        if (present(error?.message)) addText('p', `오류 안내: ${error.message}`);
      }
      if (Array.isArray(event?.supportedActions) && event.supportedActions.length === 0) {
        addText('p', '현재 원천이 지원하는 조치가 없어 조치 준비를 진행할 수 없습니다.');
      }
      addText('p', '조작은 제공 화면의 버튼으로만 진행합니다. 조치 화면 취소는 이미 전달된 효과를 되돌리지 않습니다.');
      return root;
    },
  };
}
