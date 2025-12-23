using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using UI;

#if UNITY_LUNA
using Bridge;
#endif

/// <summary>
/// 宝石游戏管理器（单例，整合所有系统）
/// </summary>
public class JewelGameManager : MonoBehaviour
{
    public static JewelGameManager Instance { get; private set; }
    
    [Header("配置")]
    public JewelBoardConfig BoardConfig;
    
    [Header("管理器引用")]
    public JewelBoardManager BoardManager;
    public JewelPreviewManager PreviewManager;
    
    [Header("UI引用")]
    public Text ScoreText;
    public Text ComboText;
    public ImageNumberDisplay MovesText; // 移动次数显示（图片数字）
    public ImageNumberDisplay DiamondCountText; // 钻石块计数显示（图片数字）
    public RectTransform DiamondTargetTransform; // 钻石收集动画的目标位置（左上角）
    public GameObject GameOverPanel;
    public Text FinalScoreText;
    public Text UserAgentText; // 用户代理字符串显示
    
    [Header("游戏结果界面")]
    public GameWinPanel WinPanel; // 胜利界面
    public GameLosePanel LosePanel; // 失败界面
    
    [Header("角色动画")]
    public JewelCharacterAnimator CharacterAnimator; // 角色动画控制器
    
    [Header("引导系统")]
    public JewelHandGuide HandGuide; // 手部引导控制器
    
    [Header("商店导航")]
    public StoreNavigator StoreNavigator; // 商店导航器（用于跳转商店）
    
    [Header("游戏规则配置")]
    [Tooltip("初始剩余步数")]
    public int InitialMoves = 6;
    
    [Tooltip("失败后是否自动重新加载关卡（否则跳转商店）")]
    public bool AutoRestartOnFail = true;
    
    [Tooltip("Win/Lose界面出现时是否自动跳转应用商店")]
    public bool AutoJumpToStoreOnWinLose = false;
    
    [Tooltip("Win/Lose界面显示后等待多少秒再跳转商店")]
    [Range(0f, 10f)]
    public float AutoJumpToStoreDelay = 2f;
    
    private int _score = 0;
    private int _currentCombo = 0;
    private int _remainingMoves = 6; // 剩余步数（倒计时）
    private int _diamondCount = 0; // 当前钻石块数量
    
    /// <summary>
    /// 获取剩余步数（供外部调用）
    /// </summary>
    public int GetRemainingMoves()
    {
        return _remainingMoves;
    }
    private int _targetDiamondCount = 0; // 目标钻石数量（游戏开始时的初始钻石数）
    private bool _gameOver = false;
    private bool _hasPlayerMoved = false; // 玩家是否已经移动过
    private static bool _hasShownWinPanel = false; // 是否已经显示过胜利界面（静态，整个游戏生命周期只显示一次）
    private static bool _hasShownLosePanel = false; // 是否已经显示过失败界面（静态，整个游戏生命周期只显示一次）
    private Coroutine _winCoroutine = null; // 胜利协程引用
    private Coroutine _loseCoroutine = null; // 失败协程引用
    
    private void Awake()
    {
        // 单例模式
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
            return;
        }
        
