#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections.Generic;

namespace UI
{
    /// <summary>
    /// 序列帧预处理裁剪工具 - 在打包前裁剪序列帧，减少打包大小
    /// </summary>
    public class FrameSequenceCropTool : EditorWindow
    {
        private string sourceDirectory = "texiao/lanse";
        private string outputDirectory = "texiao/lanse_cropped";
        private Vector2 originalSize = new Vector2(720f, 1280f);
        private int cropPadding = 0;
        
        [MenuItem("Tools/序列帧预处理裁剪工具")]
        public static void ShowWindow()
        {
            GetWindow<FrameSequenceCropTool>("序列帧裁剪工具");
        }
        
        private void OnGUI()
        {
            GUILayout.Label("序列帧预处理裁剪工具", EditorStyles.boldLabel);
            EditorGUILayout.Space();
            
            EditorGUILayout.HelpBox(
                "此工具可以预处理序列帧，裁剪透明区域，生成新的小图片和偏移数据。\n" +
                "使用裁剪后的图片可以减少打包后的大小！",
                MessageType.Info
            );
            
            EditorGUILayout.Space();
            
            // 源目录
            EditorGUILayout.LabelField("源目录设置", EditorStyles.boldLabel);
            EditorGUILayout.BeginHorizontal();
            sourceDirectory = EditorGUILayout.TextField("源目录路径", sourceDirectory);
            if (GUILayout.Button("选择", GUILayout.Width(60)))
            {
                string path = EditorUtility.OpenFolderPanel("选择源目录", "Assets", "");
                if (!string.IsNullOrEmpty(path))
                {
                    string assetsPath = Application.dataPath;
                    if (path.StartsWith(assetsPath))
                    {
                        sourceDirectory = path.Substring(assetsPath.Length + 1).Replace("\\", "/");
                    }
                }
            }
            EditorGUILayout.EndHorizontal();
            
            // 输出目录
            EditorGUILayout.LabelField("输出目录设置", EditorStyles.boldLabel);
            EditorGUILayout.BeginHorizontal();
            outputDirectory = EditorGUILayout.TextField("输出目录路径", outputDirectory);
            if (GUILayout.Button("选择", GUILayout.Width(60)))
            {
                string path = EditorUtility.OpenFolderPanel("选择输出目录", "Assets", "");
                if (!string.IsNullOrEmpty(path))
                {
                    string assetsPath = Application.dataPath;
                    if (path.StartsWith(assetsPath))
                    {
                        outputDirectory = path.Substring(assetsPath.Length + 1).Replace("\\", "/");
                    }
                }
            }
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.Space();
            
            // 原始尺寸
            originalSize = EditorGUILayout.Vector2Field("原始尺寸", originalSize);
            cropPadding = EditorGUILayout.IntField("裁剪容差", cropPadding);
            
            EditorGUILayout.Space();
            
            // 执行按钮
            EditorGUI.BeginDisabledGroup(string.IsNullOrEmpty(sourceDirectory) || string.IsNullOrEmpty(outputDirectory));
            if (GUILayout.Button("开始裁剪处理", GUILayout.Height(30)))
            {
                ProcessFrames();
            }
            EditorGUI.EndDisabledGroup();
            
            EditorGUILayout.Space();
            EditorGUILayout.HelpBox(
                "处理流程：\n" +
                "1. 读取源目录中的所有图片\n" +
                "2. 裁剪每张图片的透明区域\n" +
                "3. 生成裁剪后的新图片（体积更小）\n" +
                "4. 保存偏移数据到ScriptableObject\n\n" +
                "使用裁剪后的图片可以大大减少打包大小！",
                MessageType.Info
            );
        }
        
        private void ProcessFrames()
        {
            string sourcePath = $"Assets/{sourceDirectory}";
            string outputPath = $"Assets/{outputDirectory}";
            
            if (!Directory.Exists(sourcePath))
            {
                EditorUtility.DisplayDialog("错误", $"源目录不存在: {sourcePath}", "确定");
                return;
            }
            
            // 创建输出目录
            if (!Directory.Exists(outputPath))
            {
                Directory.CreateDirectory(outputPath);
            }
            
            // 获取所有图片文件
            string[] imageExtensions = { "*.png", "*.jpg", "*.jpeg" };
            var imageFiles = new List<string>();
            
            foreach (string extension in imageExtensions)
            {
                imageFiles.AddRange(Directory.GetFiles(sourcePath, extension, SearchOption.TopDirectoryOnly));
            }
            
            if (imageFiles.Count == 0)
            {
                EditorUtility.DisplayDialog("错误", $"源目录中没有找到图片文件: {sourcePath}", "确定");
                return;
            }
            
            // 按文件名排序
            imageFiles.Sort();
            
            // 创建裁剪数据对象
            var cropData = ScriptableObject.CreateInstance<FrameSequenceCropData>();
            cropData.OriginalSize = originalSize;
            cropData.FrameCount = imageFiles.Count;
            cropData.FrameDataList = new List<FrameSequenceCropData.FrameCropInfo>();
            
            int processedCount = 0;
            
            try
            {
                EditorUtility.DisplayProgressBar("处理中", "正在裁剪序列帧...", 0f);
                
                for (int i = 0; i < imageFiles.Count; i++)
                {
                    string imageFile = imageFiles[i];
                    float progress = (float)i / imageFiles.Count;
                    EditorUtility.DisplayProgressBar("处理中", $"正在处理: {Path.GetFileName(imageFile)}", progress);
                    
                    string assetPath = imageFile.Replace("\\", "/");
                    ProcessSingleFrame(assetPath, outputPath, i, cropData);
                    processedCount++;
                }
                
                // 保存裁剪数据
                string dataPath = $"{outputPath}/CropData.asset";
                AssetDatabase.CreateAsset(cropData, dataPath);
                AssetDatabase.SaveAssets();
                
                EditorUtility.DisplayDialog("完成", 
                    $"成功处理 {processedCount} 个序列帧！\n" +
                    $"输出目录: {outputPath}\n" +
                    $"裁剪数据: {dataPath}\n\n" +
                    $"现在可以使用裁剪后的图片，体积更小！", 
                    "确定");
            }
            catch (System.Exception e)
            {
                EditorUtility.DisplayDialog("错误", $"处理过程中出现错误:\n{e.Message}", "确定");
                Debug.LogError(e);
            }
            finally
            {
                EditorUtility.ClearProgressBar();
                AssetDatabase.Refresh();
            }
        }
        
