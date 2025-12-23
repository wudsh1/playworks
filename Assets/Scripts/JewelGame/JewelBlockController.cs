using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UI;

/// <summary>
/// 宝石块控制器（负责显示和交互）
/// </summary>
public class JewelBlockController : MonoBehaviour
{
    [Header("组件引用")]
    public Image BlockImage;
    public RectTransform RectTransform;
    
    [Header("消失特效")]
    [Tooltip("蓝色块消失特效播放器（lanse）")]
    public FrameSequenceEffectPlayer LanseEffectPlayer;
    [Tooltip("粉色块消失特效播放器（fense）")]
    public FrameSequenceEffectPlayer FenseEffectPlayer;
    
    [Header("贴图配置")]
    public Sprite[] BlueSprites;    // blue-1, blue-2, blue-3, blue-4
    public Sprite[] PinkSprites;    // pink-1, pink-2, pink-3, pink-4
    
    [Header("道具贴图")]
    public Sprite DiamondSprite;     // 钻石块
    public Sprite BigBombSprite;     // 大炸弹块
    public Sprite HorizontalSprite; // 横块
    public Sprite VerticalSprite;   // 竖块
    public Sprite ExplosiveSprite;  // 炸块
    public Sprite TransformBlockSprite; // 转换块（滑动后变成BigBomb）
    
    [Header("高亮效果设置")]
    [Tooltip("高亮Shader材质（如果为空，会自动创建）")]
    public Material HighlightMaterial;
    [Tooltip("高亮颜色")]
    public Color HighlightColor = new Color(1f, 1f, 0.5f, 0.5f); // 黄色半透明
    [Tooltip("高亮脉冲速度（每秒脉冲次数）")]
    public float HighlightPulseSpeed = 2f; // 每秒2次脉冲
    [Tooltip("高亮强度范围（最小到最大）")]
    public Vector2 HighlightIntensityRange = new Vector2(0.3f, 1f); // 30%到100%强度
    [Tooltip("高亮强度（用于控制边缘高亮效果）")]
    public float HighlightPower = 2f;
    
    private JewelBlockData _blockData;
    private JewelBoardConfig _config;
    private bool _isAnimating = false; // 是否正在播放动画
    private Coroutine _highlightCoroutine; // 高亮动画协程
    private Material _originalMaterial; // 原始材质
    private Material _highlightMaterialInstance; // 高亮材质实例
    
    /// <summary>
    /// 初始化宝石块
    /// </summary>
    public void Initialize(JewelBlockData blockData, JewelBoardConfig config, float cellWidth, float cellHeight)
    {
        _blockData = blockData;
        _config = config;
        
        if (RectTransform == null)
        {
            RectTransform = GetComponent<RectTransform>();
        }
        
        if (BlockImage == null)
        {
            BlockImage = GetComponent<Image>();
        }
        
        // 设置尺寸（宽度 = 单元格宽度 × 块宽度，高度 = 单元格高度，确保是正方形单元格）
        RectTransform.sizeDelta = new Vector2(cellWidth * blockData.Width, cellHeight);
        
        // 设置贴图
        UpdateSprite();
        
        // 初始化特效播放器（初始时隐藏）
        if (LanseEffectPlayer != null && LanseEffectPlayer.gameObject != null)
        {
            LanseEffectPlayer.gameObject.SetActive(false);
            LanseEffectPlayer.AutoPlay = false; // 不自动播放
        }
        
        if (FenseEffectPlayer != null && FenseEffectPlayer.gameObject != null)
        {
            FenseEffectPlayer.gameObject.SetActive(false);
            FenseEffectPlayer.AutoPlay = false; // 不自动播放
        }
        
        // 保存原始材质
        if (BlockImage != null)
        {
            _originalMaterial = BlockImage.material;
            
            // 如果是道具块（但不是钻石块和转换块），应用高亮Shader
            if (_blockData != null && _blockData.IsItem() && !_blockData.IsDiamond() && !_blockData.IsTransformBlock())
            {
                SetupHighlightMaterial();
                StartHighlightEffect();
            }
        }
    }
    
    /// <summary>
    /// 更新贴图
    /// </summary>
    private void UpdateSprite()
    {
        if (BlockImage == null || _blockData == null) return;
        
        // 如果是道具，使用道具贴图
        if (_blockData.IsItem())
        {
            Sprite itemSprite = GetItemSprite(_blockData.Color);
            if (itemSprite != null)
            {
                BlockImage.sprite = itemSprite;
            }
        }
        else
        {
            // 普通宝石块
            Sprite[] sprites = GetSpriteArray(_blockData.Color);
            int spriteIndex = _blockData.Width - 1;
            
            if (sprites != null && spriteIndex >= 0 && spriteIndex < sprites.Length)
            {
                BlockImage.sprite = sprites[spriteIndex];
            }
        }
    }
    
