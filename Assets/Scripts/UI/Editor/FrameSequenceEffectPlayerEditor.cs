#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.IO;
using System.Linq;

namespace UI
{
    [UnityEditor.CustomEditor(typeof(FrameSequenceEffectPlayer))]
    public class FrameSequenceEffectPlayerEditor : UnityEditor.Editor
    {
        public override void OnInspectorGUI()
        {
            DrawDefaultInspector();
            
            FrameSequenceEffectPlayer player = (FrameSequenceEffectPlayer)target;
            
            EditorGUILayout.Space();
            EditorGUILayout.LabelField("从目录加载序列帧", EditorStyles.boldLabel);
            
            EditorGUILayout.BeginHorizontal();
            player.FrameSpritesDirectory = EditorGUILayout.TextField("目录路径", player.FrameSpritesDirectory);
            
            if (GUILayout.Button("加载", GUILayout.Width(60)))
            {
                LoadFramesFromDirectory(player);
            }
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("选择目录", GUILayout.Width(80)))
            {
                string selectedPath = EditorUtility.OpenFolderPanel("选择序列帧目录", "Assets", "");
                if (!string.IsNullOrEmpty(selectedPath))
                {
                    // 转换为相对于Assets的路径
                    string assetsPath = Application.dataPath;
                    if (selectedPath.StartsWith(assetsPath))
                    {
                        player.FrameSpritesDirectory = selectedPath.Substring(assetsPath.Length + 1).Replace("\\", "/");
                    }
                    else
                    {
                        EditorUtility.DisplayDialog("错误", "请选择Assets文件夹内的目录", "确定");
                    }
                }
            }
            
            if (GUILayout.Button("清除", GUILayout.Width(60)))
            {
                player.FrameSpritesDirectory = "";
            }
            EditorGUILayout.EndHorizontal();
            
            if (!string.IsNullOrEmpty(player.FrameSpritesDirectory))
            {
                string fullPath = $"Assets/{player.FrameSpritesDirectory}";
                EditorGUILayout.HelpBox(
                    $"目录路径: {fullPath}\n" +
                    $"将自动加载该目录下的所有图片文件（.png, .jpg等）并按文件名排序\n" +
                    $"示例: texiao/lanse",
                    MessageType.Info
                );
            }
            else
            {
                EditorGUILayout.HelpBox(
                    "输入目录路径（相对于Assets），例如: texiao/lanse\n" +
                    "或者点击\"选择目录\"按钮浏览选择",
                    MessageType.None
                );
            }
            
            if (player.FrameSprites != null && player.FrameSprites.Length > 0)
            {
                EditorGUILayout.HelpBox(
                    $"当前已加载 {player.FrameSprites.Length} 个序列帧",
                    MessageType.Info
                );
            }
            
            // 如果设置了CropData但没有加载序列帧，提供自动加载功能
            if (player.PreprocessedCropData != null && (player.FrameSprites == null || player.FrameSprites.Length == 0))
            {
                EditorGUILayout.Space();
                EditorGUILayout.HelpBox(
                    "⚠️ 检测到已设置预处理裁剪数据(CropData)，但序列帧数组为空！\n" +
                    "请加载裁剪后的序列帧图片。",
                    MessageType.Warning
                );
                
                EditorGUILayout.BeginHorizontal();
                if (GUILayout.Button("从CropData自动加载序列帧", GUILayout.Height(30)))
                {
                    LoadFramesFromCropData(player);
                }
                EditorGUILayout.EndHorizontal();
            }
        }
        
        private void LoadFramesFromDirectory(FrameSequenceEffectPlayer player)
        {
            if (string.IsNullOrEmpty(player.FrameSpritesDirectory))
            {
                EditorUtility.DisplayDialog("错误", "请输入目录路径", "确定");
                return;
            }
            
            // 构建完整路径
            string directoryPath = $"Assets/{player.FrameSpritesDirectory}";
            
            // 检查目录是否存在
            if (!Directory.Exists(directoryPath))
            {
                EditorUtility.DisplayDialog("错误", $"目录不存在: {directoryPath}", "确定");
                return;
            }
            
            // 获取所有图片文件
            string[] imageExtensions = { "*.png", "*.jpg", "*.jpeg" };
            var imageFiles = new System.Collections.Generic.List<string>();
            
            foreach (string extension in imageExtensions)
            {
                imageFiles.AddRange(Directory.GetFiles(directoryPath, extension, SearchOption.TopDirectoryOnly));
            }
            
            if (imageFiles.Count == 0)
            {
                EditorUtility.DisplayDialog("警告", $"目录中没有找到图片文件: {directoryPath}", "确定");
                return;
            }
            
            // 按文件名排序（智能排序，支持数字部分）
            imageFiles.Sort((a, b) =>
            {
                string nameA = Path.GetFileNameWithoutExtension(a);
                string nameB = Path.GetFileNameWithoutExtension(b);
                return CompareFileNames(nameA, nameB);
            });
            
            // 加载Sprite
            var sprites = new System.Collections.Generic.List<Sprite>();
            foreach (string filePath in imageFiles)
            {
                string assetPath = filePath.Replace("\\", "/");
                Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
                
                if (sprite != null)
                {
                    sprites.Add(sprite);
                }
                else
                {
                    Debug.LogWarning($"无法加载Sprite: {assetPath}。请确保图片已导入为Sprite格式。");
                }
            }
            
            if (sprites.Count == 0)
            {
                EditorUtility.DisplayDialog("错误", "没有成功加载任何Sprite。请确保图片已导入为Sprite格式。", "确定");
                return;
            }
            
            // 赋值
            player.FrameSprites = sprites.ToArray();
            
            // 标记为已修改
            EditorUtility.SetDirty(player);
            
            Debug.Log($"成功从目录加载 {sprites.Count} 个序列帧: {directoryPath}");
        }
        
