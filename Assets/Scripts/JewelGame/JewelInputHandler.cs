using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// 输入处理系统（处理滑动操作）
/// </summary>
public class JewelInputHandler : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IDragHandler
{
    private JewelBlockController _activeBlock;
    private Vector2 _startDragPosition;
    private Vector2 _originalPosition;
    private float _cellWidth;
    private float _cellHeight;
    private int _minDragX; // 最小可拖动距离（像素）
    private int _maxDragX; // 最大可拖动距离（像素）
    private int _minDragY; // 最小可拖动距离Y（像素）
    private int _maxDragY; // 最大可拖动距离Y（像素）
    private bool _isDragging = false;
    private bool _isVerticalDrag = false; // 是否是垂直拖动
    
    private System.Action<JewelBlockController, int> _onBlockMovedHorizontal; // 水平移动回调
    private System.Action<JewelBlockController, int> _onBlockMovedVertical; // 垂直移动回调
    private System.Func<JewelBlockController, int, int, bool> _canMoveToPosition; // 检查是否可以移动到指定位置的回调
    private System.Action<JewelBlockController, int, int> _calculateHorizontalLimits; // 计算水平拖动限制的回调
    private System.Func<JewelBlockController, System.Tuple<int, int>> _calculateVerticalLimits; // 计算垂直拖动限制的回调
    private System.Func<int, int, JewelBlockData> _getBlockAt; // 获取指定位置的块数据
    
    private bool _inputEnabled = true; // 输入是否启用（用于在动画期间禁用输入）
    
    /// <summary>
    /// 初始化
    /// </summary>
    public void Initialize(float cellWidth, float cellHeight, System.Action<JewelBlockController, int> onBlockMovedHorizontal, System.Action<JewelBlockController, int> onBlockMovedVertical = null, System.Func<JewelBlockController, System.Tuple<int, int>> calculateVerticalLimits = null, System.Func<JewelBlockController, int, int, bool> canMoveToPosition = null, System.Action<JewelBlockController, int, int> calculateHorizontalLimits = null, System.Func<int, int, JewelBlockData> getBlockAt = null)
    {
        _cellWidth = cellWidth;
        _cellHeight = cellHeight;
        _onBlockMovedHorizontal = onBlockMovedHorizontal;
        _onBlockMovedVertical = onBlockMovedVertical;
        _calculateVerticalLimits = calculateVerticalLimits;
        _canMoveToPosition = canMoveToPosition;
        _calculateHorizontalLimits = calculateHorizontalLimits;
        _getBlockAt = getBlockAt;
    }
    
    /// <summary>
    /// 启用输入
    /// </summary>
    public void EnableInput()
    {
        _inputEnabled = true;
    }
    
    /// <summary>
    /// 禁用输入
    /// </summary>
    public void DisableInput()
    {
        _inputEnabled = false;
    }
    
    /// <summary>
    /// 开始拖动
    /// </summary>
    public void OnPointerDown(PointerEventData eventData)
    {
        if (!_inputEnabled) return; // 如果输入被禁用，直接返回
        
        GameObject hitObject = eventData.pointerCurrentRaycast.gameObject;
        if (hitObject == null) return;
        
        _activeBlock = hitObject.GetComponent<JewelBlockController>();
        if (_activeBlock == null) return;
        
        JewelBlockData blockData = _activeBlock.GetBlockData();
        
        // 不在这里检查，而是在实际移动时根据方向检查
        
        _startDragPosition = eventData.position;
        RectTransform rectTransform = _activeBlock.GetComponent<RectTransform>();
        if (rectTransform != null)
        {
            _originalPosition = rectTransform.anchoredPosition;
        }
        _isDragging = true;
        _isVerticalDrag = false;
        
        // 计算水平拖动限制
        if (_calculateHorizontalLimits != null)
        {
            _calculateHorizontalLimits(_activeBlock, 0, 0); // 占位参数，实际会在方法内部计算
        }
        else
        {
            CalculateDragLimits(_activeBlock);
        }
        
        // 如果是非钻石道具块，计算垂直拖动限制
        if (blockData != null && blockData.IsNonDiamondItem() && _calculateVerticalLimits != null)
        {
            var limits = _calculateVerticalLimits(_activeBlock);
            if (limits != null)
            {
                _minDragY = limits.Item1 * (int)_cellHeight;
                _maxDragY = limits.Item2 * (int)_cellHeight;
            }
            else
            {
                _minDragY = -1000;
                _maxDragY = 1000;
            }
        }
        else
        {
            _minDragY = -1000;
            _maxDragY = 1000;
        }
    }
    