    /// <summary>
    /// 根据颜色获取贴图数组
    /// </summary>
    private Sprite[] GetSpriteArray(JewelColor color)
    {
        switch (color)
        {
            case JewelColor.Blue: return BlueSprites;
            case JewelColor.Pink: return PinkSprites;
            default: return BlueSprites;
        }
    }
    
    /// <summary>
    /// 获取道具贴图
    /// </summary>
    private Sprite GetItemSprite(JewelColor color)
    {
        switch (color)
        {
            case JewelColor.Diamond: return DiamondSprite;
            case JewelColor.BigBomb: return BigBombSprite;
            case JewelColor.Horizontal: return HorizontalSprite;
            case JewelColor.Vertical: return VerticalSprite;
            case JewelColor.Explosive: return ExplosiveSprite;
            case JewelColor.TransformBlock: return TransformBlockSprite != null ? TransformBlockSprite : BlueSprites[0]; // 如果没有指定贴图，使用蓝色块贴图
            default: return null;
        }
    }
    
    /// <summary>
    /// 更新位置
    /// </summary>
    public void UpdatePosition(float cellWidth, float cellHeight, float boardWidth, float boardHeight, float bottomOffsetY = 0f)
    {
        if (RectTransform == null) return;
        
        // X坐标：从中心点计算
        float x = (cellWidth * _blockData.X) + (cellWidth * _blockData.Width / 2f) - (boardWidth / 2f);
        
        // Y坐标：从底部开始计算（Y=0对应最底一行）
        // bottomOffsetY是最底一行（Y=0）的y坐标偏移量
        float y = bottomOffsetY + (cellHeight * _blockData.Y) + (cellHeight / 2f);
        
        RectTransform.anchoredPosition = new Vector2(x, y);
        
        // 同步更新特效播放器的位置（如果存在）
        Vector2 position = new Vector2(x, y);
        if (LanseEffectPlayer != null && LanseEffectPlayer.GetComponent<RectTransform>() != null)
        {
            LanseEffectPlayer.GetComponent<RectTransform>().anchoredPosition = position;
        }
        if (FenseEffectPlayer != null && FenseEffectPlayer.GetComponent<RectTransform>() != null)
        {
            FenseEffectPlayer.GetComponent<RectTransform>().anchoredPosition = position;
        }
    }
    
    /// <summary>
    /// 播放消除动画
    /// </summary>
    public void PlayClearAnimation()
    {
        // 停止高亮效果
        StopHighlightEffect();
        
        // 如果是钻石块，播放收集动画
        if (_blockData != null && _blockData.IsDiamond())
        {
            Debug.Log($"[钻石动画] 开始播放动画，块ID: {_blockData.Id}");
            _isAnimating = true;
            StartCoroutine(DiamondCollectAnimationCoroutine());
        }
        else if (_blockData != null && !_blockData.IsItem())
        {
            // 普通宝石块，播放序列帧特效
            _isAnimating = true;
            StartCoroutine(PlaySequenceFrameEffectCoroutine());
        }
        else
        {
            // 其他道具块，使用普通消除动画
            StartCoroutine(ClearAnimationCoroutine());
        }
    }
    
