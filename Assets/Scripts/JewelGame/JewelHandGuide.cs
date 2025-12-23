using System.Collections;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 手部引导控制器
/// </summary>
public class JewelHandGuide : MonoBehaviour
{
    [Header("组件引用")]
    public Image HandImage; // 手部图片
    public RectTransform HandRectTransform; // 手部RectTransform
    
    [Header("引导设置")]
    [Tooltip("引导所在的行（从0开始，第4行=3）")]
    public int GuideRow = 3; // 第4行（Y=3）
    [Tooltip("引导起始列（从0开始，第7列=6）")]
    public int GuideStartColumn = 6; // 第7列（X=6）
    [Tooltip("引导结束列（从0开始，第8列=7）")]
    public int GuideEndColumn = 7; // 第8列（X=7）
    [Tooltip("左右移动速度（秒）")]
    public float MoveDuration = 1.0f; // 移动一次的时间
    
    [Header("高级设置")]
    [Tooltip("自动调整父物体层级（确保在正确的Canvas下）")]
    public bool AutoAdjustParent = true;
    [Tooltip("手部图标相对游戏板的Y轴偏移（用于微调位置）")]
    public float YOffset = 0f;
    [Tooltip("手部图标相对游戏板的X轴偏移（用于微调位置）")]
    public float XOffset = 0f;
    
    [Header("调试工具")]
    [Tooltip("显示调试信息（在场景中绘制目标位置）")]
    public bool ShowDebugInfo = true;
    [Tooltip("使用世界坐标而非局部坐标（某些情况下更准确）")]
    public bool UseWorldPosition = false;
    
    private JewelBoardManager _boardManager;
    private bool _isActive = false;
    private Coroutine _moveCoroutine;
    private RectTransform _boardContainerRect; // 游戏板容器的 RectTransform
    
    /// <summary>
    /// 初始化引导
    /// </summary>
    public void Initialize(JewelBoardManager boardManager)
    {
        _boardManager = boardManager;
        
        if (HandImage == null)
        {
            HandImage = GetComponent<Image>();
        }
        
        if (HandRectTransform == null)
        {
            HandRectTransform = GetComponent<RectTransform>();
        }
        
        // 获取游戏板容器的 RectTransform
        if (_boardManager != null && _boardManager.BoardContainer != null)
        {
            _boardContainerRect = _boardManager.BoardContainer;
            
            Debug.Log($"[JewelHandGuide] 游戏板容器: {_boardContainerRect.name}, 手部父物体: {(HandRectTransform != null ? HandRectTransform.parent?.name : "null")}");
        }
        
        // 加载手部图片（如果未在Inspector中设置）
        if (HandImage != null && HandImage.sprite == null)
        {
            // 尝试从Resources文件夹加载
            Sprite handSprite = Resources.Load<Sprite>("手");
            if (handSprite == null)
            {
                // 尝试从素材集合文件夹加载
                handSprite = Resources.Load<Sprite>("素材集合/手");
            }
            
            if (handSprite != null)
            {
                HandImage.sprite = handSprite;
            }
            else
            {
                Debug.LogWarning("[JewelHandGuide] 无法加载手部图片。请在Inspector中手动设置HandImage的Sprite，或将图片放在Resources文件夹中");
            }
        }
        
        // 初始隐藏
        if (HandImage != null)
        {
            HandImage.gameObject.SetActive(false);
        }
        
        Debug.Log($"[JewelHandGuide] 初始化完成。游戏板容器: {(_boardContainerRect != null ? _boardContainerRect.name : "null")}, 手部父物体: {(HandRectTransform != null ? HandRectTransform.parent?.name : "null")}");
        
        // 检查手部图片组件
        if (HandImage != null)
        {
            Debug.Log($"[JewelHandGuide] 手部图片组件:");
            Debug.Log($"  - Sprite: {(HandImage.sprite != null ? HandImage.sprite.name : "null")}");
            Debug.Log($"  - Color: {HandImage.color}");
            Debug.Log($"  - Raycast Target: {HandImage.raycastTarget}");
            Debug.Log($"  - GameObject Active: {HandImage.gameObject.activeSelf}");
        }
        else
        {
            Debug.LogWarning($"[JewelHandGuide] ⚠️ HandImage 组件未设置！");
        }
    }
    
    /// <summary>
    /// 显示引导
    /// </summary>
    public void ShowGuide()
    {
        if (_boardManager == null || HandImage == null || HandRectTransform == null)
        {
            Debug.LogWarning("[JewelHandGuide] 组件未正确初始化");
            return;
        }
        
        _isActive = true;
        HandImage.gameObject.SetActive(true);
        
        // 延迟一帧等待方块生成完成
        StartCoroutine(ShowGuideDelayed());
    }
    
    /// <summary>
    /// 延迟显示引导（等待方块生成完成）
    /// </summary>
    private IEnumerator ShowGuideDelayed()
    {
        // 等待一帧，确保所有方块已生成和渲染（LoadLevelData 完成后）
        yield return null;
        
        // 🎯 直接使用与 CreateBlock 相同的计算方式
        UpdateHandPositionLikeBlock();
        
        
        // 开始左右移动动画
        if (_moveCoroutine != null)
        {
            StopCoroutine(_moveCoroutine);
        }
        _moveCoroutine = StartCoroutine(MoveHandCoroutine());
    }
    