    /// <summary>
    /// 检查指定方向是否可以合并
    /// 规则：
    /// - 横块 ↔ 炸块（任何方向）
    /// - 竖块 ↔ 炸块（任何方向）
    /// - 大炸弹 ↔ 大炸弹（任何方向）
    /// </summary>
    /// <param name="blockData">当前块数据</param>
    /// <param name="deltaX">X方向偏移（负数=左，正数=右）</param>
    /// <param name="deltaY">Y方向偏移（负数=下，正数=上）</param>
    /// <returns>是否可以在该方向合并</returns>
    private bool CanMergeInDirection(JewelBlockData blockData, int deltaX, int deltaY)
    {
        if (_getBlockAt == null)
        {
            return false;
        }
        
        int x = blockData.X;
        int y = blockData.Y;
        
        // 根据移动方向确定检查位置
        int checkX = x;
        int checkY = y;
        
        if (deltaX < 0)
        {
            // 向左移动，检查左边
            checkX = x - 1;
        }
        else if (deltaX > 0)
        {
            // 向右移动，检查右边
            checkX = x + blockData.Width;
        }
        else if (deltaY > 0)
        {
            // 向上移动，检查上方
            checkY = y + 1;
        }
        else if (deltaY < 0)
        {
            // 向下移动，检查下方
            checkY = y - 1;
        }
        else
        {
            return false; // 没有移动
        }
        
        JewelBlockData targetBlock = _getBlockAt(checkX, checkY);
        
        // 如果目标位置为空，允许移动（对于所有块类型）
        if (targetBlock == null)
        {
            return true;
        }
        
        // 根据当前块类型和目标块类型判断是否可以合并
        if (blockData.IsTransformBlock())
        {
            // 转换块：只能移动到空位置，不能与其他块重叠（包括其他转换块）
            // 如果目标位置为空，允许移动；否则不允许
            return false; // 目标位置不为空时，不允许移动
        }
        else if (blockData.IsHorizontal())
        {
            // 横块：可以和炸块合并（任何方向）
            return targetBlock.IsExplosive();
        }
        else if (blockData.IsVertical())
        {
            // 竖块：可以和炸块合并（任何方向）
            return targetBlock.IsExplosive();
        }
        else if (blockData.IsExplosive())
        {
            // 炸块：可以和横块、竖块合并（任何方向）
            return targetBlock.IsHorizontal() || targetBlock.IsVertical();
        }
        else if (blockData.IsBigBomb())
        {
            // 大炸弹：只能和大炸弹合并
            return targetBlock.IsBigBomb();
        }
        
        return false;
    }
    
