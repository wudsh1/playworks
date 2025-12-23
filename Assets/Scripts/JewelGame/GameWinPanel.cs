using UnityEngine;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// 游戏胜利界面
/// </summary>
public class GameWinPanel : MonoBehaviour
{
    [Header("UI引用")]
    [Tooltip("胜利界面面板")]
    public GameObject Panel;
    
    [Tooltip("跳转商店按钮")]
    public Button StoreButton;
    
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
    
    [Header("商店导航器")]
    [Tooltip("商店导航器（用于跳转商店）")]
    public StoreNavigator StoreNavigator;
    
    private Vector3 _buttonOriginalScale;
    private bool _isAnimating = false;
    
    private void Awake()
    {
        // 自动查找组件
        if (Panel == null)
        {
            Panel = gameObject;
        }
        
        if (StoreButton == null)
        {
            StoreButton = GetComponentInChildren<Button>();
        }
        
        if (ButtonText == null && StoreButton != null)
        {
            ButtonText = StoreButton.GetComponentInChildren<Text>();
        }
        
        // 记录按钮原始缩放
        if (StoreButton != null)
        {
            _buttonOriginalScale = StoreButton.transform.localScale;
        }
        
        // 绑定按钮点击事件
        if (StoreButton != null)
        {
            StoreButton.onClick.AddListener(OnStoreButtonClick);
        }
        
        // 自动查找StoreNavigator
        if (StoreNavigator == null)
        {
            StoreNavigator = FindObjectOfType<StoreNavigator>();
            if (StoreNavigator == null && JewelGameManager.Instance != null)
            {
                StoreNavigator = JewelGameManager.Instance.StoreNavigator;
            }
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
        if (StoreButton != null)
        {
            StoreButton.onClick.RemoveListener(OnStoreButtonClick);
        }
    }
    
    /// <summary>
    /// 显示胜利界面
    /// </summary>
    public void Show()
    {
        if (Panel != null)
        {
            Panel.SetActive(true);
        }
        
        // 播放按钮动画
        if (StoreButton != null && !_isAnimating)
        {
            StartCoroutine(PlayButtonScaleAnimation());
        }
    }
    
    /// <summary>
    /// 隐藏胜利界面
    /// </summary>
    public void Hide()
    {
        if (Panel != null)
        {
            Panel.SetActive(false);
        }
        
        // 重置按钮缩放
        if (StoreButton != null)
        {
            StoreButton.transform.localScale = _buttonOriginalScale;
        }
        
        _isAnimating = false;
    }
    
    /// <summary>
    /// 播放按钮从小到大的缩放动画
    /// </summary>
    private IEnumerator PlayButtonScaleAnimation()
    {
        if (StoreButton == null) yield break;
        
        _isAnimating = true;
        
        // 设置初始缩放
        Vector3 startScale = _buttonOriginalScale * ButtonStartScale;
        Vector3 endScale = _buttonOriginalScale * ButtonEndScale;
        StoreButton.transform.localScale = startScale;
        
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
            
            StoreButton.transform.localScale = Vector3.Lerp(startScale, endScale, t);
            yield return null;
        }
        
        // 确保最终缩放正确
        StoreButton.transform.localScale = endScale;
        _isAnimating = false;
    }
    
    /// <summary>
    /// 跳转商店按钮点击回调（胜利后加载下一关）
    /// </summary>
    private void OnStoreButtonClick()
    {
        Debug.Log("[GameWinPanel] 胜利按钮被点击，加载下一关");
        
        // 隐藏界面
        Hide();
        
        // 加载下一关（除第一关外都是随机关）
        if (JewelGameManager.Instance != null)
        {
            JewelGameManager.Instance.NextLevel();
        }
        else
        {
            Debug.LogError("[GameWinPanel] JewelGameManager.Instance 未找到！");
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