    /// <summary>
    /// 使用与方块完全相同的方式更新位置（调用 BoardManager 的方法）
    /// </summary>
    private void UpdateHandPositionLikeBlock()
    {
        if (_boardManager == null || HandRectTransform == null) return;
        
        float cellWidth = _boardManager.GetCellWidth();
        float cellHeight = _boardManager.GetCellHeight();
        float boardWidth = _boardManager.GetBoardWidth();
        float bottomOffsetY = _boardManager.GetBottomOffsetY();
        
        // 🎯 与 JewelBlockController.UpdatePosition() 完全相同的公式
        // 把手部当作一个 Width=1 的方块
        float x = (cellWidth * GuideStartColumn - 1) + (cellWidth * 1 / 2f) - (boardWidth / 2f);
        float y = bottomOffsetY + (cellHeight * GuideRow - 1) + (cellHeight / 2f);
        
        // 应用偏移量
        x += XOffset;
        y += YOffset;
        
        // 设置 anchoredPosition
        HandRectTransform.anchoredPosition = new Vector2(x, y);
        
    }
    
    
    /// <summary>
    /// 隐藏引导
    /// </summary>
    public void HideGuide()
    {
        _isActive = false;
        
        if (_moveCoroutine != null)
        {
            StopCoroutine(_moveCoroutine);
            _moveCoroutine = null;
        }
        
        if (HandImage != null)
        {
            HandImage.gameObject.SetActive(false);
        }
    }
    
    /// <summary>
    /// 更新手部位置（使用与方块完全相同的计算公式）
    /// </summary>
    private void UpdateHandPosition()
    {
        if (_boardManager == null || HandRectTransform == null) return;
        
        // 获取游戏板的尺寸信息
        float cellWidth = _boardManager.GetCellWidth();
        float cellHeight = _boardManager.GetCellHeight();
        float boardWidth = _boardManager.GetBoardWidth();
        float bottomOffsetY = _boardManager.GetBottomOffsetY();
        
        // 🎯 使用与 JewelBlockController.UpdatePosition() 完全相同的公式
        // 假设手部引导是一个虚拟的 1x1 方块，位于 (GuideStartColumn, GuideRow)
        float targetX = (cellWidth * GuideStartColumn) + (cellWidth / 2f) - (boardWidth / 2f);
        float targetY = bottomOffsetY + (cellHeight * GuideRow) + (cellHeight / 2f);
        
        // 应用偏移量
        targetX += XOffset;
        targetY += YOffset;
        
        // 设置位置
        HandRectTransform.anchoredPosition = new Vector2(targetX, targetY);
        

    }
    
    /// <summary>
    /// 左右移动动画协程（使用与方块完全相同的计算公式）
    /// </summary>
    private IEnumerator MoveHandCoroutine()
    {
        if (_boardManager == null || HandRectTransform == null) yield break;
        
        float cellWidth = _boardManager.GetCellWidth();
        float cellHeight = _boardManager.GetCellHeight();
        float boardWidth = _boardManager.GetBoardWidth();
        float bottomOffsetY = _boardManager.GetBottomOffsetY();
        
        // 🎯 使用与方块完全相同的计算公式（把手部当作 Width=1 的方块）
        float startX = (cellWidth * GuideStartColumn) + (cellWidth * 1 / 2f) - (boardWidth / 2f) + XOffset;
        float endX = (cellWidth * GuideEndColumn) + (cellWidth * 1 / 2f) - (boardWidth / 2f) + XOffset;
        float y = bottomOffsetY + (cellHeight * GuideRow) + (cellHeight / 2f) + YOffset;
        

        while (_isActive)
        {
            // 从左到右
            yield return StartCoroutine(MoveToPosition(startX, endX, y, MoveDuration));
            
            // 从右到左
            yield return StartCoroutine(MoveToPosition(endX, startX, y, MoveDuration));
        }
    }
    
    /// <summary>
    /// 移动到指定位置
    /// </summary>
    private IEnumerator MoveToPosition(float fromX, float toX, float y, float duration)
    {
        if (HandRectTransform == null) yield break;
        
        float elapsed = 0f;
        Vector2 startPos = new Vector2(fromX, y);
        Vector2 endPos = new Vector2(toX, y);
        
        while (elapsed < duration && _isActive)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            
            // 使用缓动曲线（ease-in-out）
            t = t * t * (3f - 2f * t); // Smoothstep
            
            HandRectTransform.anchoredPosition = Vector2.Lerp(startPos, endPos, t);
            
            yield return null;
        }
        
        // 确保最终位置准确
        if (_isActive && HandRectTransform != null)
        {
            HandRectTransform.anchoredPosition = endPos;
        }
    }
    
    private void OnDestroy()
    {
        if (_moveCoroutine != null)
        {
            StopCoroutine(_moveCoroutine);
        }
    }



}

