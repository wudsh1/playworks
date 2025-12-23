using UnityEngine;

#if UNITY_LUNA
using Bridge;
#endif

/// <summary>
/// 商店导航器（用于跳转到应用商店）
/// 支持 Luna Playable Ads 环境的运行时平台检测
/// </summary>
public class StoreNavigator : MonoBehaviour
{
    [Header("商店配置")]
    [Tooltip("iOS App Store 应用ID（例如：1234567890）")]
    public string IosAppId = "1476678178";
    
    [Tooltip("Android Google Play 包名（例如：com.company.game）")]
    public string AndroidPackageName = "com.sportbrain.jewelpuzzle";
    
    [Tooltip("备用网页商店URL（可选，用于其他平台）")]
    public string FallbackWebStoreUrl = "https://play.google.com/store/apps/details?id=com.sportbrain.jewelpuzzle";
    
    [Header("运行时检测（Luna Playable 环境）")]
    [Tooltip("是否启用运行时平台检测（用于 Luna Playable Ads）")]
    public bool UseRuntimePlatformDetection = true;
    
    /// <summary>
    /// 打开应用商店
    /// </summary>
    public void OpenStore()
    {
        // 优先使用运行时平台检测（适用于 Playable Ads / Luna 环境）
        if (UseRuntimePlatformDetection)
        {
            PlatformType platform = DetectPlatformRuntime();
            Debug.Log($"[StoreNavigator] 运行时检测到的平台: {platform}");
            
            switch (platform)
            {
                case PlatformType.iOS:
                    OpenIOSStore();
                    break;
                case PlatformType.Android:
                    OpenAndroidStore();
                    break;
                default:
                    OpenWebStore();
                    break;
            }
        }
        else
        {
            // 使用编译时平台检测（传统方式）
#if UNITY_IOS
            OpenIOSStore();
#elif UNITY_ANDROID
            OpenAndroidStore();
#else
            OpenWebStore();
#endif
        }
    }
    
    /// <summary>
    /// 平台类型枚举
    /// </summary>
    private enum PlatformType
    {
        Unknown,
        iOS,
        Android,
        WebGL
    }
    
    /// <summary>
    /// 运行时检测平台（适用于 Playable Ads 环境）
    /// </summary>
    private PlatformType DetectPlatformRuntime()
    {
        // 方法1：检查 Unity 的 RuntimePlatform
        RuntimePlatform runtimePlatform = Application.platform;
        Debug.Log($"1 [StoreNavigator] Application.platform = {runtimePlatform}");
        

            return DetectPlatformFromUserAgent();
        
    }
    
    /// <summary>
    /// 通过 UserAgent 检测平台（用于 Luna Playable 环境）
    /// </summary>
    private PlatformType DetectPlatformFromUserAgent()
    {
#if UNITY_LUNA
        try
        {
            // 使用 Luna Bridge.NET 方式调用 JavaScript
            if (PlatformDetectorJS.isIOSDevice())
            {
                Debug.Log("[StoreNavigator] Luna JavaScript 检测到 iOS 设备");
                return PlatformType.iOS;
            }
            
            if (PlatformDetectorJS.isAndroidDevice())
            {
                Debug.Log("[StoreNavigator] Luna JavaScript 检测到 Android 设备");
                return PlatformType.Android;
            }
            
            // 获取平台名称字符串
            string platformName = PlatformDetectorJS.getPlatformName();
            Debug.Log($"[StoreNavigator] Luna JavaScript 返回平台名称: {platformName}");
            
            if (platformName == "iOS" || platformName == "Mac")
            {
                return PlatformType.iOS;
            }
            else if (platformName == "Android")
            {
                return PlatformType.Android;
            }
        }
        catch (System.Exception ex)
        {
            Debug.LogWarning($"[StoreNavigator] Luna JavaScript 平台检测失败: {ex.Message}");
        }
#endif
        

        return PlatformType.Unknown;
    }
    
    /// <summary>
    /// 打开iOS App Store
    /// </summary>
    private void OpenIOSStore()
    {

        // iOS App Store URL格式
        string storeUrl = $"https://apps.apple.com/app/id{IosAppId}";
        
        Debug.Log($"[StoreNavigator] 打开iOS商店: {storeUrl}");
        OpenURLPlatformSafe(storeUrl);
    }
    
