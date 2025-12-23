using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace UI
{
    /// <summary>
    /// 序列帧特效播放器
    /// 支持自动裁剪透明区域（AABB裁剪），并保存每帧相对于原中心的偏移，以保持掉落效果
    /// </summary>
    public class FrameSequenceEffectPlayer : MonoBehaviour
    {
        [Header("序列帧配置")]
        [Tooltip("序列帧目录路径（相对于Assets，例如：texiao/lanse）")]
        public string FrameSpritesDirectory = "";
        
        [Tooltip("序列帧图片数组（按播放顺序，可通过目录自动加载）")]
        public Sprite[] FrameSprites;
        
        [Tooltip("预处理裁剪数据（如果使用预处理裁剪，请设置此数据）")]
        public FrameSequenceCropData PreprocessedCropData;
        
        [Tooltip("裁剪后图片所在目录（如果使用预处理裁剪且FrameSprites为空，会从此目录加载）")]
        public string CroppedSpritesDirectory = "";
        
        [Tooltip("播放帧率（每秒播放帧数）")]
        public float FrameRate = 30f;
        
        [Tooltip("是否循环播放")]
        public bool Loop = false;
        
        [Tooltip("是否自动播放")]
        public bool AutoPlay = true;
        
        [Header("裁剪设置")]
        [Tooltip("是否自动裁剪透明区域")]
        public bool AutoCropTransparent = true;
        
        [Tooltip("裁剪边界的容差值（像素），用于扩展裁剪边界")]
        public int CropPadding = 0;
        
        [Tooltip("原始尺寸（用于计算偏移）")]
        public Vector2 OriginalSize = new Vector2(720f, 1280f);
        
        [Header("显示设置")]
        [Tooltip("Image组件（如果为空则自动获取）")]
        public Image TargetImage;
        
        [Tooltip("是否保持原始中心位置")]
        public bool KeepOriginalCenter = true;
        
        [Tooltip("对齐方式")]
        public Alignment AnchorAlignment = Alignment.Center;
        
        /// <summary>
        /// 对齐方式
        /// </summary>
        public enum Alignment
        {
            Center,     // 中心对齐
            Top,        // 顶部对齐
            Bottom,     // 底部对齐
            Left,       // 左对齐
            Right,      // 右对齐
            TopLeft,    // 左上
            TopRight,   // 右上
            BottomLeft, // 左下
            BottomRight // 右下
        }
        
        /// <summary>
        /// 帧数据结构
        /// </summary>
        [System.Serializable]
        public class FrameData
        {
            public Sprite Sprite;
            public Vector2 CroppedSize;          // 裁剪后的尺寸
            public Vector2 OffsetFromCenter;     // 相对于原始中心的偏移
            public Rect CropRect;                // 裁剪矩形（相对于原始图片）
        }
        
        // 帧数据列表
        private List<FrameData> _frameDataList = new List<FrameData>();
        
        // 播放状态
        private int _currentFrameIndex = 0;
        private float _frameTimer = 0f;
        private bool _isPlaying = false;
        private bool _isPaused = false;
        
        // 组件引用
        private RectTransform _rectTransform;
        private Vector2 _originalSize;
        private Vector2 _originalPosition;
        
        // 事件
        public System.Action OnPlayComplete; // 播放完成事件
        
        private void Awake()
        {
            // 获取组件
            if (TargetImage == null)
            {
                TargetImage = GetComponent<Image>();
            }
            
            if (TargetImage == null)
            {
                Debug.LogError("FrameSequenceEffectPlayer: 未找到Image组件！");
                return;
            }
            
            _rectTransform = GetComponent<RectTransform>();
            if (_rectTransform == null)
            {
                Debug.LogError("FrameSequenceEffectPlayer: 未找到RectTransform组件！");
                return;
            }
            
            // 保存原始尺寸和位置
            _originalSize = _rectTransform.sizeDelta;
            _originalPosition = _rectTransform.anchoredPosition;
            
            // 初始化帧数据
            InitializeFrameData();
        }
        
        private void Start()
        {
            if (AutoPlay)
            {
                Play();
            }
        }
        
        private void Update()
        {
            if (_isPlaying && !_isPaused)
            {
                UpdateAnimation();
            }
        }
        
        /// <summary>
        /// 初始化帧数据（裁剪透明区域并计算偏移）
        /// </summary>
        private void InitializeFrameData()
        {
            _frameDataList.Clear();
            
            // 优先使用预处理数据
            bool usePreprocessedData = PreprocessedCropData != null && PreprocessedCropData.FrameDataList != null && 
                                      PreprocessedCropData.FrameDataList.Count > 0;
            
            // 如果使用预处理数据，尝试自动加载序列帧
            if (usePreprocessedData)
            {
                Debug.Log($"FrameSequenceEffectPlayer: 使用预处理裁剪数据，共 {PreprocessedCropData.FrameCount} 帧");
                OriginalSize = PreprocessedCropData.OriginalSize; // 使用预处理数据中的原始尺寸
                
                // 如果FrameSprites为空，尝试从CropData加载
                if (FrameSprites == null || FrameSprites.Length == 0)
                {
                    LoadSpritesFromCropData();
                }
            }
            
            // 检查是否有序列帧
            if (FrameSprites == null || FrameSprites.Length == 0)
            {
                Debug.LogWarning("FrameSequenceEffectPlayer: 序列帧数组为空！请设置FrameSprites或通过目录加载。\n" +
                               "如果使用预处理数据，请确保裁剪后的图片已加载到FrameSprites数组中。");
                return;
            }
            
            for (int i = 0; i < FrameSprites.Length; i++)
            {
                var sprite = FrameSprites[i];
                if (sprite == null)
                {
                    Debug.LogWarning($"FrameSequenceEffectPlayer: 发现空的Sprite（索引 {i}），跳过");
                    continue;
                }
                
                FrameData frameData = new FrameData();
                frameData.Sprite = sprite;
                
                // 优先使用预处理数据
                if (usePreprocessedData)
                {
                    var cropInfo = PreprocessedCropData.GetFrameInfo(i);
                    if (cropInfo != null)
                    {
                        frameData.CroppedSize = cropInfo.CroppedSize;
                        frameData.OffsetFromCenter = cropInfo.OffsetFromCenter;
                        frameData.CropRect = cropInfo.CropRect;
                    }
                    else
                    {
                        // 预处理数据中找不到对应帧，使用原始尺寸
                        frameData.CroppedSize = new Vector2(sprite.rect.width, sprite.rect.height);
                        frameData.OffsetFromCenter = Vector2.zero;
                        frameData.CropRect = sprite.rect;
                    }
                }
                else if (AutoCropTransparent)
                {
                    // 运行时裁剪透明区域并计算偏移
                    CropAndCalculateOffset(frameData, i);
                }
                else
                {
                    // 不裁剪，使用原始尺寸
                    frameData.CroppedSize = new Vector2(sprite.rect.width, sprite.rect.height);
                    frameData.OffsetFromCenter = Vector2.zero;
                    frameData.CropRect = sprite.rect;
                }
                
                _frameDataList.Add(frameData);
            }
            
            Debug.Log($"FrameSequenceEffectPlayer: 初始化完成，共 {_frameDataList.Count} 帧" + 
                     (usePreprocessedData ? "（使用预处理数据）" : "") + 
                     $"，FrameSprites.Length = {FrameSprites.Length}");
        }
        
        /// <summary>
        /// 从CropData自动加载序列帧（运行时无法自动加载，需要手动设置）
        /// </summary>
        private void LoadSpritesFromCropData()
        {
            if (PreprocessedCropData == null || PreprocessedCropData.FrameDataList == null || 
                PreprocessedCropData.FrameDataList.Count == 0)
            {
                Debug.LogWarning("FrameSequenceEffectPlayer: CropData无效，无法自动加载序列帧");
                return;
            }
            
            // 在运行时无法使用AssetDatabase，所以只能提示用户
            Debug.LogWarning($"FrameSequenceEffectPlayer: 检测到CropData，但FrameSprites数组为空。\n" +
                           $"请手动加载裁剪后的序列帧到FrameSprites数组，或设置CroppedSpritesDirectory目录路径。\n" +
                           $"CropData包含 {PreprocessedCropData.FrameCount} 帧，第一帧文件名: {PreprocessedCropData.FrameDataList[0].CroppedFileName}");
            
            // TODO: 在编辑器模式下可以使用AssetDatabase自动加载
            #if UNITY_EDITOR
            if (!string.IsNullOrEmpty(CroppedSpritesDirectory) || !string.IsNullOrEmpty(FrameSpritesDirectory))
            {
                string directory = !string.IsNullOrEmpty(CroppedSpritesDirectory) ? CroppedSpritesDirectory : FrameSpritesDirectory;
                TryLoadSpritesFromDirectory(directory);
            }
            #endif
        }
        
        #if UNITY_EDITOR
        /// <summary>
        /// 从目录加载序列帧（仅在编辑器模式下可用）
        /// </summary>
        private void TryLoadSpritesFromDirectory(string directory)
        {
            if (string.IsNullOrEmpty(directory)) return;
            
            string directoryPath = $"Assets/{directory}";
            if (!System.IO.Directory.Exists(directoryPath))
            {
                Debug.LogWarning($"FrameSequenceEffectPlayer: 目录不存在: {directoryPath}");
                return;
            }
            
            // 使用Resources或AssetDatabase加载（仅编辑器）
            // 这里只是提示，实际加载应该在Editor脚本中完成
            Debug.Log($"FrameSequenceEffectPlayer: 提示：请在Editor中使用Editor脚本从目录加载序列帧: {directoryPath}");
        }
        #endif
        
        /// <summary>
        /// 裁剪透明区域并计算偏移
        /// </summary>
        private void CropAndCalculateOffset(FrameData frameData, int frameIndex)
        {
            Sprite sprite = frameData.Sprite;
            if (sprite == null || sprite.texture == null)
            {
                Debug.LogError("FrameSequenceEffectPlayer: Sprite或Texture为空，无法裁剪");
                return;
            }
            
            Texture2D texture = sprite.texture;
            Rect spriteRect = sprite.rect;
            
            // 初始化边界值
            int xMin = int.MaxValue;
            int xMax = int.MinValue;
            int yMin = int.MaxValue;
            int yMax = int.MinValue;
            
            bool foundPixel = false;
            
            // 尝试读取像素数据（需要纹理是可读的）
            try
            {
                // 读取sprite区域的像素
                int startX = Mathf.FloorToInt(spriteRect.xMin);
                int startY = Mathf.FloorToInt(spriteRect.yMin);
                int width = Mathf.CeilToInt(spriteRect.width);
                int height = Mathf.CeilToInt(spriteRect.height);
                
                // 确保在纹理范围内
                startX = Mathf.Clamp(startX, 0, texture.width - 1);
                startY = Mathf.Clamp(startY, 0, texture.height - 1);
                width = Mathf.Clamp(width, 1, texture.width - startX);
                height = Mathf.Clamp(height, 1, texture.height - startY);
                
                // 读取像素数据
                Color[] pixels = texture.GetPixels(startX, startY, width, height);
                
                // 扫描像素找到非透明区域的边界
                for (int y = 0; y < height; y++)
                {
                    for (int x = 0; x < width; x++)
                    {
                        int pixelIndex = y * width + x;
                        Color pixel = pixels[pixelIndex];
                        
                        // 检查像素是否不透明（alpha > 阈值）
                        if (pixel.a > 0.01f) // 使用小的阈值以处理抗锯齿边缘
                        {
                            foundPixel = true;
                            
                            int worldX = startX + x;
                            int worldY = startY + y;
                            
                            xMin = Mathf.Min(xMin, worldX);
                            xMax = Mathf.Max(xMax, worldX);
                            yMin = Mathf.Min(yMin, worldY);
                            yMax = Mathf.Max(yMax, worldY);
                        }
                    }
                }
            }
            catch (UnityException ex)
            {
                // 纹理不可读，使用sprite的bounds来估算
                Debug.LogWarning($"FrameSequenceEffectPlayer: 无法读取纹理像素数据，使用sprite bounds估算。错误: {ex.Message}");
                Debug.LogWarning("提示：请在纹理导入设置中启用 'Read/Write Enabled' 以支持运行时裁剪");
                
                // 使用sprite的bounds来估算
                Bounds bounds = sprite.bounds;
                Vector3 size = bounds.size;
                Vector3 center = bounds.center;
                
                // 将世界坐标转换为纹理坐标
                float pixelsPerUnit = sprite.pixelsPerUnit;
                float textureWidth = sprite.texture.width;
                float textureHeight = sprite.texture.height;
                
                // 估算非透明区域（假设在sprite中心附近）
                float estimatedWidth = size.x * pixelsPerUnit * 0.8f; // 假设80%是有内容的
                float estimatedHeight = size.y * pixelsPerUnit * 0.8f;
                
                xMin = Mathf.FloorToInt(spriteRect.center.x - estimatedWidth * 0.5f);
                xMax = Mathf.CeilToInt(spriteRect.center.x + estimatedWidth * 0.5f);
                yMin = Mathf.FloorToInt(spriteRect.center.y - estimatedHeight * 0.5f);
                yMax = Mathf.CeilToInt(spriteRect.center.y + estimatedHeight * 0.5f);
                
                foundPixel = true;
            }
            
            // 如果没找到有效像素，使用整个sprite区域
            if (!foundPixel)
            {
                xMin = Mathf.FloorToInt(spriteRect.xMin);
                xMax = Mathf.CeilToInt(spriteRect.xMax);
                yMin = Mathf.FloorToInt(spriteRect.yMin);
                yMax = Mathf.CeilToInt(spriteRect.yMax);
            }
            
            // 添加容差
            xMin = Mathf.Max(0, xMin - CropPadding);
            yMin = Mathf.Max(0, yMin - CropPadding);
            xMax = Mathf.Min(texture.width, xMax + CropPadding);
            yMax = Mathf.Min(texture.height, yMax + CropPadding);
            
            // 确保有效尺寸
            if (xMax <= xMin) xMax = xMin + 1;
            if (yMax <= yMin) yMax = yMin + 1;
            
            // 计算裁剪后的尺寸
            float croppedWidth = xMax - xMin;
            float croppedHeight = yMax - yMin;
            frameData.CroppedSize = new Vector2(croppedWidth, croppedHeight);
            
            // 计算裁剪矩形（相对于原始图片）
            frameData.CropRect = new Rect(xMin, yMin, croppedWidth, croppedHeight);
            
            // 计算裁剪区域的中心位置（在纹理/像素坐标系中）
            Vector2 cropCenter = new Vector2(
                xMin + croppedWidth * 0.5f,
                yMin + croppedHeight * 0.5f
            );
            
            // 假设sprite就是原始尺寸，或者sprite中心对齐原始中心
            // 计算原始中心位置（在sprite坐标系中，相对于sprite左上角）
            Vector2 originalCenterInSprite = new Vector2(
                spriteRect.width * 0.5f,
                spriteRect.height * 0.5f
            );
            
            // 计算偏移：裁剪中心相对于原始中心的偏移（像素单位）
            // 这里使用相对于sprite左上角的坐标
            Vector2 cropCenterFromTopLeft = new Vector2(
                xMin - spriteRect.xMin + croppedWidth * 0.5f,
                yMin - spriteRect.yMin + croppedHeight * 0.5f
            );
            
            Vector2 offsetInPixels = cropCenterFromTopLeft - originalCenterInSprite;
            
            // 如果sprite尺寸与原始尺寸不一致，需要缩放
            float scaleX = OriginalSize.x / spriteRect.width;
            float scaleY = OriginalSize.y / spriteRect.height;
            
            // 将偏移转换为相对于原始尺寸的偏移
            frameData.OffsetFromCenter = new Vector2(
                offsetInPixels.x * scaleX,
                offsetInPixels.y * scaleY
            );
            
            Debug.Log($"Frame {frameIndex}: Sprite尺寸=({spriteRect.width}, {spriteRect.height}), 裁剪尺寸={frameData.CroppedSize}, 裁剪中心偏移={offsetInPixels}, 最终偏移={frameData.OffsetFromCenter}");
        }
        
        /// <summary>
        /// 更新动画
        /// </summary>
        private void UpdateAnimation()
        {
            if (_frameDataList.Count == 0) return;
            
            _frameTimer += Time.deltaTime;
            float frameDuration = 1f / FrameRate;
            
            if (_frameTimer >= frameDuration)
            {
                _frameTimer -= frameDuration;
                _currentFrameIndex++;
                
                if (_currentFrameIndex >= _frameDataList.Count)
                {
                    if (Loop)
                    {
                        _currentFrameIndex = 0;
                    }
                    else
                    {
                        _currentFrameIndex = _frameDataList.Count - 1;
                        _isPlaying = false;
                        if (OnPlayComplete != null)
                        {
                            try
                            {
                                OnPlayComplete();
                            }
                            catch (System.Exception ex)
                            {
                                Debug.LogWarning($"FrameSequenceEffectPlayer: 播放完成回调执行出错: {ex.Message}");
                            }
                        }
                        return;
                    }
                }
                
                UpdateFrame();
            }
        }
        
        /// <summary>
        /// 更新当前帧显示
        /// </summary>
        private void UpdateFrame()
        {
            if (_currentFrameIndex < 0 || _currentFrameIndex >= _frameDataList.Count)
            {
                Debug.LogWarning($"FrameSequenceEffectPlayer: 帧索引超出范围: {_currentFrameIndex}/{_frameDataList.Count}");
                return;
            }
            
            if (TargetImage == null)
            {
                Debug.LogError("FrameSequenceEffectPlayer: TargetImage为空，无法更新帧");
                return;
            }
            
            FrameData frameData = _frameDataList[_currentFrameIndex];
            
            if (frameData.Sprite == null)
            {
                Debug.LogWarning($"FrameSequenceEffectPlayer: 帧 {_currentFrameIndex} 的Sprite为空");
                return;
            }
            
            // 更新Sprite
            TargetImage.sprite = frameData.Sprite;
            
            // 更新尺寸和位置
            // 如果有裁剪数据（预处理或运行时裁剪），使用裁剪后的尺寸
            bool hasCropData = PreprocessedCropData != null || (AutoCropTransparent && frameData.CroppedSize != Vector2.zero);
            
            if (hasCropData)
            {
                // 设置裁剪后的尺寸
                _rectTransform.sizeDelta = frameData.CroppedSize;
                
                // 根据对齐方式调整位置
                if (KeepOriginalCenter)
                {
                    // 保持原始中心位置，根据偏移调整
                    _rectTransform.anchoredPosition = _originalPosition + frameData.OffsetFromCenter;
                }
                else
                {
                    // 根据对齐方式设置位置
                    SetPositionByAlignment(frameData);
                }
            }
            else
            {
                // 不裁剪，使用原始尺寸
                _rectTransform.sizeDelta = _originalSize;
                _rectTransform.anchoredPosition = _originalPosition;
            }
            
            // 确保Image可见
            if (TargetImage != null)
            {
                TargetImage.enabled = true;
            }
        }
        
        /// <summary>
        /// 根据对齐方式设置位置
        /// </summary>
        private void SetPositionByAlignment(FrameData frameData)
        {
            Vector2 newPosition = _originalPosition;
            
            switch (AnchorAlignment)
            {
                case Alignment.Center:
                    newPosition = _originalPosition + frameData.OffsetFromCenter;
                    break;
                case Alignment.Top:
                    newPosition = new Vector2(
                        _originalPosition.x + frameData.OffsetFromCenter.x,
                        _originalPosition.y
                    );
                    break;
                case Alignment.Bottom:
                    newPosition = new Vector2(
                        _originalPosition.x + frameData.OffsetFromCenter.x,
                        _originalPosition.y - (OriginalSize.y - frameData.CroppedSize.y)
                    );
                    break;
                case Alignment.Left:
                    newPosition = new Vector2(
                        _originalPosition.x,
                        _originalPosition.y + frameData.OffsetFromCenter.y
                    );
                    break;
                case Alignment.Right:
                    newPosition = new Vector2(
                        _originalPosition.x + (OriginalSize.x - frameData.CroppedSize.x),
                        _originalPosition.y + frameData.OffsetFromCenter.y
                    );
                    break;
                // 可以继续添加其他对齐方式
            }
            
            _rectTransform.anchoredPosition = newPosition;
        }
        
        /// <summary>
        /// 播放动画
        /// </summary>
        public void Play()
        {
            // 如果没有初始化，尝试重新初始化
            if (_frameDataList.Count == 0)
            {
                Debug.LogWarning("FrameSequenceEffectPlayer: 没有可播放的帧数据，尝试重新初始化...");
                InitializeFrameData();
                
                if (_frameDataList.Count == 0)
                {
                    Debug.LogError("FrameSequenceEffectPlayer: 初始化失败！请检查：\n" +
                                 "1. FrameSprites数组是否为空\n" +
                                 "2. 序列帧图片是否已正确加载\n" +
                                 "3. Image组件是否存在");
                    return;
                }
            }
            
            _isPlaying = true;
            _isPaused = false;
            _currentFrameIndex = 0;
            _frameTimer = 0f;
            
            Debug.Log($"FrameSequenceEffectPlayer: 开始播放，共 {_frameDataList.Count} 帧，帧率 {FrameRate}fps");
            UpdateFrame();
        }
        
        /// <summary>
        /// 暂停播放
        /// </summary>
        public void Pause()
        {
            _isPaused = true;
        }
        
        /// <summary>
        /// 继续播放
        /// </summary>
        public void Resume()
        {
            _isPaused = false;
        }
        
        /// <summary>
        /// 停止播放
        /// </summary>
        public void Stop()
        {
            _isPlaying = false;
            _isPaused = false;
            _currentFrameIndex = 0;
            _frameTimer = 0f;
        }
        
        /// <summary>
        /// 设置播放位置（UI坐标）
        /// </summary>
        public void SetPosition(Vector2 position)
        {
            if (_rectTransform != null)
            {
                _originalPosition = position;
                
                // 如果正在播放，更新当前帧位置
                if (_isPlaying && _currentFrameIndex < _frameDataList.Count)
                {
                    UpdateFrame();
                }
            }
        }
        
        /// <summary>
        /// 设置播放位置（Vector3版本，自动转换为Vector2）
        /// </summary>
        public void SetPosition(Vector3 position)
        {
            SetPosition(new Vector2(position.x, position.y));
        }
        
        /// <summary>
        /// 设置当前帧索引
        /// </summary>
        public void SetFrame(int frameIndex)
        {
            if (frameIndex >= 0 && frameIndex < _frameDataList.Count)
            {
                _currentFrameIndex = frameIndex;
                _frameTimer = 0f;
                UpdateFrame();
            }
        }
        
        /// <summary>
        /// 获取当前帧索引
        /// </summary>
        public int GetCurrentFrameIndex()
        {
            return _currentFrameIndex;
        }
        
        /// <summary>
        /// 获取总帧数
        /// </summary>
        public int GetTotalFrames()
        {
            return _frameDataList.Count;
        }
        
        /// <summary>
        /// 检查是否正在播放
        /// </summary>
        public bool IsPlaying()
        {
            return _isPlaying && !_isPaused;
        }
        
        /// <summary>
        /// 重新计算裁剪数据（用于运行时调整设置后重新计算）
        /// </summary>
        public void RecalculateCropData()
        {
            InitializeFrameData();
            
            // 如果正在播放，更新当前帧
            if (_isPlaying)
            {
                UpdateFrame();
            }
        }
    }
}