        // 如果没有配置，创建默认配置
        if (BoardConfig == null)
        {
            BoardConfig = ScriptableObject.CreateInstance<JewelBoardConfig>();
            BoardConfig.Columns = 12;
            BoardConfig.Rows = 16;
        }
    }
    
    private void Start()
    {
        InitializeGame();
    }
    
    /// <summary>
    /// 初始化游戏
    /// </summary>
    private void InitializeGame()
    {
        if (BoardManager == null)
        {
            Debug.LogError("JewelBoardManager未设置！");
            return;
        }
        
        if (PreviewManager == null)
        {
            Debug.LogError("JewelPreviewManager未设置！");
            return;
        }
        
        // 初始化管理器
        BoardManager.Config = BoardConfig;
        PreviewManager.Initialize(BoardConfig);
        
        // 订阅事件
        Debug.Log($"[初始化] 订阅事件, OnRowCleared: {(BoardManager.OnRowCleared == null ? "null" : "已存在")}");
        BoardManager.OnRowCleared += OnRowCleared;
        Debug.Log($"[初始化] 订阅后, OnRowCleared: {(BoardManager.OnRowCleared == null ? "null" : "已订阅")}");
        BoardManager.OnCombo += OnCombo;
        BoardManager.OnGameOver += OnGameOver;
        BoardManager.OnMoveMade += OnMoveMade;
        BoardManager.OnItemSpawned += OnItemSpawned;
        BoardManager.OnDiamondCountChanged += OnDiamondCountChanged;
        
        // 初始化UI
        UpdateUI();
        
        // 显示 User Agent
        UpdateUserAgentText();
        
        // 初始化角色动画
        if (CharacterAnimator != null)
        {
            CharacterAnimator.PlayIdleAnimation();
        }
        
        // 初始化引导系统
        if (HandGuide != null)
        {
            HandGuide.Initialize(BoardManager);
            HandGuide.ShowGuide();
        }
        
        // 重置移动标志和游戏状态
        _hasPlayerMoved = false;
        _remainingMoves = InitialMoves;
        _gameOver = false;
        // 注意：_hasShownWinPanel 和 _hasShownLosePanel 是静态的，不重置（整个游戏生命周期只显示一次）
        
        // 自动查找 StoreNavigator（如果未设置）
        if (StoreNavigator == null)
        {
            StoreNavigator = FindObjectOfType<StoreNavigator>();
        }
        
        // 更新预览
        StartCoroutine(UpdatePreviewCoroutine());
    }
    
    /// <summary>
    /// 更新预览协程
    /// </summary>
    private IEnumerator UpdatePreviewCoroutine()
    {
        while (!_gameOver)
        {
            yield return new WaitForSeconds(0.1f);
            if (BoardManager != null)
            {
                var nextRowData = BoardManager.GetNextRowData();
                if (nextRowData != null && PreviewManager != null)
                {
                    PreviewManager.UpdatePreview(nextRowData);
                }
            }
        }
    }
    
    /// <summary>
    /// 行消除回调
    /// </summary>
    private void OnRowCleared(int rowCount, bool hasDiamondDestroyed)
    {
        Debug.Log($"[角色动画] OnRowCleared 被调用! 行数: {rowCount}, 有钻石: {hasDiamondDestroyed}, CharacterAnimator: {(CharacterAnimator != null ? "已设置" : "未设置")}");
        
        _currentCombo++;
        int points = rowCount * 100 * (1 + _currentCombo);
        _score += points;
        
        UpdateUI();
        
        // 显示连击文字
        if (ComboText != null)
        {
            ComboText.text = $"COMBO x{_currentCombo}";
            ComboText.gameObject.SetActive(true);
            StartCoroutine(HideComboText());
        }
        
        // 根据是否有钻石销毁播放不同的角色动画
        if (CharacterAnimator != null)
        {
            Debug.Log($"[角色动画] 行消除: {rowCount}行, 有钻石销毁: {hasDiamondDestroyed}");
            if (hasDiamondDestroyed)
            {
                // 有钻石销毁，播放向左看动画
                Debug.Log("[角色动画] 播放向左看动画");
                CharacterAnimator.PlayLookLeftAnimation();
            }
            else
            {
                // 没有钻石销毁，播放大笑动画
                Debug.Log("[角色动画] 播放大笑动画");
                CharacterAnimator.PlayLaughAnimation();
            }
        }
        else
        {
            Debug.LogWarning("[角色动画] CharacterAnimator 未设置！");
        }
    }
    
    /// <summary>
    /// 连击回调
    /// </summary>
    private void OnCombo(int combo)
    {
        _currentCombo = combo;
    }
    
    /// <summary>
    /// 移动完成回调
    /// </summary>
    private void OnMoveMade()
    {
        // 减少剩余步数（最小为0）
        _remainingMoves--;
        if (_remainingMoves < 0)
        {
            _remainingMoves = 0;
        }
        
        Debug.Log($"[游戏逻辑] 移动完成，剩余步数: {_remainingMoves}, 剩余钻石: {_diamondCount}");
        
        UpdateUI();
        
        // 第一次移动后隐藏引导
        if (!_hasPlayerMoved && HandGuide != null)
        {
            _hasPlayerMoved = true;
            HandGuide.HideGuide();
        }
        
        // 检查游戏胜负条件
        CheckWinLoseConditions();
    }
    
    /// <summary>
    /// 游戏结束回调（从BoardManager触发）
    /// 注意：当前游戏机制下，此方法不应该被调用
    /// 游戏胜负由CheckWinLoseConditions判定（基于步数和钻石数量）
    /// </summary>
    private void OnGameOver()
    {
        // 当前游戏机制：块堆到顶不触发游戏结束
        // 此方法保留，但正常情况下不应该被调用
        Debug.LogWarning("[游戏逻辑] OnGameOver被意外调用！当前游戏机制下不应触发此回调。");
    }
    
    /// <summary>
    /// 更新UI
    /// </summary>
    private void UpdateUI()
    {
        if (ScoreText != null)
        {
            ScoreText.text = _score.ToString();
        }
        
        // 显示剩余步数（倒计时）
        if (MovesText != null)
        {
            MovesText.SetNumber(_remainingMoves);
        }
        
        if (DiamondCountText != null)
        {
            DiamondCountText.SetNumber(_diamondCount);
        }
    }
    
    /// <summary>
    /// 更新 User Agent 文本显示
    /// </summary>
    private void UpdateUserAgentText()
    {
        if (UserAgentText == null) return;
        
        string userAgent = "Unknown";
        
#if UNITY_LUNA
        try
        {
            userAgent = PlatformDetectorJS.getUserAgent();
            Debug.Log($"[UserAgent] 获取到 User Agent: {userAgent}");
        }
        catch (System.Exception ex)
        {
            Debug.LogWarning($"[UserAgent] 获取 User Agent 失败: {ex.Message}");
            userAgent = "获取失败";
        }
#else
        // 非 Luna 环境，使用 SystemInfo
        userAgent = SystemInfo.operatingSystem;
        Debug.Log($"[UserAgent] 使用 SystemInfo: {userAgent}");
#endif
        
        UserAgentText.text = $"User Agent: {userAgent}";
    }
    
    /// <summary>
    /// 道具生成回调
    /// </summary>
    private void OnItemSpawned(JewelColor itemType)
    {
        // 可以在这里添加道具生成的特效
    }
    
    /// <summary>
    /// 钻石块数量变化回调
    /// </summary>
    private void OnDiamondCountChanged(int count)
    {
        _diamondCount = count;
        
        // 游戏刚开始时，记录初始钻石数量作为目标
        if (_targetDiamondCount == 0 && count > 0 && !_hasPlayerMoved)
        {
            _targetDiamondCount = count;
            Debug.Log($"[游戏逻辑] 初始化目标钻石数量: {_targetDiamondCount}");
        }
        
        Debug.Log($"[游戏逻辑] 钻石数量变化: {count}/{_targetDiamondCount}");
        
        UpdateUI();
        
        // 如果正在处理游戏逻辑（如ClearAllBlocks、GameLoop等），跳过胜负检查
        // 胜负检查将在处理完成后通过OnMoveMade()触发
        if (BoardManager != null && BoardManager.IsProcessing)
        {
            Debug.Log("[游戏逻辑] 正在处理游戏逻辑，跳过胜负检查（将在处理完成后检查）");
            return;
        }
        
        // 检查是否收集完所有钻石（胜利条件）
        CheckWinLoseConditions();
    }
    
    /// <summary>
    /// 检查游戏胜负条件
    /// </summary>
    private void CheckWinLoseConditions()
    {
        Debug.Log($"[游戏逻辑] 检查游戏胜负条件, _gameOver: {_gameOver}, _hasPlayerMoved: {_hasPlayerMoved}, _targetDiamondCount: {_targetDiamondCount}, _diamondCount: {_diamondCount}, _remainingMoves: {_remainingMoves}");
        if (_gameOver) return; // 游戏已结束，不再检查
        
        // 只有在玩家已经移动过，且已经设置了目标钻石数量后才检查胜负
        if (!_hasPlayerMoved || _targetDiamondCount == 0) return;
        
        // 特殊情况：如果目标钻石数已达成但当前钻石数大于目标，说明是BigBomb清除后重新生成的
        // 此时应该重置目标钻石数，不触发胜利条件
        if (_diamondCount > _targetDiamondCount)
        {
            Debug.Log($"[游戏逻辑] 检测到钻石数量超过目标（可能是BigBomb清除后重新生成），重置目标钻石数量: {_targetDiamondCount} → {_diamondCount}");
            _targetDiamondCount = _diamondCount;
            return;
        }
        
        // 如果已经显示过胜利界面，之后不再显示任何页面（胜利和失败都不显示）
        if (_hasShownWinPanel)
        {
            Debug.Log("[游戏逻辑] 已经显示过胜利界面，之后不再显示任何胜负页面");
            return;
        }
        
        // 胜利条件：钻石数量为 0 且目标钻石数 > 0（收集完所有钻石）
        if (_diamondCount == 0 && _targetDiamondCount > 0)
        {
            // 如果协程正在运行，直接返回
            if (_gameOver || _winCoroutine != null)
            {
                Debug.Log($"[游戏逻辑] 胜利协程正在运行，跳过重复触发 (gameOver:{_gameOver}, coroutine:{_winCoroutine != null})");
                return;
            }
            
            // 立即设置游戏结束标志和显示标志，防止重复触发
            _gameOver = true;
            _hasShownWinPanel = true;
            Debug.Log($"[游戏逻辑] ✅ 胜利！所有钻石已收集完成（初始:{_targetDiamondCount} → 当前:0）");
            _winCoroutine = StartCoroutine(OnGameWin());
            return;
        }
        
        // 失败条件：步数用完且钻石未收集完
        if (_remainingMoves <= 0 && _diamondCount > 0)
        {
            // 如果已经显示过失败界面，不再显示失败页面
            if (_hasShownLosePanel)
            {
                Debug.Log("[游戏逻辑] 已经显示过失败界面，不再显示失败页面");
                return;
            }
            
            // 如果协程正在运行，直接返回
            if (_gameOver || _loseCoroutine != null)
            {
                Debug.Log($"[游戏逻辑] 失败协程正在运行，跳过重复触发 (gameOver:{_gameOver}, coroutine:{_loseCoroutine != null})");
                return;
            }
            
            // 立即设置游戏结束标志和显示标志，防止重复触发
            _gameOver = true;
            _hasShownLosePanel = true;
            Debug.Log($"[游戏逻辑] ❌ 失败！步数用完，剩余钻石: {_diamondCount}/{_targetDiamondCount}");
            _loseCoroutine = StartCoroutine(OnGameLose());
            return;
        }
    }
    
    /// <summary>
    /// 游戏胜利
    /// </summary>
    private IEnumerator OnGameWin()
    {
        try
        {
            // 双重检查：如果已经显示过胜利界面，直接返回
            if (!_hasShownWinPanel)
            {
                Debug.Log("[游戏逻辑] 胜利协程被调用但标志未设置，可能是重复调用，直接返回");
                yield break;
            }
            
            if (WinPanel != null && WinPanel.gameObject.activeSelf)
            {
                Debug.Log("[游戏逻辑] 胜利界面已显示，跳过重复显示");
                yield break;
            }
        
        Debug.Log("[游戏逻辑] 游戏胜利");
        
        // 播放胜利动画
        if (CharacterAnimator != null)
        {
            CharacterAnimator.PlayLaughAnimation();
        }
        
        // 等待所有钻石块飞行到目标位置完成
        yield return StartCoroutine(WaitForAllDiamondAnimationsComplete());
        
            // 再次检查，防止在等待期间被重复调用
            if (!_hasShownWinPanel)
            {
                Debug.Log("[游戏逻辑] 等待期间标志被重置，取消显示胜利界面");
                yield break;
            }
            
            // 显示胜利界面（只显示一次）
            if (WinPanel != null && !WinPanel.gameObject.activeSelf)
        {
            Debug.Log("[游戏逻辑] 显示胜利界面");
            WinPanel.Show();
            
            // 如果启用了自动跳转商店，等待指定时间后跳转
            if (AutoJumpToStoreOnWinLose)
            {
                Debug.Log($"[游戏逻辑] 将在 {AutoJumpToStoreDelay} 秒后自动跳转商店");
                yield return new WaitForSeconds(AutoJumpToStoreDelay);
                JumpToStore();
            }
        }
            else if (WinPanel == null)
        {
            Debug.LogWarning("[游戏逻辑] WinPanel未设置，无法显示胜利界面");
            // 如果没有界面，则使用原来的逻辑
            if (!AutoRestartOnFail)
            {
                Debug.Log("[游戏逻辑] 非重玩版本，胜利后跳转商店");
                JumpToStore();
            }
            else
            {
                Debug.Log("[游戏逻辑] 重玩版本，胜利后不跳转商店");
            }
            }
        }
        finally
        {
            // 协程结束时清除引用
            _winCoroutine = null;
        }
    }
    
    /// <summary>
    /// 等待所有钻石块飞行动画完成
    /// </summary>
    private IEnumerator WaitForAllDiamondAnimationsComplete()
    {
        Debug.Log("[游戏逻辑] 等待所有钻石块飞行动画完成...");
        
        // 持续检查直到所有钻石块动画完成
        while (true)
        {
            // 查找所有正在播放动画的钻石块
            JewelBlockController[] allBlocks = FindObjectsOfType<JewelBlockController>();
            bool hasAnimatingDiamond = false;
            
            foreach (var block in allBlocks)
            {
                // 检查是否为钻石块且正在播放动画
                if (block != null && block.gameObject.activeInHierarchy && block.IsAnimating())
                {
                    // 通过GetBlockData()检查是否为钻石块
                    var blockData = block.GetBlockData();
                    if (blockData != null && blockData.IsDiamond())
                    {
                        hasAnimatingDiamond = true;
                        break;
                    }
                }
            }
            
            // 如果没有正在播放动画的钻石块，退出循环
            if (!hasAnimatingDiamond)
            {
                Debug.Log("[游戏逻辑] 所有钻石块飞行动画已完成");
                break;
            }
            
            // 等待一帧后再次检查
            yield return null;
        }
        
        // 额外等待一小段时间，确保动画完全结束
        yield return new WaitForSeconds(0.1f);
    }
    
    /// <summary>
    /// 游戏失败
    /// </summary>
    private IEnumerator OnGameLose()
    {
        try
        {
            // 双重检查：如果已经显示过失败界面，直接返回
            if (!_hasShownLosePanel)
            {
                Debug.Log("[游戏逻辑] 失败协程被调用但标志未设置，可能是重复调用，直接返回");
                yield break;
            }
            
            if (LosePanel != null && LosePanel.gameObject.activeSelf)
            {
                Debug.Log("[游戏逻辑] 失败界面已显示，跳过重复显示");
                yield break;
            }
        
        Debug.Log("[游戏逻辑] 游戏失败");
        
        // 播放失败动画
        if (CharacterAnimator != null)
        {
            CharacterAnimator.PlayIdleAnimation();
        }
        
        // 等待动画播放结束
        yield return new WaitForSeconds(0.5f);
        
            // 再次检查，防止在等待期间被重复调用
            if (!_hasShownLosePanel)
            {
                Debug.Log("[游戏逻辑] 等待期间标志被重置，取消显示失败界面");
                yield break;
            }
            
            // 显示失败界面（只显示一次）
            if (LosePanel != null && !LosePanel.gameObject.activeSelf)
        {
            Debug.Log("[游戏逻辑] 显示失败界面");
            LosePanel.Show();
            
            // 如果启用了自动跳转商店，等待指定时间后跳转
            if (AutoJumpToStoreOnWinLose)
            {
                Debug.Log($"[游戏逻辑] 将在 {AutoJumpToStoreDelay} 秒后自动跳转商店");
                yield return new WaitForSeconds(AutoJumpToStoreDelay);
                JumpToStore();
            }
        }
            else if (LosePanel == null)
        {
            Debug.LogWarning("[游戏逻辑] LosePanel未设置，无法显示失败界面");
            // 如果没有界面，则使用原来的逻辑
            if (AutoRestartOnFail)
            {
                Debug.Log("[游戏逻辑] 自动重新加载关卡");
                RestartGame();
            }
            else
            {
                Debug.Log("[游戏逻辑] 跳转商店");
                JumpToStore();
            }
            }
        }
        finally
        {
            // 协程结束时清除引用
            _loseCoroutine = null;
        }
    }
    
    /// <summary>
    /// 跳转到应用商店
    /// </summary>
    private void JumpToStore()
    {
        if (StoreNavigator != null)
        {
            Debug.Log("[游戏逻辑] 跳转商店");
            StoreNavigator.OpenStore();
        }
        else
        {
            Debug.LogError("[游戏逻辑] StoreNavigator未设置，无法跳转商店！");
        }
    }
    
    /// <summary>
    /// 隐藏连击文字
    /// </summary>
    private IEnumerator HideComboText()
    {
        yield return new WaitForSeconds(1.5f);
        if (ComboText != null)
        {
            ComboText.gameObject.SetActive(false);
        }
    }
    
    /// <summary>
    /// 重新开始游戏
    /// </summary>
    public void RestartGame()
    {
        _score = 0;
        _currentCombo = 0;
        _remainingMoves = InitialMoves; // 重置为初始步数
        _diamondCount = 0;
        _targetDiamondCount = 0; // 重置目标钻石数（会在游戏初始化时重新统计）
        _gameOver = false;
        _hasPlayerMoved = false;
        // 注意：_hasShownWinPanel 和 _hasShownLosePanel 是静态的，不重置（整个游戏生命周期只显示一次）
        
        // 隐藏所有游戏结果界面
        if (GameOverPanel != null)
        {
            GameOverPanel.SetActive(false);
        }
        
        if (WinPanel != null)
        {
            WinPanel.Hide();
        }
        
        if (LosePanel != null)
        {
            LosePanel.Hide();
        }
        
        // 重新初始化游戏
        if (BoardManager != null)
        {
            // 重置第一关标志，确保重试时重新加载第一关
            BoardManager.ResetFirstLevel();
            
            // 清除所有块
            foreach (Transform child in BoardManager.BoardContainer)
            {
                Destroy(child.gameObject);
            }
            
            BoardManager.InitializeGame();
        }
        
        UpdateUI();
        
        Debug.Log($"[游戏逻辑] 游戏重启，初始剩余步数: {_remainingMoves}");
    }
        /// <summary>
    /// 加载下一关（胜利后调用，不重置第一关标志，从第二关开始都是随机关）
    /// </summary>
    public void NextLevel()
    {
        _score = 0;
        _currentCombo = 0;
        _remainingMoves = InitialMoves; // 重置为初始步数
        _diamondCount = 0;
        _targetDiamondCount = 0; // 重置目标钻石数（会在游戏初始化时重新统计）
        _gameOver = false;
        _hasPlayerMoved = false;
        // 注意：_hasShownWinPanel 和 _hasShownLosePanel 是静态的，不重置（整个游戏生命周期只显示一次）
        
        // 隐藏所有游戏结果界面
        if (GameOverPanel != null)
        {
            GameOverPanel.SetActive(false);
        }
        
        if (WinPanel != null)
        {
            WinPanel.Hide();
        }
        
        if (LosePanel != null)
        {
            LosePanel.Hide();
        }
        
        // 重新初始化游戏（不重置第一关标志，所以会加载随机关卡）
        if (BoardManager != null)
        {
            // 注意：不调用 ResetFirstLevel()，所以 _isFirstLevel 保持为 false，会加载随机关卡
            
            // 清除所有块
            foreach (Transform child in BoardManager.BoardContainer)
            {
                Destroy(child.gameObject);
            }
            
            BoardManager.InitializeGame();
        }
        
        UpdateUI();
        
        Debug.Log($"[游戏逻辑] 加载下一关，初始剩余步数: {_remainingMoves}");
    }
    private void OnDestroy()
    {
        // 取消订阅事件
        if (BoardManager != null)
        {
            BoardManager.OnRowCleared -= OnRowCleared;
            BoardManager.OnCombo -= OnCombo;
            BoardManager.OnGameOver -= OnGameOver;
            BoardManager.OnMoveMade -= OnMoveMade;
            BoardManager.OnItemSpawned -= OnItemSpawned;
            BoardManager.OnDiamondCountChanged -= OnDiamondCountChanged;
        }
    }
}


