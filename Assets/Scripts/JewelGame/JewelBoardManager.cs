using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 游戏板管理器（核心逻辑：重力、消除、生成）
/// </summary>
public class JewelBoardManager : MonoBehaviour
{
    [Header("配置")]
    public JewelBoardConfig Config;
    
    [Header("关卡数据（可选）")]
    [Tooltip("如果设置了关卡数据，将使用关卡数据中的初始布局")]
    public JewelLevelData LevelData;
    
    [Header("预制体")]
    public GameObject BlockPrefab;
    
    [Header("UI引用")]
    public RectTransform BoardContainer;
    public GraphicRaycaster Raycaster;
    
    [Header("位置设置")]
    [Tooltip("最底一行（Y=0）的y坐标，如果为0则自动计算")]
    public float BottomRowY = -694f;
    
    private List<JewelBlockData> _blocks = new List<JewelBlockData>();
    private List<JewelBlockData> _nextRowData = new List<JewelBlockData>();
    private int _blockIdCounter = 0;
    private bool _isProcessing = false;
    private int _moveCount = 0; // 移动计数器，用于控制TransformBlock转换
    private static bool _isFirstLevel = true; // 是否是第一关（静态，整个游戏生命周期只第一关使用关卡数据）
    private int _firstLevelMoveCount = 0; // 第一关移动次数计数器（用于第5步后生成bigbomb）
    private bool _isCurrentlyFirstLevel = true; // 当前是否是第一关（用于追踪第一关的移动次数）
    private bool _hasSpawnedStep5BigBomb = false; // 是否已经在第5步后生成过bigbomb
    private bool _pendingStep5BigBombSpawn = false; // 是否等待上推完成后生成bigbomb
    
    private float _cellWidth;
    private float _cellHeight;
    private float _boardWidth;
    private float _boardHeight;
    private float _bottomOffsetY; // 底部偏移量（最底一行的y坐标）
    
    // 公共访问器（用于引导系统等）
    public float GetCellWidth() => _cellWidth;
    public float GetCellHeight() => _cellHeight;
    public float GetBoardWidth() => _boardWidth;
    public float GetBottomOffsetY() => _bottomOffsetY;
    public bool IsProcessing => _isProcessing; // 是否正在处理游戏逻辑（用于防止在处理期间检查胜负条件）
    
    private JewelInputHandler _inputHandler;
    
    // 事件
    public System.Action<int, bool> OnRowCleared; // 参数：行数，是否有钻石销毁
    public System.Action<int> OnCombo;
    public System.Action OnGameOver;
    public System.Action OnMoveMade; // 移动完成事件
    public System.Action<JewelColor> OnItemSpawned; // 道具生成事件
    public System.Action<int> OnDiamondCountChanged; // 钻石块数量变化事件
    
    [Header("道具配置（如果为0则使用Config中的值）")]
    [Tooltip("消除一行时生成道具的概率（0-1），如果为0则使用Config中的值")]
    [Range(0f, 1f)]
    public float ItemSpawnChance = 0f; // 0表示使用Config中的值
    
    private void Awake()
    {
        if (Config == null)
        {
            Debug.LogError("JewelBoardConfig未设置！");
            return;
        }
        
        if (!Config.Validate())
        {
            Debug.LogError("游戏板配置无效！");
            return;
        }
        
        CalculateBoardMetrics();
    }
    
    private void Start()
    {
        InitializeInputHandler();
        InitializeGame();
    }
    
    /// <summary>
    /// 计算游戏板尺寸（确保单元格是正方形）
    /// </summary>
    private void CalculateBoardMetrics()
    {
        if (BoardContainer == null) return;
        
        _boardWidth = BoardContainer.rect.width;
        _boardHeight = BoardContainer.rect.height;
        
        // 计算基于宽度和高度的单元格尺寸
        float cellSizeByWidth = _boardWidth / Config.Columns;
        float cellSizeByHeight = _boardHeight / Config.Rows;
        
        // 取较小值，确保单元格是正方形且能完整显示
        float cellSize = Mathf.Min(cellSizeByWidth, cellSizeByHeight);
        
        // 使用统一的单元格尺寸（正方形）
        _cellWidth = cellSize;
        _cellHeight = cellSize;
        
        // 重新计算实际使用的游戏板尺寸（基于正方形单元格）
        _boardWidth = _cellWidth * Config.Columns;
        _boardHeight = _cellHeight * Config.Rows;
        
        // 计算底部偏移量（最底一行Y=0的y坐标）
        // 如果指定了BottomRowY，直接使用该值；否则自动计算
        if (BottomRowY != 0f)
        {
            // 使用指定的底部Y坐标
            // 在UpdatePosition中：y = bottomOffsetY + (cellHeight * Y) + (cellHeight / 2f)
            // 当Y=0时，y = bottomOffsetY + cellHeight/2 = BottomRowY
            // 所以：bottomOffsetY = BottomRowY - cellHeight/2
            _bottomOffsetY = BottomRowY - (_cellHeight / 2f);
        }
        else
        {
            // 自动计算：根据容器尺寸计算
            RectTransform containerRect = BoardContainer.GetComponent<RectTransform>();
            if (containerRect != null)
            {
                // 获取容器的底部位置（相对于锚点）
                // 如果容器锚点在中心，底部是 -rect.height/2
                float containerBottom = -containerRect.rect.height / 2f;
                _bottomOffsetY = containerBottom - (_cellHeight / 2f);
            }
            else
            {
                // 默认从底部开始（如果锚点在底部，则从0开始）
                _bottomOffsetY = -(_cellHeight / 2f);
            }
        }
    }
    
    /// <summary>
    /// 初始化输入处理
    /// </summary>
    private void InitializeInputHandler()
    {
        _inputHandler = gameObject.AddComponent<JewelInputHandler>();
        _inputHandler.Initialize(_cellWidth, _cellHeight, OnBlockMovedHorizontal, OnBlockMovedVertical, CalculateVerticalLimitsForInputHandler, CanBlockMoveToPosition, CalculateHorizontalLimitsForInputHandler, GetBlockAt);
    }
    
    /// <summary>
    /// 转换所有TransformBlock为BigBomb（在moves改变时调用，需要两次移动后才转换）
    /// </summary>
    private void ConvertAllTransformBlocks()
    {
        _moveCount++;
        Debug.Log($"[转换块] 移动计数: {_moveCount}");
        
        // 只有在第二次移动后才转换
        if (_moveCount < 2)
        {
            Debug.Log($"[转换块] 还需要 {2 - _moveCount} 次移动才会转换TransformBlock为BigBomb");
            return;
        }
        
        foreach (var block in _blocks)
        {
            if (block.IsTransformBlock())
            {
                Debug.Log($"[转换块] 检测到TransformBlock，转换为BigBomb (块ID: {block.Id}, 位置: X={block.X}, Y={block.Y})");
                block.Color = JewelColor.BigBomb;
                
                // 更新贴图
                if (block.BlockObject != null)
                {
                    JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                    if (controller != null)
                    {
                        controller.Initialize(block, Config, _cellWidth, _cellHeight);
                        controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
                    }
                }
            }
        }
        
        // 转换完成后重置计数器
        _moveCount = 0;
    }
    
    /// <summary>
    /// 获取指定位置的块数据
    /// 注意：考虑块的宽度，一个块可能占据多个X坐标
    /// </summary>
    private JewelBlockData GetBlockAt(int x, int y)
    {
        foreach (var block in _blocks)
        {
            // 检查块是否在指定位置（考虑块的宽度）
            if (block.Y == y && x >= block.X && x < block.X + block.Width)
            {
                return block;
            }
        }
        return null;
    }
    
    /// <summary>
    /// 为输入处理器计算垂直拖动限制
    /// </summary>
    private System.Tuple<int, int> CalculateVerticalLimitsForInputHandler(JewelBlockController controller)
    {
        JewelBlockData blockData = controller.GetBlockData();
        if (blockData != null)
        {
            bool isNonDiamondItem = blockData.IsNonDiamondItem();
            bool isBigBomb = blockData.IsBigBomb();
            
            if (isBigBomb)
            {
                Debug.Log($"[BigBomb垂直限制] 计算垂直拖动限制，IsNonDiamondItem: {isNonDiamondItem}, IsBigBomb: {isBigBomb}");
            }
            
            if (isNonDiamondItem)
        {
            int minGrid, maxGrid;
            CalculateVerticalDragLimitsForBlock(blockData, out minGrid, out maxGrid);
                if (isBigBomb)
                {
                    Debug.Log($"[BigBomb垂直限制] 限制范围: min={minGrid}, max={maxGrid}, 当前Y={blockData.Y}, X={blockData.X}");
                    Debug.Log($"[BigBomb垂直限制] 允许移动范围: Y={blockData.Y + minGrid} 到 Y={blockData.Y + maxGrid}");
                }
            return new System.Tuple<int, int>(minGrid, maxGrid);
            }
        }
        return new System.Tuple<int, int>(-1000, 1000);
    }
    
    /// <summary>
    /// 为输入处理器计算水平拖动限制
    /// </summary>
    private void CalculateHorizontalLimitsForInputHandler(JewelBlockController controller, int unused1, int unused2)
    {
        JewelBlockData blockData = controller.GetBlockData();
        if (blockData != null)
        {
            int minGridDelta, maxGridDelta;
            CalculateDragLimitsForBlock(blockData, out minGridDelta, out maxGridDelta);
            
            // 将网格单位转换为像素
            int minPixels = minGridDelta * (int)_cellWidth;
            int maxPixels = maxGridDelta * (int)_cellWidth;
            
            // 设置拖动限制
            _inputHandler.SetDragLimitsPixels(minPixels, maxPixels);
        }
    }
    
    /// <summary>
    /// 重置第一关标志（用于重试时重新加载第一关）
    /// </summary>
    public void ResetFirstLevel()
    {
        _isFirstLevel = true;
        Debug.Log("[游戏逻辑] 重置第一关标志，重试时将重新加载第一关");
    }
    
    /// <summary>
    /// 初始化游戏（公开方法，供外部调用）
    /// </summary>
    public void InitializeGame()
    {
        // 清除现有块
        _blocks.Clear();
        _blockIdCounter = 0;
        _moveCount = 0; // 重置移动计数器
        _firstLevelMoveCount = 0; // 重置第一关移动计数器
        _hasSpawnedStep5BigBomb = false; // 重置bigbomb生成标志
        
        foreach (Transform child in BoardContainer)
        {
            Destroy(child.gameObject);
        }
        
        // 只有第一关且有关卡数据时，才使用关卡数据中的初始布局
        // 从第二关开始，都使用随机生成
        bool hasLevelData = _isFirstLevel && LevelData != null && LevelData.InitialBlocks.Count > 0;
        
        // 记录当前是否是第一关（只要 _isFirstLevel 是 true，就是第一关，不管是否有关卡数据）
        _isCurrentlyFirstLevel = _isFirstLevel;
        Debug.Log($"[游戏逻辑] 初始化游戏: _isFirstLevel={_isFirstLevel}, hasLevelData={hasLevelData}, LevelData={(LevelData != null ? "存在" : "null")}, InitialBlocks.Count={(LevelData != null ? LevelData.InitialBlocks.Count : 0)}, _isCurrentlyFirstLevel={_isCurrentlyFirstLevel}");
        
        if (hasLevelData)
        {
            Debug.Log("[游戏逻辑] 第一关，使用关卡数据");
            LoadLevelData();
            _isFirstLevel = false; // 标记已使用过关卡数据，之后都是随机关卡
        }
        else
        {
            Debug.Log("[游戏逻辑] 随机关卡，生成随机初始行（填满游戏板，包含6-7个钻石块）");
            // 生成随机关卡（填满游戏板，包含6-7个钻石块）
            GenerateRandomLevel();
        }
        
        // 稳定游戏板（让所有块下落到底部）
        // 如果加载了关卡数据，不应用重力（保持关卡设计的位置）
        // 否则应用重力让随机生成的块下落到底部
        if (!hasLevelData)
        {
            StabilizeBoardInstant();
        }
        
        // 生成下一行预览
        GenerateNextRowData();
        
        // 渲染所有块
        RenderAllBlocks();
        
        // 更新钻石块计数
        UpdateDiamondCount();
    }
    
