using UnityEngine;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// "Free to Play"按钮（带闪烁效果）
/// </summary>
public class FreeToPlayButton : MonoBehaviour
{
    [Header("UI引用")]
    [Tooltip("按钮组件")]
    public Button Button;
    
    [Tooltip("按钮文本组件")]
    public Text ButtonText;
    
    [Tooltip("按钮背景图片")]
    public Image ButtonBackground;
    
    [Tooltip("可选的图标")]
    public Image IconImage;
    
    [Header("闪烁效果配置")]
    [Tooltip("闪烁间隔时间（秒）")]
    [Range(0.1f, 2f)]
    public float BlinkInterval = 0.5f;
    
    [Tooltip("闪烁时的最小透明度")]
    [Range(0f, 1f)]
    public float MinAlpha = 0.3f;
    
    [Tooltip("闪烁时的最大透明度")]
    [Range(0f, 1f)]
    public float MaxAlpha = 1f;
    
    [Tooltip("是否启用颜色闪烁")]
    public bool EnableColorBlink = true;
    
    [Tooltip("闪烁的颜色A")]
    public Color BlinkColorA = Color.white;
    
    [Tooltip("闪烁的颜色B")]
    public Color BlinkColorB = Color.yellow;
    
    [Tooltip("是否启用缩放动画")]
    public bool EnableScaleAnimation = true;
    
    [Tooltip("缩放动画的最小缩放比例")]
    [Range(0.8f, 1f)]
    public float MinScale = 0.95f;
    
    [Tooltip("缩放动画的最大缩放比例")]
    [Range(1f, 1.5f)]
    public float MaxScale = 1.05f;
    
    [Header("商店导航器")]
    [Tooltip("商店导航器（用于跳转商店）")]
    public StoreNavigator StoreNavigator;
    
    private bool _isBlinking = false;
    private Coroutine _blinkCoroutine;
    private Vector3 _originalScale;
    
    private void Awake()
    {
        // 自动查找组件
        if (Button == null)
        {
            Button = GetComponent<Button>();
        }
        
        if (ButtonText == null)
        {
            ButtonText = GetComponentInChildren<Text>();
        }
        
        if (ButtonBackground == null)
        {
            ButtonBackground = GetComponent<Image>();
        }
        
        // 记录原始缩放
        _originalScale = transform.localScale;
        
        // 绑定按钮点击事件
        if (Button != null)
        {
            Button.onClick.AddListener(OnButtonClick);
        }
        
        // 自动查找StoreNavigator
        if (StoreNavigator == null)
        {
            StoreNavigator = FindObjectOfType<StoreNavigator>();
            if (StoreNavigator == null)
            {
                Debug.LogWarning("[FreeToPlayButton] 未找到StoreNavigator，将自动创建");
                GameObject navigatorObj = new GameObject("StoreNavigator");
                StoreNavigator = navigatorObj.AddComponent<StoreNavigator>();
            }
        }
    }
    
    private void Start()
    {
        // 设置按钮文本
        if (ButtonText != null)
        {
            ButtonText.text = "Free to Play";
        }
        
        // 开始闪烁
        StartBlinking();
    }
    
    private void OnDestroy()
    {
        // 取消按钮事件绑定
        if (Button != null)
        {
            Button.onClick.RemoveListener(OnButtonClick);
        }
    }
    
    /// <summary>
    /// 开始闪烁
    /// </summary>
    public void StartBlinking()
    {
        if (_isBlinking) return;
        
        _isBlinking = true;
        if (_blinkCoroutine != null)
        {
            StopCoroutine(_blinkCoroutine);
        }
        _blinkCoroutine = StartCoroutine(BlinkCoroutine());
    }
    
