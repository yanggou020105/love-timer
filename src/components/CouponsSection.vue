<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../supabase'

const coupons = ref([])
const isLoading = ref(true)
const activeCoupon = ref(null)
const showModal = ref(false)

const loadCoupons = async () => {
  isLoading.value = true
  coupons.value = await db.getCoupons()
  isLoading.value = false
}

const redeem = async (coupon) => {
  if (coupon.isRedeemed) return

  const result = await db.redeemCoupon(coupon.id)
  if (result.isRedeemed) {
    coupon.isRedeemed = true
    coupon.time = result.time
    activeCoupon.value = coupon
    showModal.value = true
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center px-5 w-full max-w-md mx-auto h-full select-none animate-fade-in py-10 relative">
    <!-- 标题区 -->
    <div class="mb-3 shrink-0">
      <h2 class="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-2 justify-center">
        🎫 甜蜜兑换券
      </h2>
      <p class="text-[11px] text-rose-950/60 mt-0.5">羊狗的专属承诺，亦雾安持券即可一键索权</p>
    </div>

    <!-- 兑换券容器 -->
    <div class="glass-panel w-full rounded-3xl p-4 shadow-love flex-1 overflow-y-auto border border-white/50 space-y-3" style="max-height: 58vh;">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-48 gap-2">
        <svg class="animate-bounce w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <span class="text-xs text-rose-950/40">正在搜寻口袋里的兑换券...</span>
      </div>

      <div v-else class="space-y-3 py-1">
        <!-- 兑换券卡片 -->
        <div
          v-for="coupon in coupons"
          :key="coupon.id"
          @click="redeem(coupon)"
          class="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r p-[1px] shadow-sm transition duration-300 transform active:scale-95"
          :class="[
            coupon.isRedeemed
              ? 'from-gray-300 to-gray-400 cursor-not-allowed opacity-75'
              : 'from-pink-400 via-rose-400 to-rose-500 hover:-translate-y-0.5 cursor-pointer shadow-love-hover'
          ]"
        >
          <!-- 磨砂玻璃卡面 -->
          <div class="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3.5 flex items-center justify-between relative overflow-hidden">

            <!-- 优惠券边缘切口设计（Ticket Cutout） -->
            <div class="absolute -left-3 top-[50%] -translate-y-1/2 w-6 h-6 rounded-full bg-pink-100 border-r border-rose-300/20"></div>
            <div class="absolute -right-3 top-[50%] -translate-y-1/2 w-6 h-6 rounded-full bg-pink-100 border-l border-rose-300/20"></div>

            <div class="text-left flex-1 px-4">
              <h3 class="text-sm font-bold text-rose-950 mb-1" :class="{ 'line-through text-gray-500': coupon.isRedeemed }">
                {{ coupon.title }}
              </h3>
              <p class="text-[10px] leading-relaxed text-rose-900/70">
                {{ coupon.description }}
              </p>
              <p v-if="coupon.isRedeemed" class="text-[9px] text-gray-400 mt-1 font-mono">
                兑换于：{{ coupon.time }}
              </p>
            </div>

            <!-- 右侧印章/按钮区 -->
            <div class="flex flex-col items-center justify-center pl-2 border-l border-dashed border-rose-300/40 min-w-[70px]">
              <div v-if="!coupon.isRedeemed" class="text-center">
                <span class="text-[10px] font-bold text-rose-500 bg-rose-100 px-2 py-1 rounded-full animate-pulse shadow-sm">
                  点击使用
                </span>
              </div>
              <div v-else class="text-center relative">
                <!-- 红色复古盖章印记（USED） -->
                <div class="border-2 border-dashed border-rose-600/80 text-rose-600/80 rounded-full font-bold text-[10px] py-1 px-2 uppercase tracking-widest font-mono transform -rotate-12 shadow-sm">
                  已兑换
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 兑换成功弹窗 -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
      @click="showModal = false"
    >
      <div
        class="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white text-center transform scale-100 transition duration-300 select-none animate-slide-up"
        @click.stop
      >
        <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-heartbeat shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-rose-500">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>

        <h3 class="text-base font-extrabold text-rose-950 mb-2">🎉 索权兑换成功！</h3>
        <p class="text-xs text-rose-900 leading-relaxed px-2 mb-4">
          亦雾安成功兑换了：<br>
          <strong class="text-sm font-bold text-rose-600 block my-1">「 {{ activeCoupon?.title }} 」</strong>
          快去截图发送给**羊狗**，要求立刻履行承诺吧！
        </p>

        <div class="bg-rose-50/50 border border-rose-200/50 rounded-2xl p-3 mb-5 text-[10px] font-mono text-rose-800/80">
          <div>证书编号：LOVE-{{ activeCoupon?.id }}-{{ Date.now().toString().slice(-6) }}</div>
          <div>验证时间：{{ activeCoupon?.time }}</div>
        </div>

        <button
          @click="showModal = false"
          class="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold text-xs shadow-md transition duration-300"
        >
          我知道啦
        </button>
      </div>
    </div>
  </div>
</template>
