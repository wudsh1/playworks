using UnityEngine;

/// <summary>
/// 游戏板配置类（可配置尺寸）
/// </summary>
[CreateAssetMenu(fileName = "JewelBoardConfig", menuName = "JewelGame/BoardConfig")]
public class JewelBoardConfig : ScriptableObject
{
    [Header("游戏板尺寸")]
    [Tooltip("列数（宽度）")]
    public int Columns = 12;
    
    [Tooltip("行数（高度）")]
    public int Rows = 16;
    
    [Header("宝石配置")]
    [Tooltip("宝石块最小宽度")]
    public int MinBlockWidth = 1;
    
    [Tooltip("宝石块最大宽度")]
    public int MaxBlockWidth = 4;
    
    [Tooltip("初始生成的行数")]
    public int InitialRows = 4;
    
    [Header("游戏规则")]
    [Tooltip("每行消除所需填充的列数（通常等于列数）")]
    public int RequiredColumnsForClear = 12;
    
    [Tooltip("游戏结束条件：堆到第几行（使用行数作为最多行数）")]
    public int GameOverRow = 15;
    
    /// <summary>
    /// 获取游戏结束行数（使用配置的行数）
    /// </summary>
    public int GetGameOverRow()
    {
        return Rows - 1; // 使用配置的行数减1作为游戏结束行
    }
    
    [Tooltip("最大移动次数（0表示无限制）")]
    public int MaxMoves = 0;
    
    [Tooltip("目标分数（0表示无限制）")]
    public int TargetScore = 0;
    
    [Header("视觉效果")]
    [Tooltip("重力下落时间（秒）")]
    public float GravityFallTime = 0.2f;
    
    [Tooltip("新行上升时间（秒）")]
    public float RowRiseTime = 0.3f;
    
    [Tooltip("消除动画时间（秒）")]
    public float ClearAnimationTime = 0.4f;
    
    [Header("道具配置")]
    [Tooltip("消除一行时生成道具的概率（0-1）")]
    [Range(0f, 1f)]
    public float ItemSpawnChance = 0.3f;
    
    [Tooltip("是否启用道具系统")]
    public bool EnableItems = true;
    
    [Tooltip("道具生成权重（总和应该为100，用于控制各道具出现概率）")]
    [Range(0, 100)]
    public int DiamondWeight = 20;      // 钻石块权重
    
    [Range(0, 100)]
    public int BigBombWeight = 20;      // 大炸弹块权重
    
    [Range(0, 100)]
    public int HorizontalWeight = 20;   // 横块权重
    
    [Range(0, 100)]
    public int VerticalWeight = 20;     // 竖块权重
    
    [Range(0, 100)]
    public int ExplosiveWeight = 20;    // 炸块权重
    
    /// <summary>
    /// 验证配置有效性
    /// </summary>
    public bool Validate()
    {
        if (Columns < 1 || Rows < 1)
        {
            Debug.LogError("游戏板尺寸必须大于0");
            return false;
        }
        
        if (MinBlockWidth < 1 || MaxBlockWidth < MinBlockWidth)
        {
            Debug.LogError("宝石宽度配置无效");
            return false;
        }
        
        if (MaxBlockWidth > Columns)
        {
            Debug.LogError("最大宝石宽度不能超过列数");
            return false;
        }
        
        if (RequiredColumnsForClear > Columns)
        {
            Debug.LogError("消除所需列数不能超过总列数");
            return false;
        }
        
        return true;
    }
}