    /// <summary>
    /// 从关卡数据加载初始布局
    /// </summary>
    private void LoadLevelData()
    {
        if (LevelData == null) return;
        
        // 更新配置（如果关卡数据中有不同的尺寸）
        if (LevelData.Columns > 0 && LevelData.Rows > 0)
        {
            Config.Columns = LevelData.Columns;
            Config.Rows = LevelData.Rows;
            CalculateBoardMetrics(); // 重新计算尺寸
        }
        
        // 加载所有初始块
        foreach (var blockData in LevelData.InitialBlocks)
        {
            if (blockData.X >= 0 && blockData.X < Config.Columns && 
                blockData.Y >= 0 && blockData.Y < Config.Rows)
            {
                JewelBlockData jewelBlock = new JewelBlockData(
                    _blockIdCounter++,
                    blockData.X,
                    blockData.Y,
                    blockData.Width,
                    blockData.Color
                );
                CreateBlock(jewelBlock);
            }
        }
    }
    
    /// <summary>
    /// 生成一行数据
    /// </summary>
    private void SpawnRowData(int yLevel)
    {
        List<JewelBlockData> rowBlocks = GenerateRowData(yLevel);
        foreach (var blockData in rowBlocks)
        {
            CreateBlock(blockData);
        }
    }
    
    /// <summary>
    /// 生成随机关卡（包含空位，包含6-7个钻石块）
    /// </summary>
    private void GenerateRandomLevel()
    {
        // 生成所有行的块（允许留空，使用原来的生成逻辑）
        for (int y = 0; y < Config.Rows; y++)
        {
            List<JewelBlockData> rowBlocks = GenerateRowData(y);
            foreach (var blockData in rowBlocks)
            {
                CreateBlock(blockData);
            }
        }
        
        // 收集所有已创建的块
        List<JewelBlockData> allBlocks = new List<JewelBlockData>(_blocks);
        
        // 随机选择6-7个块，将它们改为钻石块
        int diamondCount = Random.Range(6, 8); // 6或7个钻石块
        Debug.Log($"[游戏逻辑] 随机生成 {diamondCount} 个钻石块");
        
        // 过滤出可以转换为钻石的块（排除已经是道具的块，且宽度为1的块优先）
        List<JewelBlockData> candidateBlocks = new List<JewelBlockData>();
        foreach (var block in allBlocks)
        {
            // 只选择普通块（蓝色或粉色），且宽度为1的块
            if (!block.IsItem() && block.Width == 1)
            {
                candidateBlocks.Add(block);
            }
        }
        
        // 如果候选块不足，也考虑宽度大于1的块（需要拆分）
        if (candidateBlocks.Count < diamondCount)
        {
            foreach (var block in allBlocks)
            {
                if (!block.IsItem() && block.Width > 1 && !candidateBlocks.Contains(block))
                {
                    candidateBlocks.Add(block);
                }
            }
        }
        
        // 随机选择要转换为钻石的块
        if (candidateBlocks.Count > 0)
        {
            // 打乱候选列表（Fisher-Yates洗牌算法）
            for (int i = candidateBlocks.Count - 1; i > 0; i--)
            {
                int randomIndex = Random.Range(0, i + 1);
                var temp = candidateBlocks[i];
                candidateBlocks[i] = candidateBlocks[randomIndex];
                candidateBlocks[randomIndex] = temp;
            }
            
            // 选择前diamondCount个块转换为钻石（但不超过候选数量）
            int targetCount = Mathf.Min(diamondCount, candidateBlocks.Count);
            int convertedCount = 0;
            
            foreach (var block in candidateBlocks)
            {
                if (convertedCount >= targetCount) break;
                
                if (block.Width == 1)
                {
                    // 直接转换
                    block.Color = JewelColor.Diamond;
                    // 更新贴图
                    if (block.BlockObject != null)
                    {
                        JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                        if (controller != null)
                        {
                            controller.Initialize(block, Config, _cellWidth, _cellHeight);
                            controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
                        }
                    }
                    convertedCount++;
                }
                else if (block.Width > 1)
                {
                    // 宽度大于1的块，需要拆分：将第一个位置改为钻石，其余位置保持不变
                    int originalX = block.X;
                    int originalY = block.Y;
                    int originalWidth = block.Width;
                    JewelColor originalColor = block.Color;
                    
                    // 删除原块
                    if (block.BlockObject != null)
                    {
                        Destroy(block.BlockObject);
                    }
                    _blocks.Remove(block);
                    
                    // 创建钻石块（1x1）
                    JewelBlockData diamondBlock = new JewelBlockData(_blockIdCounter++, originalX, originalY, 1, JewelColor.Diamond);
                    CreateBlock(diamondBlock);
                    
                    // 创建剩余部分（如果宽度>1）
                    if (originalWidth > 1)
                    {
                        JewelBlockData remainingBlock = new JewelBlockData(_blockIdCounter++, originalX + 1, originalY, originalWidth - 1, originalColor);
                        CreateBlock(remainingBlock);
                    }
                    
                    convertedCount++;
                }
            }
            
            Debug.Log($"[游戏逻辑] 成功生成 {convertedCount} 个钻石块（目标: {diamondCount}）");
        }
        else
        {
            Debug.LogWarning("[游戏逻辑] 没有可用的候选块来生成钻石块");
        }
    }
    
    /// <summary>
    /// 生成一行数据（算法）- 填满版本（不留空，确保有足够的宽度为1的块）
    /// </summary>
    private List<JewelBlockData> GenerateRowDataFilled(int yLevel = 0)
    {
        List<JewelBlockData> rowBlocks = new List<JewelBlockData>();
        int currentX = 0;
        
        while (currentX < Config.Columns)
        {
            int remainingWidth = Config.Columns - currentX;
            int maxWidth = Mathf.Min(Config.MaxBlockWidth, remainingWidth);
            
            // 如果剩余空间不足，使用剩余的所有空间
            int width;
            if (remainingWidth <= Config.MaxBlockWidth)
            {
                width = remainingWidth;
            }
            else
            {
                // 随机宽度，但确保能填满整行
                // 为了确保有足够的宽度为1的块用于转换为钻石，增加宽度为1的概率
                if (Random.value < 0.4f && remainingWidth > 1)
                {
                    // 40%概率生成宽度为1的块
                    width = 1;
                }
                else
                {
                    width = Random.Range(Config.MinBlockWidth, maxWidth + 1);
                }
                
                // 如果剩余空间刚好，使用剩余空间
                if (currentX + width >= Config.Columns)
                {
                    width = remainingWidth;
                }
            }
            
            // 随机颜色（目前只有2种：蓝色和粉色）
            JewelColor color = (JewelColor)Random.Range(0, 2);
            
            JewelBlockData blockData = new JewelBlockData(_blockIdCounter++, currentX, yLevel, width, color);
            rowBlocks.Add(blockData);
            currentX += width;
        }
        
        return rowBlocks;
    }
    
    /// <summary>
    /// 生成一行数据（算法）
    /// </summary>
    private List<JewelBlockData> GenerateRowData(int yLevel = 0)
    {
        List<JewelBlockData> rowBlocks = new List<JewelBlockData>();
        int currentX = 0;
        
        while (currentX < Config.Columns)
        {
            int maxWidth = Mathf.Min(Config.MaxBlockWidth, Config.Columns - currentX);
            
            // 15%概率留空
            if (Random.value < 0.15f && currentX < Config.Columns - 1)
            {
                currentX++;
                continue;
            }
            
            // 为了确保有足够的宽度为1的块可以转换为钻石，增加宽度为1的概率
            int width;
            if (Random.value < 0.35f && maxWidth >= 1)
            {
                // 35%概率生成宽度为1的块
                width = 1;
            }
            else
            {
                width = Random.Range(Config.MinBlockWidth, Mathf.Min(3, maxWidth) + 1);
            }
            
            int existingWidth = 0;
            foreach (var b in rowBlocks)
            {
                existingWidth += b.Width;
            }
            
            if (currentX + width >= Config.Columns && existingWidth + width >= Config.Columns)
            {
                break;
            }
            
            // 随机颜色（目前只有2种：蓝色和粉色）
            JewelColor color = (JewelColor)Random.Range(0, 2);
            
            JewelBlockData blockData = new JewelBlockData(_blockIdCounter++, currentX, yLevel, width, color);
            rowBlocks.Add(blockData);
            currentX += width;
        }
        
        return rowBlocks;
    }
    
    /// <summary>
    /// 创建块对象
    /// </summary>
    private void CreateBlock(JewelBlockData blockData)
    {
        GameObject blockObj = Instantiate(BlockPrefab, BoardContainer);
        
        // 确保GameObject被激活
        blockObj.SetActive(true);
        
        JewelBlockController controller = blockObj.GetComponent<JewelBlockController>();
        
        if (controller == null)
        {
            controller = blockObj.AddComponent<JewelBlockController>();
        }
        
        controller.Initialize(blockData, Config, _cellWidth, _cellHeight);
        controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
        
        blockData.BlockObject = blockObj;
        _blocks.Add(blockData);
        
        // 如果是BigBomb，添加调试日志
        if (blockData.IsBigBomb())
        {
            Debug.Log($"[CreateBlock] BigBomb已创建: ID={blockData.Id}, X={blockData.X}, Y={blockData.Y}, GameObject激活={blockObj.activeSelf}, 父级={BoardContainer.name}");
        }
        
        // 如果是钻石块，更新计数
        if (blockData.IsDiamond())
        {
            UpdateDiamondCount();
        }
    }
    
    /// <summary>
    /// 稳定游戏板（让所有块立即下落到底部）
    /// </summary>
    private void StabilizeBoardInstant()
    {
        bool moved = true;
        while (moved)
        {
            moved = false;
            _blocks.Sort((a, b) => a.Y.CompareTo(b.Y));
            
            foreach (var block in _blocks)
            {
                if (block.Y == 0) continue;
                
                // 所有块都受重力影响（包括道具块）
                if (!block.HasSupport(_blocks))
                {
                    block.Y--;
                    moved = true;
                }
            }
        }
    }
    
    /// <summary>
    /// 渲染所有块
    /// </summary>
    private void RenderAllBlocks()
    {
        foreach (var block in _blocks)
        {
            if (block.BlockObject != null)
            {
                JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                if (controller != null)
                {
                    controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
                }
            }
        }
    }
    
