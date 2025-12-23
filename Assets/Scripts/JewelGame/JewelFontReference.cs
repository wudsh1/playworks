using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 字体资源引用脚本（确保字体被包含在构建中）
/// 将此脚本添加到场景中的任意GameObject上，并拖入字体资源
/// </summary>
public class JewelFontReference : MonoBehaviour
{
    [Header("字体引用（确保字体被包含在构建中）")]
    [Tooltip("拖入需要包含在构建中的字体资源")]
    public Font[] FontsToInclude;
    
    private void Awake()
    {
        // 这个脚本的主要目的是确保字体资源被引用，从而被包含在构建中
        // 即使不执行任何操作，只要字体被引用，Unity就会包含它
        if (FontsToInclude != null && FontsToInclude.Length > 0)
        {
            foreach (var font in FontsToInclude)
            {
                if (font != null)
                {
                    Debug.Log($"[字体引用] 字体已引用: {font.name}");
                }
            }
        }
    }
}


















