import type { HeartMode, HeartReply } from '../shared/types'

interface ScriptNode {
  text: string
  options: string[]
}

/**
 * 清心：第一版用固定引导文案。
 * 之后接 AI 时，只需把 getHeartReply 换成调用模型，保持 (mode, step, message) → HeartReply 的契约即可。
 */
const SCRIPTS: Record<HeartMode, ScriptNode[]> = {
  vent: [
    {
      text: '嗯，我在呢。把堵在心口的那口气，慢慢说给我听，不必有头有尾。',
      options: ['其实是……', '我也说不清']
    },
    {
      text: '听见了。这确实让人难受——你愿意说出来，已经是在把它放下。还有想倒的，尽管倒。',
      options: ['还有一些', '好像轻了点']
    },
    {
      text: '辛苦你了。烦恼如尘，拂一拂便散。深吸一口气……再缓缓呼出去。我一直都在。',
      options: ['谢谢你', '嗯，好多了']
    }
  ],
  calm: [
    {
      text: '好，我们一起静下来。先松开肩膀，跟我做一次深呼吸：吸气……数四拍。',
      options: ['吸气', '继续']
    },
    {
      text: '屏息……两拍。然后缓缓呼出……六拍，把杂念随这口气一并送走。',
      options: ['再来一次', '好些了']
    },
    {
      text: '心如止水，自照清明。你做得很好，此刻的你，已经回到了自己身边。',
      options: ['谢谢', '我准备好了']
    }
  ],
  cheer: [
    {
      text: '抬头看看我——你远比自己以为的要坚韧。这一程，你已经走了好远了。',
      options: ['真的吗', '我有点累']
    },
    {
      text: '真的。修行从不在一日之功，你今天仍愿意继续，这本身就很了不起。',
      options: ['谢谢你', '我再试试']
    },
    {
      text: '去吧，清风在你身后。无论结果如何，我都在这儿，备好茶等你回来。',
      options: ['这就去', '嗯！']
    }
  ]
}

export function getHeartReply(mode: HeartMode, step: number, _message: string): HeartReply {
  const script = SCRIPTS[mode] ?? SCRIPTS.vent
  const idx = Math.max(0, Math.min(step, script.length - 1))
  const node = script[idx]
  const done = idx >= script.length - 1
  return { text: node.text, options: node.options, done }
}