    /// <summary>
    /// 停止闪烁
    /// </summary>
    public void StopBlinking()
    {
        _isBlinking = false;
        if (_blinkCoroutine != null)
        {
            StopCoroutine(_blinkCoroutine);
            _blinkCoroutine = null;
        }
        
        // 恢复原始状态
        if (ButtonBackground != null)
        {
            Color color = ButtonBackground.color;
            color.a = MaxAlpha;
            ButtonBackground.color = color;
        }
        
        if (ButtonText != null)
        {
            Color color = ButtonText.color;
            color.a = MaxAlpha;
            ButtonText.color = color;
        }
        
        transform.localScale = _originalScale;
    }
    
    /// <summary>
    /// 闪烁协程
    /// </summary>
    private IEnumerator BlinkCoroutine()
    {
        float elapsed = 0f;
        
        while (_isBlinking)
        {
            elapsed += Time.deltaTime;
            
            // 计算闪烁进度（0-1-0循环）
            float t = Mathf.PingPong(elapsed / BlinkInterval, 1f);
            
            // 透明度闪烁
            float alpha = Mathf.Lerp(MinAlpha, MaxAlpha, t);
            
            if (ButtonBackground != null)
            {
                Color bgColor = ButtonBackground.color;
                
                // 颜色闪烁
                if (EnableColorBlink)
                {
                    bgColor = Color.Lerp(BlinkColorA, BlinkColorB, t);
                }
                
                bgColor.a = alpha;
                ButtonBackground.color = bgColor;
            }
            
            if (ButtonText != null)
            {
                Color textColor = ButtonText.color;
                textColor.a = alpha;
                ButtonText.color = textColor;
            }
            
            if (IconImage != null)
            {
                Color iconColor = IconImage.color;
                iconColor.a = alpha;
                IconImage.color = iconColor;
            }
            
            // 缩放动画
            if (EnableScaleAnimation)
            {
                float scale = Mathf.Lerp(MinScale, MaxScale, t);
                transform.localScale = _originalScale * scale;
            }
            
            yield return null;
        }
    }
    
    /// <summary>
    /// 按钮点击回调
    /// </summary>
    private void OnButtonClick()
    {
        Debug.Log("[FreeToPlayButton] 按钮被点击，准备跳转商店");
        
        // 播放点击音效（如果有）
        // AudioManager.instance.PlaySound("ButtonClick");
        
        // 按钮点击反馈动画
        StartCoroutine(ClickFeedbackAnimation());
        
        // 跳转商店
        if (StoreNavigator != null)
        {
            StoreNavigator.OpenStore();
        }
        else
        {
            Debug.LogError("[FreeToPlayButton] StoreNavigator未设置！");
        }
    }
    
    /// <summary>
    /// 点击反馈动画
    /// </summary>
    private IEnumerator ClickFeedbackAnimation()
    {
        // 快速缩小
        float duration = 0.1f;
        float elapsed = 0f;
        Vector3 targetScale = _originalScale * 0.9f;
        Vector3 startScale = transform.localScale;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            transform.localScale = Vector3.Lerp(startScale, targetScale, t);
            yield return null;
        }
        
        // 快速恢复
        elapsed = 0f;
        startScale = transform.localScale;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            transform.localScale = Vector3.Lerp(startScale, _originalScale, t);
            yield return null;
        }
        
        transform.localScale = _originalScale;
    }
    
#if UNITY_EDITOR
    /// <summary>
    /// 编辑器中测试闪烁效果
    /// </summary>
    [ContextMenu("测试闪烁效果")]
    private void TestBlink()
    {
        if (Application.isPlaying)
        {
            if (_isBlinking)
            {
                StopBlinking();
            }
            else
            {
                StartBlinking();
            }
        }
        else
        {
            Debug.Log("请在运行时测试闪烁效果");
        }
    }
    
    /// <summary>
    /// 编辑器中测试按钮点击
    /// </summary>
    [ContextMenu("测试按钮点击")]
    private void TestClick()
    {
        if (Application.isPlaying)
        {
            OnButtonClick();
        }
        else
        {
            Debug.Log("请在运行时测试按钮点击");
        }
    }
#endif
}













