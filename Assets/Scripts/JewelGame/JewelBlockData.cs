using UnityEngine;

/// <summary>
/// 宝石块数据类
/// </summary>
public class JewelBlockData
{
    public int Id { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public JewelColor Color { get; set; }
    public GameObject BlockObject { get; set; }
    
    public JewelBlockData(int id, int x, int y, int width, JewelColor color)
    {
        Id = id;
        X = x;
        Y = y;
        Width = width;
        Color = color;
    }
    
    /// <summary>
    /// 检查两个块是否重叠
    /// </summary>
    public bool OverlapsWith(JewelBlockData other)
    {
        if (Y != other.Y) return false;
        return X < other.X + other.Width && X + Width > other.X;
    }
    
    /// <summary>
    /// 检查是否有支撑（下方有块支撑）
    /// </summary>
    public bool HasSupport(System.Collections.Generic.List<JewelBlockData> allBlocks)
    {
        if (Y == 0) return true;
        
        foreach (var block in allBlocks)
        {
            if (block.Y == Y - 1)
            {
                if (X < block.X + block.Width && X + Width > block.X)
                {
                    return true;
                }
            }
        }
        return false;
    }
    
    /// <summary>
    /// 判断是否是道具块
    /// </summary>
    public bool IsItem()
    {
        return Color >= JewelColor.Diamond;
    }
    
    /// <summary>
    /// 判断是否是钻石块
    /// </summary>
    public bool IsDiamond()
    {
        return Color == JewelColor.Diamond;
    }
    
    /// <summary>
    /// 判断是否是横块
    /// </summary>
    public bool IsHorizontal()
    {
        return Color == JewelColor.Horizontal;
    }
    
    /// <summary>
    /// 判断是否是竖块
    /// </summary>
    public bool IsVertical()
    {
        return Color == JewelColor.Vertical;
    }
    
    /// <summary>
    /// 判断是否是炸块
    /// </summary>
    public bool IsExplosive()
    {
        return Color == JewelColor.Explosive;
    }
    
    /// <summary>
    /// 判断是否是大炸弹块
    /// </summary>
    public bool IsBigBomb()
    {
        return Color == JewelColor.BigBomb;
    }
    
    /// <summary>
    /// 判断是否是转换块
    /// </summary>
    public bool IsTransformBlock()
    {
        return Color == JewelColor.TransformBlock;
    }
    
    /// <summary>
    /// 判断是否是非钻石的道具块（可以上下移动，不算入消除宽度）
    /// 包括：BigBomb, Horizontal, Vertical, Explosive, TransformBlock
    /// </summary>
    public bool IsNonDiamondItem()
    {
        // 明确列出所有可垂直移动的道具块类型，确保 BigBomb 可以垂直移动
        return IsBigBomb() || IsHorizontal() || IsVertical() || IsExplosive() || IsTransformBlock();
    }
}