    /// <summary>
    /// 检查周围是否有可合并的非钻石道具（已废弃，改用CanMergeInDirection）
    /// 规则：
    /// - 横块：任何方向有炸块
    /// - 竖块：任何方向有炸块
    /// - 炸块：任何方向有横块或竖块
    /// - 大炸弹：任何方向有另一个大炸弹
    /// </summary>
    private bool HasAdjacentMergeableItem(JewelBlockData blockData)
    {
        if (_getBlockAt == null) return true; // 如果没有提供获取块的回调，默认允许移动
        
        int x = blockData.X;
        int y = blockData.Y;
        
        if (blockData.IsHorizontal())
        {
            // 横块：只检查左右方向是否有炸块
            // 左边检查：块的X-1位置
            // 右边检查：块的X+Width位置
            JewelBlockData leftBlock = _getBlockAt(x - 1, y);
            JewelBlockData rightBlock = _getBlockAt(x + blockData.Width, y);
            
            bool hasLeftExplosive = leftBlock != null && leftBlock.IsExplosive();
            bool hasRightExplosive = rightBlock != null && rightBlock.IsExplosive();
            
            if (hasLeftExplosive || hasRightExplosive)
            {
                Debug.Log($"[输入处理] 横块找到炸块 - 左:{hasLeftExplosive}, 右:{hasRightExplosive}，可以移动");
                return true;
            }
            Debug.Log($"[输入处理] 横块左右方向没有炸块，不可移动");
            return false;
        }
        else if (blockData.IsVertical())
        {
            // 竖块：只检查上下方向是否有炸块
            JewelBlockData upBlock = _getBlockAt(x, y + 1);
            JewelBlockData downBlock = _getBlockAt(x, y - 1);
            
            if ((upBlock != null && upBlock.IsExplosive()) || 
                (downBlock != null && downBlock.IsExplosive()))
            {
                Debug.Log($"[输入处理] 竖块上下方向找到炸块，可以移动");
                return true;
            }
            Debug.Log($"[输入处理] 竖块上下方向没有炸块，不可移动");
            return false;
        }
        else if (blockData.IsExplosive())
        {
            // 炸块：上下方向有竖块，或左右方向有横块
            JewelBlockData upBlock = _getBlockAt(x, y + 1);
            JewelBlockData downBlock = _getBlockAt(x, y - 1);
            JewelBlockData leftBlock = _getBlockAt(x - 1, y);
            JewelBlockData rightBlock = _getBlockAt(x + 1, y);
            
            bool hasVerticalMatch = (upBlock != null && upBlock.IsVertical()) || 
                                   (downBlock != null && downBlock.IsVertical());
            bool hasHorizontalMatch = (leftBlock != null && leftBlock.IsHorizontal()) || 
                                     (rightBlock != null && rightBlock.IsHorizontal());
            
            if (hasVerticalMatch || hasHorizontalMatch)
            {
                Debug.Log($"[输入处理] 炸块找到可合并道具（竖块或横块），可以移动");
                return true;
            }
            Debug.Log($"[输入处理] 炸块没有找到可合并道具，不可移动");
            return false;
        }
        else if (blockData.IsBigBomb())
        {
            // 大炸弹：上下左右有另一个大炸弹
            JewelBlockData upBlock = _getBlockAt(x, y + 1);
            JewelBlockData downBlock = _getBlockAt(x, y - 1);
            JewelBlockData leftBlock = _getBlockAt(x - 1, y);
            JewelBlockData rightBlock = _getBlockAt(x + 1, y);
            
            if ((upBlock != null && upBlock.IsBigBomb()) || 
                (downBlock != null && downBlock.IsBigBomb()) ||
                (leftBlock != null && leftBlock.IsBigBomb()) || 
                (rightBlock != null && rightBlock.IsBigBomb()))
            {
                Debug.Log($"[输入处理] 大炸弹周围找到另一个大炸弹，可以移动");
                return true;
            }
            Debug.Log($"[输入处理] 大炸弹周围没有另一个大炸弹，不可移动");
            return false;
        }
        
        return false;
    }
    
    /// <summary>
    /// 拖动中
    /// </summary>
    public void OnDrag(PointerEventData eventData)
    {
        if (!_inputEnabled) return; // 如果输入被禁用，直接返回
        if (!_isDragging || _activeBlock == null) return;
        
        JewelBlockData blockData = _activeBlock.GetBlockData();
        if (blockData == null) return;
        
        float deltaX = eventData.position.x - _startDragPosition.x;
        float deltaY = eventData.position.y - _startDragPosition.y;
        
        // 非钻石道具块可以上下移动
        bool isNonDiamondItem = blockData.IsNonDiamondItem();
        
        if (isNonDiamondItem)
        {
            // 非钻石道具块：判断是水平还是垂直拖动
            if (!_isVerticalDrag)
            {
                // 判断拖动方向
                float verticalThreshold = _cellHeight * 0.3f;
                float absDeltaY = Mathf.Abs(deltaY);
                float absDeltaX = Mathf.Abs(deltaX);
                
                if (absDeltaY > absDeltaX || absDeltaY > verticalThreshold)
                {
                    _isVerticalDrag = true;
                }
            }
            
            if (_isVerticalDrag)
            {
                // 垂直拖动：先计算原始移动距离
                int gridDeltaY = Mathf.RoundToInt(deltaY / _cellHeight);
                
                // 强制限制只能移动1格（-1, 0, 1）
                gridDeltaY = Mathf.Clamp(gridDeltaY, -1, 1);
                
                // 检查是否超出垂直拖动限制
                if (gridDeltaY < 0 && deltaY < _minDragY) gridDeltaY = 0;
                if (gridDeltaY > 0 && deltaY > _maxDragY) gridDeltaY = 0;
                
                // 检查目标方向是否可以合并（非钻石道具必须检查）
                if (gridDeltaY != 0 && !CanMergeInDirection(blockData, 0, gridDeltaY))
                {
                    gridDeltaY = 0;
                }
                
                // 实时碰撞检测
                if (gridDeltaY != 0 && _canMoveToPosition != null)
                {
                    int newY = blockData.Y + gridDeltaY;
                    if (!_canMoveToPosition(_activeBlock, blockData.X, newY))
                    {
                        gridDeltaY = 0;
                    }
                }
                
                // 只允许移动计算出的格数距离
                float clampedDeltaY = gridDeltaY * _cellHeight;
                
                RectTransform rectTransform = _activeBlock.GetComponent<RectTransform>();
                if (rectTransform != null)
                {
                    rectTransform.anchoredPosition = new Vector2(_originalPosition.x, _originalPosition.y + clampedDeltaY);
                }
            }
            else
            {
                // 水平拖动（非钻石道具需要检查）
                HandleHorizontalDragForItem(deltaX, blockData);
            }
        }
        else
        {
            // 普通块和钻石块：只能水平拖动，无限制
            HandleHorizontalDrag(deltaX, blockData);
        }
    }
    
