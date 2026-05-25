<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TimerSection from './components/TimerSection.vue'
import TimelineSection from './components/TimelineSection.vue'
import PreferencesSection from './components/PreferencesSection.vue'
import CouponsSection from './components/CouponsSection.vue'

// 音乐状态
const isPlaying = ref(false)
const audioRef = ref(null)
const showMusicPlayer = ref(false)
const musicUrl = ref('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.warn('播放失败，可能由于浏览器安全策略限制，需用户交互：', err)
    })
  }
}

// 侧边导航指示器
const activeIndex = ref(0)
const sections = ['timer', 'timeline', 'preferences', 'coupons']

const scrollToSection = (index) => {
  const el = document.getElementById(sections[index])
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    activeIndex.value = index
  }
}

// 滚动监听，实时更新右侧导航点高亮
const handleScroll = (e) => {
  const container = e.target
  const scrollTop = container.scrollTop
  const height = container.clientHeight
  const index = Math.round(scrollTop / height)
  if (index >= 0 && index < sections.length) {
    activeIndex.value = index
  }
}

// Canvas 爱心粒子飘落动效
let canvas = null
let ctx = null
let animationFrameId = null
const hearts = []
const maxHearts = 35

class Heart {
  constructor() {
    this.reset()
  }

  reset() {
    this.x = Math.random() * canvas.width
    this.y = canvas.height + Math.random() * 50
    this.size = Math.random() * 8 + 6
    this.speedY = -(Math.random() * 0.8 + 0.4)
    this.speedX = Math.random() * 0.4 - 0.2
    this.alpha = Math.random() * 0.5 + 0.3
    this.decay = Math.random() * 0.002 + 0.001
  }

  update() {
    this.y += this.speedY
    this.x += this.speedX
    this.alpha -= this.decay

    if (this.y < -20 || this.alpha <= 0) {
      this.reset()
    }
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = '#fca5a5'
    ctx.beginPath()

    const x = this.x
    const y = this.y
    const size = this.size

    ctx.moveTo(x, y + size / 4)
    ctx.quadraticCurveTo(x, y, x + size / 2, y)
    ctx.quadraticCurveTo(x + size, y, x + size, y + size / 3)
    ctx.quadraticCurveTo(x + size, y + (size * 2) / 3, x + size / 2, y + size)
    ctx.quadraticCurveTo(x, y + (size * 2) / 3, x, y + size / 3)
    ctx.quadraticCurveTo(x, y, x, y + size / 4)

    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

const initCanvas = () => {
  canvas = document.getElementById('canvas-hearts')
  if (!canvas) return
  ctx = canvas.getContext('2d')

  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  for (let i = 0; i < maxHearts; i++) {
    hearts.push(new Heart())
    hearts[i].y = Math.random() * canvas.height
  }

  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < hearts.length; i++) {
      hearts[i].update()
      hearts[i].draw()
    }
    animationFrameId = requestAnimationFrame(loop)
  }

  loop()
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', () => {})
})
</script>

<template>
  <div class="relative w-full h-screen h-dvh overflow-hidden select-none bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
    <!-- 1. 全局 Canvas 背景层 (心形粒子缓缓上升) -->
    <canvas id="canvas-hearts" class="absolute inset-0 z-0 pointer-events-none w-full h-full"></canvas>

    <!-- 2. 全局背景音乐播放器 (右上角 CD 悬浮按钮) -->
    <div v-if="showMusicPlayer" class="absolute z-40 music-player-btn">
      <button
        @click="togglePlay"
        class="w-11 h-11 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-love flex items-center justify-center transition-all duration-500 active:scale-90"
        :class="{ 'animate-spin': isPlaying }"
        style="animation-duration: 8s;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
             class="w-5 h-5 text-rose-500" :class="{ 'animate-pulse': isPlaying }">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 0v11.25M19.5 6l-10.5 3m0 0v11.25m0-11.25L3 12m0 0v6.75m0-6.75l6.75-2.25M3 18.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM19.5 17.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </button>
      <audio ref="audioRef" :src="musicUrl" loop preload="auto" class="hidden"></audio>
    </div>

    <!-- 3. 右侧极简悬浮导航点 (移动端交互) -->
    <div class="absolute top-[50%] -translate-y-1/2 flex flex-col gap-3.5 z-40 side-nav-dots">
      <button
        v-for="(sec, idx) in sections"
        :key="sec"
        @click="scrollToSection(idx)"
        class="w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm border border-rose-300/30"
        :class="[activeIndex === idx ? 'bg-rose-500 scale-125 w-4 rounded-lg' : 'bg-rose-300/40']"
      ></button>
    </div>

    <!-- 4. 滑动容器 (Snap-Scrolling 满屏滚动) -->
    <main
      @scroll="handleScroll"
      class="snap-container relative z-10 w-full"
    >
      <!-- 滑动 Slide 1：浪漫计时器 -->
      <section id="timer" class="snap-section">
        <TimerSection />
      </section>

      <!-- 滑动 Slide 2：时光小轴 -->
      <section id="timeline" class="snap-section">
        <TimelineSection />
      </section>

      <!-- 滑动 Slide 3：她的专属档案 -->
      <section id="preferences" class="snap-section">
        <PreferencesSection />
      </section>

      <!-- 滑动 Slide 4：甜蜜兑换券 -->
      <section id="coupons" class="snap-section">
        <CouponsSection />
      </section>
    </main>
  </div>
</template>