    /// <summary>
    /// 检查两个块是否可以重叠（允许道具交互，但不允许普通块重叠）
    /// </summary>
    private bool CanBlocksOverlap(JewelBlockData movingBlock, JewelBlockData targetBlock)
    {
        // TransformBlock 像普通块一样，不能与其他块重叠（包括其他 TransformBlock）
        // 如果目标是 TransformBlock，也不允许重叠
        if (movingBlock.IsTransformBlock() || targetBlock.IsTransformBlock())
        {
            return false; // TransformBlock 不能与其他块重叠
        }
        
        // 如果移动的块是横块或竖块，且目标是炸块，允许移动（用于触发交互）
        bool isMovingItem = movingBlock.IsHorizontal() || movingBlock.IsVertical();
        bool isTargetExplosive = targetBlock.IsExplosive();
        
        // 如果移动的块是炸块，且目标是横块或竖块，允许移动（用于触发交互）
        bool isMovingExplosive = movingBlock.IsExplosive();
        bool isTargetHorizontal = targetBlock.IsHorizontal();
        bool isTargetVertical = targetBlock.IsVertical();
        
        // 两个BigBomb可以重叠（用于触发交互）
        bool isMovingBigBomb = movingBlock.IsBigBomb();
        bool isTargetBigBomb = targetBlock.IsBigBomb();
        
        if (isMovingBigBomb && isTargetBigBomb)
        {
            Debug.Log($"[BigBomb重叠] 允许两个BigBomb重叠，移动块: ({movingBlock.X}, {movingBlock.Y}), 目标块: ({targetBlock.X}, {targetBlock.Y})");
        }
        
        // 只允许特定的道具交互重叠
        if ((isMovingItem && isTargetExplosive) || 
            (isMovingExplosive && (isTargetHorizontal || isTargetVertical)) ||
            (isMovingBigBomb && isTargetBigBomb))
        {
            return true; // 允许重叠用于触发交互
        }
        
        // 其他所有情况都不允许重叠
        return false;
    }
    
    /// <summary>
    /// 检查块在新位置是否会与其他块重叠
    /// </summary>
    private bool WouldBlockOverlapAtPosition(JewelBlockData blockData, int newX, int newY, out JewelBlockData overlappingBlock)
    {
        overlappingBlock = null;
        
        foreach (var other in _blocks)
        {
            if (other.Id == blockData.Id) continue;
            
            // 检查是否在同一行（水平移动）
            if (newY == other.Y)
            {
                bool wouldOverlap = newX < other.X + other.Width && newX + blockData.Width > other.X;
                if (wouldOverlap)
                {
                    // 检查是否允许重叠（道具交互）
                    if (!CanBlocksOverlap(blockData, other))
                    {
                        overlappingBlock = other;
                        return true; // 不允许的重叠
                    }
                }
            }
        }
        
        return false; // 没有不允许的重叠
    }
    
    /// <summary>
    /// 检查块是否可以移动到指定位置（供InputHandler实时检测使用）
    /// </summary>
    private bool CanBlockMoveToPosition(JewelBlockController controller, int newX, int newY)
    {
        JewelBlockData blockData = controller.GetBlockData();
        if (blockData == null) return false;
        
        bool isBigBomb = blockData.IsBigBomb();
        
        // 检查边界
        if (newX < 0 || newX + blockData.Width > Config.Columns)
        {
            if (isBigBomb) Debug.Log($"[BigBomb移动检测] ✗ 超出X边界: newX={newX}, Width={blockData.Width}, Columns={Config.Columns}");
            return false;
        }
        if (newY < 0 || newY >= Config.Rows)
        {
            if (isBigBomb) Debug.Log($"[BigBomb移动检测] ✗ 超出Y边界: newY={newY}, Rows={Config.Rows}");
            return false;
        }
        
        // 检查是否会与其他块重叠
        foreach (var other in _blocks)
        {
            if (other.Id == blockData.Id) continue;
            
            // 对于垂直移动，检查是否在新位置（newY行）与其他块重叠
            if (newY == other.Y)
            {
                // 检查X轴是否有重叠
                bool wouldOverlap = newX < other.X + other.Width && newX + blockData.Width > other.X;
                if (wouldOverlap)
                {
                    // 检查是否允许重叠（道具交互）
                    bool canOverlap = CanBlocksOverlap(blockData, other);
                    if (isBigBomb)
                    {
                        Debug.Log($"[BigBomb移动检测] 在新位置 ({newX}, {newY}) 与块 {other.Color} 重叠，允许重叠: {canOverlap}");
                    }
                    
                    if (!canOverlap)
                    {
                        if (isBigBomb)
                        {
                            Debug.Log($"[BigBomb移动检测] ✗ 不允许重叠，阻止移动");
                        }
                        return false; // 不允许的重叠
                    }
                    // 如果允许重叠，继续检查其他块
                }
            }
        }
        
        if (isBigBomb)
        {
            Debug.Log($"[BigBomb移动检测] ✓ 可以移动到位置 ({newX}, {newY})");
        }
        
        return true;
    }
    
