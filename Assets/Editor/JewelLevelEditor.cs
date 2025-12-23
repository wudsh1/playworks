using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

/// <summary>
/// 关卡编辑器窗口
/// </summary>
public class JewelLevelEditor : EditorWindow
{
    private JewelLevelData _levelData;
    private Vector2 _scrollPosition;
    private JewelColor _selectedColor = JewelColor.Blue;
    private int _selectedWidth = 1;
    private bool _isItemMode = false;
    
    private const float CELL_SIZE = 20f;
    private const float BOARD_OFFSET_X = 20f;
    private const float BOARD_OFFSET_Y = 100f;
    
    [MenuItem("JewelGame/关卡编辑器")]
    public static void ShowWindow()
    {
        JewelLevelEditor window = GetWindow<JewelLevelEditor>("关卡编辑器");
        window.minSize = new Vector2(400, 600);
    }
    
    private void OnEnable()
    {
        // 如果没有关卡数据，创建一个新的
        if (_levelData == null)
        {
            CreateNewLevel();
        }
    }
    
    private void OnGUI()
    {
        EditorGUILayout.BeginVertical();
        
        // 工具栏
        DrawToolbar();
        
        EditorGUILayout.Space(10);
        
        // 关卡数据选择
        DrawLevelDataSelector();
        
        EditorGUILayout.Space(10);
        
        // 工具面板
        DrawToolPanel();
        
        EditorGUILayout.Space(10);
        
        // 游戏板
        DrawGameBoard();
        
        EditorGUILayout.EndVertical();
    }
    
    /// <summary>
    /// 绘制工具栏
    /// </summary>
    private void DrawToolbar()
    {
        EditorGUILayout.BeginHorizontal(EditorStyles.toolbar);
        
        if (GUILayout.Button("新建关卡", EditorStyles.toolbarButton))
        {
            CreateNewLevel();
        }
        
        if (GUILayout.Button("保存", EditorStyles.toolbarButton))
        {
            SaveLevel();
        }
        
        if (GUILayout.Button("加载", EditorStyles.toolbarButton))
        {
            LoadLevel();
        }
        
        if (GUILayout.Button("清除", EditorStyles.toolbarButton))
        {
            if (EditorUtility.DisplayDialog("确认", "确定要清除所有块吗？", "确定", "取消"))
            {
                if (_levelData != null)
                {
                    _levelData.ClearAllBlocks();
                    EditorUtility.SetDirty(_levelData);
                }
            }
        }
        
        EditorGUILayout.EndHorizontal();
    }
    
    /// <summary>
    /// 绘制关卡数据选择器
    /// </summary>
    private void DrawLevelDataSelector()
    {
        EditorGUILayout.BeginHorizontal();
        EditorGUILayout.LabelField("关卡数据:", GUILayout.Width(80));
        _levelData = (JewelLevelData)EditorGUILayout.ObjectField(_levelData, typeof(JewelLevelData), false);
        
        if (_levelData == null)
        {
            if (GUILayout.Button("创建新关卡", GUILayout.Width(100)))
            {
                CreateNewLevel();
            }
        }
        EditorGUILayout.EndHorizontal();
        
        if (_levelData != null)
        {
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("关卡名称:", GUILayout.Width(80));
            _levelData.LevelName = EditorGUILayout.TextField(_levelData.LevelName);
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("关卡编号:", GUILayout.Width(80));
            _levelData.LevelNumber = EditorGUILayout.IntField(_levelData.LevelNumber);
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("列数:", GUILayout.Width(80));
            _levelData.Columns = EditorGUILayout.IntField(_levelData.Columns);
            EditorGUILayout.LabelField("行数:", GUILayout.Width(50));
            _levelData.Rows = EditorGUILayout.IntField(_levelData.Rows);
            EditorGUILayout.EndHorizontal();
        }
    }
    
