<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../supabase'

const preferences = ref([])
const isLoading = ref(true)
const editingId = ref(null)
const tempValue = ref('')
const isSaving = ref(false)

const loadData = async () => {
  isLoading.value = true
  preferences.value = await db.getPreferences()
  isLoading.value = false
}

const startEdit = (item) => {
  editingId.value = item.id
  tempValue.value = item.value
}

const cancelEdit = () => {
  editingId.value = null
  tempValue.value = ''
}

const saveEdit = async (id) => {
  isSaving.value = true
  const success = await db.savePreference(id, tempValue.value)
  if (success) {
    const item = preferences.value.find(p => p.id === id)
    if (item) {
      item.value = tempValue.value
    }
  }
  editingId.value = null
  isSaving.value = false
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center px-5 w-full max-w-md mx-auto h-full select-none animate-fade-in py-10">
    <!-- 标题区 -->
    <div class="mb-3 shrink-0">
      <h2 class="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent flex items-center gap-2 justify-center">
        ☁️ 亦雾安的专属档案馆
      </h2>
      <p class="text-[11px] text-rose-950/60 mt-0.5">记录她的小偏好，随时查阅，拒绝踩雷</p>
    </div>

    <!-- 档案容器 -->
    <div class="glass-panel w-full rounded-3xl p-4 shadow-love flex-1 overflow-y-auto border border-white/50 relative" style="max-height: 58vh;">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-48 gap-2">
        <svg class="animate-bounce w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span class="text-xs text-rose-950/40">翻阅小本本中...</span>
      </div>

      <div v-else class="space-y-3 py-1">
        <div
          v-for="item in preferences"
          :key="item.id"
          class="bg-white/40 backdrop-blur-md rounded-2xl p-3.5 border border-white/40 shadow-sm relative transition duration-300 hover:bg-white/50"
        >
          <!-- 编辑按钮 (在非编辑状态下显示) -->
          <button
            v-if="editingId !== item.id"
            @click="startEdit(item)"
            class="absolute top-3 right-3 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 p-1.5 rounded-full transition duration-300 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </button>

          <!-- 展示状态 -->
          <div v-if="editingId !== item.id" class="text-left">
            <h3 class="text-xs font-bold text-rose-950 flex items-center gap-1.5 mb-1">
              {{ item.label }}
            </h3>
            <p class="text-[11px] text-rose-900 leading-relaxed bg-rose-100/20 px-3 py-2 rounded-xl border border-rose-200/20 font-medium">
              {{ item.value }}
            </p>
          </div>

          <!-- 编辑状态 -->
          <div v-else class="text-left animate-fade-in">
            <h3 class="text-xs font-bold text-rose-950 flex items-center gap-1.5 mb-2">
              📝 正在修改 - {{ item.label }}
            </h3>
            <textarea
              v-model="tempValue"
              class="w-full text-[11px] text-rose-900 leading-relaxed bg-white/70 px-3 py-2.5 rounded-xl border border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 resize-none h-16 shadow-inner font-medium"
              placeholder="请输入新的记录..."
            ></textarea>

            <div class="flex justify-end gap-2 mt-2">
              <button
                @click="cancelEdit"
                class="px-2.5 py-1 text-[10px] font-semibold text-rose-950/60 hover:text-rose-950 hover:bg-rose-50 rounded-lg border border-rose-200/50 transition duration-300"
              >
                取消
              </button>
              <button
                @click="saveEdit(item.id)"
                :disabled="isSaving"
                class="px-3 py-1 text-[10px] font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg flex items-center gap-1 transition duration-300 shadow-sm disabled:opacity-50"
              >
                <span v-if="isSaving" class="animate-spin h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full"></span>
                <span>{{ isSaving ? '保存中...' : '💾 保存' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 滑动提示箭头 -->
    <div class="absolute bottom-10 flex flex-col items-center gap-1 opacity-60 animate-bounce">
      <span class="text-[10px] text-rose-950/50 uppercase tracking-widest font-semibold">向上滑动 兑换券</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-rose-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </div>
  </div>
</template>
