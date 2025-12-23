# Luna Playable 平台检测集成指南

## 📚 官方文档

**Luna Labs 官方文档：**  
https://docs.lunalabs.io/docs/playable/code/external-js-libraries

本项目严格按照 Luna 官方推荐的 **Bridge.NET** 方式集成 JavaScript。

---

## 📱 问题背景

在打包成 **Luna Playable Ads** 后，游戏会被转换为 **WebGL/HTML5** 格式，运行在浏览器中。

### ❌ 传统方式不可用

```csharp
// ❌ 这种方式在 Luna Playable 中不工作
#if UNITY_IOS
    OpenIOSStore();
#elif UNITY_ANDROID
    OpenAndroidStore();
#endif
```

**原因**：代码编译为 WebGL，不是原生 iOS/Android

### ✅ 需要运行时检测

在 Luna Playable 中，必须使用**运行时 JavaScript 检测**来判断用户设备的实际平台。

---

## 🔧 Luna 官方集成方式

### 步骤 1：创建 JavaScript 文件

**文件位置**：`Assets/ExternalSources/PlatformDetector.js`

```javascript
var PlatformDetector = (function() {
    function isIOSDevice() {
        var userAgent = navigator.userAgent;
        return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    }
    
    function isAndroidDevice() {
        var userAgent = navigator.userAgent;
        return /android/i.test(userAgent);
    }
    
    function isSafariBrowser() {
        var userAgent = navigator.userAgent;
        // 检测 Safari：包含 Safari 但不包含 Chrome、CriOS、FxiOS 等
        var hasSafari = /Safari/.test(userAgent);
        var hasChrome = /Chrome|CriOS/.test(userAgent);
        var hasFirefox = /FxiOS/.test(userAgent);
        var hasEdge = /EdgiOS/.test(userAgent);
        return hasSafari && !hasChrome && !hasFirefox && !hasEdge;
    }
    
    function isIOSSafari() {
        return isIOSDevice() && isSafariBrowser();
    }
    
    function getPlatformName() {
        if (isIOSDevice()) return "iOS";
        if (isAndroidDevice()) return "Android";
        return "Unknown";
    }
    
    function openURL(url) {
        var newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed) {
            window.location.href = url;
        }
    }
    
    return {
        isIOSDevice: isIOSDevice,
        isAndroidDevice: isAndroidDevice,
        isSafariBrowser: isSafariBrowser,
        isIOSSafari: isIOSSafari,
        getPlatformName: getPlatformName,
        openURL: openURL
    };
})();
```

### 步骤 2：在 Luna Playworks 中添加

1. 打开 **Luna Playworks** 插件
2. 导航到 **Code** → **External Sources** 选项卡
3. 点击添加按钮，选择 `PlatformDetector.js` 文件
4. ⚠️ **注意**：只能选择单个 JS 文件，不支持文件夹

### 步骤 3：创建 C# 接口（Bridge.NET）

**文件**：`StoreNavigator.cs`

```csharp
#if UNITY_LUNA
using Bridge;

[External]
[Name("PlatformDetector")]
public static class PlatformDetectorJS
{
    /// <summary>
    /// 检测是否为 iOS 设备
    /// </summary>
    public static extern bool isIOSDevice();
    
    /// <summary>
    /// 检测是否为 Android 设备
    /// </summary>
    public static extern bool isAndroidDevice();
    
    /// <summary>
    /// 检测是否为 Safari 浏览器
    /// </summary>
    public static extern bool isSafariBrowser();
    
    /// <summary>
    /// 检测是否为 iOS 设备上的 Safari 浏览器
    /// </summary>
    public static extern bool isIOSSafari();
    
    /// <summary>
    /// 获取平台名称
    /// </summary>
    public static extern string getPlatformName();
    
    /// <summary>
    /// 打开 URL
    /// </summary>
    public static extern void openURL(string url);
}
#endif
```

**关键点**：
- ✅ 使用 `#if UNITY_LUNA` 预处理指令
- ✅ 引入 `Bridge` 命名空间
- ✅ 使用 `[External]` 属性标记类
- ✅ 使用 `[Name("PlatformDetector")]` 指定 JavaScript 对象名
- ✅ 方法声明为 `extern`，且方法名与 JavaScript 一致

### 步骤 4：在 C# 中调用

