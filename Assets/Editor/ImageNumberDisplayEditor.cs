using UnityEngine;
using UnityEditor;
using UI;

namespace UI.Editor
{
    /// <summary>
    /// ImageNumberDisplay的编辑器脚本，提供便捷的测试功能
    /// </summary>
    [CustomEditor(typeof(ImageNumberDisplay))]
    public class ImageNumberDisplayEditor : UnityEditor.Editor
    {
        private int _testNumber = 0;

        public override void OnInspectorGUI()
        {
            DrawDefaultInspector();

            ImageNumberDisplay display = (ImageNumberDisplay)target;

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("测试工具", EditorStyles.boldLabel);

            EditorGUILayout.BeginHorizontal();
            _testNumber = EditorGUILayout.IntField("测试数字", _testNumber);
            if (GUILayout.Button("设置", GUILayout.Width(60)))
            {
                display.SetNumber(_testNumber);
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("随机数字"))
            {
                _testNumber = Random.Range(0, 999999);
                display.SetNumber(_testNumber);
            }
            if (GUILayout.Button("清零"))
            {
                _testNumber = 0;
                display.SetNumber(0);
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();
            EditorGUILayout.HelpBox("使用说明：\n" +
                "1. 将0-9的数字图片拖入Digit Sprites数组\n" +
                "2. 设置Number属性或使用测试工具设置数字\n" +
                "3. 调整Spacing、Alignment等参数来调整显示效果", MessageType.Info);
        }
    }
}















