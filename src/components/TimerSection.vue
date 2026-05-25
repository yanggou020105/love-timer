<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '../supabase'

// 恋爱纪念日：2025年11月22日 00:00:00
const ANNIVERSARY_DATE = new Date('2025-11-22T00:00:00')

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let timerId = null

const calculateTime = () => {
  const now = new Date()
  const diff = now.getTime() - ANNIVERSARY_DATE.getTime()

  if (diff < 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    return
  }

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff / (1000 * 60 * 60)) % 24)
  minutes.value = Math.floor((diff / (1000 * 60)) % 60)
  seconds.value = Math.floor((diff / 1000) % 60)
}

// 头像上传
const boyAvatar = ref(null)
const girlAvatar = ref(null)
const boyInput = ref(null)
const girlInput = ref(null)

const loadAvatars = () => {
  // 云端优先
  if (db.getAvatarUrl) {
    const boyUrl = db.getAvatarUrl('boy.jpg')
    const girlUrl = db.getAvatarUrl('girl.jpg')
    if (boyUrl) boyAvatar.value = boyUrl
    if (girlUrl) girlAvatar.value = girlUrl
  }
  // 本地兜底
  if (!boyAvatar.value) boyAvatar.value = localStorage.getItem('love_avatar_boy')
  if (!girlAvatar.value) girlAvatar.value = localStorage.getItem('love_avatar_girl')
}

const handleUpload = async (role, event) => {
  const file = event.target.files[0]
  if (!file) return
  const filename = role === 'boy' ? 'boy.jpg' : 'girl.jpg'

  // 同时存本地和云端
  const reader = new FileReader()
  reader.onload = async (e) => {
    const dataUrl = e.target.result
    if (role === 'boy') {
      boyAvatar.value = dataUrl
      localStorage.setItem('love_avatar_boy', dataUrl)
    } else {
      girlAvatar.value = dataUrl
      localStorage.setItem('love_avatar_girl', dataUrl)
    }
    // 上传云端
    const cloudUrl = await db.uploadAvatar(file, filename)
    if (cloudUrl) {
      if (role === 'boy') boyAvatar.value = cloudUrl
      else girlAvatar.value = cloudUrl
    }
  }
  reader.readAsDataURL(file)
}

// 天气与穿衣建议
const weather = ref(null)
const weatherLoading = ref(true)

const weatherIcons = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️',
  80: '🌦️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

const getClothing = (temp, code) => {
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]
  const snowCodes = [71, 73, 75]
  const needUmbrella = rainCodes.includes(code)
  const needSnowGear = snowCodes.includes(code)

  let clothing = ''
  if (temp >= 30) clothing = '短袖短裤，注意防晒 ☀️'
  else if (temp >= 25) clothing = '短袖/薄裙，带上防晒 🧴'
  else if (temp >= 20) clothing = '薄长袖/连衣裙，舒适宜人 🌿'
  else if (temp >= 15) clothing = '薄外套/卫衣，刚刚好 🍂'
  else if (temp >= 10) clothing = '外套/风衣，注意保暖 🧥'
  else if (temp >= 5) clothing = '厚外套/毛衣，要暖和 🧣'
  else if (temp >= 0) clothing = '羽绒服/棉衣，裹紧一点 ❄️'
  else clothing = '厚羽绒服+围巾手套，超冷 🥶'

  if (needSnowGear) clothing += ' | 穿防滑鞋 👢'
  if (needUmbrella) clothing += ' | 记得带伞 ☂️'

  return clothing
}

const fetchWeather = async (lat, lon, cityName) => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    )
    const data = await res.json()
    const temp = Math.round(data.current.temperature_2m)
    const code = data.current.weather_code
    weather.value = {
      temp,
      icon: weatherIcons[code] || '🌡️',
      clothing: getClothing(temp, code),
      city: cityName || '',
    }
  } catch {
    weather.value = null
  } finally {
    weatherLoading.value = false
  }
}

const reverseGeocode = async (lat, lon) => {
  // 优先用 BigDataCloud（CORS 友好，免费）
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    )
    const data = await res.json()
    if (data.city) return data.city
    if (data.locality) return data.locality
    const admin = data.principalSubdivision || data.adminArea || ''
    if (admin) return admin
  } catch { /* fall through */ }

  // 备用：Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=zh`
    )
    const data = await res.json()
    const addr = data.address || {}
    return addr.city || addr.town || addr.county || addr.district || addr.state || addr.province || ''
  } catch {
    return ''
  }
}

const getWeatherByCity = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data.latitude) {
      const city = data.city || data.region || data.country_name || ''
      await fetchWeather(data.latitude, data.longitude, city)
    } else {
      weatherLoading.value = false
    }
  } catch {
    weatherLoading.value = false
  }
}

const loadWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        await fetchWeather(pos.coords.latitude, pos.coords.longitude, city)
      },
      () => getWeatherByCity(),
      { timeout: 5000 }
    )
  } else {
    getWeatherByCity()
  }
}

