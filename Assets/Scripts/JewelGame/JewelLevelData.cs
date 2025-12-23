using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// 关卡数据类（存储初始棋盘布局）
/// </summary>
[CreateAssetMenu(fileName = "JewelLevelData", menuName = "JewelGame/LevelData")]
public class JewelLevelData : ScriptableObject
{
    [Header("关卡信息")]
    public string LevelName = "Level 1";
    public int LevelNumber = 1;
    
    [Header("游戏板配置")]
    public int Columns = 12;
    public int Rows = 16;
    
    [Header("初始棋盘布局")]
    [Tooltip("初始块数据列表（X, Y, Width, Color）")]
    public List<BlockPlacementData> InitialBlocks = new List<BlockPlacementData>();
    
    /// <summary>
    /// 块放置数据（序列化用）
    /// </summary>
    [System.Serializable]
    public class BlockPlacementData
    {
        public int X;
        public int Y;
        public int Width;
        public JewelColor Color;
        
        public BlockPlacementData(int x, int y, int width, JewelColor color)
        {
            X = x;
            Y = y;
            Width = width;
            Color = color;
        }
    }
    
    /// <summary>
    /// 清除所有块
    /// </summary>
    public void ClearAllBlocks()
    {
        InitialBlocks.Clear();
    }
    
    /// <summary>
    /// 添加块
    /// </summary>
    public void AddBlock(int x, int y, int width, JewelColor color)
    {
        InitialBlocks.Add(new BlockPlacementData(x, y, width, color));
    }
    
    /// <summary>
    /// 移除块
    /// </summary>
    public void RemoveBlock(int x, int y)
    {
        InitialBlocks.RemoveAll(b => b.X == x && b.Y == y);
    }
    
    /// <summary>
    /// 获取指定位置的块
    /// </summary>
    public BlockPlacementData GetBlockAt(int x, int y)
    {
        foreach (var block in InitialBlocks)
        {
            if (block.Y == y && block.X <= x && block.X + block.Width > x)
            {
                return block;
            }
        }
        return null;
    }
    
    /// <summary>
    /// 判断是否是道具块
    /// </summary>
    public bool IsItem(JewelColor color)
    {
        return color >= JewelColor.Diamond;
    }
}