    /// <summary>
    /// 绘制工具面板
    /// </summary>
    private void DrawToolPanel()
    {
        EditorGUILayout.LabelField("工具面板", EditorStyles.boldLabel);
        
        // 模式选择
        EditorGUILayout.BeginHorizontal();
        EditorGUILayout.LabelField("模式:", GUILayout.Width(50));
        _isItemMode = EditorGUILayout.Toggle("道具模式", _isItemMode);
        EditorGUILayout.EndHorizontal();
        
        if (!_isItemMode)
        {
            // 普通块模式
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("颜色:", GUILayout.Width(50));
            // 限制只能选择普通颜色
            JewelColor[] normalColors = { JewelColor.Blue, JewelColor.Pink };
            int currentIndex = System.Array.IndexOf(normalColors, _selectedColor);
            if (currentIndex < 0) currentIndex = 0;
            currentIndex = EditorGUILayout.Popup(currentIndex, System.Array.ConvertAll(normalColors, c => c.ToString()));
            _selectedColor = normalColors[currentIndex];
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("宽度:", GUILayout.Width(50));
            _selectedWidth = EditorGUILayout.IntSlider(_selectedWidth, 1, 4);
            EditorGUILayout.EndHorizontal();
        }
        else
        {
            // 道具模式
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("道具类型:", GUILayout.Width(80));
            // 限制只能选择道具类型
            JewelColor[] itemColors = { 
                JewelColor.Diamond, 
                JewelColor.BigBomb, 
                JewelColor.Horizontal, 
                JewelColor.Vertical, 
                JewelColor.Explosive,
                JewelColor.TransformBlock
            };
            int currentIndex = System.Array.IndexOf(itemColors, _selectedColor);
            if (currentIndex < 0) currentIndex = 0;
            currentIndex = EditorGUILayout.Popup(currentIndex, System.Array.ConvertAll(itemColors, c => c.ToString()));
            _selectedColor = itemColors[currentIndex];
            EditorGUILayout.EndHorizontal();
            
            // 道具固定为1x1
            _selectedWidth = 1;
            EditorGUI.BeginDisabledGroup(true);
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("宽度:", GUILayout.Width(50));
            EditorGUILayout.IntField(_selectedWidth);
            EditorGUILayout.EndHorizontal();
            EditorGUI.EndDisabledGroup();
            EditorGUILayout.HelpBox("道具块固定为1x1大小", MessageType.Info);
        }
        
        EditorGUILayout.Space(5);
        EditorGUILayout.HelpBox("左键点击：放置块\n右键点击：删除块", MessageType.Info);
    }
    
    /// <summary>
    /// 绘制游戏板
    /// </summary>
    private void DrawGameBoard()
    {
        if (_levelData == null) return;
        
        EditorGUILayout.LabelField("游戏板", EditorStyles.boldLabel);
        
        _scrollPosition = EditorGUILayout.BeginScrollView(_scrollPosition);
        
        Rect boardRect = GUILayoutUtility.GetRect(
            _levelData.Columns * CELL_SIZE + BOARD_OFFSET_X * 2,
            _levelData.Rows * CELL_SIZE + BOARD_OFFSET_Y * 2
        );
        
        // 绘制背景网格
        DrawGrid(boardRect);
        
        // 绘制已放置的块
        DrawPlacedBlocks(boardRect);
        
        // 处理鼠标输入
        HandleMouseInput(boardRect);
        
        EditorGUILayout.EndScrollView();
    }
    
