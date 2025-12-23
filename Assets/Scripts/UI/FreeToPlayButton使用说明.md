# FreeToPlayButton 使用说明

## 📋 功能说明

`FreeToPlayButton` 是一个带有闪烁效果的按钮组件，用于在游戏底部显示"Free to Play"按钮，点击后跳转到应用商店。

## ✨ 特性

- ✅ 自动闪烁效果（透明度、颜色、缩放可配置）
- ✅ 点击反馈动画
- ✅ 跨平台商店跳转（iOS App Store / Android Google Play）
- ✅ 支持自定义闪烁参数
- ✅ 编辑器内测试功能

---

## 🚀 快速开始

### 步骤1：创建按钮UI

1. **在场景中创建按钮**：
   - 在 Hierarchy 窗口右键 → `UI` → `Button`
   - 重命名为 `FreeToPlayButton`
   - 调整位置到屏幕底部

2. **设置按钮样式**：
   - 修改按钮大小（建议：宽度200-300，高度60-80）
   - 修改按钮文本为"Free to Play"
   - 调整字体大小和颜色

### 步骤2：添加脚本组件

1. **添加 FreeToPlayButton 脚本**：
   - 选中按钮对象
   - 在 Inspector 窗口点击 `Add Component`
   - 搜索 `FreeToPlayButton` 并添加

2. **添加 StoreNavigator（可选）**：
   - 如果场景中没有 StoreNavigator，脚本会自动创建
   - 或手动创建：创建空物体 → 添加 `StoreNavigator` 脚本

### 步骤3：配置参数

#### FreeToPlayButton 配置

在 Inspector 面板中配置以下参数：

##### UI引用（自动填充）
- **Button**：按钮组件（自动查找）
- **ButtonText**：文本组件（自动查找）
- **ButtonBackground**：背景图片（自动查找）
- **IconImage**：可选图标（可手动指定）

##### 闪烁效果配置
- **Blink Interval**：闪烁间隔时间（默认：0.5秒）
- **Min Alpha**：最小透明度（默认：0.3）
- **Max Alpha**：最大透明度（默认：1.0）
- **Enable Color Blink**：启用颜色闪烁（默认：开启）
- **Blink Color A**：闪烁颜色A（默认：白色）
- **Blink Color B**：闪烁颜色B（默认：黄色）
- **Enable Scale Animation**：启用缩放动画（默认：开启）
- **Min Scale**：最小缩放（默认：0.95）
- **Max Scale**：最大缩放（默认：1.05）

#### StoreNavigator 配置

在 Inspector 面板中配置商店信息：

- **Ios App Id**：你的iOS应用在App Store的ID（例如：`1234567890`）
  - 获取方式：在 App Store Connect 中查看应用ID
  - 或从应用商店链接中提取：`https://apps.apple.com/app/id1234567890`

- **Android Package Name**：你的Android应用包名（例如：`com.company.game`）
  - 默认值：`com.DefaultCompany.2D-Luna-Game`
  - 应与项目设置中的包名一致

- **Fallback Web Store Url**：备用网页商店链接（可选）
  - 用于PC或其他平台的跳转

---

## 🎮 使用示例

### 在 JewelGameManager 中集成

你可以在 `JewelGameManager.cs` 中添加对按钮的引用：

```csharp
[Header("Free to Play按钮")]
public FreeToPlayButton FreeToPlayButton;

private void Start()
{
    // 初始化后自动开始闪烁
    if (FreeToPlayButton != null)
    {
        FreeToPlayButton.StartBlinking();
    }
}
```

### 手动控制闪烁

```csharp
// 开始闪烁
FreeToPlayButton.StartBlinking();

// 停止闪烁
FreeToPlayButton.StopBlinking();
```

---

## 🧪 测试功能

### 编辑器测试

在 Inspector 窗口中，右键点击组件标题：