    /// <summary>
    /// 播放序列帧特效协程（根据块颜色选择对应的特效）
    /// </summary>
    private IEnumerator PlaySequenceFrameEffectCoroutine()
    {
        if (_blockData == null)
        {
            _isAnimating = false;
            yield break;
        }
        
        FrameSequenceEffectPlayer effectPlayer = null;
        
        // 根据块颜色选择对应的特效播放器
        switch (_blockData.Color)
        {
            case JewelColor.Blue:
                effectPlayer = LanseEffectPlayer;
                break;
            case JewelColor.Pink:
                effectPlayer = FenseEffectPlayer;
                break;
            default:
                // 如果没有匹配的特效，使用普通动画
                StartCoroutine(ClearAnimationCoroutine());
                yield break;
        }
        
        // 如果没有对应的特效播放器，使用普通动画
        if (effectPlayer == null)
        {
            Debug.LogWarning($"[JewelBlockController] 未找到对应的特效播放器，颜色: {_blockData.Color}，使用普通消除动画");
            StartCoroutine(ClearAnimationCoroutine());
            yield break;
        }
        
        // 隐藏原始图片
        if (BlockImage != null)
        {
            BlockImage.enabled = false;
        }
        
        // 获取特效播放器的RectTransform
        RectTransform effectRectTransform = effectPlayer.GetComponent<RectTransform>();
        if (effectRectTransform == null)
        {
            Debug.LogWarning($"[JewelBlockController] 特效播放器没有RectTransform组件");
            StartCoroutine(ClearAnimationCoroutine());
            yield break;
        }
        
        // 确保特效播放器的GameObject激活
        effectPlayer.gameObject.SetActive(true);
        
        // 设置特效位置和父级（确保在正确的层级）
        if (RectTransform != null)
        {
            // 设置位置（相对于父级）
            effectRectTransform.anchoredPosition = RectTransform.anchoredPosition;
            
            // 确保特效播放器与块在同一父级下
            if (effectRectTransform.parent != RectTransform.parent)
            {
                effectRectTransform.SetParent(RectTransform.parent, false);
            }
        }
        
        // 禁用循环播放（确保只播放一次）
        bool originalLoop = effectPlayer.Loop;
        effectPlayer.Loop = false;
        
        // 播放特效
        effectPlayer.Play();
        
        Debug.Log($"[JewelBlockController] 开始播放序列帧特效，块颜色: {_blockData.Color}，块ID: {_blockData.Id}");
        
        // 等待特效播放完成（通过轮询检查播放状态）
        int totalFrames = effectPlayer.GetTotalFrames();
        float frameRate = effectPlayer.FrameRate;
        float totalDuration = (totalFrames / frameRate) + 0.1f; // 添加一点缓冲时间
        
        float elapsed = 0f;
        while (elapsed < totalDuration && this != null && effectPlayer != null)
        {
            elapsed += Time.deltaTime;
            
            // 检查是否还在播放
            if (!effectPlayer.IsPlaying() && !effectPlayer.gameObject.activeSelf)
            {
                break;
            }
            
            yield return null;
        }
        
        // 恢复原始循环设置
        if (effectPlayer != null)
        {
            effectPlayer.Loop = originalLoop;
        }
        
        // 隐藏特效播放器
        if (effectPlayer != null && effectPlayer.gameObject != null)
        {
            effectPlayer.gameObject.SetActive(false);
        }
        
        // 标记动画完成
        _isAnimating = false;
        
        // 隐藏块本身
        if (this != null && gameObject != null)
        {
            gameObject.SetActive(false);
        }
    }
    
    /// <summary>
    /// 检查是否正在播放动画
    /// </summary>
    public bool IsAnimating()
    {
        return _isAnimating;
    }
    
    /// <summary>
    /// 钻石收集动画协程（旋转+移动到目标位置）
    /// </summary>
    private IEnumerator DiamondCollectAnimationCoroutine()
    {
        if (JewelGameManager.Instance == null || JewelGameManager.Instance.DiamondTargetTransform == null)
        {
            // 如果没有目标位置，使用普通消除动画
            yield return StartCoroutine(ClearAnimationCoroutine());
            yield break;
        }
        
        float duration = 1.0f; // 动画时长（1秒，更快）
        float elapsed = 0f;
        
        // 获取起始和目标位置（使用世界坐标）
        RectTransform rectTransform = GetComponent<RectTransform>();
        Vector3 startWorldPosition = rectTransform.position;
        
        // 获取目标位置（使用世界坐标）
        RectTransform targetRect = JewelGameManager.Instance.DiamondTargetTransform;
        Vector3 targetWorldPosition = targetRect.position;
        
        Debug.Log($"[钻石动画] 起始世界坐标: {startWorldPosition}, 目标世界坐标: {targetWorldPosition}");
        
        Vector3 startRotation = transform.localEulerAngles;
        Vector3 targetRotation = startRotation + new Vector3(0, 0, 720f); // 旋转2圈
        
        Vector3 startScale = transform.localScale;
        Vector3 targetScale = Vector3.one; // 保持原始大小，不缩小
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            
                // 使用缓动曲线（ease-in-out，让动画更平滑）
                t = t * t * (3f - 2f * t); // Smoothstep

                // 位置插值（使用世界坐标）
                rectTransform.position = Vector3.Lerp(startWorldPosition, targetWorldPosition, t);
            
            // 旋转插值
            transform.localEulerAngles = Vector3.Lerp(startRotation, targetRotation, t);
            
            // 缩放插值
            transform.localScale = Vector3.Lerp(startScale, targetScale, t);
            
            yield return null;
        }
        
