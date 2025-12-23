using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// CanvasScaler适配器 - 根据屏幕分辨率高宽比动态调整match值
/// </summary>
[RequireComponent(typeof(CanvasScaler))]
public class CanvasScalerAdapter : MonoBehaviour
{
    [Header("适配设置")]
    [Tooltip("iPad比例阈值（height/width），小于等于此值时使用MatchForIPad")]
    public float IPadAspectRatio = 1.34f; // iPad 1024x1366 比例 = 1366/1024 ≈ 1.334，使用1.34作为阈值
    
    [Tooltip("当height/width <= iPad比例时的match值")]
    [Range(0f, 1f)]
    public float MatchForIPad = 0.684f;
    
    [Tooltip("当height/width > iPad比例且 < 2时的match值")]
    [Range(0f, 1f)]
    public float MatchForNormalAspect = 0.509f;
    
    [Tooltip("当height/width >= 2时的match值")]
    [Range(0f, 1f)]
    public float MatchForTallAspect = 0f;
    
    [Tooltip("是否在屏幕尺寸改变时自动更新")]
    public bool UpdateOnScreenSizeChange = true;
    
    private CanvasScaler _canvasScaler;
    private int _lastScreenWidth;
    private int _lastScreenHeight;
    
    private void Awake()
    {
        _canvasScaler = GetComponent<CanvasScaler>();
        if (_canvasScaler == null)
        {
            Debug.LogError("[CanvasScalerAdapter] 未找到CanvasScaler组件！");
            return;
        }
        
        // 确保CanvasScaler使用Match Width Or Height模式
        if (_canvasScaler.uiScaleMode != CanvasScaler.ScaleMode.ScaleWithScreenSize)
        {
            Debug.LogWarning("[CanvasScalerAdapter] CanvasScaler的UI Scale Mode不是ScaleWithScreenSize，将自动设置为ScaleWithScreenSize");
            _canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        }
        
        if (_canvasScaler.screenMatchMode != CanvasScaler.ScreenMatchMode.MatchWidthOrHeight)
        {
            Debug.LogWarning("[CanvasScalerAdapter] CanvasScaler的Screen Match Mode不是MatchWidthOrHeight，将自动设置为MatchWidthOrHeight");
            _canvasScaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
        }
    }
    
    private void Start()
    {
        UpdateMatchValue();
    }
    
    private void Update()
    {
        if (UpdateOnScreenSizeChange)
        {
            // 检查屏幕尺寸是否改变
            if (Screen.width != _lastScreenWidth || Screen.height != _lastScreenHeight)
            {
                UpdateMatchValue();
            }
        }
    }
    
    /// <summary>
    /// 根据屏幕分辨率更新match值
    /// </summary>
    public void UpdateMatchValue()
    {
        if (_canvasScaler == null) return;
        
        _lastScreenWidth = Screen.width;
        _lastScreenHeight = Screen.height;
        
        float aspectRatio = (float)Screen.height / Screen.width;
        
        float matchValue;
        if (aspectRatio <= IPadAspectRatio)
        {
            Debug.Log("1 [CanvasScalerAdapter] 小于等于iPad比例，使用iPad的match值");
            // 小于等于iPad比例，使用iPad的match值
            matchValue = MatchForIPad;
        }
        else if (aspectRatio < 2f)
        {
            Debug.Log("2 [CanvasScalerAdapter] 大于iPad比例但小于2，使用普通比例");

            // 大于iPad比例但小于2，使用普通比例
            matchValue = MatchForNormalAspect;
        }
        else
        {
            // 大于等于2，使用高屏比例
            matchValue = MatchForTallAspect;
        }
        
        _canvasScaler.matchWidthOrHeight = matchValue;
        
        Debug.Log($"[CanvasScalerAdapter] 屏幕分辨率: {Screen.width}x{Screen.height}, 高宽比: {aspectRatio:F2}, Match值: {matchValue}");
    }
    
    /// <summary>
    /// 手动更新match值（供外部调用）
    /// </summary>
    public void Refresh()
    {
        UpdateMatchValue();
    }
}





