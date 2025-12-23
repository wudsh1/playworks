using UnityEngine;
using System.Collections.Generic;
using System.Linq;

namespace UI
{
    /// <summary>
    /// 序列帧裁剪数据 - 保存预处理裁剪后的信息和偏移
    /// </summary>
    [CreateAssetMenu(fileName = "FrameSequenceCropData", menuName = "UI/序列帧裁剪数据")]
    public class FrameSequenceCropData : ScriptableObject
    {
        [Header("基本信息")]
        [Tooltip("原始特效尺寸")]
        public Vector2 OriginalSize = new Vector2(720f, 1280f);
        
        [Tooltip("总帧数")]
        public int FrameCount;
        
        [System.Serializable]
        public class FrameCropInfo
        {
            [Tooltip("帧索引")]
            public int FrameIndex;
            
            [Tooltip("原始文件名")]
            public string OriginalFileName;
            
            [Tooltip("裁剪后的文件名")]
            public string CroppedFileName;
            
            [Tooltip("裁剪后的尺寸")]
            public Vector2 CroppedSize;
            
            [Tooltip("相对于原始中心的偏移")]
            public Vector2 OffsetFromCenter;
            
            [Tooltip("裁剪矩形（相对于原始图片）")]
            public Rect CropRect;
        }
        
        [Header("帧数据列表")]
        [Tooltip("每帧的裁剪信息")]
        public List<FrameCropInfo> FrameDataList = new List<FrameCropInfo>();
        
        /// <summary>
        /// 获取指定帧的裁剪信息
        /// </summary>
        public FrameCropInfo GetFrameInfo(int frameIndex)
        {
            if (frameIndex < 0 || frameIndex >= FrameDataList.Count)
            {
                return null;
            }
            return FrameDataList[frameIndex];
        }
        
        /// <summary>
        /// 根据文件名获取帧信息
        /// </summary>
        public FrameCropInfo GetFrameInfoByFileName(string fileName)
        {
            return FrameDataList.FirstOrDefault(f => f.CroppedFileName == fileName);
        }
    }
}