```csharp
public void OpenStore()
{
#if UNITY_LUNA
    // Luna 环境：使用 JavaScript 检测平台
    if (PlatformDetectorJS.isIOSDevice())
    {
        // 可以进一步判断是否为 Safari 浏览器
        if (PlatformDetectorJS.isIOSSafari())
        {
            Debug.Log("检测到 iOS Safari 浏览器");
        }
        
        string url = $"https://apps.apple.com/app/id{IosAppId}";
        PlatformDetectorJS.openURL(url);
    }
    else if (PlatformDetectorJS.isAndroidDevice())
    {
        string url = $"https://play.google.com/store/apps/details?id={AndroidPackageName}";
        PlatformDetectorJS.openURL(url);
    }
#else
    // 非 Luna 环境：使用标准方式
    Application.OpenURL(storeUrl);
#endif
}
```

---

## 🎯 完整实现

本项目已完整实现 Luna 平台检测：

### 文件结构

```
Assets/
├── ExternalSources/
│   └── PlatformDetector.js          # JavaScript 平台检测库
├── Scripts/
│   ├── StoreNavigator.cs            # 商店导航器（含 Bridge.NET 接口）
│   └── UI/
│       └── FreeToPlayButton.cs      # Free to Play 按钮
```

### StoreNavigator.cs 功能

✅ **双模式支持**
- Luna 环境：使用 Bridge.NET + JavaScript
- 非 Luna 环境：使用 `Application.OpenURL`

✅ **平台检测**
```csharp
private PlatformType DetectPlatformFromUserAgent()
{
#if UNITY_LUNA
    if (PlatformDetectorJS.isIOSDevice())
        return PlatformType.iOS;
    
    if (PlatformDetectorJS.isAndroidDevice())
        return PlatformType.Android;
#endif
    
    // 备用：SystemInfo 检测
    return DetectFromSystemInfo();
}
```

✅ **URL 打开**
```csharp
private void OpenURLPlatformSafe(string url)
{
#if UNITY_LUNA
    PlatformDetectorJS.openURL(url);  // Luna JavaScript 方式
#else
    Application.OpenURL(url);          // 标准方式
#endif
}
```

---

## 🧪 测试方法

### 1. Unity 编辑器测试

在 `StoreNavigator` 组件上右键：
- **测试商店跳转**：测试基本功能
- **测试Luna平台检测**：测试 JavaScript 调用（仅 Luna 打包后）

### 2. Luna 打包测试

#### Step 1：配置 External Sources
1. Luna Playworks → **Code** → **External Sources**
2. 添加 `PlatformDetector.js`

#### Step 2：打包 Playable
```bash
# 使用 Luna CLI 打包
luna build

# 或使用 Luna Playground 测试
```

#### Step 3：真机测试
1. 在 iOS 设备上打开 Playable
2. 点击 "Free to Play" 按钮
3. 应自动检测为 iOS，跳转到 App Store

4. 在 Android 设备上重复测试
5. 应自动检测为 Android，跳转到 Google Play

### 3. 浏览器模拟测试

**Chrome 开发者工具**：
1. **F12** 打开开发者工具
2. **Ctrl+Shift+M** 切换设备工具栏
3. 选择设备：
   - iPhone 13 Pro → 检测为 iOS
   - Samsung Galaxy S20 → 检测为 Android

### 4. 查看控制台日志

在浏览器 Console 中应看到：

```
[PlatformDetector] JavaScript 库已加载
[StoreNavigator] Luna JavaScript 检测到 iOS 设备
[StoreNavigator] Luna JavaScript 返回平台名称: iOS
[StoreNavigator] 使用 Luna JavaScript 打开 URL: https://apps.apple.com/app/id1234567890
```

---

## 🍎 Safari 浏览器检测

### 功能说明

新增了 Safari 浏览器检测功能，特别适用于在 iOS 平台上判断用户是否使用 Safari 浏览器。

### 使用方法

```csharp
#if UNITY_LUNA
    // 检测是否为 Safari 浏览器（所有平台）
    if (PlatformDetectorJS.isSafariBrowser())
    {
        Debug.Log("当前使用 Safari 浏览器");
    }
    
    // 检测是否为 iOS 设备上的 Safari 浏览器
    if (PlatformDetectorJS.isIOSSafari())
    {
        Debug.Log("当前使用 iOS Safari 浏览器");
        // 可以针对 iOS Safari 做特殊处理
    }
    
    // 组合使用：判断 iOS 设备且使用 Safari
    if (PlatformDetectorJS.isIOSDevice() && PlatformDetectorJS.isSafariBrowser())
    {
        // 等同于 isIOSSafari()
    }
#endif
```

### 检测原理

