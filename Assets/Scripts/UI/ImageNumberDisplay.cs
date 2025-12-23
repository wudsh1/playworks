using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace UI
{
    /// <summary>
    /// 图片数字显示控件，支持多位数显示
    /// </summary>
    public class ImageNumberDisplay : MonoBehaviour
    {
        [Header("数字图片配置")]
        [Tooltip("数字0-9的图片数组，索引对应数字值")]
        [SerializeField]
        private Sprite[] _digitSprites = new Sprite[10];

        [Header("显示设置")]
        [Tooltip("当前显示的数字值")]
        [SerializeField]
        private int _number = 0;

        [Tooltip("数字之间的间距")]
        [SerializeField]
        private float _spacing = 10f;

        [Tooltip("对齐方式：Left=左对齐，Right=右对齐，Center=居中")]
        [SerializeField]
        private Alignment _alignment = Alignment.Left;

        [Tooltip("是否显示前导零")]
        [SerializeField]
        private bool _showLeadingZeros = false;

        [Tooltip("最小显示位数（用于前导零）")]
        [SerializeField]
        private int _minDigits = 1;

        [Header("数字图片尺寸")]
        [Tooltip("每个数字图片的宽度（如果为0则使用图片原始宽度）")]
        [SerializeField]
        private float _digitWidth = 0f;

        [Tooltip("每个数字图片的高度（如果为0则使用图片原始高度）")]
        [SerializeField]
        private float _digitHeight = 0f;

        [Header("颜色设置")]
        [Tooltip("数字图片的颜色")]
        [SerializeField]
        private Color _digitColor = Color.white;

        // 数字Image对象列表
        private List<Image> _digitImages = new List<Image>();

        // 数字Image对象池（用于复用）
        private Queue<Image> _imagePool = new Queue<Image>();

        /// <summary>
        /// 对齐方式枚举
        /// </summary>
        public enum Alignment
        {
            Left,   // 左对齐
            Right,  // 右对齐
            Center  // 居中
        }

        /// <summary>
        /// 当前显示的数字值
        /// </summary>
        public int Number
        {
            get { return _number; }
            set
            {
                if (_number != value)
                {
                    _number = value;
                    UpdateDisplay();
                }
            }
        }

        /// <summary>
        /// 数字之间的间距
        /// </summary>
        public float Spacing
        {
            get { return _spacing; }
            set
            {
                if (_spacing != value)
                {
                    _spacing = value;
                    UpdateDisplay();
                }
            }
        }

        /// <summary>
        /// 对齐方式
        /// </summary>
        public Alignment AlignmentType
        {
            get { return _alignment; }
            set
            {
                if (_alignment != value)
                {
                    _alignment = value;
                    UpdateDisplay();
                }
            }
        }

        private void Awake()
        {
            // 初始化时更新显示
            UpdateDisplay();
        }

        private void OnValidate()
        {
            // 在编辑器中修改属性时更新显示
            if (Application.isPlaying)
            {
                UpdateDisplay();
            }
        }

        /// <summary>
        /// 设置数字图片数组
        /// </summary>
        /// <param name="sprites">数字0-9的图片数组</param>
        public void SetDigitSprites(Sprite[] sprites)
        {
            if (sprites == null || sprites.Length < 10)
            {
                Debug.LogError("数字图片数组必须包含10个元素（0-9）");
                return;
            }

            _digitSprites = sprites;
            UpdateDisplay();
        }

        /// <summary>
        /// 更新显示
        /// </summary>
        private void UpdateDisplay()
        {
            if (_digitSprites == null || _digitSprites.Length < 10)
            {
                Debug.LogWarning("数字图片数组未正确设置");
                return;
            }

            // 将数字转换为字符串
            string numberString = _number.ToString();
            
            // 处理前导零
            if (_showLeadingZeros && numberString.Length < _minDigits)
            {
                numberString = _number.ToString().PadLeft(_minDigits, '0');
            }

            // 确保有足够的Image对象
            int digitCount = numberString.Length;
            while (_digitImages.Count < digitCount)
            {
                Image digitImage = GetImageFromPool();
                if (digitImage == null)
                {
                    // 创建新的Image对象
                    GameObject digitObj = new GameObject($"Digit_{_digitImages.Count}");
                    digitObj.transform.SetParent(transform, false);
                    digitImage = digitObj.AddComponent<Image>();
                    digitImage.color = _digitColor;
                    // 保持图片原始比例
                    digitImage.preserveAspect = true;
                }
                _digitImages.Add(digitImage);
            }

            // 隐藏多余的Image对象
            for (int i = digitCount; i < _digitImages.Count; i++)
            {
                _digitImages[i].gameObject.SetActive(false);
                ReturnImageToPool(_digitImages[i]);
            }

            // 移除多余的Image对象
            if (_digitImages.Count > digitCount)
            {
                _digitImages.RemoveRange(digitCount, _digitImages.Count - digitCount);
            }

            // 计算总宽度（考虑保持比例）
            float totalWidth = 0f;
            Sprite firstSprite = _digitSprites[0];
            float originalWidth = firstSprite != null ? firstSprite.rect.width : 50f;
            float originalHeight = firstSprite != null ? firstSprite.rect.height : 50f;
            float aspectRatio = originalWidth / originalHeight;

            float digitW = 0f;
            float digitH = 0f;

            // 根据用户设置的宽度和高度计算实际尺寸（保持比例）
            if (_digitWidth > 0 && _digitHeight > 0)
            {
                // 如果同时设置了宽度和高度，使用较小的值来保持比例
                float widthBasedHeight = _digitWidth / aspectRatio;
                float heightBasedWidth = _digitHeight * aspectRatio;
                
                if (widthBasedHeight <= _digitHeight)
                {
                    // 以宽度为准
                    digitW = _digitWidth;
                    digitH = widthBasedHeight;
                }
                else
                {
                    // 以高度为准
                    digitW = heightBasedWidth;
                    digitH = _digitHeight;
                }
            }
            else if (_digitWidth > 0)
            {
                // 只设置了宽度，根据比例计算高度
                digitW = _digitWidth;
                digitH = _digitWidth / aspectRatio;
            }
            else if (_digitHeight > 0)
            {
                // 只设置了高度，根据比例计算宽度
                digitH = _digitHeight;
                digitW = _digitHeight * aspectRatio;
            }
            else
            {
                // 使用原始尺寸
                digitW = originalWidth;
                digitH = originalHeight;
            }

            if (digitCount > 0)
            {
                totalWidth = digitW * digitCount + _spacing * (digitCount - 1);
            }

            // 设置每个数字的位置和图片
            RectTransform rectTransform = GetComponent<RectTransform>();
            float startX = 0f;

            // 根据对齐方式计算起始X位置
            switch (_alignment)
            {
                case Alignment.Left:
                    startX = -rectTransform.rect.width / 2 + digitW / 2;
                    break;
                case Alignment.Right:
                    startX = rectTransform.rect.width / 2 - totalWidth + digitW / 2;
                    break;
                case Alignment.Center:
                    startX = -totalWidth / 2 + digitW / 2;
                    break;
            }

            for (int i = 0; i < digitCount; i++)
            {
                Image digitImage = _digitImages[i];
                digitImage.gameObject.SetActive(true);
                
                // 确保保持比例
                digitImage.preserveAspect = true;
                
                // 设置图片
                int digitValue = int.Parse(numberString[i].ToString());
                if (digitValue >= 0 && digitValue < _digitSprites.Length && _digitSprites[digitValue] != null)
                {
                    digitImage.sprite = _digitSprites[digitValue];
                }
                else
                {
                    Debug.LogWarning($"数字 {digitValue} 的图片未设置");
                }

                // 设置位置和尺寸（统一使用基准尺寸，保持比例会自动调整）
                RectTransform digitRect = digitImage.GetComponent<RectTransform>();
                digitRect.anchorMin = new Vector2(0.5f, 0.5f);
                digitRect.anchorMax = new Vector2(0.5f, 0.5f);
                digitRect.pivot = new Vector2(0.5f, 0.5f);
                digitRect.anchoredPosition = new Vector2(startX + i * (digitW + _spacing), 0f);
                // 设置尺寸，preserveAspect会自动保持比例
                digitRect.sizeDelta = new Vector2(digitW, digitH);
                
                // 设置颜色
                digitImage.color = _digitColor;
            }
        }

        /// <summary>
        /// 从对象池获取Image对象
        /// </summary>
        private Image GetImageFromPool()
        {
            if (_imagePool.Count > 0)
            {
                Image image = _imagePool.Dequeue();
                image.gameObject.SetActive(true);
                return image;
            }
            return null;
        }

        /// <summary>
        /// 将Image对象返回到对象池
        /// </summary>
        private void ReturnImageToPool(Image image)
        {
            if (image != null)
            {
                image.gameObject.SetActive(false);
                _imagePool.Enqueue(image);
            }
        }

        /// <summary>
        /// 设置数字值（便捷方法）
        /// </summary>
        public void SetNumber(int number)
        {
            Number = number;
        }

        /// <summary>
        /// 设置数字值（字符串形式，支持负数）
        /// </summary>
        public void SetNumber(string numberString)
        {
            if (int.TryParse(numberString, out int number))
            {
                Number = number;
            }
            else
            {
                Debug.LogError($"无法解析数字字符串: {numberString}");
            }
        }

        /// <summary>
        /// 清理资源
        /// </summary>
        private void OnDestroy()
        {
            // 清理所有Image对象
            foreach (Image image in _digitImages)
            {
                if (image != null)
                {
                    Destroy(image.gameObject);
                }
            }
            _digitImages.Clear();

            // 清理对象池
            while (_imagePool.Count > 0)
            {
                Image image = _imagePool.Dequeue();
                if (image != null)
                {
                    Destroy(image.gameObject);
                }
            }
            _imagePool.Clear();
        }
    }
}

