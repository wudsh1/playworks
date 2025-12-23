/// <summary>
/// 宝石颜色枚举（目前支持2种颜色 + 道具类型）
/// </summary>
public enum JewelColor
{
    Blue = 0,
    Pink = 1,
    // 道具类型（1x1大小）
    Diamond = 10,      // 钻石块
    BigBomb = 11,      // 大炸弹块
    Horizontal = 12,   // 横块
    Vertical = 13,     // 竖块
    Explosive = 14,    // 炸块
    TransformBlock = 15 // 转换块（滑动一次后变成BigBomb）
}