    /// <summary>
    /// 绘制网格
    /// </summary>
    private void DrawGrid(Rect boardRect)
    {
        // 绘制背景
        EditorGUI.DrawRect(boardRect, new Color(0.2f, 0.2f, 0.2f, 1f));
        
        // 绘制网格线
        Handles.BeginGUI();
        Handles.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
        
        // 垂直线
        for (int x = 0; x <= _levelData.Columns; x++)
        {
            float xPos = boardRect.x + BOARD_OFFSET_X + x * CELL_SIZE;
            Handles.DrawLine(
                new Vector3(xPos, boardRect.y + BOARD_OFFSET_Y),
                new Vector3(xPos, boardRect.y + BOARD_OFFSET_Y + _levelData.Rows * CELL_SIZE)
            );
        }
        
        // 水平线
        for (int y = 0; y <= _levelData.Rows; y++)
        {
            float yPos = boardRect.y + BOARD_OFFSET_Y + y * CELL_SIZE;
            Handles.DrawLine(
                new Vector3(boardRect.x + BOARD_OFFSET_X, yPos),
                new Vector3(boardRect.x + BOARD_OFFSET_X + _levelData.Columns * CELL_SIZE, yPos)
            );
        }
        
        Handles.EndGUI();
    }
    
    /// <summary>
    /// 绘制已放置的块
    /// </summary>
    private void DrawPlacedBlocks(Rect boardRect)
    {
        foreach (var block in _levelData.InitialBlocks)
        {
            if (block.X < 0 || block.X >= _levelData.Columns || 
                block.Y < 0 || block.Y >= _levelData.Rows) continue;
            
            float x = boardRect.x + BOARD_OFFSET_X + block.X * CELL_SIZE;
            float y = boardRect.y + BOARD_OFFSET_Y + (_levelData.Rows - 1 - block.Y) * CELL_SIZE;
            float width = block.Width * CELL_SIZE;
            float height = CELL_SIZE;
            
            Rect blockRect = new Rect(x, y, width, height);
            
            // 根据颜色绘制不同颜色
            Color blockColor = GetColorForJewelColor(block.Color);
            EditorGUI.DrawRect(blockRect, blockColor);
            
            // 绘制边框
            Handles.BeginGUI();
            Handles.color = Color.white;
            Handles.DrawWireCube(
                new Vector3(x + width / 2, y + height / 2, 0),
                new Vector3(width, height, 0)
            );
            Handles.EndGUI();
            
            // 绘制标签（显示宽度或道具类型）
            bool isItem = block.Color >= JewelColor.Diamond;
            string label = isItem ? GetItemLabel(block.Color) : block.Width.ToString();
            GUI.Label(blockRect, label, EditorStyles.centeredGreyMiniLabel);
        }
    }
    
    /// <summary>
    /// 获取颜色对应的Unity颜色
    /// </summary>
    private Color GetColorForJewelColor(JewelColor color)
    {
        switch (color)
        {
            case JewelColor.Blue: return new Color(0.2f, 0.4f, 1f, 0.8f);
            case JewelColor.Pink: return new Color(1f, 0.4f, 0.8f, 0.8f);
            case JewelColor.Diamond: return new Color(0.8f, 0.8f, 1f, 0.9f);
            case JewelColor.BigBomb: return new Color(1f, 0.2f, 0.2f, 0.9f);
            case JewelColor.Horizontal: return new Color(0.2f, 1f, 0.2f, 0.9f);
            case JewelColor.Vertical: return new Color(0.2f, 0.8f, 1f, 0.9f);
            case JewelColor.Explosive: return new Color(1f, 0.8f, 0.2f, 0.9f);
            case JewelColor.TransformBlock: return new Color(0.8f, 0.2f, 0.8f, 0.9f); // 紫色，表示转换块
            default: return Color.gray;
        }
    }
    
    /// <summary>
    /// 获取道具标签
    /// </summary>
    private string GetItemLabel(JewelColor color)
    {
        switch (color)
        {
            case JewelColor.Diamond: return "💎";
            case JewelColor.BigBomb: return "💣";
            case JewelColor.Horizontal: return "→";
            case JewelColor.Vertical: return "↓";
            case JewelColor.Explosive: return "💥";
            case JewelColor.TransformBlock: return "🔄"; // 转换符号，表示滑动后变成BigBomb
            default: return "?";
        }
    }
    
