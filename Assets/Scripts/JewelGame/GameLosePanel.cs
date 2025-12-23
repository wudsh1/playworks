using UnityEngine;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// 游戏失败界面
/// </summary>
public class GameLosePanel : MonoBehaviour
{
    [Header("UI引用")]
    [Tooltip("失败界面面板")]
    public GameObject Panel;
    
    [Tooltip("重玩按钮")]
    public Button RestartButton;
    
    [Tooltip("按钮文本（可选）")]
    public Text ButtonText;
    
    [Header("动画配置")]
    [Tooltip("按钮动画持续时间（秒）")]
    [Range(0.1f, 2f)]
    public float ButtonAnimationDuration = 0.5f;
    
    [Tooltip("按钮动画起始缩放比例")]
    [Range(0f, 1f)]
    public float ButtonStartScale = 0.1f;
    
    [Tooltip("按钮动画结束缩放比例")]
    [Range(0.5f, 1.5f)]
    public float ButtonEndScale = 1f;
    
    [Tooltip("动画曲线（可选，如果为空则使用线性插值）")]
    public AnimationCurve AnimationCurve;
    
    private Vector3 _buttonOriginalScale;
    private bool _isAnimating = false;
    
    private void Awake()
    {
        // 自动查找组件
        if (Panel == null)
        {
            Panel = gameObject;
        }
        
        if (RestartButton == null)
        {
            RestartButton = GetComponentInChildren<Button>();
        }
        
        if (ButtonText == null && RestartButton != null)
        {
            ButtonText = RestartButton.GetComponentInChildren<Text>();
        }
        
        // 记录按钮原始缩放
        if (RestartButton != null)
        {
            _buttonOriginalScale = RestartButton.transform.localScale;
        }
        
        // 绑定按钮点击事件
        if (RestartButton != null)
        {
            RestartButton.onClick.AddListener(OnRestartButtonClick);
        }
        
        // 默认隐藏界面
        if (Panel != null)
        {
            Panel.SetActive(false);
        }
    }
    
    private void OnDestroy()
    {
        // 取消按钮事件绑定
        if (RestartButton != null)
        {
            RestartButton.onClick.RemoveListener(OnRestartButtonClick);
        }
    }
    
    /// <summary>
    /// 显示失败界面
    /// </summary>
    public void Show()
    {
        if (Panel != null)
        {
            Panel.SetActive(true);
        }
        
        // 播放按钮动画
        if (RestartButton != null && !_isAnimating)
        {
            StartCoroutine(PlayButtonScaleAnimation());
        }
    }
    
    /// <summary>
    /// 隐藏失败界面
    /// </summary>
    public void Hide()
    {
        if (Panel != null)
        {
            Panel.SetActive(false);
        }
        
        // 重置按钮缩放
        if (RestartButton != null)
        {
            RestartButton.transform.localScale = _buttonOriginalScale;
        }
        
        _isAnimating = false;
    }
    
    /// <summary>
    /// 播放按钮从小到大的缩放动画
    /// </summary>
    private IEnumerator PlayButtonScaleAnimation()
    {
        if (RestartButton == null) yield break;
        
        _isAnimating = true;
        
        // 设置初始缩放
        Vector3 startScale = _buttonOriginalScale * ButtonStartScale;
        Vector3 endScale = _buttonOriginalScale * ButtonEndScale;
        RestartButton.transform.localScale = startScale;
        
        float elapsed = 0f;
        
        while (elapsed < ButtonAnimationDuration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / ButtonAnimationDuration;
            
            // 使用动画曲线（如果提供）或使用缓动函数
            if (AnimationCurve != null && AnimationCurve.length > 0)
            {
                t = AnimationCurve.Evaluate(t);
            }
            else
            {
                // 使用缓出缓入曲线（ease-out）
                t = 1f - Mathf.Pow(1f - t, 3f);
            }
            
            RestartButton.transform.localScale = Vector3.Lerp(startScale, endScale, t);
            yield return null;
        }
        
        // 确保最终缩放正确
        RestartButton.transform.localScale = endScale;
        _isAnimating = false;
    }
    
    /// <summary>
    /// 重玩按钮点击回调
    /// </summary>
    private void OnRestartButtonClick()
    {
        Debug.Log("[GameLosePanel] 重玩按钮被点击");
        
        // 隐藏界面
        Hide();
        
        // 调用游戏管理器的重玩方法
        if (JewelGameManager.Instance != null)
        {
            JewelGameManager.Instance.RestartGame();
        }
        else
        {
            Debug.LogError("[GameLosePanel] JewelGameManager.Instance 未找到！");
        }
    }
    
#if UNITY_EDITOR
    /// <summary>
    /// 编辑器中测试显示界面
    /// </summary>
    [ContextMenu("测试显示界面")]
    private void TestShow()
    {
        if (Application.isPlaying)
        {
            Show();
        }
        else
        {
            Debug.Log("请在运行时测试显示界面");
        }
    }
    
    /// <summary>
    /// 编辑器中测试隐藏界面
    /// </summary>
    [ContextMenu("测试隐藏界面")]
    private void TestHide()
    {
        if (Application.isPlaying)
        {
            Hide();
        }
        else
        {
            Debug.Log("请在运行时测试隐藏界面");
        }
    }
#endif
}