    /// <summary>
    /// 处理非钻石道具的水平拖动（带合并检查）
    /// </summary>
    private void HandleHorizontalDragForItem(float deltaX, JewelBlockData blockData)
    {
        if (deltaX < _minDragX) deltaX = _minDragX;
        if (deltaX > _maxDragX) deltaX = _maxDragX;
        
        int gridDeltaX = Mathf.RoundToInt(deltaX / _cellWidth);
        
        // 检查目标方向是否可以合并
        if (gridDeltaX != 0 && !CanMergeInDirection(blockData, gridDeltaX, 0))
        {
            gridDeltaX = 0;
            deltaX = 0;
        }
        
        // 实时碰撞检测
        if (gridDeltaX != 0 && _canMoveToPosition != null)
        {
            int newX = blockData.X + gridDeltaX;
            if (!_canMoveToPosition(_activeBlock, newX, blockData.Y))
            {
                // 找到最近的合法位置
                int originalX = blockData.X;
                int bestX = originalX;
                
                for (int testX = newX; testX >= originalX; testX--)
                {
                    if (_canMoveToPosition(_activeBlock, testX, blockData.Y))
                    {
                        bestX = testX;
                        break;
                    }
                }
                
                if (bestX == originalX)
                {
                    for (int testX = newX; testX <= originalX; testX++)
                    {
                        if (_canMoveToPosition(_activeBlock, testX, blockData.Y))
                        {
                            bestX = testX;
                            break;
                        }
                    }
                }
                
                gridDeltaX = bestX - originalX;
                deltaX = gridDeltaX * _cellWidth;
            }
        }
        
        RectTransform rectTransform = _activeBlock.GetComponent<RectTransform>();
        if (rectTransform != null)
        {
            rectTransform.anchoredPosition = new Vector2(_originalPosition.x + deltaX, _originalPosition.y);
        }
    }
    
    /// <summary>
    /// 处理水平拖动
    /// </summary>
    private void HandleHorizontalDrag(float deltaX, JewelBlockData blockData)
    {
        if (deltaX < _minDragX) deltaX = _minDragX;
        if (deltaX > _maxDragX) deltaX = _maxDragX;
        
        // 实时碰撞检测
        int gridDeltaX = Mathf.RoundToInt(deltaX / _cellWidth);
        if (_canMoveToPosition != null)
        {
            int newX = blockData.X + gridDeltaX;
            if (!_canMoveToPosition(_activeBlock, newX, blockData.Y))
            {
                // 找到最近的合法位置
                int originalX = blockData.X;
                int bestX = originalX;
                
                for (int testX = newX; testX >= originalX; testX--)
                {
                    if (_canMoveToPosition(_activeBlock, testX, blockData.Y))
                    {
                        bestX = testX;
                        break;
                    }
                }
                
                if (bestX == originalX)
                {
                    for (int testX = newX; testX <= originalX; testX++)
                    {
                        if (_canMoveToPosition(_activeBlock, testX, blockData.Y))
                        {
                            bestX = testX;
                            break;
                        }
                    }
                }
                
                gridDeltaX = bestX - originalX;
                deltaX = gridDeltaX * _cellWidth;
            }
        }
        
        RectTransform rectTransform = _activeBlock.GetComponent<RectTransform>();
        if (rectTransform != null)
        {
            rectTransform.anchoredPosition = new Vector2(_originalPosition.x + deltaX, _originalPosition.y);
        }
    }
    