        /// <summary>
        /// 从CropData自动加载序列帧
        /// </summary>
        private void LoadFramesFromCropData(FrameSequenceEffectPlayer player)
        {
            if (player.PreprocessedCropData == null)
            {
                EditorUtility.DisplayDialog("错误", "未设置预处理裁剪数据", "确定");
                return;
            }
            
            // 获取CropData的资源路径
            string cropDataPath = AssetDatabase.GetAssetPath(player.PreprocessedCropData);
            if (string.IsNullOrEmpty(cropDataPath))
            {
                EditorUtility.DisplayDialog("错误", "无法获取CropData的资源路径", "确定");
                return;
            }
            
            // CropData所在的目录
            string cropDataDirectory = Path.GetDirectoryName(cropDataPath).Replace("\\", "/");
            
            // 尝试从CropData所在目录加载
            if (!Directory.Exists(cropDataDirectory))
            {
                EditorUtility.DisplayDialog("错误", $"CropData所在目录不存在: {cropDataDirectory}", "确定");
                return;
            }
            
            // 获取所有图片文件
            string[] imageExtensions = { "*.png", "*.jpg", "*.jpeg" };
            var imageFiles = new System.Collections.Generic.List<string>();
            
            foreach (string extension in imageExtensions)
            {
                imageFiles.AddRange(Directory.GetFiles(cropDataDirectory, extension, SearchOption.TopDirectoryOnly));
            }
            
            if (imageFiles.Count == 0)
            {
                EditorUtility.DisplayDialog("错误", $"在CropData目录中未找到图片文件: {cropDataDirectory}\n\n请手动加载裁剪后的序列帧。", "确定");
                return;
            }
            
            // 根据CropData中的文件名筛选和排序
            var cropFileNames = player.PreprocessedCropData.FrameDataList.Select(f => f.CroppedFileName).ToList();
            var matchedFiles = new System.Collections.Generic.List<string>();
            
            foreach (var cropFileName in cropFileNames)
            {
                string fullPath = imageFiles.FirstOrDefault(f => Path.GetFileName(f).Equals(cropFileName, System.StringComparison.OrdinalIgnoreCase));
                if (!string.IsNullOrEmpty(fullPath))
                {
                    matchedFiles.Add(fullPath);
                }
            }
            
            if (matchedFiles.Count == 0)
            {
                EditorUtility.DisplayDialog("警告", 
                    $"在目录中未找到CropData中指定的裁剪后文件。\n" +
                    $"目录: {cropDataDirectory}\n" +
                    $"请确保裁剪后的图片文件在该目录中。", 
                    "确定");
                return;
            }
            
            // 按CropData中的顺序加载
            var sprites = new System.Collections.Generic.List<Sprite>();
            foreach (var cropInfo in player.PreprocessedCropData.FrameDataList.OrderBy(f => f.FrameIndex))
            {
                string filePath = matchedFiles.FirstOrDefault(f => Path.GetFileName(f).Equals(cropInfo.CroppedFileName, System.StringComparison.OrdinalIgnoreCase));
                if (!string.IsNullOrEmpty(filePath))
                {
                    string assetPath = filePath.Replace("\\", "/");
                    Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(assetPath);
                    if (sprite != null)
                    {
                        sprites.Add(sprite);
                    }
                }
            }
            
            if (sprites.Count == 0)
            {
                EditorUtility.DisplayDialog("错误", "无法加载任何Sprite。请确保图片已导入为Sprite格式。", "确定");
                return;
            }
            
            // 赋值
            player.FrameSprites = sprites.ToArray();
            EditorUtility.SetDirty(player);
            
            Debug.Log($"成功从CropData目录加载 {sprites.Count} 个序列帧: {cropDataDirectory}");
            EditorUtility.DisplayDialog("成功", $"已加载 {sprites.Count} 个序列帧！", "确定");
        }
        
        /// <summary>
        /// 智能比较文件名（支持数字部分的自然排序）
        /// 例如：蓝色_00001.png 会在 蓝色_00002.png 之前
        /// </summary>
        private int CompareFileNames(string nameA, string nameB)
        {
            // 简单的字符串比较
            return string.Compare(nameA, nameB, System.StringComparison.OrdinalIgnoreCase);
        }
    }
}
#endif

