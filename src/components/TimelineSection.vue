<script setup>
import { ref } from 'vue'

const timelineEvents = ref([
  {
    date: '2025年11月22日',
    title: '❤️ 终成眷属，执手相伴',
    desc: '在这一天，羊狗 💖 亦雾安 正式确立恋爱关系。宇宙里从此少了两颗孤单旋转的尘埃，多了一对依偎的灵魂。'
  },
  {
    date: '2025年12月25日',
    title: '🎄 第一个圣诞节',
    desc: '闪烁的霓虹、热气腾腾的饮品，我们在漫冬的街角踩着厚雪。因为有你在身边，寒冬也温暖如春。'
  },
  {
    date: '2026年02月14日',
    title: '🍫 专属情人节浪漫',
    desc: '亲手写下的信件、精心挑选的礼物。不在于礼物的贵重，而是在于每一个用心为彼此准备的细节。'
  },
  {
    date: '2026年05月20日',
    title: '🌹 520 平凡大欢喜',
    desc: '大声表达爱意的日子。从相遇的怦然心动，到相处后的温柔包容，我们开始懂得，最浪漫的诗都写在平淡的柴米油盐里。'
  },
  {
    date: '相伴今天与未来',
    title: '🌸 岁岁常相见，朝朝共晚霞',
    desc: '时间还在一秒一秒地走，我们的故事还在继续谱写。期待以后的春华秋实，岁岁年年都有亦雾安和羊狗牵手走过。'
  }
])
</script>

<template>
  <div class="flex flex-col items-center justify-center px-5 w-full max-w-md mx-auto h-full select-none animate-fade-in py-10">
    <!-- 标题区 -->
    <div class="mb-3 shrink-0">
      <h2 class="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-2 justify-center">
        📖 时光纪念册
      </h2>
      <p class="text-[11px] text-rose-950/60 mt-0.5">我们的时间线，记录每一次怦然心动</p>
    </div>

    <!-- 滚动时间线卡片 -->
    <div class="glass-panel w-full rounded-3xl p-4 shadow-love flex-1 overflow-y-auto border border-white/50 relative" style="max-height: 58vh;">
      <div class="relative pl-6 border-l-2 border-dashed border-rose-300/60 space-y-5 py-1 text-left">

        <div
          v-for="(event, index) in timelineEvents"
          :key="index"
          class="relative animate-slide-up"
          :style="{ animationDelay: `${index * 150}ms` }"
        >
          <!-- 时间线圆点 -->
          <span class="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 border border-white shadow-sm">
            <span class="h-1.5 w-1.5 rounded-full bg-white animate-ping" v-if="index === timelineEvents.length - 1"></span>
            <span class="h-1.5 w-1.5 rounded-full bg-white" v-else></span>
          </span>

          <!-- 模块框 -->
          <div class="bg-white/40 backdrop-blur-sm rounded-xl p-2.5 border border-white/40 shadow-[0_2px_10px_rgba(244,63,94,0.02)]">
            <span class="inline-block text-[10px] font-bold text-rose-600/80 bg-rose-100/70 px-2 py-0.5 rounded-full mb-1 font-mono">
              {{ event.date }}
            </span>
            <h3 class="text-[11px] font-bold text-rose-950 mb-0.5">
              {{ event.title }}
            </h3>
            <p class="text-[10px] leading-relaxed text-rose-900/80">
              {{ event.desc }}
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- 滑动提示箭头 -->
    <div class="absolute bottom-10 flex flex-col items-center gap-1 opacity-60 animate-bounce">
      <span class="text-[10px] text-rose-950/50 uppercase tracking-widest font-semibold">向上滑动 档案馆</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-rose-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </div>
  </div>
</template>