**FreeToPlayButton 组件**：
- `测试闪烁效果`：开启/关闭闪烁
- `测试按钮点击`：模拟点击效果

**StoreNavigator 组件**：
- `测试商店跳转`：测试商店跳转功能

### 运行时测试

运行游戏后，点击按钮会：
1. 播放点击反馈动画（缩放）
2. 在控制台输出日志
3. 尝试打开应用商店

---

## 📱 平台说明

### iOS 平台
- 跳转到 App Store 应用详情页
- URL格式：`https://apps.apple.com/app/id{你的应用ID}`
- **注意**：需要在 StoreNavigator 中配置正确的 iOS App ID

### Android 平台
- 优先尝试打开 Google Play 应用
- 失败则使用网页版 Google Play
- URL格式：`market://details?id={包名}` 或 `https://play.google.com/store/apps/details?id={包名}`
- **注意**：需要在 StoreNavigator 中配置正确的包名

### 其他平台
- 跳转到备用网页商店
- 需要在 StoreNavigator 中配置 Fallback Web Store Url

---

## 🎨 自定义样式建议

### 按钮外观
- **背景颜色**：使用醒目的颜色（如绿色、黄色）
- **文字颜色**：与背景形成对比
- **边框**：可添加圆角和阴影效果

### 闪烁效果
- **快速闪烁**（吸引注意）：Blink Interval = 0.3秒
- **缓慢闪烁**（温和）：Blink Interval = 1.0秒
- **强烈效果**：Min Alpha = 0.2，Enable Color Blink = true
- **温和效果**：Min Alpha = 0.7，Enable Scale Animation = false

### 推荐配置组合

#### 配置1：醒目闪烁
```
Blink Interval: 0.4
Min Alpha: 0.3
Max Alpha: 1.0
Enable Color Blink: true
Blink Color A: White
Blink Color B: Yellow
Enable Scale Animation: true
Min Scale: 0.95
Max Scale: 1.05
```

#### 配置2：温和脉动
```
Blink Interval: 0.8
Min Alpha: 0.7
Max Alpha: 1.0
Enable Color Blink: false
Enable Scale Animation: true
Min Scale: 0.98
Max Scale: 1.02
```

---

## ⚠️ 注意事项

1. **应用商店配置**
   - 在发布应用前，务必配置正确的 iOS App ID 和 Android 包名
   - 测试时商店链接可能无法打开（因为应用尚未上架）

2. **按钮位置**
   - 建议放置在屏幕底部中央
   - 确保不会遮挡游戏主要内容

3. **性能优化**
   - 闪烁效果使用协程实现，性能消耗很小
   - 可在不需要时调用 `StopBlinking()` 停止动画

4. **多场景使用**
   - 可以在多个场景中使用此按钮
   - StoreNavigator 推荐作为场景中的单例存在

---

## 🐛 常见问题

### Q1：按钮不闪烁？
**A**：检查以下几点：
- 脚本是否正确挂载
- ButtonBackground 或 ButtonText 是否正确引用
- 在 Start() 中是否自动调用了 StartBlinking()

### Q2：点击按钮没有反应？
**A**：检查以下几点：
- Button 组件是否正确引用
- StoreNavigator 是否配置正确
- 查看控制台是否有错误日志

### Q3：商店跳转无效？
**A**：可能的原因：
- iOS App ID 或 Android 包名配置错误
- 应用尚未在商店上架
- 编辑器中测试需要在真机上测试才能正常跳转

### Q4：如何调整闪烁速度？
**A**：修改 `Blink Interval` 参数：
- 更小的值 = 更快的闪烁
- 更大的值 = 更慢的闪烁

---

## 📝 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ 支持透明度、颜色、缩放闪烁
- ✅ 跨平台商店跳转
- ✅ 点击反馈动画
- ✅ 编辑器测试功能

---

## 📧 技术支持

如有问题，请查看控制台日志，所有操作都会输出详细日志信息。













