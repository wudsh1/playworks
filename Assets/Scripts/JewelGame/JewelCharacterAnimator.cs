using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// 角色序列帧动画控制器
/// </summary>
public class JewelCharacterAnimator : MonoBehaviour
{
    [Header("组件引用")]
    public Image CharacterImage;
    
    [Header("序列帧配置")]
    [Tooltip("待机动画序列帧")]
    public Sprite[] IdleSprites;
    
    [Tooltip("向左看动画序列帧")]
    public Sprite[] LookLeftSprites;
    
    [Tooltip("大笑动画序列帧")]
    public Sprite[] LaughSprites;
    
    [Header("动画设置")]
    [Tooltip("待机动画总时长（秒），整个动画播放一次的时间")]
    public float IdleTotalTime = 2f; // 2秒播放一次完整动画
    
    [Tooltip("向左看动画总时长（秒），整个动画播放一次的时间")]
    public float LookLeftTotalTime = 1.5f; // 1.5秒播放一次完整动画
    
    [Tooltip("大笑动画总时长（秒），整个动画播放一次的时间")]
    public float LaughTotalTime = 1.5f; // 1.5秒播放一次完整动画
    
    [Tooltip("向左看动画播放次数（0表示播放一次）")]
    public int LookLeftPlayCount = 1;
    
    [Tooltip("大笑动画播放次数（0表示播放一次）")]
    public int LaughPlayCount = 1;
    
    private Coroutine _currentAnimation;
    private bool _isPlayingOneShot = false; // 是否正在播放一次性动画
    
    private void Start()
    {
        // 开始时播放待机动画
        PlayIdleAnimation();
    }
    
    /// <summary>
    /// 播放待机动画（循环）
    /// </summary>
    public void PlayIdleAnimation()
    {
        if (_isPlayingOneShot) return; // 如果正在播放一次性动画，不切换
        
        StopCurrentAnimation();
        if (IdleSprites != null && IdleSprites.Length > 0)
        {
            _currentAnimation = StartCoroutine(PlaySpriteSequence(IdleSprites, IdleTotalTime, true));
        }
        else
        {
            Debug.LogWarning("[角色动画] 待机序列帧未加载或为空！");
        }
    }
    
    /// <summary>
    /// 播放向左看动画（播放完成后返回待机）
    /// </summary>
    public void PlayLookLeftAnimation()
    {
        Debug.Log($"[角色动画] PlayLookLeftAnimation 被调用, 序列帧数量: {(LookLeftSprites != null ? LookLeftSprites.Length : 0)}, CharacterImage: {(CharacterImage != null ? "已设置" : "未设置")}");
        StopCurrentAnimation();
        _isPlayingOneShot = true;
        if (LookLeftSprites != null && LookLeftSprites.Length > 0)
        {
            _currentAnimation = StartCoroutine(PlaySpriteSequence(LookLeftSprites, LookLeftTotalTime, false, LookLeftPlayCount, () => {
                _isPlayingOneShot = false;
                PlayIdleAnimation();
            }));
        }
        else
        {
            Debug.LogWarning("[角色动画] 向左看序列帧未加载或为空！");
            _isPlayingOneShot = false;
        }
    }
    
    /// <summary>
    /// 播放大笑动画（播放完成后返回待机）
    /// </summary>
    public void PlayLaughAnimation()
    {
        Debug.Log($"[角色动画] PlayLaughAnimation 被调用, 序列帧数量: {(LaughSprites != null ? LaughSprites.Length : 0)}, CharacterImage: {(CharacterImage != null ? "已设置" : "未设置")}");
        StopCurrentAnimation();
        _isPlayingOneShot = true;
        if (LaughSprites != null && LaughSprites.Length > 0)
        {
            _currentAnimation = StartCoroutine(PlaySpriteSequence(LaughSprites, LaughTotalTime, false, LaughPlayCount, () => {
                _isPlayingOneShot = false;
                PlayIdleAnimation();
            }));
        }
        else
        {
            Debug.LogWarning("[角色动画] 大笑序列帧未加载或为空！");
            _isPlayingOneShot = false;
        }
    }
    
    /// <summary>
    /// 停止当前动画
    /// </summary>
    private void StopCurrentAnimation()
    {
        if (_currentAnimation != null)
        {
            StopCoroutine(_currentAnimation);
            _currentAnimation = null;
        }
    }
    
    /// <summary>
    /// 播放序列帧动画
    /// </summary>
    /// <param name="sprites">序列帧数组</param>
    /// <param name="totalTime">总时长（秒），整个动画播放一次的时间</param>
    /// <param name="loop">是否循环</param>
    /// <param name="playCount">播放次数（循环时忽略）</param>
    /// <param name="onComplete">完成回调</param>
    private IEnumerator PlaySpriteSequence(Sprite[] sprites, float totalTime, bool loop, int playCount = 1, System.Action onComplete = null)
    {
        if (sprites == null || sprites.Length == 0 || CharacterImage == null)
        {
            if (onComplete != null) onComplete();
            yield break;
        }
        
        // 根据总时长和序列帧数量计算每帧时间
        float frameTime = totalTime / sprites.Length;
        int currentPlay = 0;
        
        do
        {
            for (int i = 0; i < sprites.Length; i++)
            {
                if (CharacterImage != null)
                {
                    CharacterImage.sprite = sprites[i];
                }
                yield return new WaitForSeconds(frameTime);
            }
            
            currentPlay++;
            
            if (!loop && playCount > 0 && currentPlay >= playCount)
            {
                break;
            }
        } while (loop || (playCount > 0 && currentPlay < playCount));
        
        if (onComplete != null)
        {
            onComplete();
        }
    }
}