    /// <summary>
    /// 打开Android Google Play商店
    /// </summary>
    private void OpenAndroidStore()
    {
        if (string.IsNullOrEmpty(AndroidPackageName))
        {
            Debug.LogWarning("[StoreNavigator] Android包名未设置，使用备用网页商店");
            OpenWebStore();
            return;
        }
        
        // 在 Playable 环境中，直接使用网页版 Google Play
        // market:// 协议在浏览器中无法使用
#if UNITY_WEBGL && !UNITY_EDITOR
        string webUrl = $"https://play.google.com/store/apps/details?id={AndroidPackageName}";
        Debug.Log($"[StoreNavigator] WebGL环境，使用网页版Google Play: {webUrl}");
        OpenURLPlatformSafe(webUrl);
#else
        // 原生环境中，优先尝试使用Google Play应用
        string marketUrl = $"market://details?id={AndroidPackageName}";
        string webUrl = $"https://play.google.com/store/apps/details?id={AndroidPackageName}";
        
        try
        {
           OpenURLPlatformSafe(webUrl);

        }
        catch (System.Exception ex)
        {
            Debug.LogWarning($"[StoreNavigator] 无法打开Google Play应用: {ex.Message}，使用网页版");
        }
#endif
    }
    
    /// <summary>
    /// 打开网页商店（备用方案）
    /// </summary>
    private void OpenWebStore()
    {
        if (string.IsNullOrEmpty(FallbackWebStoreUrl))
        {
            Debug.LogError("[StoreNavigator] 备用网页商店URL未设置！");
            return;
        }
        
        Debug.Log($"[StoreNavigator] 打开网页商店: {FallbackWebStoreUrl}");
        OpenURLPlatformSafe(FallbackWebStoreUrl);
    }
    
    /// <summary>
    /// 跨平台安全地打开URL
    /// </summary>
    private void OpenURLPlatformSafe(string url)
    {
#if UNITY_LUNA
        try
        {
            // 在 Luna Playable 中使用 JavaScript 打开 URL（更可靠）
            PlatformDetectorJS.openURL(url);
            Debug.Log($"[StoreNavigator] 使用 Luna JavaScript 打开 URL: {url}");
        }
        catch (System.Exception ex)
        {
            Debug.LogWarning($"[StoreNavigator] Luna JavaScript OpenURL 失败: {ex.Message}，使用 Application.OpenURL");
            Application.OpenURL(url);
        }
#else
        // 非 Luna 环境，使用标准方式
        Application.OpenURL(url);
#endif
    }
    
    /// <summary>
    /// 测试商店跳转（在编辑器中使用）
    /// </summary>
    [ContextMenu("测试商店跳转")]
    public void TestStoreNavigation()
    {
        Debug.Log("[StoreNavigator] 测试商店跳转...");
        OpenStore();
    }
    
#if UNITY_LUNA
    /// <summary>
    /// 测试 Luna JavaScript 平台检测
    /// </summary>
    [ContextMenu("测试Luna平台检测")]
    public void TestLunaPlatformDetection()
    {
        Debug.Log("[StoreNavigator] 测试 Luna 平台检测...");
        PlatformDetectorJS.logDeviceInfo();
        
        string platformName = PlatformDetectorJS.getPlatformName();
        bool isiOS = PlatformDetectorJS.isIOSDevice();
        bool isAndroid = PlatformDetectorJS.isAndroidDevice();
        bool isSafari = PlatformDetectorJS.isSafariBrowser();
        bool isIOSSafari = PlatformDetectorJS.isIOSSafari();
        
        Debug.Log($"[StoreNavigator] 平台名称: {platformName}");
        Debug.Log($"[StoreNavigator] 是否iOS: {isiOS}");
        Debug.Log($"[StoreNavigator] 是否Android: {isAndroid}");
        Debug.Log($"[StoreNavigator] 是否Safari: {isSafari}");
        Debug.Log($"[StoreNavigator] 是否iOS Safari: {isIOSSafari}");
    }
#endif
}

#if UNITY_LUNA
/// <summary>
/// Luna Playable JavaScript 接口（使用 Bridge.NET）
/// 对应 PlatformDetector.js 中的 PlatformDetector 对象
/// </summary>
[External]
[Name("PlatformDetector")]
public static class PlatformDetectorJS
{
    /// <summary>
    /// 获取用户代理字符串
    /// </summary>
    public static extern string getUserAgent();
    
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
    /// 获取平台名称（"iOS", "Android", 或 "Unknown"）
    /// </summary>
    public static extern string getPlatformName();
    
    /// <summary>
    /// 打开 URL
    /// </summary>
    public static extern void openURL(string url);
    
    /// <summary>
    /// 打印设备信息到控制台（用于调试）
    /// </summary>
    public static extern void logDeviceInfo();
}
#endif