            // 确保最终位置准确（使用世界坐标）
            rectTransform.position = targetWorldPosition;
            transform.localEulerAngles = targetRotation;
            transform.localScale = targetScale;
        
        Debug.Log($"[钻石动画] 动画完成，块ID: {_blockData.Id}");
        
        // 标记动画完成
        _isAnimating = false;
        
        // 不隐藏对象，让BoardManager来销毁（隐藏会导致协程可能中断）
        // gameObject.SetActive(false);
    }
    
    /// <summary>
    /// 消除动画协程
    /// </summary>
    private IEnumerator ClearAnimationCoroutine()
    {
        float duration = 0.4f;
        float elapsed = 0f;
        Vector3 startScale = transform.localScale;
        Color startColor = BlockImage != null ? BlockImage.color : Color.white;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            
            // 缩放动画
            transform.localScale = Vector3.Lerp(startScale, Vector3.zero, t);
            
            // 淡出动画
            if (BlockImage != null)
            {
                Color color = startColor;
                color.a = Mathf.Lerp(startColor.a, 0f, t);
                BlockImage.color = color;
            }
            
            yield return null;
        }
        
        gameObject.SetActive(false);
    }
    
    /// <summary>
    /// 获取块数据
    /// </summary>
    public JewelBlockData GetBlockData()
    {
        return _blockData;
    }
    
    /// <summary>
    /// 设置高亮材质
    /// </summary>
    private void SetupHighlightMaterial()
    {
        if (BlockImage == null) return;
        
        // 如果没有指定材质，尝试加载Shader
        if (HighlightMaterial == null)
        {
            Shader highlightShader = Shader.Find("UI/JewelHighlight");
            if (highlightShader != null)
            {
                HighlightMaterial = new Material(highlightShader);
            }
            else
            {
                Debug.LogWarning("[JewelBlockController] 找不到UI/JewelHighlight Shader，高亮效果将不可用");
                return;
            }
        }
        
        // 创建材质实例（避免修改原始材质）
        _highlightMaterialInstance = new Material(HighlightMaterial);
        
        // 设置Shader参数
        _highlightMaterialInstance.SetColor("_HighlightColor", HighlightColor);
        _highlightMaterialInstance.SetFloat("_HighlightPower", HighlightPower);
        
        // 应用材质到Image
        BlockImage.material = _highlightMaterialInstance;
    }
    
    /// <summary>
    /// 启动高亮效果
    /// </summary>
    private void StartHighlightEffect()
    {
        if (_highlightCoroutine != null)
        {
            StopCoroutine(_highlightCoroutine);
        }
        _highlightCoroutine = StartCoroutine(HighlightPulseCoroutine());
    }
    
    /// <summary>
    /// 停止高亮效果
    /// </summary>
    private void StopHighlightEffect()
    {
        if (_highlightCoroutine != null)
        {
            StopCoroutine(_highlightCoroutine);
            _highlightCoroutine = null;
        }
        
        // 恢复原始材质
        if (BlockImage != null)
        {
            BlockImage.material = _originalMaterial;
        }
        
        // 清理材质实例
        if (_highlightMaterialInstance != null)
        {
            Destroy(_highlightMaterialInstance);
            _highlightMaterialInstance = null;
        }
    }
    
    /// <summary>
    /// 高亮脉冲动画协程
    /// </summary>
    private IEnumerator HighlightPulseCoroutine()
    {
        if (_highlightMaterialInstance == null)
        {
            yield break;
        }
        
        float time = 0f;
        
        while (true)
        {
            time += Time.deltaTime;
            
            // 计算脉冲强度（使用正弦波）
            float pulseValue = (Mathf.Sin(time * HighlightPulseSpeed * 2f * Mathf.PI) + 1f) * 0.5f; // 0到1之间
            float intensity = Mathf.Lerp(HighlightIntensityRange.x, HighlightIntensityRange.y, pulseValue);
            
            // 更新Shader的高亮强度参数
            if (_highlightMaterialInstance != null)
            {
                _highlightMaterialInstance.SetFloat("_HighlightIntensity", intensity);
            }
            
            yield return null;
        }
    }
    
    /// <summary>
    /// 当对象被销毁时清理
    /// </summary>
    private void OnDestroy()
    {
        StopHighlightEffect();
    }
}


