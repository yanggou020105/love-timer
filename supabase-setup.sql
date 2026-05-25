-- 1. 她的偏好档案表
CREATE TABLE preferences (
  id BIGINT PRIMARY KEY,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL
);

INSERT INTO preferences (id, key, label, value) VALUES
(1, 'tea', '🧋 奶茶偏好', '乌龙奶茶 / 五分糖 / 去冰 / 加珍珠'),
(2, 'food', '🍲 最爱美食', '番茄小火锅、芝士草莓、章鱼小丸子'),
(3, 'hate', '🚫 避雷食物', '香菜、折耳根、大蒜、极辣'),
(4, 'sizes', '💍 穿戴尺寸', '鞋码 37 / 戒指指围 12 号'),
(5, 'wishlist', '🎁 愿望清单', '拍立得相纸、去海边看日落、一起养只猫');

-- 2. 甜蜜兑换券状态表
CREATE TABLE coupons (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "isRedeemed" BOOLEAN DEFAULT false,
  time TEXT
);

INSERT INTO coupons (id, title, description, "isRedeemed", time) VALUES
(1, '🧹 绝不洗碗券', '使用后免除一次洗碗义务！羊狗会无条件麻溜代劳！', false, null),
(2, '🧋 奶茶续命券', '召唤一杯最爱喝的奶茶，羊狗必须在 1 小时内点好外卖或送达！', false, null),
(3, '💖 立刻和好券', '吵架时的一键和好神器，羊狗必须立刻停止傲娇，无条件哄亦雾安开心！', false, null);

-- 3. 创建头像存储 Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 允许公开读取头像
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 允许所有人上传头像
CREATE POLICY "Anyone upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- 允许所有人更新头像
CREATE POLICY "Anyone update avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');