onMounted(() => {
  loadAvatars()
  loadWeather()
  calculateTime()
  timerId = setInterval(calculateTime, 1000)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center px-5 w-full max-w-md mx-auto text-center select-none animate-fade-in">
    <!-- 隐藏的文件上传 input -->
    <input ref="boyInput" type="file" accept="image/*" class="hidden" @change="handleUpload('boy', $event)" />
    <input ref="girlInput" type="file" accept="image/*" class="hidden" @change="handleUpload('girl', $event)" />

    <!-- 页面标题 -->
    <div class="relative mb-2">
      <h1 class="relative z-10 text-xl font-extrabold bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent tracking-wide animate-shimmer bg-[length:200%_auto]">
        🏠 羊狗和亦雾安的小家
      </h1>
      <div class="absolute inset-0 -top-1 -bottom-1 bg-gradient-to-r from-rose-400/0 via-pink-400/20 to-rose-400/0 blur-xl rounded-full animate-pulse"></div>
      <span class="absolute -top-1 -left-2 text-xs animate-float-star" style="animation-delay: 0s;">✨</span>
      <span class="absolute -top-2 right-1 text-[10px] animate-float-star" style="animation-delay: 0.8s;">💕</span>
      <span class="absolute -bottom-0 -right-3 text-[10px] animate-float-star" style="animation-delay: 1.6s;">🌟</span>
      <span class="absolute top-2 -left-4 text-[8px] animate-float-star" style="animation-delay: 2.4s;">💖</span>
      <span class="absolute -top-3 right-6 text-[8px] animate-float-star" style="animation-delay: 3.2s;">✨</span>
    </div>

    <!-- 顶部甜蜜头像和爱心 -->
    <div class="relative flex items-center justify-center gap-5 mb-4">
      <button
        @click="boyInput.click()"
        class="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden transform hover:scale-110 transition duration-300 bg-pink-100 flex items-center justify-center"
      >
        <img v-if="boyAvatar" :src="boyAvatar" class="w-full h-full object-cover" alt="羊狗" />
        <span v-else class="font-bold text-base text-pink-500">🐑</span>
      </button>

      <div class="relative animate-heartbeat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9 text-rose-500 drop-shadow-md">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
        </span>
      </div>

      <button
        @click="girlInput.click()"
        class="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden transform hover:scale-110 transition duration-300 bg-rose-100 flex items-center justify-center"
      >
        <img v-if="girlAvatar" :src="girlAvatar" class="w-full h-full object-cover" alt="亦雾安" />
        <span v-else class="font-bold text-base text-rose-500">☁️</span>
      </button>
    </div>

    <!-- 今日天气卡片 -->
    <div
      v-if="weather"
      class="glass-panel w-full rounded-2xl px-4 py-3 mb-3 shadow-sm border border-white/40 animate-slide-up"
      style="animation-delay: 200ms;"
    >
      <div class="flex items-start gap-3">
        <div class="flex flex-col items-center shrink-0">
          <span class="text-xl leading-none">{{ weather.icon }}</span>
          <span class="text-[10px] text-rose-900/50 mt-0.5" v-if="weather.city">{{ weather.city }}</span>
        </div>
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <span class="text-base font-bold text-rose-800 leading-none">{{ weather.temp }}°C</span>
          <p class="text-[11px] text-rose-900/70 leading-relaxed">
            {{ weather.clothing }}
          </p>
        </div>
      </div>
    </div>
    <div
      v-else-if="weatherLoading"
      class="glass-panel w-full rounded-2xl px-4 py-3 mb-3 shadow-sm border border-white/40 text-[11px] text-rose-900/40"
    >
      🌍 正在获取天气...
    </div>

    <!-- 核心计时器卡片 -->
    <div class="glass-panel w-full rounded-3xl p-5 shadow-love animate-slide-up border border-white/50">
      <h2 class="text-sm font-semibold tracking-widest text-rose-700/80 uppercase mb-2">
        💕 我们已经在一起
      </h2>

      <div class="flex items-baseline justify-center mb-5">
        <span class="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent transform scale-105 transition-all duration-500">
          {{ days }}
        </span>
        <span class="text-lg font-medium text-rose-950 ml-1">天</span>
      </div>

      <div class="grid grid-cols-3 gap-2.5 mb-5">
        <div class="bg-white/40 backdrop-blur-md rounded-xl p-2.5 border border-white/40 flex flex-col items-center">
          <span class="text-xl font-bold font-mono text-rose-800">{{ String(hours).padStart(2, '0') }}</span>
          <span class="text-[10px] text-rose-950/60 mt-0.5">小时</span>
        </div>
        <div class="bg-white/40 backdrop-blur-md rounded-xl p-2.5 border border-white/40 flex flex-col items-center">
          <span class="text-xl font-bold font-mono text-rose-800">{{ String(minutes).padStart(2, '0') }}</span>
          <span class="text-[10px] text-rose-950/60 mt-0.5">分钟</span>
        </div>
        <div class="bg-white/40 backdrop-blur-md rounded-xl p-2.5 border border-white/40 flex flex-col items-center relative overflow-hidden">
          <span class="text-xl font-bold font-mono text-pink-600 transition-all duration-300 animate-pulse">{{ String(seconds).padStart(2, '0') }}</span>
          <span class="text-[10px] text-rose-950/60 mt-0.5">秒</span>
        </div>
      </div>

      <p class="text-[11px] leading-relaxed text-rose-900/80 px-2 italic font-serif">
        "从 2025年11月22日 开始，<br>
        这一路风景，因为有你而变得温柔且灿烂。"
      </p>
    </div>

    <!-- 滑动提示箭头 -->
    <div class="absolute bottom-10 flex flex-col items-center gap-1 opacity-60 animate-bounce">
      <span class="text-[10px] text-rose-950/50 uppercase tracking-widest font-semibold">向上滑动 开启回忆</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-rose-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </div>
  </div>
</template>
