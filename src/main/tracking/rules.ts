import type { CategoryId } from '../../shared/categories'

/**
 * 观时分类规则（关键字均小写匹配）。
 * - titleRules 优先于 appRules：浏览器里看 B 站算「娱乐」，看 GitHub 算「工作」。
 * - 可按需增删；后续可做成用户可编辑的配置。
 */

export interface KeywordRules {
  /** 命中窗口标题关键字 → 直接归类（优先级最高） */
  titleRules: Partial<Record<CategoryId, string[]>>
  /** 命中应用名关键字 → 归类 */
  appRules: Partial<Record<CategoryId, string[]>>
}

export const DEFAULT_RULES: KeywordRules = {
  titleRules: {
    fun: [
      'youtube',
      'bilibili',
      '哔哩哔哩',
      'netflix',
      '抖音',
      'tiktok',
      '优酷',
      '爱奇艺',
      '腾讯视频',
      'twitch',
      '网易云',
      '小红书',
      '微博'
    ],
    work: [
      'github',
      'gitlab',
      'stack overflow',
      'jira',
      'confluence',
      'notion',
      'figma',
      'localhost',
      'mdn',
      'leetcode',
      'docs.',
      'overleaf'
    ],
    comm: ['gmail', 'outlook', '邮箱', 'webmail', 'mail.', 'slack', 'teams']
  },
  appRules: {
    work: [
      'code', // Visual Studio Code
      'xcode',
      'terminal',
      'iterm',
      'warp',
      'intellij',
      'pycharm',
      'webstorm',
      'goland',
      'datagrip',
      'android studio',
      'sublime text',
      'nova',
      'cursor',
      'figma',
      'sketch',
      'typora',
      'obsidian',
      'logseq',
      'notion',
      'wps',
      'microsoft word',
      'microsoft excel',
      'microsoft powerpoint',
      'pages',
      'numbers',
      'keynote',
      'preview',
      'tableplus',
      'postman'
    ],
    comm: [
      'wechat',
      '微信',
      '企业微信',
      'wecom',
      'qq',
      'dingtalk',
      '钉钉',
      'lark',
      '飞书',
      'slack',
      'mail',
      'messages',
      '信息',
      'telegram',
      'discord',
      'zoom',
      'microsoft teams',
      'facetime',
      'skype'
    ],
    browse: ['safari', 'google chrome', 'chrome', 'microsoft edge', 'firefox', 'arc', 'brave', 'opera'],
    fun: [
      'music',
      '网易云音乐',
      'neteasemusic',
      'qq音乐',
      'qqmusic',
      'spotify',
      'bilibili',
      '哔哩哔哩',
      'iina',
      'quicktime',
      'vlc',
      'steam',
      'tiktok',
      '抖音',
      '爱奇艺',
      '腾讯视频',
      '优酷',
      'douyin'
    ]
  }
}
