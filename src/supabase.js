import { createClient } from '@supabase/supabase-js'

// 从 Vite 环境变量中读取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 检查是否配置了 Supabase 环境变量
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * 统一的数据管理驱动（支持 Supabase 云存储与 LocalStorage 本地降级）
 * 这样即使用户没有配数据库，网页在本地依然可以完美运转和测试！
 */
export const db = {
  // --- 1. 她的档案数据接口 ---
  async getPreferences() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('preferences')
          .select('*')
          .order('id', { ascending: true })
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('读取 Supabase 失败，正在降级使用 LocalStorage:', err)
      }
    }

    // 本地缓存读取
    const local = localStorage.getItem('love_preferences')
    if (local) {
      return JSON.parse(local)
    }
    
    // 默认初始配置（带女友“亦雾安”和男友“羊狗”的相关预设）
    const defaultData = [
      { id: 1, key: 'tea', label: '🧋 奶茶偏好', value: '乌龙奶茶 / 五分糖 / 去冰 / 加珍珠' },
      { id: 2, key: 'food', label: '🍲 最爱美食', value: '番茄小火锅、芝士草莓、章鱼小丸子' },
      { id: 3, key: 'hate', label: '🚫 避雷食物', value: '香菜、折耳根、大蒜、极辣' },
      { id: 4, key: 'sizes', label: '💍 穿戴尺寸', value: '鞋码 37 / 戒指指围 12 号' },
      { id: 5, key: 'wishlist', label: '🎁 愿望清单', value: '拍立得相纸、去海边看日落、一起养只猫' }
    ]
    localStorage.setItem('love_preferences', JSON.stringify(defaultData))
    return defaultData
  },

  async savePreference(id, value) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('preferences')
          .update({ value })
          .eq('id', id)
        if (!error) return true
      } catch (err) {
        console.warn('更新 Supabase 失败，正在降级保存至本地:', err)
      }
    }

    // 本地缓存更新
    const current = await this.getPreferences()
    const item = current.find(p => p.id === id)
    if (item) {
      item.value = value
      localStorage.setItem('love_preferences', JSON.stringify(current))
    }
    return true
  },

  // --- 2. 恋爱兑换券数据接口 ---
  async getCoupons() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('id', { ascending: true })
        if (!error && data && data.length > 0) {
          return data
        }
      } catch (err) {
        console.warn('读取 Supabase 兑换券失败，使用 LocalStorage:', err)
      }
    }

    const local = localStorage.getItem('love_coupons')
    if (local) {
      return JSON.parse(local)
    }

    const defaultCoupons = [
      { id: 1, title: '🧹 绝不洗碗券', description: '使用后免除一次洗碗义务！羊狗会无条件麻溜代劳！', isRedeemed: false, time: null },
      { id: 2, title: '🧋 奶茶续命券', description: '召唤一杯最爱喝的奶茶，羊狗必须在 1 小时内点好外卖或送达！', isRedeemed: false, time: null },
      { id: 3, title: '💖 立刻和好券', description: '吵架时的一键和好神器，羊狗必须立刻停止傲娇，无条件哄亦雾安开心！', isRedeemed: false, time: null }
    ]
    localStorage.setItem('love_coupons', JSON.stringify(defaultCoupons))
    return defaultCoupons
  },

  async redeemCoupon(id) {
    const timeString = new Date().toLocaleString('zh-CN', { hour12: false })
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('coupons')
          .update({ isRedeemed: true, time: timeString })
          .eq('id', id)
        if (!error) return { isRedeemed: true, time: timeString }
      } catch (err) {
        console.warn('兑换券 Supabase 状态更新失败，保存至本地:', err)
      }
    }

    const current = await this.getCoupons()
    const item = current.find(c => c.id === id)
    if (item) {
      item.isRedeemed = true
      item.time = timeString
      localStorage.setItem('love_coupons', JSON.stringify(current))
    }
    return { isRedeemed: true, time: timeString }
  }
}
