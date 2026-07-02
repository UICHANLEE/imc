import type { AppState, Category, IssueType, Priority, Project, Status } from "./types";

export const columns: { key: Status; label: string; wipLimit?: number; description: string }[] = [
  { key: "backlog", label: "Backlog", description: "아직 우선순위 조정 전" },
  { key: "selected", label: "Selected", wipLimit: 4, description: "이번 스프린트 후보" },
  { key: "progress", label: "In Progress", wipLimit: 3, description: "현재 작업 중" },
  { key: "review", label: "Review", wipLimit: 2, description: "검토와 문서 정리" },
  { key: "done", label: "Done", description: "완료된 작업" }
];

export const categories: Category[] = ["Product", "Design", "Development", "Personal"];
export const issueTypes: IssueType[] = ["Epic", "Story", "Task", "Bug", "Sub-task"];
export const priorities: Priority[] = ["Highest", "High", "Medium", "Low"];
export const assignees = ["Uichan", "Mina", "Joon", "Unassigned"];
export const days = ["월", "화", "수", "목", "금"];
export const startHour = 8;
export const endHour = 20;
export const hourHeight = 60;
export const storageKey = "imc-react-state-v3";

export const initialProjects: Project[] = [
  { id: "prj-imc", name: "It's My Calendar", key: "IMC", color: "#0c66e4" },
  { id: "prj-mobile", name: "Mobile App", key: "MOB", color: "#7c3aed" },
  { id: "prj-growth", name: "Growth Ops", key: "GRO", color: "#0f766e" }
];