Safari 检测通过分析 UserAgent 字符串实现：
- ✅ 包含 `Safari` 标识
- ❌ 不包含 `Chrome` 或 `CriOS`（Chrome iOS）
- ❌ 不包含 `FxiOS`（Firefox iOS）
- ❌ 不包含 `EdgiOS`（Edge iOS）

### 使用场景

1. **针对 Safari 的特殊处理**
   ```csharp
   if (PlatformDetectorJS.isIOSSafari())
   {
       // Safari 可能需要特殊的 URL 打开方式
       // 或者需要处理某些 Safari 特有的限制
   }
   ```

2. **浏览器兼容性处理**
   ```csharp
   if (PlatformDetectorJS.isIOSDevice())
   {
       if (PlatformDetectorJS.isSafariBrowser())
       {
           // Safari 浏览器
       }
       else
       {
           // 其他浏览器（Chrome、Firefox 等）
       }
   }
   ```

---

## ⚙️ 配置说明

### StoreNavigator 配置

在 Unity Inspector 中配置：

```
Use Runtime Platform Detection: ✅ true

iOS App Id: 1234567890
Android Package Name: com.yourcompany.yourgame
Fallback Web Store Url: https://your-website.com
```

### 获取应用信息

#### iOS App ID
- 登录 [App Store Connect](https://appstoreconnect.apple.com/)
- 找到你的应用
- App ID 在应用详情页中（例如：`1234567890`）

#### Android 包名
- 打开 Unity → **Edit** → **Project Settings** → **Player**
- Android 选项卡 → **Other Settings**
- **Package Name**（例如：`com.company.game`）

---

## 📝 关键要点

### ✅ 正确做法（Luna 官方方式）

```csharp
// 1. 使用 #if UNITY_LUNA 预处理指令
#if UNITY_LUNA
using Bridge;

// 2. 使用 [External] 和 [Name] 属性
[External]
[Name("PlatformDetector")]
public static class PlatformDetectorJS
{
    // 3. 方法声明为 extern
    public static extern bool isIOSDevice();
}

// 4. 在代码中调用
if (PlatformDetectorJS.isIOSDevice())
{
    // ...
}
#endif
```

### ❌ 错误做法（传统 WebGL 方式）

```csharp
// ❌ 不要使用 DllImport（Luna 不支持）
[DllImport("__Internal")]
private static extern bool IsIOSDevice();

// ❌ 不要使用 .jslib 文件（Luna 不支持）
// Assets/Plugins/WebGL/PlatformDetector.jslib

// ❌ 不要使用 #if UNITY_WEBGL
#if UNITY_WEBGL
    // Luna 环境应使用 #if UNITY_LUNA
#endif
```

---

## 🐛 常见问题

### Q1: JavaScript 没有被调用？

**检查清单**：
- [ ] `PlatformDetector.js` 是否在 `Assets/ExternalSources/` 目录
- [ ] 是否在 Luna Playworks 的 **External Sources** 中添加
- [ ] C# 接口类是否使用了 `[External]` 和 `[Name]` 属性
- [ ] 方法名是否与 JavaScript 完全一致（包括大小写）

### Q2: 编译错误 "Bridge not found"？

**解决方案**：
- 使用 `#if UNITY_LUNA` 包裹所有 Bridge 相关代码
- Bridge 命名空间仅在 Luna 打包时可用

```csharp
#if UNITY_LUNA
using Bridge;  // 只在 Luna 环境中引入
#endif
```

### Q3: 平台检测不准确？

**排查步骤**：
1. 打开浏览器开发者工具
2. 查看 Console 日志
3. 检查 JavaScript 是否正确加载
4. 验证 UserAgent 字符串

### Q4: 无法跳转到商店？

**可能原因**：
- App ID 或包名配置错误
- 应用尚未上架
- 浏览器阻止了弹出窗口

**测试方法**：
- 手动访问生成的 URL
- 检查控制台是否有错误

---

## 🔗 相关链接

- **Luna Labs 官方文档**: https://docs.lunalabs.io/
- **External JS Libraries**: https://docs.lunalabs.io/docs/playable/code/external-js-libraries
- **Bridge.NET 文档**: http://bridge.net/

---

## ✨ 总结

✅ **使用 Luna 官方的 Bridge.NET 方式**  
✅ **JavaScript 文件放在 `Assets/ExternalSources/`**  
✅ **在 Luna Playworks 的 External Sources 中添加**  
✅ **使用 `#if UNITY_LUNA` 预处理指令**  
✅ **使用 `[External]` 和 `[Name]` 属性**  
✅ **方法声明为 `extern`**  

这是 Luna Playable Ads 平台检测的**唯一正确方式**！