    /// <summary>
    /// 块水平移动回调
    /// </summary>
    private void OnBlockMovedHorizontal(JewelBlockController controller, int gridDelta)
    {
        Debug.Log($"[水平移动] 开始处理移动，gridDelta={gridDelta}, _isProcessing={_isProcessing}");
        
        if (_isProcessing)
        {
            Debug.Log("[水平移动] 正在处理中，跳过");
            return;
        }
        
        JewelBlockData blockData = controller.GetBlockData();
        if (blockData == null)
        {
            Debug.Log("[水平移动] blockData为null，跳过");
            return;
        }
        
        Debug.Log($"[水平移动] 块类型: {blockData.Color}, 当前位置: X={blockData.X}, Y={blockData.Y}, Width={blockData.Width}");
        
        // 在移动前计算拖动限制
        int minGridDelta, maxGridDelta;
        CalculateDragLimitsForBlock(blockData, out minGridDelta, out maxGridDelta);
        
        // 限制gridDelta在允许范围内
        gridDelta = Mathf.Clamp(gridDelta, minGridDelta, maxGridDelta);
        
        int newX = blockData.X + gridDelta;
        Debug.Log($"[水平移动] 新位置: newX={newX} (原X={blockData.X}, gridDelta={gridDelta})");
        
        // 检查是否超出边界
        if (newX < 0 || newX + blockData.Width > Config.Columns)
        {
            // 回弹
            controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
            return;
        }
        
        // 检查是否与同行其他块重叠
        JewelBlockData overlappingBlock;
        if (WouldBlockOverlapAtPosition(blockData, newX, blockData.Y, out overlappingBlock))
        {
            Debug.Log($"[水平移动] 检测到不允许的重叠，与其他块 {overlappingBlock.Color} 重叠，阻止移动");
            // 回弹
            controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
            return;
        }
        
        // 执行移动（先更新坐标，再检查交互）
        blockData.X = newX;
        Debug.Log($"[水平移动] 坐标已更新: X={blockData.X}, Y={blockData.Y}");
        RenderAllBlocks();
        
        // 在检查交互之前，先保存移动块是否是TransformBlock
        bool wasTransformBlock = blockData.IsTransformBlock();
        
        // 在触发移动事件前，转换所有TransformBlock为BigBomb
        ConvertAllTransformBlocks();
        
        // 第一关移动计数增加（无论是否有第一关数据，只要 _isCurrentlyFirstLevel 是 true）
        if (_isCurrentlyFirstLevel)
        {
            _firstLevelMoveCount++;
            // 获取剩余步数（通过GameManager）
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关移动计数] ✓ 当前移动次数: {_firstLevelMoveCount}, 剩余步数(MovesText): {remainingMoves}, _isCurrentlyFirstLevel: {_isCurrentlyFirstLevel}, _hasSpawnedStep5BigBomb: {_hasSpawnedStep5BigBomb}");
        }
        else
        {
            // 如果不是第一关，也打印一下，方便调试
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关移动计数] ✗ 不是第一关: _isCurrentlyFirstLevel={_isCurrentlyFirstLevel}, _isFirstLevel={_isFirstLevel}, 剩余步数={remainingMoves}");
        }
        
        // 检查第一关第5步后生成bigbomb（延迟到游戏循环完成后）
        if (_isCurrentlyFirstLevel && _firstLevelMoveCount == 5 && !_hasSpawnedStep5BigBomb)
        {
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关第5步] ✓✓✓ 检测到第5步完成，剩余步数: {remainingMoves}，将在上推完成后生成bigbomb");
            _pendingStep5BigBombSpawn = true;
        }
        else if (_isCurrentlyFirstLevel)
        {
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关移动计数] 条件不满足: _firstLevelMoveCount={_firstLevelMoveCount}, 剩余步数={remainingMoves}, _hasSpawnedStep5BigBomb={_hasSpawnedStep5BigBomb}");
        }
        
        // 检查道具交互：横块/竖块移动到炸块
        Debug.Log($"[水平移动] 准备检查道具交互，块类型: {blockData.Color}, 是横块:{blockData.IsHorizontal()}, 是竖块:{blockData.IsVertical()}, 原本是TransformBlock:{wasTransformBlock}");
        bool hasSpecialEffect = CheckItemInteraction(blockData, wasTransformBlock);
        Debug.Log($"[水平移动] 道具交互检查结果: {hasSpecialEffect}");
        
        if (!hasSpecialEffect)
        {
            // 没有特殊效果，触发移动事件并正常游戏循环
            if (OnMoveMade != null)
            {
                OnMoveMade();
            }
            StartCoroutine(GameLoop());
        }
        // 如果有特殊效果，CheckItemInteraction已经启动了协程，OnMoveMade会在特殊效果完成后调用
    }
    
    /// <summary>
    /// 块垂直移动回调（非钻石道具块）
    /// </summary>
    private void OnBlockMovedVertical(JewelBlockController controller, int gridDeltaY)
    {
        if (_isProcessing) return;
        
        JewelBlockData blockData = controller.GetBlockData();
        if (blockData == null) return;
        
        // 只有非钻石道具块可以垂直移动
        if (!blockData.IsNonDiamondItem()) return;
        
        // 计算垂直拖动限制
        int minGridDeltaY, maxGridDeltaY;
        CalculateVerticalDragLimitsForBlock(blockData, out minGridDeltaY, out maxGridDeltaY);
        
        // 限制gridDeltaY在允许范围内
        gridDeltaY = Mathf.Clamp(gridDeltaY, minGridDeltaY, maxGridDeltaY);
        
        int newY = blockData.Y + gridDeltaY;
        
        // 检查是否超出边界
        if (newY < 0 || newY >= Config.Rows)
        {
            // 回弹
            controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
            return;
        }
        
        // 检查目标位置是否有其他块（使用统一的碰撞检测）
        // 对于垂直移动，需要检查块占据的所有X坐标位置
        bool canMove = true;
        foreach (var other in _blocks)
        {
            if (other.Id == blockData.Id) continue;
            
            // 检查是否在同一列位置（垂直移动）
            if (other.Y == newY)
            {
                // 检查X轴是否有重叠
                bool wouldOverlapX = blockData.X < other.X + other.Width && blockData.X + blockData.Width > other.X;
                if (wouldOverlapX)
                {
                    // 检查是否允许重叠（道具交互）
                    if (!CanBlocksOverlap(blockData, other))
                {
                        Debug.Log($"[垂直移动] 检测到不允许的重叠，与其他块 {other.Color} 重叠，阻止移动");
                    canMove = false;
                    break;
                    }
                }
            }
        }
        
        if (!canMove)
        {
            // 回弹
            controller.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
            return;
        }
        
        // 执行移动
        blockData.Y = newY;
        RenderAllBlocks();
        
        // 在检查交互之前，先保存移动块是否是TransformBlock
        bool wasTransformBlock = blockData.IsTransformBlock();
        
        // 在触发移动事件前，转换所有TransformBlock为BigBomb
        ConvertAllTransformBlocks();
        
        // 第一关移动计数增加
        if (_isCurrentlyFirstLevel)
        {
            _firstLevelMoveCount++;
            // 获取剩余步数（通过GameManager）
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关移动计数] 当前移动次数: {_firstLevelMoveCount}, 剩余步数(MovesText): {remainingMoves}, _isCurrentlyFirstLevel: {_isCurrentlyFirstLevel}, _hasSpawnedStep5BigBomb: {_hasSpawnedStep5BigBomb}");
        }
        
        // 检查第一关第5步后生成bigbomb（延迟到游戏循环完成后）
        if (_isCurrentlyFirstLevel && _firstLevelMoveCount == 5 && !_hasSpawnedStep5BigBomb)
        {
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关第5步] ✓✓✓ 检测到第5步完成，剩余步数: {remainingMoves}，将在上推完成后生成bigbomb");
            _pendingStep5BigBombSpawn = true;
        }
        else if (_isCurrentlyFirstLevel)
        {
            int remainingMoves = 0;
            if (JewelGameManager.Instance != null)
            {
                remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
            }
            Debug.Log($"[第一关移动计数] 条件不满足: _firstLevelMoveCount={_firstLevelMoveCount}, 剩余步数={remainingMoves}, _hasSpawnedStep5BigBomb={_hasSpawnedStep5BigBomb}");
        }
        
        Debug.Log("OnBlockMovedVertical: " + blockData.X + ", " + blockData.Y);
        // 检查道具交互：竖块移动到炸块（垂直移动）
        bool hasSpecialEffect = CheckItemInteraction(blockData, wasTransformBlock);
        
        if (!hasSpecialEffect)
        {
            // 没有特殊效果，触发移动事件并触发游戏循环（道具块现在也受重力影响）
            if (OnMoveMade != null)
            {
                OnMoveMade();
            }
            StartCoroutine(GameLoop());
        }
        // 如果有特殊效果，CheckItemInteraction已经启动了协程，OnMoveMade会在特殊效果完成后调用
    }
    
    /// <summary>
    /// 计算块的拖动限制（供InputHandler使用）
    /// </summary>
    public void CalculateDragLimitsForBlock(JewelBlockData blockData, out int minGridDelta, out int maxGridDelta)
    {
        minGridDelta = -blockData.X; // 不能移动到负坐标
        maxGridDelta = Config.Columns - (blockData.X + blockData.Width); // 不能超出右边界
        
        // 检查同行的其他块，考虑碰撞检测
        foreach (var other in _blocks)
        {
            if (other.Id != blockData.Id && other.Y == blockData.Y)
            {
                // 检查是否允许重叠（道具交互）
                bool canOverlap = CanBlocksOverlap(blockData, other);
                
                // 左侧块
                if (other.X + other.Width <= blockData.X)
                {
                    int maxLeftMove = -(blockData.X - (other.X + other.Width));
                    if (!canOverlap)
                    {
                        // 不允许重叠，限制移动
                        minGridDelta = Mathf.Max(minGridDelta, maxLeftMove);
                    }
                }
                // 右侧块
                if (other.X >= blockData.X + blockData.Width)
                {
                    int maxRightMove = other.X - (blockData.X + blockData.Width);
                    if (!canOverlap)
                    {
                        // 不允许重叠，限制移动
                        maxGridDelta = Mathf.Min(maxGridDelta, maxRightMove);
                    }
                }
                // 如果块已经重叠（理论上不应该发生，但为了安全起见）
                else if (!canOverlap && blockData.X < other.X + other.Width && blockData.X + blockData.Width > other.X)
                {
                    // 块已经重叠，只能移动到一个方向
                    if (other.X + other.Width <= blockData.X)
                    {
                        minGridDelta = Mathf.Max(minGridDelta, -(blockData.X - (other.X + other.Width)));
                    }
                if (other.X >= blockData.X + blockData.Width)
                {
                    maxGridDelta = Mathf.Min(maxGridDelta, other.X - (blockData.X + blockData.Width));
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// 计算块的垂直拖动限制（供InputHandler使用，非钻石道具块）
    /// </summary>
    public void CalculateVerticalDragLimitsForBlock(JewelBlockData blockData, out int minGridDeltaY, out int maxGridDeltaY)
    {
        minGridDeltaY = -blockData.Y; // 不能移动到负坐标
        maxGridDeltaY = Config.Rows - 1 - blockData.Y; // 不能超出上边界
        
        bool isBigBomb = blockData.IsBigBomb();
        
        // 对于BigBomb，允许移动到任何位置（除了边界），因为需要与其他BigBomb重叠
        if (isBigBomb)
        {
            // BigBomb可以垂直移动到任何位置（只要在边界内）
            // 只受边界限制，不受其他块限制（因为允许重叠）
            Debug.Log($"[BigBomb垂直限制] BigBomb允许移动到任何位置，只受边界限制: Y范围 0 到 {Config.Rows - 1}");
            return; // 只返回边界限制，不检查其他块
        }
        
        // 检查可能重叠的其他块，考虑碰撞检测（对于非BigBomb的道具块）
        foreach (var other in _blocks)
        {
            if (other.Id == blockData.Id) continue;
            
            // 检查X轴是否有重叠
            bool overlapsX = blockData.X < other.X + other.Width && blockData.X + blockData.Width > other.X;
            if (overlapsX)
            {
                // 检查是否允许重叠（道具交互）
                bool canOverlap = CanBlocksOverlap(blockData, other);
                
                if (!canOverlap)
            {
                    // 不允许重叠，限制移动
                // 下方块
                if (other.Y < blockData.Y)
                {
                        int newLimit = -(blockData.Y - other.Y - 1);
                        minGridDeltaY = Mathf.Max(minGridDeltaY, newLimit);
                }
                // 上方块
                if (other.Y > blockData.Y)
                {
                        int newLimit = other.Y - blockData.Y - 1;
                        maxGridDeltaY = Mathf.Min(maxGridDeltaY, newLimit);
                    }
                }
                else
                {
                    // 允许重叠（比如道具交互），不限制移动
                    bool isMovingBigBomb = blockData.IsBigBomb() && other.IsBigBomb();
                    if (isMovingBigBomb)
                    {
                        Debug.Log($"[BigBomb垂直限制] ✓ 允许与另一个BigBomb重叠，不限制移动: other.Y={other.Y}, blockData.Y={blockData.Y}");
                    }
                }
            }
        }
    }
    
    /// <summary>
    /// 游戏主循环
    /// </summary>
    private IEnumerator GameLoop()
    {
        _isProcessing = true;
        
        // 禁用输入
        if (_inputHandler != null)
        {
            _inputHandler.DisableInput();
        }
        
        // 应用重力
        yield return StartCoroutine(ApplyGravity());
        
        // 检查消除
        yield return StartCoroutine(CheckClearRecursive());
        
        // 生成新行并上推
        yield return StartCoroutine(SpawnAndPushUpFromPreview());
        
        // 再次应用重力
        yield return StartCoroutine(ApplyGravity());
        
        // 再次检查连击
        yield return StartCoroutine(CheckClearRecursive());
        
        // 渲染
        RenderAllBlocks();
        
        // 检查游戏结束
        CheckGameOver();
        
        // 如果上推没有发生（比如块已堆到顶部），在这里检查是否需要生成bigbomb
        if (_pendingStep5BigBombSpawn)
        {
            _pendingStep5BigBombSpawn = false;
            Debug.Log("[第一关第5步] 游戏循环完成（未发生上推或上推已完成），开始生成bigbomb");
            yield return StartCoroutine(SpawnStep5BigBombs());
        }
        
        _isProcessing = false;
        
        // 重新启用输入
        if (_inputHandler != null)
        {
            _inputHandler.EnableInput();
        }
    }
    
    /// <summary>
    /// 应用重力（优化版本：一次性计算所有下落，使用平滑动画）
    /// </summary>
    private IEnumerator ApplyGravity()
    {
        bool hasChanges = true;
        int maxIterations = Config.Rows; // 防止无限循环
        int iterations = 0;
        
        // 先计算所有块应该下落到的最终位置
        while (hasChanges && iterations < maxIterations)
        {
            hasChanges = false;
            iterations++;
            
            List<JewelBlockData> sorted = new List<JewelBlockData>(_blocks);
            sorted.Sort((a, b) => a.Y.CompareTo(b.Y));
            
            foreach (var block in sorted)
            {
                if (block.Y == 0) continue;
                
                // 所有块都受重力影响（包括道具块）
                
                if (!block.HasSupport(_blocks))
                {
                    block.Y--;
                    hasChanges = true;
                }
            }
        }
        
        // 如果有块下落，使用平滑动画
        if (iterations > 1)
        {
            // 使用平滑的动画时间，根据下落距离调整
            float animationTime = Mathf.Min(Config.GravityFallTime * 0.5f, 0.15f);
            StartCoroutine(AnimateBlocksSmooth(animationTime));
            yield return new WaitForSeconds(animationTime);
        }
        else
        {
            // 没有变化，直接渲染
            RenderAllBlocks();
        }
    }
    
    /// <summary>
    /// 平滑动画块位置
    /// </summary>
    private IEnumerator AnimateBlocksSmooth(float duration)
    {
        float elapsed = 0f;
        Dictionary<JewelBlockController, Vector2> startPositions = new Dictionary<JewelBlockController, Vector2>();
        Dictionary<JewelBlockController, Vector2> targetPositions = new Dictionary<JewelBlockController, Vector2>();
        
        // 记录所有块的起始和目标位置
        foreach (var block in _blocks)
        {
            if (block.BlockObject == null) continue;
            
            JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
            if (controller == null) continue;
            
            RectTransform rectTransform = controller.GetComponent<RectTransform>();
            if (rectTransform == null) continue;
            
            startPositions[controller] = rectTransform.anchoredPosition;
            
            // 计算目标位置
            float x = (_cellWidth * block.X) + (_cellWidth * block.Width / 2f) - (_boardWidth / 2f);
            float y = _bottomOffsetY + (_cellHeight * block.Y) + (_cellHeight / 2f);
            targetPositions[controller] = new Vector2(x, y);
        }
        
        // 平滑插值动画
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = Mathf.Clamp01(elapsed / duration);
            // 使用缓出曲线，让动画更自然
            t = 1f - Mathf.Pow(1f - t, 3f);
            
            foreach (var kvp in startPositions)
            {
                JewelBlockController controller = kvp.Key;
                Vector2 startPos = kvp.Value;
                Vector2 targetPos = targetPositions[controller];
                
                RectTransform rectTransform = controller.GetComponent<RectTransform>();
                if (rectTransform != null)
                {
                    rectTransform.anchoredPosition = Vector2.Lerp(startPos, targetPos, t);
                }
            }
            
            yield return null;
        }
        
        // 确保最终位置准确
        RenderAllBlocks();
    }
    
    /// <summary>
    /// 递归检查消除
    /// </summary>
    private IEnumerator CheckClearRecursive()
    {
        List<int> rowsToClear = new List<int>();
        
        for (int r = 0; r < Config.Rows; r++)
        {
            int totalWidth = 0;
            foreach (var block in _blocks)
            {
                if (block.Y == r)
                {
                    // 非钻石道具块不算入消除宽度（视为空格）
                    if (!block.IsNonDiamondItem())
                    {
                        totalWidth += block.Width;
                    }
                }
            }
            
            if (totalWidth >= Config.RequiredColumnsForClear)
            {
                rowsToClear.Add(r);
            }
        }
        
        if (rowsToClear.Count > 0)
        {
            // 播放消除动画（钻石块和普通块同时播放）
            List<JewelBlockData> diamondsToAnimate = new List<JewelBlockData>();
            foreach (int row in rowsToClear)
            {
                foreach (var block in _blocks)
                {
                    if (block.Y == row && block.BlockObject != null)
                    {
                        JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                        if (controller != null)
                        {
                            // 如果是钻石块，记录起来，同时播放动画
                            if (block.IsDiamond())
                            {
                                diamondsToAnimate.Add(block);
                                controller.PlayClearAnimation(); // 立即播放钻石动画
                            }
                            else
                            {
                                controller.PlayClearAnimation(); // 播放普通块动画
                            }
                        }
                    }
                }
            }
            
            // 等待所有动画完成（钻石和普通块同时进行）
            float maxWaitTime = Mathf.Max(Config.ClearAnimationTime, 1.2f); // 取两者中较长的（钻石动画1秒+缓冲）
            float elapsed = 0f;
            bool allAnimationsComplete = false;
            
            if (diamondsToAnimate.Count > 0)
            {
                Debug.Log($"[钻石动画] CheckClearRecursive: 开始等待 {diamondsToAnimate.Count} 个钻石动画完成（同时进行）");
                
                while (elapsed < maxWaitTime && !allAnimationsComplete)
                {
                    allAnimationsComplete = true;
                    int animatingCount = 0;
                    foreach (var diamond in diamondsToAnimate)
                    {
                        if (diamond.BlockObject != null && diamond.BlockObject.activeSelf)
                        {
                            JewelBlockController controller = diamond.BlockObject.GetComponent<JewelBlockController>();
                            if (controller != null && controller.IsAnimating())
                            {
                                allAnimationsComplete = false;
                                animatingCount++;
                            }
                        }
                    }
                    
                    if (!allAnimationsComplete)
                    {
                        yield return new WaitForSeconds(0.1f);
                        elapsed += 0.1f;
                    }
                }
                
                Debug.Log($"[钻石动画] CheckClearRecursive: 所有动画完成，等待时间: {elapsed:F1}秒");
            }
            else
            {
                // 没有钻石块，只等待普通块动画
                yield return new WaitForSeconds(Config.ClearAnimationTime);
            }
            
            // 额外等待一小段时间确保动画完全结束
            yield return new WaitForSeconds(0.2f);
            
            // 移除被消除的块（动画完成后才销毁）
            _blocks.RemoveAll(b => rowsToClear.Contains(b.Y));
            foreach (int row in rowsToClear)
            {
                foreach (Transform child in BoardContainer)
                {
                    JewelBlockController controller = child.GetComponent<JewelBlockController>();
                    if (controller != null && controller.GetBlockData() != null && controller.GetBlockData().Y == row)
                    {
                        Destroy(child.gameObject);
                    }
                }
            }
            
            // 更新钻石块计数
            UpdateDiamondCount();
            
            // 触发事件（传递是否有钻石销毁的信息）
            bool hasDiamondDestroyed = diamondsToAnimate.Count > 0;
            Debug.Log($"[事件] CheckClearRecursive: 准备触发 OnRowCleared 事件, 行数: {rowsToClear.Count}, 有钻石: {hasDiamondDestroyed}, 事件是否为空: {OnRowCleared == null}");
            if (OnRowCleared != null)
            {
                Debug.Log($"[事件] CheckClearRecursive: 触发 OnRowCleared 事件, 订阅者数量: {OnRowCleared.GetInvocationList().Length}");
                try
                {
                    OnRowCleared(rowsToClear.Count, hasDiamondDestroyed);
                    Debug.Log($"[事件] CheckClearRecursive: OnRowCleared 事件调用完成");
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"[事件] CheckClearRecursive: OnRowCleared 事件调用失败: {ex.Message}");
                }
            }
            else
            {
                Debug.LogWarning("[事件] CheckClearRecursive: OnRowCleared 事件为空，没有订阅者！");
            }
            
            // 随机生成道具（在消除的行中随机位置）
            float spawnChance = GetItemSpawnChance();
            if (Config != null && Config.EnableItems && Random.value < spawnChance && rowsToClear.Count > 0)
            {
                SpawnRandomItem(rowsToClear[0]);
            }
            
            // 再次应用重力
            yield return StartCoroutine(ApplyGravity());
            
            // 递归检查
            yield return StartCoroutine(CheckClearRecursive());
        }
    }
    
    /// <summary>
    /// 检查道具交互（横块/竖块移动到炸块，或两个大炸弹重叠）
    /// </summary>
    /// <param name="movedBlock">移动的块</param>
    /// <param name="wasTransformBlock">移动的块在移动前是否是TransformBlock</param>
    private bool CheckItemInteraction(JewelBlockData movedBlock, bool wasTransformBlock = false)
    {
        Debug.Log($"[道具交互] 检查移动的块: {movedBlock.Color} (X:{movedBlock.X}, Y:{movedBlock.Y}, Width:{movedBlock.Width}), 原本是TransformBlock:{wasTransformBlock}");
        
        // 检查移动的块是否是大炸弹
        bool isBigBomb = movedBlock.IsBigBomb();
        
        // 如果移动的块是大炸弹，检查是否有另一个大炸弹在同一位置
        // 但如果移动的块原本是TransformBlock，不应该触发BigBomb效果
        if (isBigBomb && !wasTransformBlock)
        {
            Debug.Log("[道具交互] 移动的是大炸弹（不是从TransformBlock转换来的），检查是否有另一个大炸弹在同一位置");
            
            foreach (var other in _blocks)
            {
                if (other.Id == movedBlock.Id) continue;
                
                bool isOtherBigBomb = other.IsBigBomb();
                bool isSameRow = other.Y == movedBlock.Y;
                bool isSameCol = other.X == movedBlock.X;
                
                // 两个大炸弹重叠：检查是否在同一行同一列（都是1x1块）
                // 对于垂直移动，移动后的新位置与目标块应该在同行同列
                // 注意：如果目标块也是从TransformBlock转换来的，也不应该触发效果
                // 但由于我们无法追踪目标块是否原本是TransformBlock，这里只检查移动的块
                if (isOtherBigBomb && isSameRow && isSameCol)
                {
                    Debug.Log($"[道具交互] ✓ 触发两个大炸弹重叠效果！清除所有块");
                    Debug.Log($"[道具交互] 移动的BigBomb: X={movedBlock.X}, Y={movedBlock.Y}");
                    Debug.Log($"[道具交互] 目标的BigBomb: X={other.X}, Y={other.Y}");
                    
                    // 移除两个大炸弹
                    RemoveBlock(movedBlock);
                    RemoveBlock(other);
                    
                    // 清除所有块（通过协程）
                    StartCoroutine(ClearAllBlocks());
                    return true;
                }
            }
        }
        else if (isBigBomb && wasTransformBlock)
        {
            Debug.Log("[道具交互] 移动的块原本是TransformBlock，即使现在是大炸弹，也不触发BigBomb效果");
        }
        
        // 检查移动的块是否是横块、竖块或炸块
        bool isHorizontal = movedBlock.IsHorizontal();
        bool isVertical = movedBlock.IsVertical();
        bool isExplosive = movedBlock.IsExplosive();
        
        // 如果移动的块是炸块，检查是否有横块或竖块在同一位置
        if (isExplosive)
        {
            Debug.Log("[道具交互] 移动的是炸块，检查是否有横块或竖块在同一位置");
            
            foreach (var other in _blocks)
            {
                if (other.Id == movedBlock.Id) continue;
                
                bool isOtherHorizontal = other.IsHorizontal();
                bool isOtherVertical = other.IsVertical();
                bool isSameRow = other.Y == movedBlock.Y;
                bool isSameCol = other.X == movedBlock.X;
                
                Debug.Log($"[道具交互] 检查其他块: {other.Color} (X:{other.X}, Y:{other.Y}, Width:{other.Width}), 是横块:{isOtherHorizontal}, 是竖块:{isOtherVertical}, 同行:{isSameRow}, 同列:{isSameCol}");
                
                // 炸块移动到横块：检查是否在同一行且重叠
                if (isOtherHorizontal && isSameRow)
                {
                    bool overlaps = movedBlock.X == other.X;
                    Debug.Log($"[道具交互] 炸块与横块重叠检查: {overlaps} (炸块X:{movedBlock.X}, Y:{movedBlock.Y}, 横块X:{other.X}, Y:{other.Y})");
                    
                    if (overlaps)
                    {
                        Debug.Log($"[道具交互] 触发炸块+横块效果！消除3行: {movedBlock.Y - 1}, {movedBlock.Y}, {movedBlock.Y + 1}");
                        
                        // 记录要消除的行
                        int targetRow = movedBlock.Y;
                        
                        // 移除触发道具和炸块
                        RemoveBlock(movedBlock);
                        RemoveBlock(other);
                        
                        // 触发特殊效果（通过协程）
                        StartCoroutine(TriggerRowClear(targetRow));
                        return true;
                    }
                }
                // 炸块移动到竖块：检查是否在同一列且重叠
                else if (isOtherVertical && isSameCol)
                {
                    bool overlaps = movedBlock.X == other.X && movedBlock.Y == other.Y;
                    Debug.Log($"[道具交互] 炸块与竖块重叠检查: {overlaps} (炸块位置X:{movedBlock.X}, Y:{movedBlock.Y}, 竖块位置X:{other.X}, Y:{other.Y})");
                    
                    if (overlaps)
                    {
                        Debug.Log($"[道具交互] 触发炸块+竖块效果！消除3列: {movedBlock.X - 1}, {movedBlock.X}, {movedBlock.X + 1}");
                        
                        // 记录要消除的列
                        int targetCol = movedBlock.X;
                        
                        // 移除触发道具和炸块
                        RemoveBlock(movedBlock);
                        RemoveBlock(other);
                        
                        // 触发特殊效果（通过协程）
                        StartCoroutine(TriggerColumnClear(targetCol));
                        return true;
                    }
                }
            }
            
            Debug.Log("[道具交互] 炸块未找到匹配的横块或竖块");
            return false;
        }
        
        // 如果移动的块是横块或竖块，检查是否有炸块在同一位置
        if (!isHorizontal && !isVertical) return false;
        
        Debug.Log($"[道具交互] 移动的是横块或竖块，检查是否有炸块在同一位置");
        
        // 检查同一行是否有炸块（横块）或同一列是否有炸块（竖块）
        foreach (var other in _blocks)
        {
            if (other.Id == movedBlock.Id) continue;
            
            bool isSameRow = other.Y == movedBlock.Y;
            bool isSameCol = other.X == movedBlock.X;
            bool isOtherExplosive = other.IsExplosive();
            
            Debug.Log($"[道具交互] 检查其他块: {other.Color} (X:{other.X}, Y:{other.Y}, Width:{other.Width}), 是炸块:{isOtherExplosive}, 同行:{isSameRow}, 同列:{isSameCol}");
            
            if (isHorizontal && isSameRow && isOtherExplosive)
            {
                // 横块：检查是否在同一行且重叠
                // 横块和炸块都是1x1，所以X坐标相同就算重叠
                bool overlaps = movedBlock.X == other.X;
                Debug.Log($"[道具交互] 横块与炸块重叠检查: {overlaps} (横块X:{movedBlock.X}, Y:{movedBlock.Y}, 炸块X:{other.X}, Y:{other.Y})");
                
                if (overlaps)
                {
                    Debug.Log($"[道具交互] 触发横块+炸块效果！消除3行: {other.Y - 1}, {other.Y}, {other.Y + 1}");
                    
                    // 记录要消除的行
                    int targetRow = other.Y;
                    
                    // 移除触发道具和炸块
                    RemoveBlock(movedBlock);
                    RemoveBlock(other);
                    
                    // 触发特殊效果（通过协程）
                    StartCoroutine(TriggerRowClear(targetRow));
                    return true;
                }
            }
            else if (isVertical && isSameCol && isOtherExplosive)
            {
                // 竖块：检查是否在同一列且重叠（都是1x1，所以X和Y都相同就算重叠）
                bool overlaps = movedBlock.X == other.X && movedBlock.Y == other.Y;
                Debug.Log($"[道具交互] 竖块与炸块重叠检查: {overlaps} (竖块位置X:{movedBlock.X}, Y:{movedBlock.Y}, 炸块位置X:{other.X}, Y:{other.Y})");
                
                if (overlaps)
                {
                    Debug.Log($"[道具交互] 触发竖块+炸块效果！消除3列: {other.X - 1}, {other.X}, {other.X + 1}");
                    
                    // 记录要消除的列
                    int targetCol = other.X;
                    
                    // 移除触发道具和炸块
                    RemoveBlock(movedBlock);
                    RemoveBlock(other);
                    
                    // 触发特殊效果（通过协程）
                    StartCoroutine(TriggerColumnClear(targetCol));
                    return true;
                }
            }
        }
        
        Debug.Log("[道具交互] 未找到匹配的炸块");
        return false;
    }
    
    /// <summary>
    /// 清除所有块（两个大炸弹重叠时的效果）
    /// </summary>
    private IEnumerator ClearAllBlocks()
    {
        Debug.Log("[大炸弹效果] 开始清除所有块");
        
        _isProcessing = true;
        
        // 禁用输入
        if (_inputHandler != null)
        {
            _inputHandler.DisableInput();
        }
        
        // 收集所有需要清除的块
        List<JewelBlockData> blocksToClear = new List<JewelBlockData>(_blocks);
        
        // 播放清除动画
        foreach (var block in blocksToClear)
        {
            if (block.BlockObject != null)
            {
                JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                if (controller != null)
                {
                    controller.PlayClearAnimation();
                }
            }
        }
        
        // 等待动画完成
        float maxWaitTime = 1.0f; // 最多等待1秒
        float elapsed = 0f;
        bool allAnimationsComplete = false;
        
        while (elapsed < maxWaitTime && !allAnimationsComplete)
        {
            allAnimationsComplete = true;
            foreach (var block in blocksToClear)
            {
                if (block.BlockObject != null)
                {
                    JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                    if (controller != null && controller.IsAnimating())
                    {
                        allAnimationsComplete = false;
                        break;
                    }
                }
            }
            
            if (!allAnimationsComplete)
            {
                elapsed += Time.deltaTime;
                yield return null;
            }
        }
        
        // 移除所有块
        foreach (var block in blocksToClear)
        {
            if (block.BlockObject != null)
            {
                Destroy(block.BlockObject);
            }
        }
        
        _blocks.Clear();
        
        // 更新钻石计数（此时应该是0，因为所有块都被清除了）
        UpdateDiamondCount();
        
        Debug.Log("[大炸弹效果] 所有块已清除，游戏继续");
        
        // 在触发移动事件前，转换所有TransformBlock为BigBomb（虽然此时所有块都会被清除，但保持逻辑一致性）
        ConvertAllTransformBlocks();
        
        // 生成新行，继续游戏
        yield return StartCoroutine(SpawnAndPushUpFromPreview());
        
        // 应用重力
        yield return StartCoroutine(ApplyGravity());
        
        // 更新钻石计数（新生成的块中可能包含钻石）
        UpdateDiamondCount();
        
        // 检查消除（可能触发连击）
        yield return StartCoroutine(CheckClearRecursive());
        
        // 再次更新钻石计数（消除后可能有新的钻石）
        UpdateDiamondCount();
        
        // 触发移动完成事件（在所有棋盘稳定操作完成后）
        // 这确保游戏胜负条件检查发生在棋盘完全稳定之后
        if (OnMoveMade != null)
        {
            OnMoveMade();
        }
        
        _isProcessing = false;
        
        // 重新启用输入
        if (_inputHandler != null)
        {
            _inputHandler.EnableInput();
        }
    }
    
    /// <summary>
    /// 移除块
    /// </summary>
    private void RemoveBlock(JewelBlockData block)
    {
        _blocks.Remove(block);
        if (block.BlockObject != null)
        {
            Destroy(block.BlockObject);
        }
        UpdateDiamondCount();
    }
    
    /// <summary>
    /// 触发行消除（特殊效果）
    /// </summary>
    private IEnumerator TriggerRowClear(int centerRow)
    {
        // 禁用输入
        if (_inputHandler != null)
        {
            _inputHandler.DisableInput();
        }
        
        yield return StartCoroutine(ClearRows(centerRow - 1, centerRow, centerRow + 1));
        yield return StartCoroutine(ApplyGravity());
        yield return StartCoroutine(CheckClearRecursive());
        
        // 重新启用输入
        if (_inputHandler != null)
        {
            _inputHandler.EnableInput();
        }
    }
    
    /// <summary>
    /// 触发列消除（特殊效果）
    /// </summary>
    private IEnumerator TriggerColumnClear(int centerCol)
    {
        // 禁用输入
        if (_inputHandler != null)
        {
            _inputHandler.DisableInput();
        }
        
        yield return StartCoroutine(ClearColumns(centerCol - 1, centerCol, centerCol + 1));
        yield return StartCoroutine(ApplyGravity());
        yield return StartCoroutine(CheckClearRecursive());
        
        // 重新启用输入
        if (_inputHandler != null)
        {
            _inputHandler.EnableInput();
        }
    }
    
    /// <summary>
    /// 消除指定行
    /// </summary>
    private IEnumerator ClearRows(params int[] rows)
    {
        List<int> rowsToClear = new List<int>();
        foreach (int row in rows)
        {
            if (row >= 0 && row < Config.Rows)
            {
                rowsToClear.Add(row);
            }
        }
        
        if (rowsToClear.Count > 0)
        {
            // 播放消除动画（钻石块和普通块同时播放）
            List<JewelBlockData> diamondsToAnimate = new List<JewelBlockData>();
            foreach (int row in rowsToClear)
            {
                foreach (var block in _blocks)
                {
                    if (block.Y == row && block.BlockObject != null)
                    {
                        JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                        if (controller != null)
                        {
                            // 如果是钻石块，记录起来，同时播放动画
                            if (block.IsDiamond())
                            {
                                diamondsToAnimate.Add(block);
                                controller.PlayClearAnimation(); // 立即播放钻石动画
                            }
                            else
                            {
                                controller.PlayClearAnimation(); // 播放普通块动画
                            }
                        }
                    }
                }
            }
            
            // 等待所有动画完成（钻石和普通块同时进行）
            float maxWaitTime = Mathf.Max(Config.ClearAnimationTime, 1.2f); // 取两者中较长的（钻石动画1秒+缓冲）
            float elapsed = 0f;
            bool allAnimationsComplete = false;
            
            if (diamondsToAnimate.Count > 0)
            {
                Debug.Log($"[钻石动画] ClearRows: 开始等待 {diamondsToAnimate.Count} 个钻石动画完成（同时进行）");
                
                while (elapsed < maxWaitTime && !allAnimationsComplete)
                {
                    allAnimationsComplete = true;
                    int animatingCount = 0;
                    foreach (var diamond in diamondsToAnimate)
                    {
                        if (diamond.BlockObject != null && diamond.BlockObject.activeSelf)
                        {
                            JewelBlockController controller = diamond.BlockObject.GetComponent<JewelBlockController>();
                            if (controller != null && controller.IsAnimating())
                            {
                                allAnimationsComplete = false;
                                animatingCount++;
                            }
                        }
                    }
                    
                    if (!allAnimationsComplete)
                    {
                        yield return new WaitForSeconds(0.1f);
                        elapsed += 0.1f;
                    }
                }
                
                Debug.Log($"[钻石动画] ClearRows: 所有动画完成，等待时间: {elapsed:F1}秒");
            }
            else
            {
                // 没有钻石块，只等待普通块动画
                yield return new WaitForSeconds(Config.ClearAnimationTime);
            }
            
            // 额外等待一小段时间确保动画完全结束
            yield return new WaitForSeconds(0.2f);
            
            // 移除被消除的块（动画完成后才销毁）
            Debug.Log($"[钻石动画] 开始销毁块，行数: {rowsToClear.Count}");
            _blocks.RemoveAll(b => rowsToClear.Contains(b.Y));
            foreach (int row in rowsToClear)
            {
                foreach (Transform child in BoardContainer)
                {
                    JewelBlockController controller = child.GetComponent<JewelBlockController>();
                    if (controller != null && controller.GetBlockData() != null && controller.GetBlockData().Y == row)
                    {
                        Debug.Log($"[钻石动画] 销毁块，行: {row}, 块ID: {controller.GetBlockData().Id}, 是钻石: {controller.GetBlockData().IsDiamond()}, 动画中: {controller.IsAnimating()}");
                        Destroy(child.gameObject);
                    }
                }
            }
            
            // 更新钻石块计数
            UpdateDiamondCount();
            
            // 触发事件（传递是否有钻石销毁的信息）
            bool hasDiamondDestroyed = diamondsToAnimate.Count > 0;
            if (OnRowCleared != null)
            {
                OnRowCleared(rowsToClear.Count, hasDiamondDestroyed);
            }
            
            // 随机生成道具（在消除的行中随机位置）
            float spawnChance = GetItemSpawnChance();
            if (Config != null && Config.EnableItems && Random.value < spawnChance && rowsToClear.Count > 0)
            {
                SpawnRandomItem(rowsToClear[0]);
            }
        }
    }
    
    /// <summary>
    /// 消除指定列
    /// </summary>
    private IEnumerator ClearColumns(params int[] columns)
    {
        List<int> colsToClear = new List<int>();
        foreach (int col in columns)
        {
            if (col >= 0 && col < Config.Columns)
            {
                colsToClear.Add(col);
            }
        }
        
        if (colsToClear.Count > 0)
        {
            List<JewelBlockData> blocksToRemove = new List<JewelBlockData>();
            
            // 找到所有需要消除的块（块覆盖了要消除的列）
            foreach (var block in _blocks)
            {
                foreach (int col in colsToClear)
                {
                    if (block.X <= col && block.X + block.Width > col)
                    {
                        if (!blocksToRemove.Contains(block))
                        {
                            blocksToRemove.Add(block);
                        }
                        break; // 找到匹配就跳出内层循环
                    }
                }
            }
            
            // 播放消除动画（钻石块和普通块同时播放）
            List<JewelBlockData> diamondsToAnimate = new List<JewelBlockData>();
            foreach (var block in blocksToRemove)
            {
                if (block.BlockObject != null)
                {
                    JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
                    if (controller != null)
                    {
                        // 如果是钻石块，记录起来，同时播放动画
                        if (block.IsDiamond())
                        {
                            diamondsToAnimate.Add(block);
                            controller.PlayClearAnimation(); // 立即播放钻石动画
                        }
                        else
                        {
                            controller.PlayClearAnimation(); // 播放普通块动画
                        }
                    }
                }
            }
            
            // 等待所有动画完成（钻石和普通块同时进行）
            float maxWaitTime = Mathf.Max(Config.ClearAnimationTime, 1.2f); // 取两者中较长的（钻石动画1秒+缓冲）
            float elapsed = 0f;
            bool allAnimationsComplete = false;
            
            if (diamondsToAnimate.Count > 0)
            {
                Debug.Log($"[钻石动画] ClearColumns: 开始等待 {diamondsToAnimate.Count} 个钻石动画完成（同时进行）");
                
                while (elapsed < maxWaitTime && !allAnimationsComplete)
                {
                    allAnimationsComplete = true;
                    int animatingCount = 0;
                    foreach (var diamond in diamondsToAnimate)
                    {
                        if (diamond.BlockObject != null && diamond.BlockObject.activeSelf)
                        {
                            JewelBlockController controller = diamond.BlockObject.GetComponent<JewelBlockController>();
                            if (controller != null && controller.IsAnimating())
                            {
                                allAnimationsComplete = false;
                                animatingCount++;
                            }
                        }
                    }
                    
                    if (!allAnimationsComplete)
                    {
                        yield return new WaitForSeconds(0.1f);
                        elapsed += 0.1f;
                    }
                }
                
                Debug.Log($"[钻石动画] ClearColumns: 所有动画完成，等待时间: {elapsed:F1}秒");
            }
            else
            {
                // 没有钻石块，只等待普通块动画
                yield return new WaitForSeconds(Config.ClearAnimationTime);
            }
            
            // 额外等待一小段时间确保动画完全结束
            yield return new WaitForSeconds(0.2f);
            
            // 移除被消除的块（动画完成后才销毁）
            foreach (var block in blocksToRemove)
            {
                _blocks.Remove(block);
                if (block.BlockObject != null)
                {
                    // 如果对象已经被动画隐藏，直接销毁
                    if (!block.BlockObject.activeSelf)
                    {
                        Destroy(block.BlockObject);
                    }
                    else
                    {
                        // 如果还在显示，强制销毁（防止动画未完成的情况）
                        Destroy(block.BlockObject);
                    }
                }
            }
            
            // 更新钻石块计数
            UpdateDiamondCount();
            
            // 触发事件（按列数计算，但使用行清除事件，传递是否有钻石销毁的信息）
            bool hasDiamondDestroyed = diamondsToAnimate.Count > 0;
            if (OnRowCleared != null)
            {
                OnRowCleared(colsToClear.Count, hasDiamondDestroyed);
            }
            
            // 随机生成道具（在消除的列中随机位置）
            float spawnChance = GetItemSpawnChance();
            if (Config != null && Config.EnableItems && Random.value < spawnChance && colsToClear.Count > 0)
            {
                int randomRow = Random.Range(0, Config.Rows);
                SpawnRandomItem(randomRow);
            }
        }
    }
    
    /// <summary>
    /// 特殊效果游戏循环
    /// </summary>
    private IEnumerator SpecialEffectGameLoop(JewelBlockData triggerBlock)
    {
        _isProcessing = true;
        
        // 禁用输入
        if (_inputHandler != null)
        {
            _inputHandler.DisableInput();
        }
        
        // 应用重力
        yield return StartCoroutine(ApplyGravity());
        
        // 检查消除
        yield return StartCoroutine(CheckClearRecursive());
        
        // 生成新行并上推
        yield return StartCoroutine(SpawnAndPushUpFromPreview());
        
        // 再次应用重力
        yield return StartCoroutine(ApplyGravity());
        
        // 再次检查连击
        yield return StartCoroutine(CheckClearRecursive());
        
        // 渲染
        RenderAllBlocks();
        
        // 检查游戏结束
        CheckGameOver();
        
        _isProcessing = false;
        
        // 重新启用输入
        if (_inputHandler != null)
        {
            _inputHandler.EnableInput();
        }
    }
    
    /// <summary>
    /// 随机生成道具
    /// </summary>
    private void SpawnRandomItem(int row)
    {
        // 在指定行的随机位置生成道具
        int randomX = Random.Range(0, Config.Columns);
        
        // 检查该位置是否已有块
        bool canSpawn = true;
        foreach (var block in _blocks)
        {
            if (block.Y == row && block.X <= randomX && block.X + block.Width > randomX)
            {
                canSpawn = false;
                break;
            }
        }
        
        if (!canSpawn) return;
        
        // 根据权重随机选择道具类型
        JewelColor itemType = GetRandomItemByWeight();
        
        // 创建道具块（1x1大小）
        JewelBlockData itemData = new JewelBlockData(_blockIdCounter++, randomX, row, 1, itemType);
        CreateBlock(itemData);
        
        // 触发事件
        if (OnItemSpawned != null)
        {
            OnItemSpawned(itemType);
        }
        
        // 更新钻石块计数
        UpdateDiamondCount();
    }
    
    /// <summary>
    /// 获取道具生成概率
    /// </summary>
    private float GetItemSpawnChance()
    {
        if (ItemSpawnChance > 0)
        {
            return ItemSpawnChance; // 使用Inspector中设置的值
        }
        else if (Config != null)
        {
            return Config.ItemSpawnChance; // 使用Config中的值
        }
        return 0.3f; // 默认值
    }
    
    /// <summary>
    /// 根据权重随机获取道具类型
    /// </summary>
    private JewelColor GetRandomItemByWeight()
    {
        if (Config == null)
        {
            // 默认随机选择
            JewelColor[] itemTypes = {
                JewelColor.Diamond,
                JewelColor.BigBomb,
                JewelColor.Horizontal,
                JewelColor.Vertical,
                JewelColor.Explosive,
                JewelColor.TransformBlock
            };
            return itemTypes[Random.Range(0, itemTypes.Length)];
        }
        
        // 使用权重系统
        List<System.Tuple<JewelColor, int>> weightedItems = new List<System.Tuple<JewelColor, int>>();
        weightedItems.Add(new System.Tuple<JewelColor, int>(JewelColor.Diamond, Config.DiamondWeight));
        weightedItems.Add(new System.Tuple<JewelColor, int>(JewelColor.BigBomb, Config.BigBombWeight));
        weightedItems.Add(new System.Tuple<JewelColor, int>(JewelColor.Horizontal, Config.HorizontalWeight));
        weightedItems.Add(new System.Tuple<JewelColor, int>(JewelColor.Vertical, Config.VerticalWeight));
        weightedItems.Add(new System.Tuple<JewelColor, int>(JewelColor.Explosive, Config.ExplosiveWeight));
        // TransformBlock使用与BigBomb相同的权重
        weightedItems.Add(new System.Tuple<JewelColor, int>(JewelColor.TransformBlock, Config.BigBombWeight));
        
        int totalWeight = 0;
        foreach (var item in weightedItems)
        {
            totalWeight += item.Item2;
        }
        
        if (totalWeight <= 0)
        {
            // 如果权重总和为0，使用默认随机
            JewelColor[] itemTypes = {
                JewelColor.Diamond,
                JewelColor.BigBomb,
                JewelColor.Horizontal,
                JewelColor.Vertical,
                JewelColor.Explosive,
                JewelColor.TransformBlock
            };
            return itemTypes[Random.Range(0, itemTypes.Length)];
        }
        
        int randomValue = Random.Range(0, totalWeight);
        int currentWeight = 0;
        
        foreach (var item in weightedItems)
        {
            currentWeight += item.Item2;
            if (randomValue < currentWeight)
            {
                return item.Item1;
            }
        }
        
        // 默认返回第一个
        return weightedItems[0].Item1;
    }
    
    /// <summary>
    /// 更新钻石块计数
    /// </summary>
    private void UpdateDiamondCount()
    {
        int count = 0;
        foreach (var block in _blocks)
        {
            if (block.IsDiamond())
            {
                count++;
            }
        }
        
        if (OnDiamondCountChanged != null)
        {
            OnDiamondCountChanged(count);
        }
    }
    
    /// <summary>
    /// 生成新行并上推（带动画）
    /// </summary>
    private IEnumerator SpawnAndPushUpFromPreview()
    {
        // 检查是否有块已经达到或超过最大行数
        int maxRows = Config.Rows;
        
        foreach (var block in _blocks)
        {
            if (block.Y + 1 >= maxRows)
            {
                Debug.Log($"[新行生成] 检测到块已超过行数限制: 块Y={block.Y}, 最大行数={maxRows}，停止生成新行");
                _isProcessing = false;
                yield break;
            }
        }
        
        // 创建新行在 Y=-1（屏幕下方）
        List<JewelBlockData> newBlocks = new List<JewelBlockData>();
        foreach (var blockData in _nextRowData)
        {
            blockData.Y = -1; // 从下方开始
            CreateBlock(blockData);
            newBlocks.Add(blockData);
        }
        
        // 使用动画让所有块同时向上移动
        yield return StartCoroutine(AnimatePushUpBlocks(newBlocks));
        
        // 生成下一行预览数据
        GenerateNextRowData();
        
        // 上推完成后，检查是否需要生成bigbomb
        if (_pendingStep5BigBombSpawn)
        {
            _pendingStep5BigBombSpawn = false;
            Debug.Log("[第一关第5步] 上推完成，开始生成bigbomb");
            yield return StartCoroutine(SpawnStep5BigBombs());
        }
    }
    
    /// <summary>
    /// 动画推动所有块向上移动（新块从下方顶上来）
    /// </summary>
    private IEnumerator AnimatePushUpBlocks(List<JewelBlockData> newBlocks)
    {
        float duration = Config.RowRiseTime;
        float elapsed = 0f;
        
        // 记录所有块的起始位置和目标位置
        Dictionary<JewelBlockController, Vector2> startPositions = new Dictionary<JewelBlockController, Vector2>();
        Dictionary<JewelBlockController, Vector2> targetPositions = new Dictionary<JewelBlockController, Vector2>();
        Dictionary<JewelBlockData, int> targetYValues = new Dictionary<JewelBlockData, int>();
        
        // 为所有块计算起始和目标位置
        foreach (var block in _blocks)
        {
            if (block.BlockObject == null) continue;
            
            JewelBlockController controller = block.BlockObject.GetComponent<JewelBlockController>();
            if (controller == null) continue;
            
            RectTransform rectTransform = controller.GetComponent<RectTransform>();
            if (rectTransform == null) continue;
            
            // 记录起始位置
            startPositions[controller] = rectTransform.anchoredPosition;
            
            // 计算目标Y坐标：旧块上移1格，新块从-1移到0
            int targetY = newBlocks.Contains(block) ? 0 : block.Y + 1;
            targetYValues[block] = targetY;
            
            // 计算目标位置（基于目标Y坐标）
            float x = (_cellWidth * block.X) + (_cellWidth * block.Width / 2f) - (_boardWidth / 2f);
            float y = _bottomOffsetY + (_cellHeight * targetY) + (_cellHeight / 2f);
            targetPositions[controller] = new Vector2(x, y);
        }
        
        // 平滑动画
        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = Mathf.Clamp01(elapsed / duration);
            // 使用缓出曲线
            t = 1f - Mathf.Pow(1f - t, 2f);
            
            foreach (var kvp in startPositions)
            {
                JewelBlockController controller = kvp.Key;
                Vector2 startPos = kvp.Value;
                Vector2 targetPos = targetPositions[controller];
                
                RectTransform rectTransform = controller.GetComponent<RectTransform>();
                if (rectTransform != null)
                {
                    rectTransform.anchoredPosition = Vector2.Lerp(startPos, targetPos, t);
                }
            }
            
            yield return null;
        }
        
        // 更新所有块的逻辑Y坐标
        foreach (var kvp in targetYValues)
        {
            kvp.Key.Y = kvp.Value;
        }
        
        // 确保最终位置准确
        RenderAllBlocks();
    }
    
    /// <summary>
    /// 生成下一行预览数据
    /// </summary>
    private void GenerateNextRowData()
    {
        _nextRowData = GenerateRowData(0);
    }
    
    /// <summary>
    /// 获取下一行预览数据
    /// </summary>
    public List<JewelBlockData> GetNextRowData()
    {
        return _nextRowData;
    }
    
    /// <summary>
    /// 检查游戏结束
    /// </summary>
    private void CheckGameOver()
    {
        // 游戏机制：只有步数用完或钻石收集完才结束游戏
        // 块堆到顶不触发游戏结束，继续游戏即可
        
        // 注释掉原有的堆到顶判定逻辑
        // int gameOverRow = Config.GetGameOverRow();
        // 
        // foreach (var block in _blocks)
        // {
        //     if (block.Y >= gameOverRow)
        //     {
        //         Debug.Log($"[游戏结束] CheckGameOver触发游戏结束！块Y={block.Y}, GameOverRow={gameOverRow}, 块颜色={block.Color}");
        //         if (OnGameOver != null)
        //         {
        //             OnGameOver();
        //         }
        //         return;
        //     }
        // }
        
        // 游戏胜负由GameManager的CheckWinLoseConditions判定
        // - 胜利：钻石数量为0（收集完所有钻石）
        // - 失败：步数用完且钻石未收集完
    }
    
    /// <summary>
    /// 生成第一关第5步的bigbomb（在上推完成后调用）
    /// </summary>
    private IEnumerator SpawnStep5BigBombs()
    {
        // 检查条件
        if (!_isCurrentlyFirstLevel || _firstLevelMoveCount != 5 || _hasSpawnedStep5BigBomb)
        {
            Debug.LogWarning($"[第一关第5步] ✗ 条件检查失败: _isCurrentlyFirstLevel={_isCurrentlyFirstLevel}, _firstLevelMoveCount={_firstLevelMoveCount}, _hasSpawnedStep5BigBomb={_hasSpawnedStep5BigBomb}");
            yield break;
        }
        
        Debug.Log($"[第一关第5步] ✓ 条件检查通过，上推已完成，准备生成bigbomb");
        
        Debug.Log("[第一关第5步] 开始查找位置生成2个bigbomb（优先上下关系）");
        Debug.Log($"[第一关第5步] 当前块数量: {_blocks.Count}");
        
        // 查找可以生成2个bigbomb的位置（优先上下关系）
        TwoPositions positions = FindTwoPositionsForBigBombs();
        
        if (positions != null)
        {
            int x1 = positions.X1;
            int y1 = positions.Y1;
            int x2 = positions.X2;
            int y2 = positions.Y2;
            Debug.Log($"[第一关第5步] 找到位置 ({x1}, {y1}) 和 ({x2}, {y2})，生成2个bigbomb");
            
            // 在第一个位置生成bigbomb
            JewelBlockData bigBombBlock1 = new JewelBlockData(
                _blockIdCounter++,
                x1,
                y1,
                1, // 宽度为1
                JewelColor.BigBomb
            );
            
            CreateBlock(bigBombBlock1);
            Debug.Log($"[第一关第5步] 已创建第一个BigBomb: ID={bigBombBlock1.Id}, X={bigBombBlock1.X}, Y={bigBombBlock1.Y}, Color={bigBombBlock1.Color}, BlockObject={(bigBombBlock1.BlockObject != null ? "存在" : "null")}");
            
            // 在第二个位置生成bigbomb
            JewelBlockData bigBombBlock2 = new JewelBlockData(
                _blockIdCounter++,
                x2,
                y2,
                1, // 宽度为1
                JewelColor.BigBomb
            );
            
            CreateBlock(bigBombBlock2);
            Debug.Log($"[第一关第5步] 已创建第二个BigBomb: ID={bigBombBlock2.Id}, X={bigBombBlock2.X}, Y={bigBombBlock2.Y}, Color={bigBombBlock2.Color}, BlockObject={(bigBombBlock2.BlockObject != null ? "存在" : "null")}");
            
            // 确保GameObject已激活
            if (bigBombBlock1.BlockObject != null)
            {
                bigBombBlock1.BlockObject.SetActive(true);
                JewelBlockController controller1 = bigBombBlock1.BlockObject.GetComponent<JewelBlockController>();
                if (controller1 != null)
                {
                    controller1.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
                    Debug.Log($"[第一关第5步] 第一个BigBomb GameObject已激活，位置已更新");
                }
            }
            
            if (bigBombBlock2.BlockObject != null)
            {
                bigBombBlock2.BlockObject.SetActive(true);
                JewelBlockController controller2 = bigBombBlock2.BlockObject.GetComponent<JewelBlockController>();
                if (controller2 != null)
                {
                    controller2.UpdatePosition(_cellWidth, _cellHeight, _boardWidth, _boardHeight, _bottomOffsetY);
                    Debug.Log($"[第一关第5步] 第二个BigBomb GameObject已激活，位置已更新");
                }
            }
            
            RenderAllBlocks();
            
            // 标记已生成，防止重复生成
            _hasSpawnedStep5BigBomb = true;
            
            // 触发道具生成事件
            if (OnItemSpawned != null)
            {
                OnItemSpawned(JewelColor.BigBomb);
                OnItemSpawned(JewelColor.BigBomb);
            }
            
            Debug.Log($"[第一关第5步] 2个BigBomb已生成在位置 ({x1}, {y1}) 和 ({x2}, {y2})，当前块总数: {_blocks.Count}");
        }
        else
        {
            Debug.LogWarning("[第一关第5步] 未找到可以生成2个bigbomb的位置");
            Debug.LogWarning($"[第一关第5步] 游戏板尺寸: {Config.Columns}x{Config.Rows}, 当前块数量: {_blocks.Count}");
        }
    }
    
    /// <summary>
    /// 两个位置的坐标类（用于替换Tuple，兼容Luna打包）
    /// </summary>
    private class TwoPositions
    {
        public int X1;
        public int Y1;
        public int X2;
        public int Y2;
        
        public TwoPositions(int x1, int y1, int x2, int y2)
        {
            X1 = x1;
            Y1 = y1;
            X2 = x2;
            Y2 = y2;
        }
    }
    
    /// <summary>
    /// 查找可以生成2个bigbomb的位置（优先上下关系）
    /// 返回: TwoPositions 两个位置的坐标，如果找不到则返回null
    /// </summary>
    private TwoPositions FindTwoPositionsForBigBombs()
    {
        Debug.Log($"[查找空位] 开始查找2个位置生成bigbomb，游戏板尺寸: {Config.Columns}x{Config.Rows}");
        
        // 优先查找上下关系的两个空位
        for (int y = 0; y < Config.Rows - 1; y++)
        {
            for (int x = 0; x < Config.Columns; x++)
            {
                // 检查当前位置和上方位置是否都为空
                if (GetBlockAt(x, y) == null && GetBlockAt(x, y + 1) == null)
                {
                    Debug.Log($"[查找空位] 找到上下关系的两个空位: ({x}, {y}) 和 ({x}, {y + 1})");
                    return new TwoPositions(x, y, x, y + 1);
                }
            }
        }
        
        // 如果找不到上下关系，查找左右关系的两个空位
        Debug.Log("[查找空位] 未找到上下关系的空位，尝试查找左右关系");
        for (int y = 0; y < Config.Rows; y++)
        {
            for (int x = 0; x < Config.Columns - 1; x++)
            {
                // 检查当前位置和右侧位置是否都为空
                if (GetBlockAt(x, y) == null && GetBlockAt(x + 1, y) == null)
                {
                    Debug.Log($"[查找空位] 找到左右关系的两个空位: ({x}, {y}) 和 ({x + 1}, {y})");
                    return new TwoPositions(x, y, x + 1, y);
                }
            }
        }
        
        // 如果找不到相邻的两个空位，查找任意两个空位
        Debug.Log("[查找空位] 未找到相邻的两个空位，尝试查找任意两个空位");
        int? firstX = null;
        int? firstY = null;
        for (int y = 0; y < Config.Rows; y++)
        {
            for (int x = 0; x < Config.Columns; x++)
            {
                if (GetBlockAt(x, y) == null)
                {
                    if (firstX == null || firstY == null)
                    {
                        firstX = x;
                        firstY = y;
                    }
                    else
                    {
                        Debug.Log($"[查找空位] 找到两个任意空位: ({firstX.Value}, {firstY.Value}) 和 ({x}, {y})");
                        return new TwoPositions(firstX.Value, firstY.Value, x, y);
                    }
                }
            }
        }
        
        Debug.LogWarning("[查找空位] 未找到足够的空位生成2个bigbomb");
        return null;
    }
    
    /// <summary>
    /// 查找有2个空位的位置（上下左右都行）（保留用于兼容性）
    /// </summary>
    private System.Tuple<int, int>? FindPositionWithTwoEmptySpaces()
    {
        Debug.Log($"[查找空位] 开始查找，游戏板尺寸: {Config.Columns}x{Config.Rows}");
        
        // 先尝试找有2个或更多空位的位置
        for (int y = 0; y < Config.Rows; y++)
        {
            for (int x = 0; x < Config.Columns; x++)
            {
                // 检查该位置是否为空
                if (GetBlockAt(x, y) != null)
                {
                    continue; // 该位置已有块
                }
                
                // 检查上下左右是否有2个空位
                int emptyCount = 0;
                
                // 上
                if (y + 1 < Config.Rows && GetBlockAt(x, y + 1) == null)
                {
                    emptyCount++;
                }
                
                // 下
                if (y - 1 >= 0 && GetBlockAt(x, y - 1) == null)
                {
                    emptyCount++;
                }
                
                // 左
                if (x - 1 >= 0 && GetBlockAt(x - 1, y) == null)
                {
                    emptyCount++;
                }
                
                // 右
                if (x + 1 < Config.Columns && GetBlockAt(x + 1, y) == null)
                {
                    emptyCount++;
                }
                
                // 如果找到有2个或更多空位的位置，返回该位置
                if (emptyCount >= 2)
                {
                    Debug.Log($"[查找空位] 找到位置 ({x}, {y})，周围有 {emptyCount} 个空位");
                    return new System.Tuple<int, int>(x, y);
                }
            }
        }
        
        // 如果找不到有2个空位的位置，尝试找有1个空位的位置
        Debug.Log("[查找空位] 未找到有2个空位的位置，尝试找有1个空位的位置");
        for (int y = 0; y < Config.Rows; y++)
        {
            for (int x = 0; x < Config.Columns; x++)
            {
                // 检查该位置是否为空
                if (GetBlockAt(x, y) != null)
                {
                    continue; // 该位置已有块
                }
                
                // 检查上下左右是否有至少1个空位
                bool hasEmpty = false;
                
                // 上
                if (y + 1 < Config.Rows && GetBlockAt(x, y + 1) == null)
                {
                    hasEmpty = true;
                }
                // 下
                else if (y - 1 >= 0 && GetBlockAt(x, y - 1) == null)
                {
                    hasEmpty = true;
                }
                // 左
                else if (x - 1 >= 0 && GetBlockAt(x - 1, y) == null)
                {
                    hasEmpty = true;
                }
                // 右
                else if (x + 1 < Config.Columns && GetBlockAt(x + 1, y) == null)
                {
                    hasEmpty = true;
                }
                
                if (hasEmpty)
                {
                    Debug.Log($"[查找空位] 找到位置 ({x}, {y})，周围至少有1个空位");
                    return new System.Tuple<int, int>(x, y);
                }
            }
        }
        
        // 如果还是找不到，就找任意一个空位
        Debug.Log("[查找空位] 未找到有相邻空位的位置，尝试找任意空位");
        for (int y = 0; y < Config.Rows; y++)
        {
            for (int x = 0; x < Config.Columns; x++)
            {
                // 检查该位置是否为空
                if (GetBlockAt(x, y) == null)
                {
                    Debug.Log($"[查找空位] 找到任意空位 ({x}, {y})");
                    return new System.Tuple<int, int>(x, y);
                }
            }
        }
        
        Debug.LogWarning("[查找空位] 未找到任何空位");
        return null; // 未找到
    }
}