export const initialState: AppState = {
  projects: initialProjects,
  review: "",
  cards: [
    {
      id: "IMC-101",
      title: "카드-문서-일정 연결 플로우 정의",
      description: "JIRA형 이슈를 만들면 연결 문서와 캘린더 블록, 집중 세션까지 이어지는 핵심 플로우를 정의합니다.",
      projectId: "prj-imc",
      category: "Product",
      issueType: "Epic",
      status: "progress",
      priority: "Highest",
      assignee: "Uichan",
      reporter: "Uichan",
      sprint: "Sprint 1",
      storyPoints: 8,
      startDate: "2026-06-10",
      endDate: "2026-06-14",
      dueDate: "2026-06-14",
      documentId: "DOC-1",
      labels: ["mvp", "core-flow"],
      component: "Workspace",
      linkedIssueIds: ["IMC-102", "IMC-103"],
      subtasks: [
        { id: "IMC-101-1", title: "이슈 필드 스키마 확정", done: true },
        { id: "IMC-101-2", title: "연결 문서 자동 생성 규칙 정리", done: false }
      ],
      updatedAt: "2026-06-11",
      minutes: 90,
      pomodoros: 0,
      day: 0,
      start: 9,
      page: "요구사항, 결정 사항, 일정 배치, 집중 기록을 한 카드 안에서 연결합니다."
    },
    {
      id: "IMC-102",
      title: "JIRA식 이슈 카드 상세 패널 만들기",
      description: "이슈 타입, 담당자, 우선순위, 라벨, 스토리 포인트, 서브태스크를 한눈에 편집할 수 있는 패널을 구현합니다.",
      projectId: "prj-imc",
      category: "Design",
      issueType: "Story",
      status: "selected",
      priority: "High",
      assignee: "Mina",
      reporter: "Uichan",
      sprint: "Sprint 1",
      storyPoints: 5,
      startDate: "2026-06-11",
      endDate: "2026-06-13",
      dueDate: "2026-06-13",
      documentId: "DOC-2",
      labels: ["issue-view", "ux"],
      component: "Issue Detail",
      linkedIssueIds: ["IMC-101"],
      subtasks: [
        { id: "IMC-102-1", title: "카드 메타 정보 시각화", done: true },
        { id: "IMC-102-2", title: "필드 편집 컨트롤 추가", done: false }
      ],
      updatedAt: "2026-06-11",
      minutes: 75,
      pomodoros: 0,
      day: null,
      start: null,
      page: "카드 상세는 Confluence 스타일 문서와 JIRA 이슈 필드를 함께 보여줍니다."
    },
    {
      id: "IMC-103",
      title: "주간 플래너 드래그/리사이즈 안정화",
      description: "캘린더 시간 격자에 이슈 카드를 배치하고 카드 하단 핸들을 드래그해 작업 시간을 조정합니다.",
      projectId: "prj-mobile",
      category: "Development",
      issueType: "Task",
      status: "progress",
      priority: "High",
      assignee: "Joon",
      reporter: "Uichan",
      sprint: "Sprint 1",
      storyPoints: 5,
      startDate: "2026-06-12",
      endDate: "2026-06-15",
      dueDate: "2026-06-15",
      documentId: "DOC-3",
      labels: ["calendar", "drag-drop"],
      component: "Planner",
      linkedIssueIds: ["IMC-101"],
      subtasks: [
        { id: "IMC-103-1", title: "요일/시간 스냅 계산", done: true },
        { id: "IMC-103-2", title: "15분 단위 리사이즈", done: false }
      ],
      updatedAt: "2026-06-11",
      minutes: 120,
      pomodoros: 0,
      day: 2,
      start: 13,
      page: "JIRA 카드가 플래너의 시간 블록으로 변환되는 핵심 인터랙션입니다."
    },
    {
      id: "GRO-104",
      title: "뽀모도로 완료 후 실제 소요 시간 기록 오류",
      description: "집중 세션 종료 후 실제 집중 시간이 통계에 중복 반영되는 경우를 점검합니다.",
      projectId: "prj-growth",
      category: "Development",
      issueType: "Bug",
      status: "backlog",
      priority: "Medium",
      assignee: "Unassigned",
      reporter: "Uichan",
      sprint: "Backlog",
      storyPoints: 3,
      startDate: "2026-06-16",
      endDate: "2026-06-18",
      dueDate: "2026-06-18",
      documentId: "DOC-4",
      labels: ["timer", "analytics"],
      component: "Focus",
      linkedIssueIds: [],
      subtasks: [
        { id: "GRO-104-1", title: "재현 케이스 작성", done: false },
        { id: "GRO-104-2", title: "통계 계산 분리", done: false }
      ],
      updatedAt: "2026-06-11",
      minutes: 45,
      pomodoros: 0,
      day: null,
      start: null,
      page: "타이머 세션과 실제 소요 시간 기록 정책을 정리합니다."
    }
  ],
  docs: [
    {
      id: "DOC-1",
      title: "프로젝트 킥오프",
      category: "Product",
      projectId: "prj-imc",
      type: "markdown",
      body: "# 프로젝트 킥오프\n\n## 목표\n- 카드, 문서, 캘린더, 집중 타이머를 하나의 작업 흐름으로 연결\n- 프로젝트별 색상과 커스텀 이름 지원\n\n## 결정 사항\n- 티켓은 시작일/종료일/담당자/문서 링크를 가진다.\n- 문서는 Markdown 또는 Canvas 중 선택한다.",
      canvasElements: [],
      cardIds: ["IMC-101"]
    },
    {
      id: "DOC-2",
      title: "이슈 상세 UX 노트",
      category: "Design",
      projectId: "prj-imc",
      type: "canvas",
      body: "",
      canvasElements: [
        { id: "el-1", type: "rectangle", x: 70, y: 58, width: 170, height: 86, text: "Issue fields", color: "#0c66e4" },
        { id: "el-2", type: "note", x: 290, y: 70, width: 190, height: 98, text: "Markdown / Canvas doc 선택", color: "#f59e0b" },
        { id: "el-3", type: "diamond", x: 160, y: 205, width: 150, height: 92, text: "Open linked doc?", color: "#7c3aed" }
      ],
      cardIds: ["IMC-102"]
    },
    {
      id: "DOC-3",
      title: "플래너 구현 로그",
      category: "Development",
      projectId: "prj-mobile",
      type: "markdown",
      body: "# 플래너 구현 로그\n\n- 카드 이동 시 `grab` / `grabbing` 커서\n- 오른쪽 아래 리사이즈 핸들에서 `nwse-resize` 커서\n- 시간 블록은 15분 단위로 스냅",
      canvasElements: [],
      cardIds: ["IMC-103"]
    },
    {
      id: "DOC-4",
      title: "타이머 통계 버그",
      category: "Development",
      projectId: "prj-growth",
      type: "markdown",
      body: "# 타이머 통계 버그\n\n## 재현\n1. 티켓에서 타이머 시작\n2. 완료 전에 다른 티켓 선택\n3. 통계 반영 값 확인",
      canvasElements: [],
      cardIds: ["GRO-104"]
    }
  ]
};
