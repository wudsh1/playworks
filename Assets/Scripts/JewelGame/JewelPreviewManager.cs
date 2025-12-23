using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 预览区域管理器
/// </summary>
public class JewelPreviewManager : MonoBehaviour
{
    [Header("UI引用")]
    public RectTransform PreviewContainer;
    public GameObject PreviewBlockPrefab;
    
    [Header("配置")]
    public JewelBoardConfig Config;
    
    private float _cellWidth;
    private float _cellHeight;
    private float _previewWidth;
    private float _previewHeight;
    
    /// <summary>
    /// 初始化
    /// </summary>
    public void Initialize(JewelBoardConfig config)
    {
        Config = config;
        CalculatePreviewMetrics();
    }
    
    /// <summary>
    /// 计算预览区域尺寸（确保单元格是正方形）
    /// </summary>
    private void CalculatePreviewMetrics()
    {
        if (PreviewContainer == null) return;
        
        _previewWidth = PreviewContainer.rect.width;
        _previewHeight = PreviewContainer.rect.height;
        
        // 计算基于宽度和高度的单元格尺寸
        float cellSizeByWidth = _previewWidth / Config.Columns;
        float cellSizeByHeight = _previewHeight; // 预览区域通常只有一行高度
        
        // 取较小值，确保单元格是正方形
        float cellSize = Mathf.Min(cellSizeByWidth, cellSizeByHeight);
        
        // 使用统一的单元格尺寸（正方形）
        _cellWidth = cellSize;
        _cellHeight = cellSize;
    }
    
    /// <summary>
    /// 更新预览显示
    /// </summary>
    public void UpdatePreview(List<JewelBlockData> nextRowData)
    {
        // 清除现有预览
        foreach (Transform child in PreviewContainer)
        {
            Destroy(child.gameObject);
        }
        
        if (nextRowData == null) return;
        
        // 创建预览块
        foreach (var blockData in nextRowData)
        {
            GameObject previewObj = Instantiate(PreviewBlockPrefab, PreviewContainer);
            JewelBlockController controller = previewObj.GetComponent<JewelBlockController>();
            
            if (controller == null)
            {
                controller = previewObj.AddComponent<JewelBlockController>();
            }
            
            // 初始化预览块（使用半透明效果）
            controller.Initialize(blockData, Config, _cellWidth, _cellHeight);
            
            // 设置预览块位置
            RectTransform rectTransform = previewObj.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                float x = (blockData.X * _cellWidth) + (blockData.Width * _cellWidth / 2f) - (_previewWidth / 2f);
                rectTransform.anchoredPosition = new Vector2(x, 0);
            }
            
            // 设置半透明效果
            Image image = previewObj.GetComponent<Image>();
            if (image != null)
            {
                Color color = image.color;
                color.a = 0.5f;
                image.color = color;
            }
        }
    }
}






















