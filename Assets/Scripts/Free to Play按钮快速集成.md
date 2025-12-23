# Free to Play 按钮 - 快速集成指南

## 🚀 5分钟快速开始

### Step 1: 创建UI按钮

1. **创建按钮**
   - Hierarchy → 右键 → `UI` → `Button`
   - 重命名为 `FreeToPlayButton`
   - 调整位置到**屏幕底部中央**

2. **调整样式**
   - Width: 250，Height: 70
   - 文本改为 "Free to Play"
   - 字体大小：28-32
   - 背景颜色：亮黄色或绿色

### Step 2: 添加脚本

1. **选中按钮** → Inspector → `Add Component`
2. 搜索 `FreeToPlayButton` → 添加
3. 脚本会自动查找 `StoreNavigator`（如果没有会自动创建）

### Step 3: 配置商店信息

找到场景中的 `StoreNavigator` 对象：

```
Use Runtime Platform Detection: ✅ true

【必填】
Ios App Id: 你的iOS应用ID（例如：1234567890）
Android Package Name: 你的Android包名（例如：com.company.game）

【可选】
Fallback Web Store Url: 备用网页链接
```

### Step 4: 配置 Luna External Sources

⚠️ **Luna Playable 必须执行此步骤！**

1. 打开 **Luna Playworks** 插件
2. 导航到 **Code** → **External Sources**
3. 点击 `+` 添加文件
4. 选择 `Assets/ExternalSources/PlatformDetector.js`

### Step 5: 测试

**运行游戏** → 点击 "Free to Play" 按钮 → 检查：
- ✅ 按钮是否在闪烁
- ✅ 点击是否有缩放动画
- ✅ 控制台是否输出平台检测日志

---

## 📁 项目文件清单

确保以下文件存在：

```
Assets/
├── ExternalSources/
│   └── PlatformDetector.js                    ✅ Luna JavaScript 库
├── Scripts/
│   ├── StoreNavigator.cs                      ✅ 商店跳转逻辑
│   ├── UI/
│   │   ├── FreeToPlayButton.cs               ✅ 按钮组件
│   │   └── FreeToPlayButton使用说明.md      📖 详细文档
│   └── Luna平台检测集成指南.md               📖 平台检测文档
```

---

## ⚙️ 闪烁效果配置（可选）

在 `FreeToPlayButton` 组件中调整：

### 快速醒目闪烁
```
Blink Interval: 0.4
Min Alpha: 0.3
Max Alpha: 1.0
Enable Color Blink: ✅
Blink Color A: White
Blink Color B: Yellow
Enable Scale Animation: ✅
Min Scale: 0.95
Max Scale: 1.05
```

### 温和脉动效果
```
Blink Interval: 0.8
Min Alpha: 0.7
Max Alpha: 1.0
Enable Color Blink: ❌
Enable Scale Animation: ✅
Min Scale: 0.98
Max Scale: 1.02
```

---

## 🧪 Luna Playable 打包测试

### 1. 配置 External Sources（必须！）
Luna Playworks → Code → External Sources → 添加 `PlatformDetector.js`

### 2. 打包 Playable
```bash
# 使用 Luna CLI
luna build

# 或使用 Luna Playground
```

### 3. 真机测试
- iOS 设备：应自动跳转 App Store
- Android 设备：应自动跳转 Google Play

### 4. 浏览器模拟测试
- Chrome DevTools (F12) → Toggle Device Toolbar
- 选择 iPhone 或 Android 设备模拟

---

## 📱 平台检测工作原理

### Luna Playable 环境
```csharp
#if UNITY_LUNA
    // 使用 JavaScript 检测用户设备
    if (PlatformDetectorJS.isIOSDevice())
        跳转 → App Store
    else if (PlatformDetectorJS.isAndroidDevice())
        跳转 → Google Play
#endif
```

### 检测流程
1. **JavaScript UserAgent 检测**（最准确）⭐
   - iOS: `/iPad|iPhone|iPod/`
   - Android: `/android/i`

2. **备用：SystemInfo 检测**
   - 解析系统信息字符串

---

## ⚠️ 常见问题

### Q: 按钮不闪烁？
**A**: 检查 `Button`、`ButtonText`、`ButtonBackground` 是否正确引用（通常自动填充）

### Q: 点击没反应？
**A**: 检查：
1. `StoreNavigator` 是否配置了 App ID 和包名
2. 控制台是否有错误日志

### Q: Luna 打包后平台检测失败？
**A**: 检查：
1. 是否在 Luna Playworks 的 External Sources 中添加了 `PlatformDetector.js`
2. JavaScript 文件名是否为 `PlatformDetector.js`（大小写敏感）
3. 浏览器控制台是否有 JavaScript 错误

### Q: 如何获取 iOS App ID？
**A**: 
- 登录 [App Store Connect](https://appstoreconnect.apple.com/)
- 找到你的应用 → 查看应用信息
- App ID 是一串数字（例如：`1234567890`）

### Q: 如何获取 Android 包名？
**A**:
- Unity → Edit → Project Settings → Player
- Android 选项卡 → Other Settings → Package Name
- 格式：`com.company.game`

---

## 📚 详细文档

- 📖 **FreeToPlayButton使用说明.md** - 按钮组件详细配置
- 📖 **Luna平台检测集成指南.md** - Luna 官方集成方式
- 🔗 **Luna 官方文档**: https://docs.lunalabs.io/

---

## ✅ 完成检查清单

打包 Luna Playable 前，确保：

- [ ] UI 按钮已创建并添加 `FreeToPlayButton` 脚本
- [ ] `StoreNavigator` 已配置 iOS App ID
- [ ] `StoreNavigator` 已配置 Android Package Name
- [ ] `Use Runtime Platform Detection` 已勾选
- [ ] `PlatformDetector.js` 已在 Luna Playworks 的 External Sources 中添加
- [ ] 在编辑器中测试按钮闪烁和点击效果
- [ ] Luna 打包后在真机上测试平台检测

---

## 🎉 就这么简单！

现在你的 Luna Playable 已经有了一个：
- ✨ 闪烁的 "Free to Play" 按钮
- 🔄 自动检测用户设备平台（iOS/Android）
- 🔗 自动跳转到对应的应用商店

**Happy Coding! 🚀**