    /// <summary>
    /// 处理鼠标输入
    /// </summary>
    private void HandleMouseInput(Rect boardRect)
    {
        Event e = Event.current;
        
        if (e.type == EventType.MouseDown && boardRect.Contains(e.mousePosition))
        {
            // 计算点击的网格坐标
            int gridX = Mathf.FloorToInt((e.mousePosition.x - boardRect.x - BOARD_OFFSET_X) / CELL_SIZE);
            int gridY = _levelData.Rows - 1 - Mathf.FloorToInt((e.mousePosition.y - boardRect.y - BOARD_OFFSET_Y) / CELL_SIZE);
            
            if (gridX >= 0 && gridX < _levelData.Columns && gridY >= 0 && gridY < _levelData.Rows)
            {
                if (e.button == 0) // 左键：放置块
                {
                    PlaceBlock(gridX, gridY);
                }
                else if (e.button == 1) // 右键：删除块
                {
                    RemoveBlock(gridX, gridY);
                }
                
                e.Use();
                Repaint();
            }
        }
    }
    
    /// <summary>
    /// 放置块
    /// </summary>
    private void PlaceBlock(int gridX, int gridY)
    {
        if (_levelData == null) return;
        
        // 道具块固定宽度为1
        int blockWidth = _isItemMode ? 1 : _selectedWidth;
        
        // 检查是否超出边界
        if (gridX + blockWidth > _levelData.Columns)
        {
            EditorUtility.DisplayDialog("错误", "块超出右边界！", "确定");
            return;
        }
        
        // 检查是否与现有块重叠
        for (int x = gridX; x < gridX + blockWidth; x++)
        {
            var existingBlock = _levelData.GetBlockAt(x, gridY);
            if (existingBlock != null)
            {
                // 移除重叠的块
                _levelData.RemoveBlock(x, gridY);
            }
        }
        
        // 添加新块（道具块强制宽度为1）
        _levelData.AddBlock(gridX, gridY, blockWidth, _selectedColor);
        EditorUtility.SetDirty(_levelData);
    }
    
    /// <summary>
    /// 删除块
    /// </summary>
    private void RemoveBlock(int gridX, int gridY)
    {
        if (_levelData == null) return;
        
        _levelData.RemoveBlock(gridX, gridY);
        EditorUtility.SetDirty(_levelData);
    }
    
    /// <summary>
    /// 创建新关卡
    /// </summary>
    private void CreateNewLevel()
    {
        string path = EditorUtility.SaveFilePanelInProject(
            "创建新关卡",
            "Level_1",
            "asset",
            "选择保存位置"
        );
        
        if (!string.IsNullOrEmpty(path))
        {
            _levelData = CreateInstance<JewelLevelData>();
            _levelData.LevelName = System.IO.Path.GetFileNameWithoutExtension(path);
            AssetDatabase.CreateAsset(_levelData, path);
            AssetDatabase.SaveAssets();
            EditorUtility.FocusProjectWindow();
            Selection.activeObject = _levelData;
        }
    }
    
    /// <summary>
    /// 保存关卡
    /// </summary>
    private void SaveLevel()
    {
        if (_levelData != null)
        {
            EditorUtility.SetDirty(_levelData);
            AssetDatabase.SaveAssets();
            EditorUtility.DisplayDialog("保存成功", "关卡已保存！", "确定");
        }
    }
    
    /// <summary>
    /// 加载关卡
    /// </summary>
    private void LoadLevel()
    {
        string path = EditorUtility.OpenFilePanel(
            "加载关卡",
            "Assets",
            "asset"
        );
        
        if (!string.IsNullOrEmpty(path))
        {
            path = "Assets" + path.Replace(Application.dataPath, "");
            _levelData = AssetDatabase.LoadAssetAtPath<JewelLevelData>(path);
            if (_levelData != null)
            {
                EditorUtility.FocusProjectWindow();
                Selection.activeObject = _levelData;
            }
        }
    }
}