        private void ProcessSingleFrame(string assetPath, string outputPath, int frameIndex, FrameSequenceCropData cropData)
        {
            // 加载原始纹理（作为TextureImporter处理）
            TextureImporter importer = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (importer == null)
            {
                Debug.LogWarning($"无法获取TextureImporter: {assetPath}");
                return;
            }
            
            // 临时设置为可读
            bool wasReadable = importer.isReadable;
            if (!wasReadable)
            {
                importer.isReadable = true;
                AssetDatabase.ImportAsset(assetPath);
            }
            
            // 读取原始纹理
            Texture2D originalTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(assetPath);
            if (originalTexture == null)
            {
                Debug.LogWarning($"无法加载纹理: {assetPath}");
                return;
            }
            
            // 直接读取像素数据（如果纹理可读）
            Color[] pixels;
            int width = originalTexture.width;
            int height = originalTexture.height;
            
            try
            {
                pixels = originalTexture.GetPixels();
            }
            catch (System.Exception e)
            {
                Debug.LogError($"无法读取纹理像素: {assetPath}, 错误: {e.Message}");
                if (!wasReadable)
                {
                    importer.isReadable = false;
                    AssetDatabase.ImportAsset(assetPath);
                }
                return;
            }
            
            // 恢复原始设置
            if (!wasReadable)
            {
                importer.isReadable = false;
                AssetDatabase.ImportAsset(assetPath);
            }
            
            // 找到非透明区域的边界
            int xMin = width;
            int xMax = 0;
            int yMin = height;
            int yMax = 0;
            bool foundPixel = false;
            
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int index = y * width + x;
                    if (pixels[index].a > 0.01f)
                    {
                        foundPixel = true;
                        xMin = Mathf.Min(xMin, x);
                        xMax = Mathf.Max(xMax, x);
                        yMin = Mathf.Min(yMin, y);
                        yMax = Mathf.Max(yMax, y);
                    }
                }
            }
            
            if (!foundPixel)
            {
                Debug.LogWarning($"帧 {frameIndex} 没有找到有效像素: {assetPath}");
                return;
            }
            
            // 添加容差
            xMin = Mathf.Max(0, xMin - cropPadding);
            yMin = Mathf.Max(0, yMin - cropPadding);
            xMax = Mathf.Min(width - 1, xMax + cropPadding);
            yMax = Mathf.Min(height - 1, yMax + cropPadding);
            
            // 计算裁剪区域
            int croppedWidth = xMax - xMin + 1;
            int croppedHeight = yMax - yMin + 1;
            
            // 创建裁剪后的纹理
            Texture2D croppedTexture = new Texture2D(croppedWidth, croppedHeight, TextureFormat.RGBA32, false);
            
            // 使用GetPixels直接获取裁剪区域的像素（更可靠）
            Color[] croppedPixels = originalTexture.GetPixels(xMin, yMin, croppedWidth, croppedHeight);
            croppedTexture.SetPixels(croppedPixels);
            croppedTexture.Apply();
            
            // 保存裁剪后的图片
            string fileName = Path.GetFileNameWithoutExtension(assetPath);
            string outputFilePath = $"{outputPath}/{fileName}_cropped.png";
            string fullOutputPath = outputFilePath;
            
            byte[] pngData = croppedTexture.EncodeToPNG();
            File.WriteAllBytes(fullOutputPath, pngData);
            
            // 清理临时纹理
            DestroyImmediate(croppedTexture);
            
            // 计算偏移（相对于原始中心）
            Vector2 originalCenter = new Vector2(originalSize.x * 0.5f, originalSize.y * 0.5f);
            Vector2 cropCenter = new Vector2(xMin + croppedWidth * 0.5f, yMin + croppedHeight * 0.5f);
            Vector2 offsetFromCenter = cropCenter - originalCenter;
            
            // 保存裁剪信息
            var frameInfo = new FrameSequenceCropData.FrameCropInfo
            {
                FrameIndex = frameIndex,
                OriginalFileName = Path.GetFileName(assetPath),
                CroppedFileName = $"{fileName}_cropped.png",
                CroppedSize = new Vector2(croppedWidth, croppedHeight),
                OffsetFromCenter = offsetFromCenter,
                CropRect = new Rect(xMin, yMin, croppedWidth, croppedHeight)
            };
            
            cropData.FrameDataList.Add(frameInfo);
        }
    }
}
#endif
