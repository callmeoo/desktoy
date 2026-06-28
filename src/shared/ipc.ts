/** IPC 通道名集中定义，避免 main / preload 两侧拼写漂移。 */
export const IPC = {
  // renderer → main (invoke)
  observeGetToday: 'observe:getToday',
  tasksGetToday: 'tasks:getToday',
  tasksSaveToday: 'tasks:saveToday',
  tasksToggleTodo: 'tasks:toggleTodo',
  qiGet: 'qi:get',
  meditationComplete: 'meditation:complete',
  heartReply: 'heart:reply',
  snapshotGet: 'snapshot:get',

  // renderer → main (send)
  petMove: 'pet:move',
  petSetState: 'pet:setState',
  petResetState: 'pet:resetState',
  petSetExpanded: 'pet:setExpanded',
  navOpen: 'nav:open',
  panelHide: 'panel:hide',
  appQuit: 'app:quit',

  // main → renderer (send)
  onPetState: 'evt:petState',
  onNavigate: 'evt:navigate',
  onMorningPrompt: 'evt:morningPrompt'
} as const
