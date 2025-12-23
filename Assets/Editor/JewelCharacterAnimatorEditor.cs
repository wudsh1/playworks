using UnityEngine;
using UnityEditor;
using System.Linq;

/// <summary>
/// 角色动画控制器编辑器（自动加载序列帧）
/// </summary>
[CustomEditor(typeof(JewelCharacterAnimator))]
public class JewelCharacterAnimatorEditor : Editor
{
    public override void OnInspectorGUI()
    {
        DrawDefaultInspector();
        
        JewelCharacterAnimator animator = (JewelCharacterAnimator)target;
        
        EditorGUILayout.Space();
        EditorGUILayout.LabelField("自动加载序列帧", EditorStyles.boldLabel);
        
        if (GUILayout.Button("从Resources加载待机动画"))
        {
            LoadSpritesFromResources(animator, "老头表情序列帧/待机", "待机", ref animator.IdleSprites);
        }
        
        if (GUILayout.Button("从Resources加载向左看动画"))
        {
            LoadSpritesFromResources(animator, "老头表情序列帧/向左看", "向左看", ref animator.LookLeftSprites);
        }
        
        if (GUILayout.Button("从Resources播放大笑动画"))
        {
            LoadSpritesFromResources(animator, "老头表情序列帧/大笑", "大笑", ref animator.LaughSprites);
        }
        
        EditorGUILayout.Space();
        EditorGUILayout.HelpBox("点击按钮从Resources文件夹自动加载序列帧资源。确保资源路径正确。", MessageType.Info);
    }
    
    private void LoadSpritesFromResources(JewelCharacterAnimator animator, string resourcePath, string prefix, ref Sprite[] sprites)
    {
        // 从Resources加载所有Sprite
        Sprite[] loadedSprites = Resources.LoadAll<Sprite>(resourcePath);
        
        if (loadedSprites == null || loadedSprites.Length == 0)
        {
            EditorUtility.DisplayDialog("加载失败", $"无法从路径 '{resourcePath}' 加载序列帧。请确保资源在Resources文件夹中。", "确定");
            return;
        }
        
        // 按名称排序（确保顺序正确）
        loadedSprites = loadedSprites.OrderBy(s => s.name).ToArray();
        
        sprites = loadedSprites;
        
        EditorUtility.SetDirty(animator);
        Debug.Log($"成功加载 {loadedSprites.Length} 个 {prefix} 序列帧");
    }
}





