    /// <summary>
    /// 结束拖动
    /// </summary>
    public void OnPointerUp(PointerEventData eventData)
    {
        if (!_inputEnabled) return; // 如果输入被禁用，直接返回
        if (!_isDragging || _activeBlock == null) return;
        
        _isDragging = false;
        
        JewelBlockData blockData = _activeBlock.GetBlockData();
        if (blockData == null)
        {
            _activeBlock = null;
            return;
        }
        
        float deltaX = eventData.position.x - _startDragPosition.x;
        float deltaY = eventData.position.y - _startDragPosition.y;
        
        bool moved = false;
        
        // 非钻石道具块可以上下移动
        if (blockData.IsNonDiamondItem() && _isVerticalDrag)
        {
            // 垂直拖动
            int gridDeltaY = Mathf.RoundToInt(deltaY / _cellHeight);
            gridDeltaY = Mathf.Clamp(gridDeltaY, -1, 1);
            
            if (gridDeltaY < 0 && deltaY < _minDragY) gridDeltaY = 0;
            if (gridDeltaY > 0 && deltaY > _maxDragY) gridDeltaY = 0;
            
            // 必须检查是否可以合并
            if (gridDeltaY != 0 && CanMergeInDirection(blockData, 0, gridDeltaY))
            {
                if (_onBlockMovedVertical != null)
                {
                    _onBlockMovedVertical(_activeBlock, gridDeltaY);
                    moved = true;
                }
            }
        }
        else
        {
            // 水平拖动
            if (deltaX < _minDragX) deltaX = _minDragX;
            if (deltaX > _maxDragX) deltaX = _maxDragX;
            
            int gridDeltaX = Mathf.RoundToInt(deltaX / _cellWidth);
            
            // 对于非钻石道具，必须再次检查是否可以合并
            if (gridDeltaX != 0 && blockData.IsNonDiamondItem())
            {
                if (CanMergeInDirection(blockData, gridDeltaX, 0))
                {
                    if (_onBlockMovedHorizontal != null)
                    {
                        _onBlockMovedHorizontal(_activeBlock, gridDeltaX);
                        moved = true;
                    }
                }
            }
            else if (gridDeltaX != 0)
            {
                // 普通块和钻石块可以自由移动
                if (_onBlockMovedHorizontal != null)
                {
                    _onBlockMovedHorizontal(_activeBlock, gridDeltaX);
                    moved = true;
                }
            }
        }
        
        if (!moved)
        {
            // 回弹到原位置
            StartCoroutine(SnapBackCoroutine(_activeBlock));
        }
        
        _activeBlock = null;
        _isVerticalDrag = false;
    }
    
    /// <summary>
    /// 回弹动画协程
    /// </summary>
    private System.Collections.IEnumerator SnapBackCoroutine(JewelBlockController block)
    {
        RectTransform rectTransform = block.GetComponent<RectTransform>();
        if (rectTransform == null) yield break;
        
        Vector2 startPos = rectTransform.anchoredPosition;
        Vector2 targetPos = _originalPosition;
        float duration = 0.2f;
        float elapsed = 0f;
        
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;
            t = 1f - (1f - t) * (1f - t); // easeOut
            rectTransform.anchoredPosition = Vector2.Lerp(startPos, targetPos, t);
            yield return null;
        }
        
        rectTransform.anchoredPosition = targetPos;
    }
    
    /// <summary>
    /// 计算拖动限制
    /// </summary>
    private void CalculateDragLimits(JewelBlockController block)
    {
        // 默认限制
        _minDragX = -1000;
        _maxDragX = 1000;
        _minDragY = -1000;
        _maxDragY = 1000;
    }
    
    /// <summary>
    /// 设置水平拖动限制（像素值）
    /// </summary>
    public void SetDragLimitsPixels(int minPixels, int maxPixels)
    {
        _minDragX = minPixels;
        _maxDragX = maxPixels;
    }
    
    /// <summary>
    /// 设置垂直拖动限制（像素值）
    /// </summary>
    public void SetVerticalDragLimitsPixels(int minPixels, int maxPixels)
    {
        _minDragY = minPixels;
        _maxDragY = maxPixels;
    }
}


