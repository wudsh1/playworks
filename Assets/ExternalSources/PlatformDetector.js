/**
 * Luna Playable Platform Detector
 * 平台检测 JavaScript 库（用于 Luna Playable Ads）
 * 
 * 使用方式：
 * 1. 在 Luna Playworks 插件中：Code → External Sources → 添加此文件
 * 2. 在 C# 中使用 Bridge.NET 的 [External] 属性访问
 */

var PlatformDetector = (function() {
    
    /**
     * 获取用户代理字符串
     */
    function getUserAgent() {
        return navigator.userAgent || navigator.vendor || window.opera || '';
    }
    
    /**
     * 检测是否为 iOS 设备
     * 改进的检测逻辑，支持各种iOS设备和浏览器
     */
    function isIOSDevice() {
        var userAgent = getUserAgent();
        
        console.log('2 [PlatformDetector] userAgent =', userAgent);
        console.log('3 [PlatformDetector] window.MSStream = true');

        
        // 方法1：直接检测 iPhone、iPad、iPod（最可靠）
        if (/iPhone|iPad|iPod/.test(userAgent)) {
            return true;
        }
        
        // 方法2：检测iOS特征字符串（处理某些边缘情况）
        // iOS设备的User-Agent通常包含 "like Mac OS X" 和 "Mobile/" 或 "Version/"
        // 但不包含 "Windows" 或 "Android"
        var hasLikeMacOS = /like Mac OS X/.test(userAgent);
        var hasMobile = /Mobile\//.test(userAgent);
        var hasVersion = /Version\//.test(userAgent);
        var hasCriOS = /CriOS/.test(userAgent); // Chrome iOS
        var hasFxiOS = /FxiOS/.test(userAgent); // Firefox iOS
        var hasEdgiOS = /EdgiOS/.test(userAgent); // Edge iOS
        
        // 如果包含iOS特征且不包含Windows/Android，则可能是iOS
        if (hasLikeMacOS && !/Windows|Android/.test(userAgent)) {
            // 进一步确认：包含Mobile/Version/CriOS/FxiOS/EdgiOS中的至少一个
            if (hasMobile || hasVersion || hasCriOS || hasFxiOS || hasEdgiOS) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检测是否为 Android 设备
     * 改进的检测逻辑，更准确地识别Android设备
     */
    function isAndroidDevice() {
        var userAgent = getUserAgent();
        
        // 直接检测 Android（不区分大小写）
        if (/android/i.test(userAgent)) {
            return true;
        }
        
        // 某些Android设备的User-Agent可能不包含"Android"字符串
        // 但包含 "Linux" 和 "Mobile" 或特定的Android浏览器标识
        // 注意：这可能会误判某些Linux设备，所以作为次要检测
        var hasLinux = /Linux/.test(userAgent);
        var hasMobile = /Mobile/.test(userAgent);
        var hasAndroidBrowser = /wv|WebView/.test(userAgent); // Android WebView
        
        // 如果包含Linux和Mobile，且不包含iOS特征（避免循环调用，直接检查iOS特征）
        var hasIOSFeature = /iPhone|iPad|iPod|like Mac OS X/.test(userAgent);
        if (hasLinux && hasMobile && !hasIOSFeature) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 检测是否为 Safari 浏览器
     * 在 iOS 上，Safari 的 UserAgent 包含 "Safari" 但不包含 "Chrome"、"CriOS"、"FxiOS" 等
     */
    function isSafariBrowser() {
        var userAgent = getUserAgent();
        // 检测 Safari：包含 Safari 但不包含 Chrome、CriOS（Chrome iOS）、FxiOS（Firefox iOS）等
        var hasSafari = /Safari/.test(userAgent);
        var hasChrome = /Chrome|CriOS/.test(userAgent);
        var hasFirefox = /FxiOS/.test(userAgent);
        var hasEdge = /EdgiOS/.test(userAgent);
        
        // Safari 的特征：有 Safari 标识，但没有其他浏览器的标识
        return hasSafari && !hasChrome && !hasFirefox && !hasEdge;
    }
    
    /**
     * 检测是否为 iOS 设备上的 Safari 浏览器
     * @returns {boolean} 如果是 iOS 设备且使用 Safari 浏览器，返回 true
     */
    function isIOSSafari() {
        return isIOSDevice() && isSafariBrowser();
    }
    
    /**
     * 获取平台名称
     * @returns {string} "iOS", "Android", "Mac", "Windows", 或 "Unknown"
     */
    function getPlatformName() {
        if (isIOSDevice()) {
            return "iOS";
        } else if (isAndroidDevice()) {
            return "Android";
        }
        
        // 额外检测：Mac 或 Windows（用于调试和日志）
        var userAgent = getUserAgent();
        if (/Macintosh|Mac OS X/.test(userAgent) && !isIOSDevice()) {
            return "Mac";
        } else if (/Windows/.test(userAgent)) {
            return "Windows";
        }
        
        return "Unknown";
    }
    
    /**
     * 打开 URL（在新窗口或当前窗口）
     * @param {string} url - 要打开的 URL
     */
    function openURL(url) {
        console.log('[PlatformDetector] 准备打开URL:', url);
        
        try {
            // 在 Playable Ads 环境中，直接使用 location.href 是最可靠的方式
            // 这必须在用户点击事件的同步代码中调用
            
            // 方式1：优先尝试 window.top（处理iframe情况）
            if (window.top && window.top !== window.self) {
                console.log('[PlatformDetector] 在iframe中，使用 window.top.location');
                window.top.location.href = url;
                return;
            }
            
            // 方式2：直接跳转（最可靠）
            console.log('[PlatformDetector] 直接跳转到:', url);
            window.location.href = url;
            
        } catch (error) {
            console.error('[PlatformDetector] 打开URL失败:', error);
            
            // 备用方案：尝试 window.open
            try {
                console.log('[PlatformDetector] 尝试备用方案 window.open');
                var newWindow = window.open(url, '_blank');
                if (!newWindow) {
                    console.warn('[PlatformDetector] window.open 被拦截');
                }
            } catch (e) {
                console.error('[PlatformDetector] window.open 也失败了:', e);
            }
        }
    }
    
    /**
     * 获取详细的设备信息（用于调试）
     */
    function getDeviceInfo() {
        var userAgent = getUserAgent();
        var isIOS = isIOSDevice();
        var isAndroid = isAndroidDevice();
        
        return {
            userAgent: userAgent,
            platform: getPlatformName(),
            isiOS: isIOS,
            isAndroid: isAndroid,
            isSafari: isSafariBrowser(),
            isIOSSafari: isIOSSafari(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            // 添加详细的检测信息用于调试
            detectionDetails: {
                hasIPhone: /iPhone/.test(userAgent),
                hasIPad: /iPad/.test(userAgent),
                hasIPod: /iPod/.test(userAgent),
                hasLikeMacOS: /like Mac OS X/.test(userAgent),
                hasMobile: /Mobile\//.test(userAgent),
                hasVersion: /Version\//.test(userAgent),
                hasCriOS: /CriOS/.test(userAgent),
                hasAndroid: /android/i.test(userAgent),
                hasLinux: /Linux/.test(userAgent)
            }
        };
    }
    
    /**
     * 打印设备信息到控制台（用于调试）
     */
    function logDeviceInfo() {
        var info = getDeviceInfo();
        console.log('[PlatformDetector] Device Info:', info);
        console.log('[PlatformDetector] User Agent:', info.userAgent);
        console.log('[PlatformDetector] Platform:', info.platform);
    }
    
    // 公开的 API
    return {
        getUserAgent: getUserAgent,
        isIOSDevice: isIOSDevice,
        isAndroidDevice: isAndroidDevice,
        isSafariBrowser: isSafariBrowser,
        isIOSSafari: isIOSSafari,
        getPlatformName: getPlatformName,
        openURL: openURL,
        getDeviceInfo: getDeviceInfo,
        logDeviceInfo: logDeviceInfo
    };
    
})();

// 在加载时自动打印设备信息（可选，用于调试）
if (typeof console !== 'undefined' && console.log) {
    console.log('[PlatformDetector] JavaScript 库已加载');
    // PlatformDetector.logDeviceInfo(); // 取消注释以启用自动日志
}
