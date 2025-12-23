using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace ZeroEditor
{
    /// <summary>
    /// 位图字体创建指令
    /// </summary>
    public class BitmapFontCreateCommand
    {
        public Texture2D[] Textures { get; private set; }
        public Rect[] Rects { get; private set; }
        public char[] Chars { get; private set; }
        public string OutputPath { get; private set; }
        public string FontName { get; private set; }

        public Texture TextureAtlas { get; private set; }

        public string FontSettingFile { get; private set; }
        public string TextureAtlasFile { get; private set; }
        public string MatFile { get; private set; }

        // 存储每个纹理的裁剪偏移量（相对于原始纹理的偏移）
        private Vector2Int[] _textureOffsets;

        public BitmapFontCreateCommand(Texture2D[] textures, string charContent, string outputPath, string fontName)
        {
            Textures = textures;
            Chars = charContent.ToCharArray();
            OutputPath = outputPath;
            FontName = fontName;
            var outFileWithoutExt = Path.Combine(outputPath, fontName);
            FontSettingFile = outFileWithoutExt + ".fontsettings";
            TextureAtlasFile = outFileWithoutExt + ".png";
            MatFile = outFileWithoutExt + ".mat";
        }

        public BitmapFontCreateCommand(Texture2D[] textures, char[] chars, string outputPath, string fontName)
        {
            Textures = textures;
            Chars = chars;
            OutputPath = outputPath;
            FontName = fontName;
            var outFileWithoutExt = Path.Combine(outputPath, fontName);
            FontSettingFile = outFileWithoutExt + ".fontsettings";
            TextureAtlasFile = outFileWithoutExt + ".png";
            MatFile = outFileWithoutExt + ".mat";
        }

        /// <summary>
        /// 开始执行
        /// </summary>
        public void Execute()
        {
            try
            {
                //删除旧文件
                DeleteOldFiles();
                //合并图集
                BuildTextureAtlas();
                //创建字体
                BuildFont();
            }
            catch(Exception e)
            {
                Debug.LogError(e);
            }

            AssetDatabase.Refresh();
        }

        void DeleteOldFiles()
        {
            if (File.Exists(TextureAtlasFile))
            {
                File.Delete(TextureAtlasFile);
            }

            if (File.Exists(FontSettingFile))
            {
                File.Delete(FontSettingFile);
            }

            if (File.Exists(MatFile))
            {
                File.Delete(MatFile);
            }
        }

        void BuildFont()
        {
            Material mat = new Material(Shader.Find("GUI/Text Shader"));
            mat.SetTexture("_MainTex", TextureAtlas);
            Font font = new Font();
            font.material = mat;

            CharacterInfo[] characterInfos = new CharacterInfo[Rects.Length];

            float lineSpace = 0.1f;

            for (int i = 0; i < Rects.Length; i++)
            {
                if (Rects[i].height > lineSpace)
                {
                    lineSpace = Rects[i].height;
                }
            }

            for (int i = 0; i < Rects.Length; i++)
            {
                Rect rect = Rects[i];

                CharacterInfo info = new CharacterInfo();
                info.index = Chars[i];

                float pivot = -lineSpace / 2;
                //pivot = 0;
                int offsetY = (int)(pivot + (lineSpace - rect.height) / 2);
                
                // 获取裁剪偏移量（原始纹理左上角到包围盒左上角的偏移）
                int cropOffsetX = _textureOffsets != null && i < _textureOffsets.Length ? _textureOffsets[i].x : 0;
                int cropOffsetY = _textureOffsets != null && i < _textureOffsets.Length ? _textureOffsets[i].y : 0;
                
                // UV坐标（图集中的位置）
                info.uvBottomLeft = new Vector2((float)rect.x / TextureAtlas.width, (float)(rect.y) / TextureAtlas.height);
                info.uvBottomRight = new Vector2((float)(rect.x + rect.width) / TextureAtlas.width, (float)(rect.y) / TextureAtlas.height);
                info.uvTopLeft = new Vector2((float)rect.x / TextureAtlas.width, (float)(rect.y + rect.height) / TextureAtlas.height);
                info.uvTopRight = new Vector2((float)(rect.x + rect.width) / TextureAtlas.width, (float)(rect.y + rect.height) / TextureAtlas.height);
                
                // 字符位置信息（需要考虑裁剪偏移量）
                // minX 为负值表示字符左侧有透明区域（被裁剪掉了）
                // 如果原始纹理左边有透明区域，minX 应该是负值
                info.minX = -cropOffsetX;
                // maxX 是裁剪后宽度减去偏移量
                info.maxX = (int)rect.width - cropOffsetX;
                
                // minY 和 maxY 需要考虑垂直居中和裁剪偏移
                // 原始纹理底部到包围盒底部的偏移需要加到 minY 上
                int originalHeight = Textures[i].height;
                int bottomOffset = originalHeight - (cropOffsetY + (int)rect.height);
                info.minY = -(int)rect.height - offsetY - bottomOffset;
                info.maxY = -offsetY - bottomOffset;
                
                // advance 使用裁剪后的实际宽度（包围盒宽度），这样字符间距更紧凑
                // 如果使用原始宽度，当原始纹理周围有透明区域时会导致间距过大
                info.advance = (int)rect.width;
                
                characterInfos[i] = info;
            }

            font.characterInfo = characterInfos;            

            AssetDatabase.CreateAsset(mat, MatFile);
            AssetDatabase.CreateAsset(font, FontSettingFile);            
            EditorUtility.SetDirty(font);
            AssetDatabase.SaveAssets();
        }

        /// <summary>
        /// 计算纹理的非透明区域最大包围盒
        /// </summary>
        RectInt CalculateBoundingBox(Texture2D texture)
        {
            if (texture == null || texture.width == 0 || texture.height == 0)
            {
                return new RectInt(0, 0, 0, 0);
            }

            Color32[] pixels = texture.GetPixels32();
            int width = texture.width;
            int height = texture.height;

            int minX = width;
            int minY = height;
            int maxX = 0;
            int maxY = 0;

            // 查找非透明像素的边界
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int index = y * width + x;
                    if (pixels[index].a > 0) // 非透明像素
                    {
                        minX = Mathf.Min(minX, x);
                        minY = Mathf.Min(minY, y);
                        maxX = Mathf.Max(maxX, x);
                        maxY = Mathf.Max(maxY, y);
                    }
                }
            }

            // 如果没有找到非透明像素，返回整个纹理区域
            if (minX > maxX || minY > maxY)
            {
                return new RectInt(0, 0, width, height);
            }

            // 返回包围盒（包含边界）
            int boundingWidth = maxX - minX + 1;
            int boundingHeight = maxY - minY + 1;
            return new RectInt(minX, minY, boundingWidth, boundingHeight);
        }

        /// <summary>
        /// 裁剪纹理到指定区域
        /// </summary>
        Texture2D CropTexture(Texture2D source, RectInt cropRect)
        {
            if (source == null || cropRect.width <= 0 || cropRect.height <= 0)
            {
                return source;
            }

            // 确保裁剪区域在纹理范围内
            cropRect.x = Mathf.Clamp(cropRect.x, 0, source.width);
            cropRect.y = Mathf.Clamp(cropRect.y, 0, source.height);
            cropRect.width = Mathf.Min(cropRect.width, source.width - cropRect.x);
            cropRect.height = Mathf.Min(cropRect.height, source.height - cropRect.y);

            Texture2D cropped = new Texture2D(cropRect.width, cropRect.height, TextureFormat.ARGB32, false);
            Color[] pixels = source.GetPixels(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
            cropped.SetPixels(pixels);
            cropped.Apply();
            return cropped;
        }

        void BuildTextureAtlas()
        {
            foreach (var t in Textures)
            {
                var path = AssetDatabase.GetAssetPath(t);
                var ti = AssetImporter.GetAtPath(path) as TextureImporter;

                var isEdited = false;

                //ti.textureType = TextureImporterType.Sprite;

                if (ti.textureCompression != TextureImporterCompression.Uncompressed)
                {
                    //有些图片压缩格式，没办法进行合并纹理
                    ti.textureCompression = TextureImporterCompression.Uncompressed;                    
                    isEdited = true;
                }

                if (false == ti.isReadable)
                {
                    //修改为可读写，这样才能进行后面的打包
                    ti.isReadable = true;
                    isEdited = true;
                }

                if (isEdited)
                {
                    ti.SaveAndReimport();
                }
            }

            // 确保输出目录存在
            if (false == Directory.Exists(OutputPath))
            {
                Directory.CreateDirectory(OutputPath);
            }

            // 创建裁剪后纹理的保存目录
            string croppedTexturesPath = Path.Combine(OutputPath, FontName + "_Cropped");
            if (false == Directory.Exists(croppedTexturesPath))
            {
                Directory.CreateDirectory(croppedTexturesPath);
            }

            // 计算每个纹理的包围盒并裁剪
            Texture2D[] croppedTextures = new Texture2D[Textures.Length];
            _textureOffsets = new Vector2Int[Textures.Length];

            for (int i = 0; i < Textures.Length; i++)
            {
                RectInt boundingBox = CalculateBoundingBox(Textures[i]);
                
                // 记录偏移量（原始纹理左上角到包围盒左上角的偏移）
                _textureOffsets[i] = new Vector2Int(boundingBox.x, boundingBox.y);
                
                // 裁剪纹理到包围盒
                croppedTextures[i] = CropTexture(Textures[i], boundingBox);
                
                // 保存裁剪后的纹理到文件
                string croppedFileName = $"{Chars[i]}.png";
                string croppedFilePath = Path.Combine(croppedTexturesPath, croppedFileName);
                byte[] croppedBytes = croppedTextures[i].EncodeToPNG();
                File.WriteAllBytes(croppedFilePath, croppedBytes);
                
                Debug.LogFormat("字符: {0}  原始尺寸: {1}x{2}  包围盒: {3}  裁剪后尺寸: {4}x{5}  已保存到: {6}", 
                    Chars[i], 
                    Textures[i].width, Textures[i].height,
                    boundingBox,
                    croppedTextures[i].width, croppedTextures[i].height,
                    croppedFilePath);
            }

            var textureAtlas = new Texture2D(1, 1, TextureFormat.ARGB32, false);
            Rects = textureAtlas.PackTextures(croppedTextures, 0);

            //Debug.LogFormat("图集合并完成:");

            //将比例关系转换为像素值
            for (var i = 0; i < Rects.Length; i++)
            {
                var rect = Rects[i];
                rect.x = rect.x * textureAtlas.width;
                rect.width = rect.width * textureAtlas.width;
                rect.y = rect.y * textureAtlas.height;
                rect.height = rect.height * textureAtlas.height;
                Rects[i] = rect;

                //Debug.LogFormat("字符: {0}  区域: {1}", Chars[i], rect.ToString());
            }

            // 清理临时裁剪的纹理
            for (int i = 0; i < croppedTextures.Length; i++)
            {
                if (croppedTextures[i] != Textures[i] && croppedTextures[i] != null)
                {
                    UnityEngine.Object.DestroyImmediate(croppedTextures[i]);
                }
            }

            //保存图集
            var bytes = textureAtlas.EncodeToPNG();
            File.WriteAllBytes(TextureAtlasFile, bytes);
            AssetDatabase.Refresh();

            TextureAtlas = AssetDatabase.LoadAssetAtPath<Texture>(TextureAtlasFile);
        }
    }
}