/**
 * @version 1.0.9480.23920
 * @copyright anton
 * @compiler Bridge.NET 17.9.42-luna
 */
Bridge.assembly("UnityScriptsCompiler", function ($asm, globals) {
    "use strict";

    /*CanvasScalerAdapter start.*/
    /**
     * CanvasScaler适配器 - 根据屏幕分辨率高宽比动态调整match值
     *
     * @public
     * @class CanvasScalerAdapter
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("CanvasScalerAdapter", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            IPadAspectRatio: 0,
            MatchForIPad: 0,
            MatchForNormalAspect: 0,
            MatchForTallAspect: 0,
            UpdateOnScreenSizeChange: false,
            _canvasScaler: null,
            _lastScreenWidth: 0,
            _lastScreenHeight: 0
        },
        ctors: {
            init: function () {
                this.IPadAspectRatio = 1.34;
                this.MatchForIPad = 0.684;
                this.MatchForNormalAspect = 0.509;
                this.MatchForTallAspect = 0.0;
                this.UpdateOnScreenSizeChange = true;
            }
        },
        methods: {
            /*CanvasScalerAdapter.Awake start.*/
            Awake: function () {
                this._canvasScaler = this.GetComponent(UnityEngine.UI.CanvasScaler);
                if (UnityEngine.MonoBehaviour.op_Equality(this._canvasScaler, null)) {
                    UnityEngine.Debug.LogError$2("[CanvasScalerAdapter] \u672a\u627e\u5230CanvasScaler\u7ec4\u4ef6\uff01");
                    return;
                }

                // 确保CanvasScaler使用Match Width Or Height模式
                if (this._canvasScaler.uiScaleMode !== UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize) {
                    UnityEngine.Debug.LogWarning$1("[CanvasScalerAdapter] CanvasScaler\u7684UI Scale Mode\u4e0d\u662fScaleWithScreenSize\uff0c\u5c06\u81ea\u52a8\u8bbe\u7f6e\u4e3aScaleWithScreenSize");
                    this._canvasScaler.uiScaleMode = UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
                }

                if (this._canvasScaler.screenMatchMode !== UnityEngine.UI.CanvasScaler.ScreenMatchMode.MatchWidthOrHeight) {
                    UnityEngine.Debug.LogWarning$1("[CanvasScalerAdapter] CanvasScaler\u7684Screen Match Mode\u4e0d\u662fMatchWidthOrHeight\uff0c\u5c06\u81ea\u52a8\u8bbe\u7f6e\u4e3aMatchWidthOrHeight");
                    this._canvasScaler.screenMatchMode = UnityEngine.UI.CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
                }
            },
            /*CanvasScalerAdapter.Awake end.*/

            /*CanvasScalerAdapter.Start start.*/
            Start: function () {
                this.UpdateMatchValue();
            },
            /*CanvasScalerAdapter.Start end.*/

            /*CanvasScalerAdapter.Update start.*/
            Update: function () {
                if (this.UpdateOnScreenSizeChange) {
                    // 检查屏幕尺寸是否改变
                    if (UnityEngine.Screen.width !== this._lastScreenWidth || UnityEngine.Screen.height !== this._lastScreenHeight) {
                        this.UpdateMatchValue();
                    }
                }
            },
            /*CanvasScalerAdapter.Update end.*/

            /*CanvasScalerAdapter.UpdateMatchValue start.*/
            /**
             * 根据屏幕分辨率更新match值
             *
             * @instance
             * @public
             * @this CanvasScalerAdapter
             * @memberof CanvasScalerAdapter
             * @return  {void}
             */
            UpdateMatchValue: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this._canvasScaler, null)) {
                    return;
                }

                this._lastScreenWidth = UnityEngine.Screen.width;
                this._lastScreenHeight = UnityEngine.Screen.height;

                var aspectRatio = UnityEngine.Screen.height / UnityEngine.Screen.width;

                var matchValue;
                if (aspectRatio <= this.IPadAspectRatio) {
                    UnityEngine.Debug.Log$1("1 [CanvasScalerAdapter] \u5c0f\u4e8e\u7b49\u4e8eiPad\u6bd4\u4f8b\uff0c\u4f7f\u7528iPad\u7684match\u503c");
                    // 小于等于iPad比例，使用iPad的match值
                    matchValue = this.MatchForIPad;
                } else if (aspectRatio < 2.0) {
                    UnityEngine.Debug.Log$1("2 [CanvasScalerAdapter] \u5927\u4e8eiPad\u6bd4\u4f8b\u4f46\u5c0f\u4e8e2\uff0c\u4f7f\u7528\u666e\u901a\u6bd4\u4f8b");

                    // 大于iPad比例但小于2，使用普通比例
                    matchValue = this.MatchForNormalAspect;
                } else {
                    // 大于等于2，使用高屏比例
                    matchValue = this.MatchForTallAspect;
                }

                this._canvasScaler.matchWidthOrHeight = matchValue;

                UnityEngine.Debug.Log$1(System.String.format("[CanvasScalerAdapter] \u5c4f\u5e55\u5206\u8fa8\u7387: {0}x{1}, \u9ad8\u5bbd\u6bd4: {2:F2}, Match\u503c: {3}", Bridge.box(UnityEngine.Screen.width, System.Int32), Bridge.box(UnityEngine.Screen.height, System.Int32), Bridge.box(aspectRatio, System.Single, System.Single.format, System.Single.getHashCode), Bridge.box(matchValue, System.Single, System.Single.format, System.Single.getHashCode)));
            },
            /*CanvasScalerAdapter.UpdateMatchValue end.*/

            /*CanvasScalerAdapter.Refresh start.*/
            /**
             * 手动更新match值（供外部调用）
             *
             * @instance
             * @public
             * @this CanvasScalerAdapter
             * @memberof CanvasScalerAdapter
             * @return  {void}
             */
            Refresh: function () {
                this.UpdateMatchValue();
            },
            /*CanvasScalerAdapter.Refresh end.*/


        }
    });
    /*CanvasScalerAdapter end.*/

    /*FreeToPlayButton start.*/
    /**
     * "Free to Play"按钮（带闪烁效果）
     *
     * @public
     * @class FreeToPlayButton
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("FreeToPlayButton", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            Button: null,
            ButtonText: null,
            ButtonBackground: null,
            IconImage: null,
            BlinkInterval: 0,
            MinAlpha: 0,
            MaxAlpha: 0,
            EnableColorBlink: false,
            BlinkColorA: null,
            BlinkColorB: null,
            EnableScaleAnimation: false,
            MinScale: 0,
            MaxScale: 0,
            StoreNavigator: null,
            _isBlinking: false,
            _blinkCoroutine: null,
            _originalScale: null
        },
        ctors: {
            init: function () {
                this.BlinkColorA = new UnityEngine.Color();
                this.BlinkColorB = new UnityEngine.Color();
                this._originalScale = new UnityEngine.Vector3();
                this.BlinkInterval = 0.5;
                this.MinAlpha = 0.3;
                this.MaxAlpha = 1.0;
                this.EnableColorBlink = true;
                this.BlinkColorA = new pc.Color( 1, 1, 1, 1 );
                this.BlinkColorB = new pc.Color( 1, 1, 0, 1 );
                this.EnableScaleAnimation = true;
                this.MinScale = 0.95;
                this.MaxScale = 1.05;
                this._isBlinking = false;
            }
        },
        methods: {
            /*FreeToPlayButton.Awake start.*/
            Awake: function () {
                // 自动查找组件
                if (UnityEngine.MonoBehaviour.op_Equality(this.Button, null)) {
                    this.Button = this.GetComponent(UnityEngine.UI.Button);
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.ButtonText, null)) {
                    this.ButtonText = this.GetComponentInChildren(UnityEngine.UI.Text);
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.ButtonBackground, null)) {
                    this.ButtonBackground = this.GetComponent(UnityEngine.UI.Image);
                }

                // 记录原始缩放
                this._originalScale = this.transform.localScale.$clone();

                // 绑定按钮点击事件
                if (UnityEngine.MonoBehaviour.op_Inequality(this.Button, null)) {
                    this.Button.onClick.AddListener(Bridge.fn.cacheBind(this, this.OnButtonClick));
                }

                // 自动查找StoreNavigator
                if (UnityEngine.MonoBehaviour.op_Equality(this.StoreNavigator, null)) {
                    this.StoreNavigator = UnityEngine.Object.FindObjectOfType(StoreNavigator);
                    if (UnityEngine.MonoBehaviour.op_Equality(this.StoreNavigator, null)) {
                        UnityEngine.Debug.LogWarning$1("[FreeToPlayButton] \u672a\u627e\u5230StoreNavigator\uff0c\u5c06\u81ea\u52a8\u521b\u5efa");
                        var navigatorObj = new UnityEngine.GameObject.$ctor2("StoreNavigator");
                        this.StoreNavigator = navigatorObj.AddComponent(StoreNavigator);
                    }
                }
            },
            /*FreeToPlayButton.Awake end.*/

            /*FreeToPlayButton.Start start.*/
            Start: function () {
                // 设置按钮文本
                if (UnityEngine.MonoBehaviour.op_Inequality(this.ButtonText, null)) {
                    this.ButtonText.text = "Free to Play";
                }

                // 开始闪烁
                this.StartBlinking();
            },
            /*FreeToPlayButton.Start end.*/

            /*FreeToPlayButton.OnDestroy start.*/
            OnDestroy: function () {
                // 取消按钮事件绑定
                if (UnityEngine.MonoBehaviour.op_Inequality(this.Button, null)) {
                    this.Button.onClick.RemoveListener(Bridge.fn.cacheBind(this, this.OnButtonClick));
                }
            },
            /*FreeToPlayButton.OnDestroy end.*/

            /*FreeToPlayButton.StartBlinking start.*/
            /**
             * 开始闪烁
             *
             * @instance
             * @public
             * @this FreeToPlayButton
             * @memberof FreeToPlayButton
             * @return  {void}
             */
            StartBlinking: function () {
                if (this._isBlinking) {
                    return;
                }

                this._isBlinking = true;
                if (this._blinkCoroutine != null) {
                    this.StopCoroutine$2(this._blinkCoroutine);
                }
                this._blinkCoroutine = this.StartCoroutine$1(this.BlinkCoroutine());
            },
            /*FreeToPlayButton.StartBlinking end.*/

            /*FreeToPlayButton.StopBlinking start.*/
            /**
             * 停止闪烁
             *
             * @instance
             * @public
             * @this FreeToPlayButton
             * @memberof FreeToPlayButton
             * @return  {void}
             */
            StopBlinking: function () {
                this._isBlinking = false;
                if (this._blinkCoroutine != null) {
                    this.StopCoroutine$2(this._blinkCoroutine);
                    this._blinkCoroutine = null;
                }

                // 恢复原始状态
                if (UnityEngine.MonoBehaviour.op_Inequality(this.ButtonBackground, null)) {
                    var color = this.ButtonBackground.color.$clone();
                    color.a = this.MaxAlpha;
                    this.ButtonBackground.color = color.$clone();
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.ButtonText, null)) {
                    var color1 = this.ButtonText.color.$clone();
                    color1.a = this.MaxAlpha;
                    this.ButtonText.color = color1.$clone();
                }

                this.transform.localScale = this._originalScale.$clone();
            },
            /*FreeToPlayButton.StopBlinking end.*/

            /*FreeToPlayButton.BlinkCoroutine start.*/
            /**
             * 闪烁协程
             *
             * @instance
             * @private
             * @this FreeToPlayButton
             * @memberof FreeToPlayButton
             * @return  {System.Collections.IEnumerator}
             */
            BlinkCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    elapsed,
                    t,
                    alpha,
                    bgColor,
                    textColor,
                    iconColor,
                    scale,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    elapsed = 0.0;
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( this._isBlinking ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    elapsed += UnityEngine.Time.deltaTime;

                                        // 计算闪烁进度（0-1-0循环）
                                        t = UnityEngine.Mathf.PingPong(elapsed / this.BlinkInterval, 1.0);

                                        // 透明度闪烁
                                        alpha = pc.math.lerp(this.MinAlpha, this.MaxAlpha, t);

                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.ButtonBackground, null)) {
                                            bgColor = this.ButtonBackground.color.$clone();

                                            // 颜色闪烁
                                            if (this.EnableColorBlink) {
                                                bgColor = pc.Color.lerp( this.BlinkColorA, this.BlinkColorB, t );
                                            }

                                            bgColor.a = alpha;
                                            this.ButtonBackground.color = bgColor.$clone();
                                        }

                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.ButtonText, null)) {
                                            textColor = this.ButtonText.color.$clone();
                                            textColor.a = alpha;
                                            this.ButtonText.color = textColor.$clone();
                                        }

                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.IconImage, null)) {
                                            iconColor = this.IconImage.color.$clone();
                                            iconColor.a = alpha;
                                            this.IconImage.color = iconColor.$clone();
                                        }

                                        // 缩放动画
                                        if (this.EnableScaleAnimation) {
                                            scale = pc.math.lerp(this.MinScale, this.MaxScale, t);
                                            this.transform.localScale = this._originalScale.$clone().clone().scale( scale );
                                        }

                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*FreeToPlayButton.BlinkCoroutine end.*/

            /*FreeToPlayButton.OnButtonClick start.*/
            /**
             * 按钮点击回调
             *
             * @instance
             * @private
             * @this FreeToPlayButton
             * @memberof FreeToPlayButton
             * @return  {void}
             */
            OnButtonClick: function () {
                UnityEngine.Debug.Log$1("[FreeToPlayButton] \u6309\u94ae\u88ab\u70b9\u51fb\uff0c\u51c6\u5907\u8df3\u8f6c\u5546\u5e97");

                // 播放点击音效（如果有）
                // AudioManager.instance.PlaySound("ButtonClick");

                // 按钮点击反馈动画
                this.StartCoroutine$1(this.ClickFeedbackAnimation());

                // 跳转商店
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreNavigator, null)) {
                    this.StoreNavigator.OpenStore();
                } else {
                    UnityEngine.Debug.LogError$2("[FreeToPlayButton] StoreNavigator\u672a\u8bbe\u7f6e\uff01");
                }
            },
            /*FreeToPlayButton.OnButtonClick end.*/

            /*FreeToPlayButton.ClickFeedbackAnimation start.*/
            /**
             * 点击反馈动画
             *
             * @instance
             * @private
             * @this FreeToPlayButton
             * @memberof FreeToPlayButton
             * @return  {System.Collections.IEnumerator}
             */
            ClickFeedbackAnimation: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    duration,
                    elapsed,
                    targetScale,
                    startScale,
                    t,
                    t1,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    // 快速缩小
                                        duration = 0.1;
                                        elapsed = 0.0;
                                        targetScale = this._originalScale.$clone().clone().scale( 0.9 );
                                        startScale = this.transform.localScale.$clone();
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( elapsed < duration ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / duration;
                                        this.transform.localScale = new pc.Vec3().lerp( startScale, targetScale, t );
                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {
                                    // 快速恢复
                                        elapsed = 0.0;
                                        startScale = this.transform.localScale.$clone();
                                    $step = 5;
                                    continue;
                                }
                                case 5: {
                                    if ( elapsed < duration ) {
                                            $step = 6;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 6: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t1 = elapsed / duration;
                                        this.transform.localScale = new pc.Vec3().lerp( startScale, this._originalScale, t1 );
                                        $enumerator.current = null;
                                        $step = 7;
                                        return true;
                                }
                                case 7: {
                                    
                                        $step = 5;
                                        continue;
                                }
                                case 8: {
                                    this.transform.localScale = this._originalScale.$clone();

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*FreeToPlayButton.ClickFeedbackAnimation end.*/


        }
    });
    /*FreeToPlayButton end.*/

    /*GameLosePanel start.*/
    /**
     * 游戏失败界面
     *
     * @public
     * @class GameLosePanel
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("GameLosePanel", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            Panel: null,
            RestartButton: null,
            ButtonText: null,
            ButtonAnimationDuration: 0,
            ButtonStartScale: 0,
            ButtonEndScale: 0,
            AnimationCurve: null,
            _buttonOriginalScale: null,
            _isAnimating: false
        },
        ctors: {
            init: function () {
                this._buttonOriginalScale = new UnityEngine.Vector3();
                this.ButtonAnimationDuration = 0.5;
                this.ButtonStartScale = 0.1;
                this.ButtonEndScale = 1.0;
                this._isAnimating = false;
            }
        },
        methods: {
            /*GameLosePanel.Awake start.*/
            Awake: function () {
                // 自动查找组件
                if (UnityEngine.GameObject.op_Equality(this.Panel, null)) {
                    this.Panel = this.gameObject;
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.RestartButton, null)) {
                    this.RestartButton = this.GetComponentInChildren(UnityEngine.UI.Button);
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.ButtonText, null) && UnityEngine.MonoBehaviour.op_Inequality(this.RestartButton, null)) {
                    this.ButtonText = this.RestartButton.GetComponentInChildren(UnityEngine.UI.Text);
                }

                // 记录按钮原始缩放
                if (UnityEngine.MonoBehaviour.op_Inequality(this.RestartButton, null)) {
                    this._buttonOriginalScale = this.RestartButton.transform.localScale.$clone();
                }

                // 绑定按钮点击事件
                if (UnityEngine.MonoBehaviour.op_Inequality(this.RestartButton, null)) {
                    this.RestartButton.onClick.AddListener(Bridge.fn.cacheBind(this, this.OnRestartButtonClick));
                }

                // 默认隐藏界面
                if (UnityEngine.GameObject.op_Inequality(this.Panel, null)) {
                    this.Panel.SetActive(false);
                }
            },
            /*GameLosePanel.Awake end.*/

            /*GameLosePanel.OnDestroy start.*/
            OnDestroy: function () {
                // 取消按钮事件绑定
                if (UnityEngine.MonoBehaviour.op_Inequality(this.RestartButton, null)) {
                    this.RestartButton.onClick.RemoveListener(Bridge.fn.cacheBind(this, this.OnRestartButtonClick));
                }
            },
            /*GameLosePanel.OnDestroy end.*/

            /*GameLosePanel.Show start.*/
            /**
             * 显示失败界面
             *
             * @instance
             * @public
             * @this GameLosePanel
             * @memberof GameLosePanel
             * @return  {void}
             */
            Show: function () {
                if (UnityEngine.GameObject.op_Inequality(this.Panel, null)) {
                    this.Panel.SetActive(true);
                }

                // 播放按钮动画
                if (UnityEngine.MonoBehaviour.op_Inequality(this.RestartButton, null) && !this._isAnimating) {
                    this.StartCoroutine$1(this.PlayButtonScaleAnimation());
                }
            },
            /*GameLosePanel.Show end.*/

            /*GameLosePanel.Hide start.*/
            /**
             * 隐藏失败界面
             *
             * @instance
             * @public
             * @this GameLosePanel
             * @memberof GameLosePanel
             * @return  {void}
             */
            Hide: function () {
                if (UnityEngine.GameObject.op_Inequality(this.Panel, null)) {
                    this.Panel.SetActive(false);
                }

                // 重置按钮缩放
                if (UnityEngine.MonoBehaviour.op_Inequality(this.RestartButton, null)) {
                    this.RestartButton.transform.localScale = this._buttonOriginalScale.$clone();
                }

                this._isAnimating = false;
            },
            /*GameLosePanel.Hide end.*/

            /*GameLosePanel.PlayButtonScaleAnimation start.*/
            /**
             * 播放按钮从小到大的缩放动画
             *
             * @instance
             * @private
             * @this GameLosePanel
             * @memberof GameLosePanel
             * @return  {System.Collections.IEnumerator}
             */
            PlayButtonScaleAnimation: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    startScale,
                    endScale,
                    elapsed,
                    t,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (UnityEngine.MonoBehaviour.op_Equality(this.RestartButton, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    this._isAnimating = true;

                                        // 设置初始缩放
                                        startScale = this._buttonOriginalScale.$clone().clone().scale( this.ButtonStartScale );
                                        endScale = this._buttonOriginalScale.$clone().clone().scale( this.ButtonEndScale );
                                        this.RestartButton.transform.localScale = startScale.$clone();

                                        elapsed = 0.0;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < this.ButtonAnimationDuration ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 6;
                                        continue;
                                }
                                case 4: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / this.ButtonAnimationDuration;

                                        // 使用动画曲线（如果提供）或使用缓动函数
                                        if (this.AnimationCurve != null && this.AnimationCurve.keys.length > 0) {
                                            t = this.AnimationCurve.value(t);
                                        } else {
                                            // 使用缓出缓入曲线（ease-out）
                                            t = 1.0 - Math.pow(1.0 - t, 3.0);
                                        }

                                        this.RestartButton.transform.localScale = new pc.Vec3().lerp( startScale, endScale, t );
                                        $enumerator.current = null;
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 6: {
                                    // 确保最终缩放正确
                                        this.RestartButton.transform.localScale = endScale.$clone();
                                        this._isAnimating = false;

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*GameLosePanel.PlayButtonScaleAnimation end.*/

            /*GameLosePanel.OnRestartButtonClick start.*/
            /**
             * 重玩按钮点击回调
             *
             * @instance
             * @private
             * @this GameLosePanel
             * @memberof GameLosePanel
             * @return  {void}
             */
            OnRestartButtonClick: function () {
                UnityEngine.Debug.Log$1("[GameLosePanel] \u91cd\u73a9\u6309\u94ae\u88ab\u70b9\u51fb");

                // 隐藏界面
                this.Hide();

                // 调用游戏管理器的重玩方法
                if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                    JewelGameManager.Instance.RestartGame();
                } else {
                    UnityEngine.Debug.LogError$2("[GameLosePanel] JewelGameManager.Instance \u672a\u627e\u5230\uff01");
                }
            },
            /*GameLosePanel.OnRestartButtonClick end.*/


        }
    });
    /*GameLosePanel end.*/

    /*GameWinPanel start.*/
    /**
     * 游戏胜利界面
     *
     * @public
     * @class GameWinPanel
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("GameWinPanel", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            Panel: null,
            StoreButton: null,
            ButtonText: null,
            ButtonAnimationDuration: 0,
            ButtonStartScale: 0,
            ButtonEndScale: 0,
            AnimationCurve: null,
            StoreNavigator: null,
            _buttonOriginalScale: null,
            _isAnimating: false
        },
        ctors: {
            init: function () {
                this._buttonOriginalScale = new UnityEngine.Vector3();
                this.ButtonAnimationDuration = 0.5;
                this.ButtonStartScale = 0.1;
                this.ButtonEndScale = 1.0;
                this._isAnimating = false;
            }
        },
        methods: {
            /*GameWinPanel.Awake start.*/
            Awake: function () {
                // 自动查找组件
                if (UnityEngine.GameObject.op_Equality(this.Panel, null)) {
                    this.Panel = this.gameObject;
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.StoreButton, null)) {
                    this.StoreButton = this.GetComponentInChildren(UnityEngine.UI.Button);
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.ButtonText, null) && UnityEngine.MonoBehaviour.op_Inequality(this.StoreButton, null)) {
                    this.ButtonText = this.StoreButton.GetComponentInChildren(UnityEngine.UI.Text);
                }

                // 记录按钮原始缩放
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreButton, null)) {
                    this._buttonOriginalScale = this.StoreButton.transform.localScale.$clone();
                }

                // 绑定按钮点击事件
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreButton, null)) {
                    this.StoreButton.onClick.AddListener(Bridge.fn.cacheBind(this, this.OnStoreButtonClick));
                }

                // 自动查找StoreNavigator
                if (UnityEngine.MonoBehaviour.op_Equality(this.StoreNavigator, null)) {
                    this.StoreNavigator = UnityEngine.Object.FindObjectOfType(StoreNavigator);
                    if (UnityEngine.MonoBehaviour.op_Equality(this.StoreNavigator, null) && UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        this.StoreNavigator = JewelGameManager.Instance.StoreNavigator;
                    }
                }

                // 默认隐藏界面
                if (UnityEngine.GameObject.op_Inequality(this.Panel, null)) {
                    this.Panel.SetActive(false);
                }
            },
            /*GameWinPanel.Awake end.*/

            /*GameWinPanel.OnDestroy start.*/
            OnDestroy: function () {
                // 取消按钮事件绑定
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreButton, null)) {
                    this.StoreButton.onClick.RemoveListener(Bridge.fn.cacheBind(this, this.OnStoreButtonClick));
                }
            },
            /*GameWinPanel.OnDestroy end.*/

            /*GameWinPanel.Show start.*/
            /**
             * 显示胜利界面
             *
             * @instance
             * @public
             * @this GameWinPanel
             * @memberof GameWinPanel
             * @return  {void}
             */
            Show: function () {
                if (UnityEngine.GameObject.op_Inequality(this.Panel, null)) {
                    this.Panel.SetActive(true);
                }

                // 播放按钮动画
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreButton, null) && !this._isAnimating) {
                    this.StartCoroutine$1(this.PlayButtonScaleAnimation());
                }
            },
            /*GameWinPanel.Show end.*/

            /*GameWinPanel.Hide start.*/
            /**
             * 隐藏胜利界面
             *
             * @instance
             * @public
             * @this GameWinPanel
             * @memberof GameWinPanel
             * @return  {void}
             */
            Hide: function () {
                if (UnityEngine.GameObject.op_Inequality(this.Panel, null)) {
                    this.Panel.SetActive(false);
                }

                // 重置按钮缩放
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreButton, null)) {
                    this.StoreButton.transform.localScale = this._buttonOriginalScale.$clone();
                }

                this._isAnimating = false;
            },
            /*GameWinPanel.Hide end.*/

            /*GameWinPanel.PlayButtonScaleAnimation start.*/
            /**
             * 播放按钮从小到大的缩放动画
             *
             * @instance
             * @private
             * @this GameWinPanel
             * @memberof GameWinPanel
             * @return  {System.Collections.IEnumerator}
             */
            PlayButtonScaleAnimation: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    startScale,
                    endScale,
                    elapsed,
                    t,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (UnityEngine.MonoBehaviour.op_Equality(this.StoreButton, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    this._isAnimating = true;

                                        // 设置初始缩放
                                        startScale = this._buttonOriginalScale.$clone().clone().scale( this.ButtonStartScale );
                                        endScale = this._buttonOriginalScale.$clone().clone().scale( this.ButtonEndScale );
                                        this.StoreButton.transform.localScale = startScale.$clone();

                                        elapsed = 0.0;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < this.ButtonAnimationDuration ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 6;
                                        continue;
                                }
                                case 4: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / this.ButtonAnimationDuration;

                                        // 使用动画曲线（如果提供）或使用缓动函数
                                        if (this.AnimationCurve != null && this.AnimationCurve.keys.length > 0) {
                                            t = this.AnimationCurve.value(t);
                                        } else {
                                            // 使用缓出缓入曲线（ease-out）
                                            t = 1.0 - Math.pow(1.0 - t, 3.0);
                                        }

                                        this.StoreButton.transform.localScale = new pc.Vec3().lerp( startScale, endScale, t );
                                        $enumerator.current = null;
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 6: {
                                    // 确保最终缩放正确
                                        this.StoreButton.transform.localScale = endScale.$clone();
                                        this._isAnimating = false;

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*GameWinPanel.PlayButtonScaleAnimation end.*/

            /*GameWinPanel.OnStoreButtonClick start.*/
            /**
             * 跳转商店按钮点击回调（胜利后加载下一关）
             *
             * @instance
             * @private
             * @this GameWinPanel
             * @memberof GameWinPanel
             * @return  {void}
             */
            OnStoreButtonClick: function () {
                UnityEngine.Debug.Log$1("[GameWinPanel] \u80dc\u5229\u6309\u94ae\u88ab\u70b9\u51fb\uff0c\u52a0\u8f7d\u4e0b\u4e00\u5173");

                // 隐藏界面
                this.Hide();

                // 加载下一关（除第一关外都是随机关）
                if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                    JewelGameManager.Instance.NextLevel();
                } else {
                    UnityEngine.Debug.LogError$2("[GameWinPanel] JewelGameManager.Instance \u672a\u627e\u5230\uff01");
                }
            },
            /*GameWinPanel.OnStoreButtonClick end.*/


        }
    });
    /*GameWinPanel end.*/

    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty start.*/
    Bridge.define("IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty", {
        inherits: [UnityEngine.MonoBehaviour]
    });
    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty end.*/

    /*JewelBlockController start.*/
    /**
     * 宝石块控制器（负责显示和交互）
     *
     * @public
     * @class JewelBlockController
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("JewelBlockController", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            BlockImage: null,
            RectTransform: null,
            LanseEffectPlayer: null,
            FenseEffectPlayer: null,
            BlueSprites: null,
            PinkSprites: null,
            DiamondSprite: null,
            BigBombSprite: null,
            HorizontalSprite: null,
            VerticalSprite: null,
            ExplosiveSprite: null,
            TransformBlockSprite: null,
            HighlightMaterial: null,
            HighlightColor: null,
            HighlightPulseSpeed: 0,
            HighlightIntensityRange: null,
            HighlightPower: 0,
            _blockData: null,
            _config: null,
            _isAnimating: false,
            _highlightCoroutine: null,
            _originalMaterial: null,
            _highlightMaterialInstance: null
        },
        ctors: {
            init: function () {
                this.HighlightColor = new UnityEngine.Color();
                this.HighlightIntensityRange = new UnityEngine.Vector2();
                this.HighlightColor = new pc.Color( 1.0, 1.0, 0.5, 0.5 );
                this.HighlightPulseSpeed = 2.0;
                this.HighlightIntensityRange = new pc.Vec2( 0.3, 1.0 );
                this.HighlightPower = 2.0;
                this._isAnimating = false;
            }
        },
        methods: {
            /*JewelBlockController.Initialize start.*/
            /**
             * 初始化宝石块
             *
             * @instance
             * @public
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @param   {JewelBlockData}      blockData     
             * @param   {JewelBoardConfig}    config        
             * @param   {number}              cellWidth     
             * @param   {number}              cellHeight
             * @return  {void}
             */
            Initialize: function (blockData, config, cellWidth, cellHeight) {
                this._blockData = blockData;
                this._config = config;

                if (UnityEngine.Component.op_Equality(this.RectTransform, null)) {
                    this.RectTransform = this.GetComponent(UnityEngine.RectTransform);
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.BlockImage, null)) {
                    this.BlockImage = this.GetComponent(UnityEngine.UI.Image);
                }

                // 设置尺寸（宽度 = 单元格宽度 × 块宽度，高度 = 单元格高度，确保是正方形单元格）
                this.RectTransform.sizeDelta = new pc.Vec2( cellWidth * blockData.Width, cellHeight );

                // 设置贴图
                this.UpdateSprite();

                // 初始化特效播放器（初始时隐藏）
                if (UnityEngine.MonoBehaviour.op_Inequality(this.LanseEffectPlayer, null) && UnityEngine.GameObject.op_Inequality(this.LanseEffectPlayer.gameObject, null)) {
                    this.LanseEffectPlayer.gameObject.SetActive(false);
                    this.LanseEffectPlayer.AutoPlay = false; // 不自动播放
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.FenseEffectPlayer, null) && UnityEngine.GameObject.op_Inequality(this.FenseEffectPlayer.gameObject, null)) {
                    this.FenseEffectPlayer.gameObject.SetActive(false);
                    this.FenseEffectPlayer.AutoPlay = false; // 不自动播放
                }

                // 保存原始材质
                if (UnityEngine.MonoBehaviour.op_Inequality(this.BlockImage, null)) {
                    this._originalMaterial = this.BlockImage.material;

                    // 如果是道具块（但不是钻石块和转换块），应用高亮Shader
                    if (this._blockData != null && this._blockData.IsItem() && !this._blockData.IsDiamond() && !this._blockData.IsTransformBlock()) {
                        this.SetupHighlightMaterial();
                        this.StartHighlightEffect();
                    }
                }
            },
            /*JewelBlockController.Initialize end.*/

            /*JewelBlockController.UpdateSprite start.*/
            /**
             * 更新贴图
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {void}
             */
            UpdateSprite: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this.BlockImage, null) || this._blockData == null) {
                    return;
                }

                // 如果是道具，使用道具贴图
                if (this._blockData.IsItem()) {
                    var itemSprite = this.GetItemSprite(this._blockData.Color);
                    if (itemSprite != null) {
                        this.BlockImage.sprite = itemSprite;
                    }
                } else {
                    // 普通宝石块
                    var sprites = this.GetSpriteArray(this._blockData.Color);
                    var spriteIndex = (this._blockData.Width - 1) | 0;

                    if (sprites != null && spriteIndex >= 0 && spriteIndex < sprites.length) {
                        this.BlockImage.sprite = sprites[spriteIndex];
                    }
                }
            },
            /*JewelBlockController.UpdateSprite end.*/

            /*JewelBlockController.GetSpriteArray start.*/
            /**
             * 根据颜色获取贴图数组
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @param   {JewelColor}                    color
             * @return  {Array.<UnityEngine.Sprite>}
             */
            GetSpriteArray: function (color) {
                switch (color) {
                    case JewelColor.Blue: 
                        return this.BlueSprites;
                    case JewelColor.Pink: 
                        return this.PinkSprites;
                    default: 
                        return this.BlueSprites;
                }
            },
            /*JewelBlockController.GetSpriteArray end.*/

            /*JewelBlockController.GetItemSprite start.*/
            /**
             * 获取道具贴图
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @param   {JewelColor}            color
             * @return  {UnityEngine.Sprite}
             */
            GetItemSprite: function (color) {
                switch (color) {
                    case JewelColor.Diamond: 
                        return this.DiamondSprite;
                    case JewelColor.BigBomb: 
                        return this.BigBombSprite;
                    case JewelColor.Horizontal: 
                        return this.HorizontalSprite;
                    case JewelColor.Vertical: 
                        return this.VerticalSprite;
                    case JewelColor.Explosive: 
                        return this.ExplosiveSprite;
                    case JewelColor.TransformBlock: 
                        return this.TransformBlockSprite != null ? this.TransformBlockSprite : this.BlueSprites[0];
                    default: 
                        return null;
                }
            },
            /*JewelBlockController.GetItemSprite end.*/

            /*JewelBlockController.UpdatePosition start.*/
            /**
             * 更新位置
             *
             * @instance
             * @public
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @param   {number}    cellWidth        
             * @param   {number}    cellHeight       
             * @param   {number}    boardWidth       
             * @param   {number}    boardHeight      
             * @param   {number}    bottomOffsetY
             * @return  {void}
             */
            UpdatePosition: function (cellWidth, cellHeight, boardWidth, boardHeight, bottomOffsetY) {
                if (bottomOffsetY === void 0) { bottomOffsetY = 0.0; }
                if (UnityEngine.Component.op_Equality(this.RectTransform, null)) {
                    return;
                }

                // X坐标：从中心点计算
                var x = (cellWidth * this._blockData.X) + (cellWidth * this._blockData.Width / 2.0) - (boardWidth / 2.0);

                // Y坐标：从底部开始计算（Y=0对应最底一行）
                // bottomOffsetY是最底一行（Y=0）的y坐标偏移量
                var y = bottomOffsetY + (cellHeight * this._blockData.Y) + (cellHeight / 2.0);

                this.RectTransform.anchoredPosition = new pc.Vec2( x, y );

                // 同步更新特效播放器的位置（如果存在）
                var position = new pc.Vec2( x, y );
                if (UnityEngine.MonoBehaviour.op_Inequality(this.LanseEffectPlayer, null) && UnityEngine.Component.op_Inequality(this.LanseEffectPlayer.GetComponent(UnityEngine.RectTransform), null)) {
                    this.LanseEffectPlayer.GetComponent(UnityEngine.RectTransform).anchoredPosition = position.$clone();
                }
                if (UnityEngine.MonoBehaviour.op_Inequality(this.FenseEffectPlayer, null) && UnityEngine.Component.op_Inequality(this.FenseEffectPlayer.GetComponent(UnityEngine.RectTransform), null)) {
                    this.FenseEffectPlayer.GetComponent(UnityEngine.RectTransform).anchoredPosition = position.$clone();
                }
            },
            /*JewelBlockController.UpdatePosition end.*/

            /*JewelBlockController.PlayClearAnimation start.*/
            /**
             * 播放消除动画
             *
             * @instance
             * @public
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {void}
             */
            PlayClearAnimation: function () {
                // 停止高亮效果
                this.StopHighlightEffect();

                // 如果是钻石块，播放收集动画
                if (this._blockData != null && this._blockData.IsDiamond()) {
                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] \u5f00\u59cb\u64ad\u653e\u52a8\u753b\uff0c\u5757ID: {0}", [Bridge.box(this._blockData.Id, System.Int32)]));
                    this._isAnimating = true;
                    this.StartCoroutine$1(this.DiamondCollectAnimationCoroutine());
                } else if (this._blockData != null && !this._blockData.IsItem()) {
                    // 普通宝石块，播放序列帧特效
                    this._isAnimating = true;
                    this.StartCoroutine$1(this.PlaySequenceFrameEffectCoroutine());
                } else {
                    // 其他道具块，使用普通消除动画
                    this.StartCoroutine$1(this.ClearAnimationCoroutine());
                }
            },
            /*JewelBlockController.PlayClearAnimation end.*/

            /*JewelBlockController.PlaySequenceFrameEffectCoroutine start.*/
            /**
             * 播放序列帧特效协程（根据块颜色选择对应的特效）
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {System.Collections.IEnumerator}
             */
            PlaySequenceFrameEffectCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    effectPlayer,
                    $t,
                    effectRectTransform,
                    originalLoop,
                    totalFrames,
                    frameRate,
                    totalDuration,
                    elapsed,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (this._blockData == null) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    this._isAnimating = false;
                                        return false;
                                    $step = 2;
                                    continue;
                                }
                                case 2: {
                                    effectPlayer = null;

                                        // 根据块颜色选择对应的特效播放器
                                        $t = this._blockData.Color;
                                        if ($t === JewelColor.Blue) {
                                            $step = 3;
                                            continue;
                                        }
                                        else if ($t === JewelColor.Pink) {
                                            $step = 4;
                                            continue;
                                        }
                                        else  {
                                            $step = 5;
                                            continue;
                                        }
                                    $step = 6;
                                    continue;
                                }
                                case 3: {
                                    effectPlayer = this.LanseEffectPlayer;
                                        $step = 6;
                                        continue;
                                }
                                case 4: {
                                    effectPlayer = this.FenseEffectPlayer;
                                        $step = 6;
                                        continue;
                                }
                                case 5: {
                                    this.StartCoroutine$1(this.ClearAnimationCoroutine());
                                        return false;
                                }
                                case 6: {
                                    // 如果没有对应的特效播放器，使用普通动画
                                        if (UnityEngine.MonoBehaviour.op_Equality(effectPlayer, null)) {
                                            $step = 7;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 7: {
                                    UnityEngine.Debug.LogWarning$1(System.String.format("[JewelBlockController] \u672a\u627e\u5230\u5bf9\u5e94\u7684\u7279\u6548\u64ad\u653e\u5668\uff0c\u989c\u8272: {0}\uff0c\u4f7f\u7528\u666e\u901a\u6d88\u9664\u52a8\u753b", [Bridge.box(this._blockData.Color, JewelColor, System.Enum.toStringFn(JewelColor))]));
                                        this.StartCoroutine$1(this.ClearAnimationCoroutine());
                                        return false;
                                    $step = 8;
                                    continue;
                                }
                                case 8: {
                                    // 隐藏原始图片
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.BlockImage, null)) {
                                            this.BlockImage.enabled = false;
                                        }

                                        // 获取特效播放器的RectTransform
                                        effectRectTransform = effectPlayer.GetComponent(UnityEngine.RectTransform);
                                        if (UnityEngine.Component.op_Equality(effectRectTransform, null)) {
                                            $step = 9;
                                            continue;
                                        } 
                                        $step = 10;
                                        continue;
                                }
                                case 9: {
                                    UnityEngine.Debug.LogWarning$1(System.String.format("[JewelBlockController] \u7279\u6548\u64ad\u653e\u5668\u6ca1\u6709RectTransform\u7ec4\u4ef6", null));
                                        this.StartCoroutine$1(this.ClearAnimationCoroutine());
                                        return false;
                                    $step = 10;
                                    continue;
                                }
                                case 10: {
                                    // 确保特效播放器的GameObject激活
                                        effectPlayer.gameObject.SetActive(true);

                                        // 设置特效位置和父级（确保在正确的层级）
                                        if (UnityEngine.Component.op_Inequality(this.RectTransform, null)) {
                                            // 设置位置（相对于父级）
                                            effectRectTransform.anchoredPosition = this.RectTransform.anchoredPosition.$clone();

                                            // 确保特效播放器与块在同一父级下
                                            if (UnityEngine.Component.op_Inequality(effectRectTransform.parent, this.RectTransform.parent)) {
                                                effectRectTransform.SetParent(this.RectTransform.parent, false);
                                            }
                                        }

                                        // 禁用循环播放（确保只播放一次）
                                        originalLoop = effectPlayer.Loop;
                                        effectPlayer.Loop = false;

                                        // 播放特效
                                        effectPlayer.Play();

                                        UnityEngine.Debug.Log$1(System.String.format("[JewelBlockController] \u5f00\u59cb\u64ad\u653e\u5e8f\u5217\u5e27\u7279\u6548\uff0c\u5757\u989c\u8272: {0}\uff0c\u5757ID: {1}", Bridge.box(this._blockData.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(this._blockData.Id, System.Int32)));

                                        // 等待特效播放完成（通过轮询检查播放状态）
                                        totalFrames = effectPlayer.GetTotalFrames();
                                        frameRate = effectPlayer.FrameRate;
                                        totalDuration = (totalFrames / frameRate) + 0.1; // 添加一点缓冲时间

                                        elapsed = 0.0;
                                    $step = 11;
                                    continue;
                                }
                                case 11: {
                                    if ( elapsed < totalDuration && UnityEngine.MonoBehaviour.op_Inequality(this, null) && UnityEngine.MonoBehaviour.op_Inequality(effectPlayer, null) ) {
                                            $step = 12;
                                            continue;
                                        } 
                                        $step = 14;
                                        continue;
                                }
                                case 12: {
                                    elapsed += UnityEngine.Time.deltaTime;

                                        // 检查是否还在播放
                                        if (!effectPlayer.IsPlaying() && !effectPlayer.gameObject.activeSelf) {
                                            $step = 14;
                                            continue;
                                        }

                                        $enumerator.current = null;
                                        $step = 13;
                                        return true;
                                }
                                case 13: {
                                    
                                        $step = 11;
                                        continue;
                                }
                                case 14: {
                                    // 恢复原始循环设置
                                        if (UnityEngine.MonoBehaviour.op_Inequality(effectPlayer, null)) {
                                            effectPlayer.Loop = originalLoop;
                                        }

                                        // 隐藏特效播放器
                                        if (UnityEngine.MonoBehaviour.op_Inequality(effectPlayer, null) && UnityEngine.GameObject.op_Inequality(effectPlayer.gameObject, null)) {
                                            effectPlayer.gameObject.SetActive(false);
                                        }

                                        // 标记动画完成
                                        this._isAnimating = false;

                                        // 隐藏块本身
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this, null) && UnityEngine.GameObject.op_Inequality(this.gameObject, null)) {
                                            this.gameObject.SetActive(false);
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBlockController.PlaySequenceFrameEffectCoroutine end.*/

            /*JewelBlockController.IsAnimating start.*/
            /**
             * 检查是否正在播放动画
             *
             * @instance
             * @public
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {boolean}
             */
            IsAnimating: function () {
                return this._isAnimating;
            },
            /*JewelBlockController.IsAnimating end.*/

            /*JewelBlockController.DiamondCollectAnimationCoroutine start.*/
            /**
             * 钻石收集动画协程（旋转+移动到目标位置）
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {System.Collections.IEnumerator}
             */
            DiamondCollectAnimationCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    duration,
                    elapsed,
                    rectTransform,
                    startWorldPosition,
                    targetRect,
                    targetWorldPosition,
                    startRotation,
                    targetRotation,
                    startScale,
                    targetScale,
                    t,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (UnityEngine.MonoBehaviour.op_Equality(JewelGameManager.Instance, null) || UnityEngine.Component.op_Equality(JewelGameManager.Instance.DiamondTargetTransform, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 3;
                                        continue;
                                }
                                case 1: {
                                    // 如果没有目标位置，使用普通消除动画
                                        $enumerator.current = this.StartCoroutine$1(this.ClearAnimationCoroutine());
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    return false;
                                }
                                case 3: {
                                    duration = 1.0; // 动画时长（1秒，更快）
                                        elapsed = 0.0;

                                        // 获取起始和目标位置（使用世界坐标）
                                        rectTransform = this.GetComponent(UnityEngine.RectTransform);
                                        startWorldPosition = rectTransform.position.$clone();

                                        // 获取目标位置（使用世界坐标）
                                        targetRect = JewelGameManager.Instance.DiamondTargetTransform;
                                        targetWorldPosition = targetRect.position.$clone();

                                        UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] \u8d77\u59cb\u4e16\u754c\u5750\u6807: {0}, \u76ee\u6807\u4e16\u754c\u5750\u6807: {1}", startWorldPosition.$clone(), targetWorldPosition.$clone()));

                                        startRotation = this.transform.localEulerAngles.$clone();
                                        targetRotation = startRotation.$clone().add( new pc.Vec3( 0, 0, 720.0 ) ); // 旋转2圈

                                        startScale = this.transform.localScale.$clone();
                                        targetScale = new pc.Vec3( 1, 1, 1 ); // 保持原始大小，不缩小
                                    $step = 4;
                                    continue;
                                }
                                case 4: {
                                    if ( elapsed < duration ) {
                                            $step = 5;
                                            continue;
                                        } 
                                        $step = 7;
                                        continue;
                                }
                                case 5: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / duration;

                                        // 使用缓动曲线（ease-in-out，让动画更平滑）
                                        t = t * t * (3.0 - 2.0 * t); // Smoothstep

                                        // 位置插值（使用世界坐标）
                                        rectTransform.position = new pc.Vec3().lerp( startWorldPosition, targetWorldPosition, t );

                                        // 旋转插值
                                        this.transform.localEulerAngles = new pc.Vec3().lerp( startRotation, targetRotation, t );

                                        // 缩放插值
                                        this.transform.localScale = new pc.Vec3().lerp( startScale, targetScale, t );

                                        $enumerator.current = null;
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    
                                        $step = 4;
                                        continue;
                                }
                                case 7: {
                                    // 确保最终位置准确（使用世界坐标）
                                        rectTransform.position = targetWorldPosition.$clone();
                                        this.transform.localEulerAngles = targetRotation.$clone();
                                        this.transform.localScale = targetScale.$clone();

                                        UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] \u52a8\u753b\u5b8c\u6210\uff0c\u5757ID: {0}", [Bridge.box(this._blockData.Id, System.Int32)]));

                                        // 标记动画完成
                                        this._isAnimating = false;

                                        // 不隐藏对象，让BoardManager来销毁（隐藏会导致协程可能中断）
                                        // gameObject.SetActive(false);

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBlockController.DiamondCollectAnimationCoroutine end.*/

            /*JewelBlockController.ClearAnimationCoroutine start.*/
            /**
             * 消除动画协程
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {System.Collections.IEnumerator}
             */
            ClearAnimationCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    duration,
                    elapsed,
                    startScale,
                    startColor,
                    t,
                    color,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    duration = 0.4;
                                        elapsed = 0.0;
                                        startScale = this.transform.localScale.$clone();
                                        startColor = UnityEngine.MonoBehaviour.op_Inequality(this.BlockImage, null) ? this.BlockImage.color.$clone() : new pc.Color( 1, 1, 1, 1 );
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( elapsed < duration ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / duration;

                                        // 缩放动画
                                        this.transform.localScale = new pc.Vec3().lerp( startScale, pc.Vec3.ZERO.clone(), t );

                                        // 淡出动画
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.BlockImage, null)) {
                                            color = startColor.$clone();
                                            color.a = pc.math.lerp(startColor.a, 0.0, t);
                                            this.BlockImage.color = color.$clone();
                                        }

                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {
                                    this.gameObject.SetActive(false);

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBlockController.ClearAnimationCoroutine end.*/

            /*JewelBlockController.GetBlockData start.*/
            /**
             * 获取块数据
             *
             * @instance
             * @public
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {JewelBlockData}
             */
            GetBlockData: function () {
                return this._blockData;
            },
            /*JewelBlockController.GetBlockData end.*/

            /*JewelBlockController.SetupHighlightMaterial start.*/
            /**
             * 设置高亮材质
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {void}
             */
            SetupHighlightMaterial: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this.BlockImage, null)) {
                    return;
                }

                // 如果没有指定材质，尝试加载Shader
                if (this.HighlightMaterial == null) {
                    var highlightShader = UnityEngine.Shader.Find("UI/JewelHighlight");
                    if (highlightShader != null) {
                        this.HighlightMaterial = new UnityEngine.Material.$ctor2(highlightShader);
                    } else {
                        UnityEngine.Debug.LogWarning$1("[JewelBlockController] \u627e\u4e0d\u5230UI/JewelHighlight Shader\uff0c\u9ad8\u4eae\u6548\u679c\u5c06\u4e0d\u53ef\u7528");
                        return;
                    }
                }

                // 创建材质实例（避免修改原始材质）
                this._highlightMaterialInstance = new UnityEngine.Material.$ctor1(this.HighlightMaterial);

                // 设置Shader参数
                this._highlightMaterialInstance.SetColor$1("_HighlightColor", this.HighlightColor);
                this._highlightMaterialInstance.SetFloat$1("_HighlightPower", this.HighlightPower);

                // 应用材质到Image
                this.BlockImage.material = this._highlightMaterialInstance;
            },
            /*JewelBlockController.SetupHighlightMaterial end.*/

            /*JewelBlockController.StartHighlightEffect start.*/
            /**
             * 启动高亮效果
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {void}
             */
            StartHighlightEffect: function () {
                if (this._highlightCoroutine != null) {
                    this.StopCoroutine$2(this._highlightCoroutine);
                }
                this._highlightCoroutine = this.StartCoroutine$1(this.HighlightPulseCoroutine());
            },
            /*JewelBlockController.StartHighlightEffect end.*/

            /*JewelBlockController.StopHighlightEffect start.*/
            /**
             * 停止高亮效果
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {void}
             */
            StopHighlightEffect: function () {
                if (this._highlightCoroutine != null) {
                    this.StopCoroutine$2(this._highlightCoroutine);
                    this._highlightCoroutine = null;
                }

                // 恢复原始材质
                if (UnityEngine.MonoBehaviour.op_Inequality(this.BlockImage, null)) {
                    this.BlockImage.material = this._originalMaterial;
                }

                // 清理材质实例
                if (this._highlightMaterialInstance != null) {
                    UnityEngine.Object.Destroy(this._highlightMaterialInstance);
                    this._highlightMaterialInstance = null;
                }
            },
            /*JewelBlockController.StopHighlightEffect end.*/

            /*JewelBlockController.HighlightPulseCoroutine start.*/
            /**
             * 高亮脉冲动画协程
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {System.Collections.IEnumerator}
             */
            HighlightPulseCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    time,
                    pulseValue,
                    intensity,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (this._highlightMaterialInstance == null) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    time = 0.0;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( true ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 6;
                                        continue;
                                }
                                case 4: {
                                    time += UnityEngine.Time.deltaTime;

                                        // 计算脉冲强度（使用正弦波）
                                        pulseValue = (Math.sin(time * this.HighlightPulseSpeed * 2.0 * UnityEngine.Mathf.PI) + 1.0) * 0.5; // 0到1之间
                                        intensity = pc.math.lerp(this.HighlightIntensityRange.x, this.HighlightIntensityRange.y, pulseValue);

                                        // 更新Shader的高亮强度参数
                                        if (this._highlightMaterialInstance != null) {
                                            this._highlightMaterialInstance.SetFloat$1("_HighlightIntensity", intensity);
                                        }

                                        $enumerator.current = null;
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 6: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBlockController.HighlightPulseCoroutine end.*/

            /*JewelBlockController.OnDestroy start.*/
            /**
             * 当对象被销毁时清理
             *
             * @instance
             * @private
             * @this JewelBlockController
             * @memberof JewelBlockController
             * @return  {void}
             */
            OnDestroy: function () {
                this.StopHighlightEffect();
            },
            /*JewelBlockController.OnDestroy end.*/


        }
    });
    /*JewelBlockController end.*/

    /*JewelBlockData start.*/
    /**
     * 宝石块数据类
     *
     * @public
     * @class JewelBlockData
     */
    Bridge.define("JewelBlockData", {
        fields: {
            Id: 0,
            X: 0,
            Y: 0,
            Width: 0,
            Color: 0,
            BlockObject: null
        },
        ctors: {
            ctor: function (id, x, y, width, color) {
                this.$initialize();
                this.Id = id;
                this.X = x;
                this.Y = y;
                this.Width = width;
                this.Color = color;
            }
        },
        methods: {
            /*JewelBlockData.OverlapsWith start.*/
            /**
             * 检查两个块是否重叠
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @param   {JewelBlockData}    other
             * @return  {boolean}
             */
            OverlapsWith: function (other) {
                if (this.Y !== other.Y) {
                    return false;
                }
                return this.X < ((other.X + other.Width) | 0) && ((this.X + this.Width) | 0) > other.X;
            },
            /*JewelBlockData.OverlapsWith end.*/

            /*JewelBlockData.HasSupport start.*/
            /**
             * 检查是否有支撑（下方有块支撑）
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @param   {System.Collections.Generic.List$1}    allBlocks
             * @return  {boolean}
             */
            HasSupport: function (allBlocks) {
                var $t;
                if (this.Y === 0) {
                    return true;
                }

                $t = Bridge.getEnumerator(allBlocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        if (block.Y === ((this.Y - 1) | 0)) {
                            if (this.X < ((block.X + block.Width) | 0) && ((this.X + this.Width) | 0) > block.X) {
                                return true;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                return false;
            },
            /*JewelBlockData.HasSupport end.*/

            /*JewelBlockData.IsItem start.*/
            /**
             * 判断是否是道具块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsItem: function () {
                return this.Color >= JewelColor.Diamond;
            },
            /*JewelBlockData.IsItem end.*/

            /*JewelBlockData.IsDiamond start.*/
            /**
             * 判断是否是钻石块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsDiamond: function () {
                return this.Color === JewelColor.Diamond;
            },
            /*JewelBlockData.IsDiamond end.*/

            /*JewelBlockData.IsHorizontal start.*/
            /**
             * 判断是否是横块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsHorizontal: function () {
                return this.Color === JewelColor.Horizontal;
            },
            /*JewelBlockData.IsHorizontal end.*/

            /*JewelBlockData.IsVertical start.*/
            /**
             * 判断是否是竖块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsVertical: function () {
                return this.Color === JewelColor.Vertical;
            },
            /*JewelBlockData.IsVertical end.*/

            /*JewelBlockData.IsExplosive start.*/
            /**
             * 判断是否是炸块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsExplosive: function () {
                return this.Color === JewelColor.Explosive;
            },
            /*JewelBlockData.IsExplosive end.*/

            /*JewelBlockData.IsBigBomb start.*/
            /**
             * 判断是否是大炸弹块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsBigBomb: function () {
                return this.Color === JewelColor.BigBomb;
            },
            /*JewelBlockData.IsBigBomb end.*/

            /*JewelBlockData.IsTransformBlock start.*/
            /**
             * 判断是否是转换块
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsTransformBlock: function () {
                return this.Color === JewelColor.TransformBlock;
            },
            /*JewelBlockData.IsTransformBlock end.*/

            /*JewelBlockData.IsNonDiamondItem start.*/
            /**
             * 判断是否是非钻石的道具块（可以上下移动，不算入消除宽度）
             包括：BigBomb, Horizontal, Vertical, Explosive, TransformBlock
             *
             * @instance
             * @public
             * @this JewelBlockData
             * @memberof JewelBlockData
             * @return  {boolean}
             */
            IsNonDiamondItem: function () {
                // 明确列出所有可垂直移动的道具块类型，确保 BigBomb 可以垂直移动
                return this.IsBigBomb() || this.IsHorizontal() || this.IsVertical() || this.IsExplosive() || this.IsTransformBlock();
            },
            /*JewelBlockData.IsNonDiamondItem end.*/


        }
    });
    /*JewelBlockData end.*/

    /*JewelBoardConfig start.*/
    /**
     * 游戏板配置类（可配置尺寸）
     *
     * @public
     * @class JewelBoardConfig
     * @augments UnityEngine.ScriptableObject
     */
    Bridge.define("JewelBoardConfig", {
        inherits: [UnityEngine.ScriptableObject],
        fields: {
            Columns: 0,
            Rows: 0,
            MinBlockWidth: 0,
            MaxBlockWidth: 0,
            InitialRows: 0,
            RequiredColumnsForClear: 0,
            GameOverRow: 0,
            MaxMoves: 0,
            TargetScore: 0,
            GravityFallTime: 0,
            RowRiseTime: 0,
            ClearAnimationTime: 0,
            ItemSpawnChance: 0,
            EnableItems: false,
            DiamondWeight: 0,
            BigBombWeight: 0,
            HorizontalWeight: 0,
            VerticalWeight: 0,
            ExplosiveWeight: 0
        },
        ctors: {
            init: function () {
                this.Columns = 12;
                this.Rows = 16;
                this.MinBlockWidth = 1;
                this.MaxBlockWidth = 4;
                this.InitialRows = 4;
                this.RequiredColumnsForClear = 12;
                this.GameOverRow = 15;
                this.MaxMoves = 0;
                this.TargetScore = 0;
                this.GravityFallTime = 0.2;
                this.RowRiseTime = 0.3;
                this.ClearAnimationTime = 0.4;
                this.ItemSpawnChance = 0.3;
                this.EnableItems = true;
                this.DiamondWeight = 20;
                this.BigBombWeight = 20;
                this.HorizontalWeight = 20;
                this.VerticalWeight = 20;
                this.ExplosiveWeight = 20;
            }
        },
        methods: {
            /*JewelBoardConfig.GetGameOverRow start.*/
            /**
             * 获取游戏结束行数（使用配置的行数）
             *
             * @instance
             * @public
             * @this JewelBoardConfig
             * @memberof JewelBoardConfig
             * @return  {number}
             */
            GetGameOverRow: function () {
                return ((this.Rows - 1) | 0); // 使用配置的行数减1作为游戏结束行
            },
            /*JewelBoardConfig.GetGameOverRow end.*/

            /*JewelBoardConfig.Validate start.*/
            /**
             * 验证配置有效性
             *
             * @instance
             * @public
             * @this JewelBoardConfig
             * @memberof JewelBoardConfig
             * @return  {boolean}
             */
            Validate: function () {
                if (this.Columns < 1 || this.Rows < 1) {
                    UnityEngine.Debug.LogError$2("\u6e38\u620f\u677f\u5c3a\u5bf8\u5fc5\u987b\u5927\u4e8e0");
                    return false;
                }

                if (this.MinBlockWidth < 1 || this.MaxBlockWidth < this.MinBlockWidth) {
                    UnityEngine.Debug.LogError$2("\u5b9d\u77f3\u5bbd\u5ea6\u914d\u7f6e\u65e0\u6548");
                    return false;
                }

                if (this.MaxBlockWidth > this.Columns) {
                    UnityEngine.Debug.LogError$2("\u6700\u5927\u5b9d\u77f3\u5bbd\u5ea6\u4e0d\u80fd\u8d85\u8fc7\u5217\u6570");
                    return false;
                }

                if (this.RequiredColumnsForClear > this.Columns) {
                    UnityEngine.Debug.LogError$2("\u6d88\u9664\u6240\u9700\u5217\u6570\u4e0d\u80fd\u8d85\u8fc7\u603b\u5217\u6570");
                    return false;
                }

                return true;
            },
            /*JewelBoardConfig.Validate end.*/


        }
    });
    /*JewelBoardConfig end.*/

    /*JewelBoardManager start.*/
    /**
     * 游戏板管理器（核心逻辑：重力、消除、生成）
     *
     * @public
     * @class JewelBoardManager
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("JewelBoardManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                _isFirstLevel: false
            },
            ctors: {
                init: function () {
                    this._isFirstLevel = true;
                }
            }
        },
        fields: {
            Config: null,
            LevelData: null,
            BlockPrefab: null,
            BoardContainer: null,
            Raycaster: null,
            BottomRowY: 0,
            _blocks: null,
            _nextRowData: null,
            _blockIdCounter: 0,
            _isProcessing: false,
            _moveCount: 0,
            _firstLevelMoveCount: 0,
            _isCurrentlyFirstLevel: false,
            _hasSpawnedStep5BigBomb: false,
            _pendingStep5BigBombSpawn: false,
            _cellWidth: 0,
            _cellHeight: 0,
            _boardWidth: 0,
            _boardHeight: 0,
            _bottomOffsetY: 0,
            _inputHandler: null,
            OnRowCleared: null,
            OnCombo: null,
            OnGameOver: null,
            OnMoveMade: null,
            OnItemSpawned: null,
            OnDiamondCountChanged: null,
            ItemSpawnChance: 0
        },
        props: {
            IsProcessing: {
                get: function () {
                    return this._isProcessing;
                }
            }
        },
        ctors: {
            init: function () {
                this.BottomRowY = -694.0;
                this._blocks = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                this._nextRowData = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                this._blockIdCounter = 0;
                this._isProcessing = false;
                this._moveCount = 0;
                this._firstLevelMoveCount = 0;
                this._isCurrentlyFirstLevel = true;
                this._hasSpawnedStep5BigBomb = false;
                this._pendingStep5BigBombSpawn = false;
                this.ItemSpawnChance = 0.0;
            }
        },
        methods: {
            /*JewelBoardManager.GetCellWidth start.*/
            GetCellWidth: function () {
                return this._cellWidth;
            },
            /*JewelBoardManager.GetCellWidth end.*/

            /*JewelBoardManager.GetCellHeight start.*/
            GetCellHeight: function () {
                return this._cellHeight;
            },
            /*JewelBoardManager.GetCellHeight end.*/

            /*JewelBoardManager.GetBoardWidth start.*/
            GetBoardWidth: function () {
                return this._boardWidth;
            },
            /*JewelBoardManager.GetBoardWidth end.*/

            /*JewelBoardManager.GetBottomOffsetY start.*/
            GetBottomOffsetY: function () {
                return this._bottomOffsetY;
            },
            /*JewelBoardManager.GetBottomOffsetY end.*/

            /*JewelBoardManager.Awake start.*/
            Awake: function () {
                if (this.Config == null) {
                    UnityEngine.Debug.LogError$2("JewelBoardConfig\u672a\u8bbe\u7f6e\uff01");
                    return;
                }

                if (!this.Config.Validate()) {
                    UnityEngine.Debug.LogError$2("\u6e38\u620f\u677f\u914d\u7f6e\u65e0\u6548\uff01");
                    return;
                }

                this.CalculateBoardMetrics();
            },
            /*JewelBoardManager.Awake end.*/

            /*JewelBoardManager.Start start.*/
            Start: function () {
                this.InitializeInputHandler();
                this.InitializeGame();
            },
            /*JewelBoardManager.Start end.*/

            /*JewelBoardManager.CalculateBoardMetrics start.*/
            /**
             * 计算游戏板尺寸（确保单元格是正方形）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            CalculateBoardMetrics: function () {
                if (UnityEngine.Component.op_Equality(this.BoardContainer, null)) {
                    return;
                }

                this._boardWidth = this.BoardContainer.rect.width;
                this._boardHeight = this.BoardContainer.rect.height;

                // 计算基于宽度和高度的单元格尺寸
                var cellSizeByWidth = this._boardWidth / this.Config.Columns;
                var cellSizeByHeight = this._boardHeight / this.Config.Rows;

                // 取较小值，确保单元格是正方形且能完整显示
                var cellSize = UnityEngine.Mathf.Min(cellSizeByWidth, cellSizeByHeight);

                // 使用统一的单元格尺寸（正方形）
                this._cellWidth = cellSize;
                this._cellHeight = cellSize;

                // 重新计算实际使用的游戏板尺寸（基于正方形单元格）
                this._boardWidth = this._cellWidth * this.Config.Columns;
                this._boardHeight = this._cellHeight * this.Config.Rows;

                // 计算底部偏移量（最底一行Y=0的y坐标）
                // 如果指定了BottomRowY，直接使用该值；否则自动计算
                if (this.BottomRowY !== 0.0) {
                    // 使用指定的底部Y坐标
                    // 在UpdatePosition中：y = bottomOffsetY + (cellHeight * Y) + (cellHeight / 2f)
                    // 当Y=0时，y = bottomOffsetY + cellHeight/2 = BottomRowY
                    // 所以：bottomOffsetY = BottomRowY - cellHeight/2
                    this._bottomOffsetY = this.BottomRowY - (this._cellHeight / 2.0);
                } else {
                    // 自动计算：根据容器尺寸计算
                    var containerRect = this.BoardContainer.GetComponent(UnityEngine.RectTransform);
                    if (UnityEngine.Component.op_Inequality(containerRect, null)) {
                        // 获取容器的底部位置（相对于锚点）
                        // 如果容器锚点在中心，底部是 -rect.height/2
                        var containerBottom = -containerRect.rect.height / 2.0;
                        this._bottomOffsetY = containerBottom - (this._cellHeight / 2.0);
                    } else {
                        // 默认从底部开始（如果锚点在底部，则从0开始）
                        this._bottomOffsetY = -(this._cellHeight / 2.0);
                    }
                }
            },
            /*JewelBoardManager.CalculateBoardMetrics end.*/

            /*JewelBoardManager.InitializeInputHandler start.*/
            /**
             * 初始化输入处理
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            InitializeInputHandler: function () {
                this._inputHandler = this.gameObject.AddComponent(JewelInputHandler);
                this._inputHandler.Initialize(this._cellWidth, this._cellHeight, Bridge.fn.cacheBind(this, this.OnBlockMovedHorizontal), Bridge.fn.cacheBind(this, this.OnBlockMovedVertical), Bridge.fn.cacheBind(this, this.CalculateVerticalLimitsForInputHandler), Bridge.fn.cacheBind(this, this.CanBlockMoveToPosition), Bridge.fn.cacheBind(this, this.CalculateHorizontalLimitsForInputHandler), Bridge.fn.cacheBind(this, this.GetBlockAt));
            },
            /*JewelBoardManager.InitializeInputHandler end.*/

            /*JewelBoardManager.ConvertAllTransformBlocks start.*/
            /**
             * 转换所有TransformBlock为BigBomb（在moves改变时调用，需要两次移动后才转换）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            ConvertAllTransformBlocks: function () {
                var $t;
                this._moveCount = (this._moveCount + 1) | 0;
                UnityEngine.Debug.Log$1(System.String.format("[\u8f6c\u6362\u5757] \u79fb\u52a8\u8ba1\u6570: {0}", [Bridge.box(this._moveCount, System.Int32)]));

                // 只有在第二次移动后才转换
                if (this._moveCount < 2) {
                    UnityEngine.Debug.Log$1(System.String.format("[\u8f6c\u6362\u5757] \u8fd8\u9700\u8981 {0} \u6b21\u79fb\u52a8\u624d\u4f1a\u8f6c\u6362TransformBlock\u4e3aBigBomb", [Bridge.box(((2 - this._moveCount) | 0), System.Int32)]));
                    return;
                }

                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        if (block.IsTransformBlock()) {
                            UnityEngine.Debug.Log$1(System.String.format("[\u8f6c\u6362\u5757] \u68c0\u6d4b\u5230TransformBlock\uff0c\u8f6c\u6362\u4e3aBigBomb (\u5757ID: {0}, \u4f4d\u7f6e: X={1}, Y={2})", Bridge.box(block.Id, System.Int32), Bridge.box(block.X, System.Int32), Bridge.box(block.Y, System.Int32)));
                            block.Color = JewelColor.BigBomb;

                            // 更新贴图
                            if (UnityEngine.GameObject.op_Inequality(block.BlockObject, null)) {
                                var controller = block.BlockObject.GetComponent(JewelBlockController);
                                if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                    controller.Initialize(block, this.Config, this._cellWidth, this._cellHeight);
                                    controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                                }
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                // 转换完成后重置计数器
                this._moveCount = 0;
            },
            /*JewelBoardManager.ConvertAllTransformBlocks end.*/

            /*JewelBoardManager.GetBlockAt start.*/
            /**
             * 获取指定位置的块数据
             注意：考虑块的宽度，一个块可能占据多个X坐标
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}            x    
             * @param   {number}            y
             * @return  {JewelBlockData}
             */
            GetBlockAt: function (x, y) {
                var $t;
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        // 检查块是否在指定位置（考虑块的宽度）
                        if (block.Y === y && x >= block.X && x < ((block.X + block.Width) | 0)) {
                            return block;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                return null;
            },
            /*JewelBoardManager.GetBlockAt end.*/

            /*JewelBoardManager.CalculateVerticalLimitsForInputHandler start.*/
            /**
             * 为输入处理器计算垂直拖动限制
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockController}    controller
             * @return  {System.Tuple$2}
             */
            CalculateVerticalLimitsForInputHandler: function (controller) {
                var blockData = controller.GetBlockData();
                if (blockData != null) {
                    var isNonDiamondItem = blockData.IsNonDiamondItem();
                    var isBigBomb = blockData.IsBigBomb();

                    if (isBigBomb) {
                        UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u5782\u76f4\u9650\u5236] \u8ba1\u7b97\u5782\u76f4\u62d6\u52a8\u9650\u5236\uff0cIsNonDiamondItem: {0}, IsBigBomb: {1}", Bridge.box(isNonDiamondItem, System.Boolean, System.Boolean.toString), Bridge.box(isBigBomb, System.Boolean, System.Boolean.toString)));
                    }

                    if (isNonDiamondItem) {
                        var minGrid = { }, maxGrid = { };
                        this.CalculateVerticalDragLimitsForBlock(blockData, minGrid, maxGrid);
                        if (isBigBomb) {
                            UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u5782\u76f4\u9650\u5236] \u9650\u5236\u8303\u56f4: min={0}, max={1}, \u5f53\u524dY={2}, X={3}", Bridge.box(minGrid.v, System.Int32), Bridge.box(maxGrid.v, System.Int32), Bridge.box(blockData.Y, System.Int32), Bridge.box(blockData.X, System.Int32)));
                            UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u5782\u76f4\u9650\u5236] \u5141\u8bb8\u79fb\u52a8\u8303\u56f4: Y={0} \u5230 Y={1}", Bridge.box(((blockData.Y + minGrid.v) | 0), System.Int32), Bridge.box(((blockData.Y + maxGrid.v) | 0), System.Int32)));
                        }
                        return { Item1: minGrid.v, Item2: maxGrid.v };
                    }
                }
                return { Item1: -1000, Item2: 1000 };
            },
            /*JewelBoardManager.CalculateVerticalLimitsForInputHandler end.*/

            /*JewelBoardManager.CalculateHorizontalLimitsForInputHandler start.*/
            /**
             * 为输入处理器计算水平拖动限制
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockController}    controller    
             * @param   {number}                  unused1       
             * @param   {number}                  unused2
             * @return  {void}
             */
            CalculateHorizontalLimitsForInputHandler: function (controller, unused1, unused2) {
                var blockData = controller.GetBlockData();
                if (blockData != null) {
                    var minGridDelta = { }, maxGridDelta = { };
                    this.CalculateDragLimitsForBlock(blockData, minGridDelta, maxGridDelta);

                    // 将网格单位转换为像素
                    var minPixels = Bridge.Int.mul(minGridDelta.v, Bridge.Int.clip32(this._cellWidth));
                    var maxPixels = Bridge.Int.mul(maxGridDelta.v, Bridge.Int.clip32(this._cellWidth));

                    // 设置拖动限制
                    this._inputHandler.SetDragLimitsPixels(minPixels, maxPixels);
                }
            },
            /*JewelBoardManager.CalculateHorizontalLimitsForInputHandler end.*/

            /*JewelBoardManager.ResetFirstLevel start.*/
            /**
             * 重置第一关标志（用于重试时重新加载第一关）
             *
             * @instance
             * @public
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            ResetFirstLevel: function () {
                JewelBoardManager._isFirstLevel = true;
                UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u91cd\u7f6e\u7b2c\u4e00\u5173\u6807\u5fd7\uff0c\u91cd\u8bd5\u65f6\u5c06\u91cd\u65b0\u52a0\u8f7d\u7b2c\u4e00\u5173");
            },
            /*JewelBoardManager.ResetFirstLevel end.*/

            /*JewelBoardManager.InitializeGame start.*/
            /**
             * 初始化游戏（公开方法，供外部调用）
             *
             * @instance
             * @public
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            InitializeGame: function () {
                var $t;
                // 清除现有块
                this._blocks.clear();
                this._blockIdCounter = 0;
                this._moveCount = 0; // 重置移动计数器
                this._firstLevelMoveCount = 0; // 重置第一关移动计数器
                this._hasSpawnedStep5BigBomb = false; // 重置bigbomb生成标志

                $t = Bridge.getEnumerator(this.BoardContainer);
                try {
                    while ($t.moveNext()) {
                        var child = Bridge.cast($t.Current, UnityEngine.Transform);
                        UnityEngine.MonoBehaviour.Destroy(child.gameObject);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                // 只有第一关且有关卡数据时，才使用关卡数据中的初始布局
                // 从第二关开始，都使用随机生成
                var hasLevelData = JewelBoardManager._isFirstLevel && this.LevelData != null && this.LevelData.InitialBlocks.Count > 0;

                // 记录当前是否是第一关（只要 _isFirstLevel 是 true，就是第一关，不管是否有关卡数据）
                this._isCurrentlyFirstLevel = JewelBoardManager._isFirstLevel;
                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u521d\u59cb\u5316\u6e38\u620f: _isFirstLevel={0}, hasLevelData={1}, LevelData={2}, InitialBlocks.Count={3}, _isCurrentlyFirstLevel={4}", Bridge.box(JewelBoardManager._isFirstLevel, System.Boolean, System.Boolean.toString), Bridge.box(hasLevelData, System.Boolean, System.Boolean.toString), (this.LevelData != null ? "\u5b58\u5728" : "null"), Bridge.box((this.LevelData != null ? this.LevelData.InitialBlocks.Count : 0), System.Int32), Bridge.box(this._isCurrentlyFirstLevel, System.Boolean, System.Boolean.toString)));

                if (hasLevelData) {
                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u7b2c\u4e00\u5173\uff0c\u4f7f\u7528\u5173\u5361\u6570\u636e");
                    this.LoadLevelData();
                    JewelBoardManager._isFirstLevel = false; // 标记已使用过关卡数据，之后都是随机关卡
                } else {
                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u968f\u673a\u5173\u5361\uff0c\u751f\u6210\u968f\u673a\u521d\u59cb\u884c\uff08\u586b\u6ee1\u6e38\u620f\u677f\uff0c\u5305\u542b6-7\u4e2a\u94bb\u77f3\u5757\uff09");
                    // 生成随机关卡（填满游戏板，包含6-7个钻石块）
                    this.GenerateRandomLevel();
                }

                // 稳定游戏板（让所有块下落到底部）
                // 如果加载了关卡数据，不应用重力（保持关卡设计的位置）
                // 否则应用重力让随机生成的块下落到底部
                if (!hasLevelData) {
                    this.StabilizeBoardInstant();
                }

                // 生成下一行预览
                this.GenerateNextRowData();

                // 渲染所有块
                this.RenderAllBlocks();

                // 更新钻石块计数
                this.UpdateDiamondCount();
            },
            /*JewelBoardManager.InitializeGame end.*/

            /*JewelBoardManager.LoadLevelData start.*/
            /**
             * 从关卡数据加载初始布局
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            LoadLevelData: function () {
                var $t;
                if (this.LevelData == null) {
                    return;
                }

                // 更新配置（如果关卡数据中有不同的尺寸）
                if (this.LevelData.Columns > 0 && this.LevelData.Rows > 0) {
                    this.Config.Columns = this.LevelData.Columns;
                    this.Config.Rows = this.LevelData.Rows;
                    this.CalculateBoardMetrics(); // 重新计算尺寸
                }

                // 加载所有初始块
                $t = Bridge.getEnumerator(this.LevelData.InitialBlocks);
                try {
                    while ($t.moveNext()) {
                        var blockData = $t.Current;
                        if (blockData.X >= 0 && blockData.X < this.Config.Columns && blockData.Y >= 0 && blockData.Y < this.Config.Rows) {
                            var jewelBlock = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), blockData.X, blockData.Y, blockData.Width, blockData.Color);
                            this.CreateBlock(jewelBlock);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*JewelBoardManager.LoadLevelData end.*/

            /*JewelBoardManager.SpawnRowData start.*/
            /**
             * 生成一行数据
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}    yLevel
             * @return  {void}
             */
            SpawnRowData: function (yLevel) {
                var $t;
                var rowBlocks = this.GenerateRowData(yLevel);
                $t = Bridge.getEnumerator(rowBlocks);
                try {
                    while ($t.moveNext()) {
                        var blockData = $t.Current;
                        this.CreateBlock(blockData);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*JewelBoardManager.SpawnRowData end.*/

            /*JewelBoardManager.GenerateRandomLevel start.*/
            /**
             * 生成随机关卡（包含空位，包含6-7个钻石块）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            GenerateRandomLevel: function () {
                var $t, $t1, $t2, $t3;
                // 生成所有行的块（允许留空，使用原来的生成逻辑）
                for (var y = 0; y < this.Config.Rows; y = (y + 1) | 0) {
                    var rowBlocks = this.GenerateRowData(y);
                    $t = Bridge.getEnumerator(rowBlocks);
                    try {
                        while ($t.moveNext()) {
                            var blockData = $t.Current;
                            this.CreateBlock(blockData);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                }

                // 收集所有已创建的块
                var allBlocks = new (System.Collections.Generic.List$1(JewelBlockData)).$ctor1(this._blocks);

                // 随机选择6-7个块，将它们改为钻石块
                var diamondCount = UnityEngine.Random.Range(6, 8); // 6或7个钻石块
                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u968f\u673a\u751f\u6210 {0} \u4e2a\u94bb\u77f3\u5757", [Bridge.box(diamondCount, System.Int32)]));

                // 过滤出可以转换为钻石的块（排除已经是道具的块，且宽度为1的块优先）
                var candidateBlocks = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                $t1 = Bridge.getEnumerator(allBlocks);
                try {
                    while ($t1.moveNext()) {
                        var block = $t1.Current;
                        // 只选择普通块（蓝色或粉色），且宽度为1的块
                        if (!block.IsItem() && block.Width === 1) {
                            candidateBlocks.add(block);
                        }
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$Dispose();
                    }
                }

                // 如果候选块不足，也考虑宽度大于1的块（需要拆分）
                if (candidateBlocks.Count < diamondCount) {
                    $t2 = Bridge.getEnumerator(allBlocks);
                    try {
                        while ($t2.moveNext()) {
                            var block1 = $t2.Current;
                            if (!block1.IsItem() && block1.Width > 1 && !candidateBlocks.contains(block1)) {
                                candidateBlocks.add(block1);
                            }
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$Dispose();
                        }
                    }
                }

                // 随机选择要转换为钻石的块
                if (candidateBlocks.Count > 0) {
                    // 打乱候选列表（Fisher-Yates洗牌算法）
                    for (var i = (candidateBlocks.Count - 1) | 0; i > 0; i = (i - 1) | 0) {
                        var randomIndex = UnityEngine.Random.Range(0, ((i + 1) | 0));
                        var temp = candidateBlocks.getItem(i);
                        candidateBlocks.setItem(i, candidateBlocks.getItem(randomIndex));
                        candidateBlocks.setItem(randomIndex, temp);
                    }

                    // 选择前diamondCount个块转换为钻石（但不超过候选数量）
                    var targetCount = UnityEngine.Mathf.Min(diamondCount, candidateBlocks.Count);
                    var convertedCount = 0;

                    $t3 = Bridge.getEnumerator(candidateBlocks);
                    try {
                        while ($t3.moveNext()) {
                            var block2 = $t3.Current;
                            if (convertedCount >= targetCount) {
                                break;
                            }

                            if (block2.Width === 1) {
                                // 直接转换
                                block2.Color = JewelColor.Diamond;
                                // 更新贴图
                                if (UnityEngine.GameObject.op_Inequality(block2.BlockObject, null)) {
                                    var controller = block2.BlockObject.GetComponent(JewelBlockController);
                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                        controller.Initialize(block2, this.Config, this._cellWidth, this._cellHeight);
                                        controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                                    }
                                }
                                convertedCount = (convertedCount + 1) | 0;
                            } else if (block2.Width > 1) {
                                // 宽度大于1的块，需要拆分：将第一个位置改为钻石，其余位置保持不变
                                var originalX = block2.X;
                                var originalY = block2.Y;
                                var originalWidth = block2.Width;
                                var originalColor = block2.Color;

                                // 删除原块
                                if (UnityEngine.GameObject.op_Inequality(block2.BlockObject, null)) {
                                    UnityEngine.MonoBehaviour.Destroy(block2.BlockObject);
                                }
                                this._blocks.remove(block2);

                                // 创建钻石块（1x1）
                                var diamondBlock = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), originalX, originalY, 1, JewelColor.Diamond);
                                this.CreateBlock(diamondBlock);

                                // 创建剩余部分（如果宽度>1）
                                if (originalWidth > 1) {
                                    var remainingBlock = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), ((originalX + 1) | 0), originalY, ((originalWidth - 1) | 0), originalColor);
                                    this.CreateBlock(remainingBlock);
                                }

                                convertedCount = (convertedCount + 1) | 0;
                            }
                        }
                    } finally {
                        if (Bridge.is($t3, System.IDisposable)) {
                            $t3.System$IDisposable$Dispose();
                        }
                    }

                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u6210\u529f\u751f\u6210 {0} \u4e2a\u94bb\u77f3\u5757\uff08\u76ee\u6807: {1}\uff09", Bridge.box(convertedCount, System.Int32), Bridge.box(diamondCount, System.Int32)));
                } else {
                    UnityEngine.Debug.LogWarning$1("[\u6e38\u620f\u903b\u8f91] \u6ca1\u6709\u53ef\u7528\u7684\u5019\u9009\u5757\u6765\u751f\u6210\u94bb\u77f3\u5757");
                }
            },
            /*JewelBoardManager.GenerateRandomLevel end.*/

            /*JewelBoardManager.GenerateRowDataFilled start.*/
            /**
             * 生成一行数据（算法）- 填满版本（不留空，确保有足够的宽度为1的块）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}                               yLevel
             * @return  {System.Collections.Generic.List$1}
             */
            GenerateRowDataFilled: function (yLevel) {
                if (yLevel === void 0) { yLevel = 0; }
                var rowBlocks = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                var currentX = 0;

                while (currentX < this.Config.Columns) {
                    var remainingWidth = (this.Config.Columns - currentX) | 0;
                    var maxWidth = UnityEngine.Mathf.Min(this.Config.MaxBlockWidth, remainingWidth);

                    // 如果剩余空间不足，使用剩余的所有空间
                    var width;
                    if (remainingWidth <= this.Config.MaxBlockWidth) {
                        width = remainingWidth;
                    } else {
                        // 随机宽度，但确保能填满整行
                        // 为了确保有足够的宽度为1的块用于转换为钻石，增加宽度为1的概率
                        if (UnityEngine.Random.value < 0.4 && remainingWidth > 1) {
                            // 40%概率生成宽度为1的块
                            width = 1;
                        } else {
                            width = UnityEngine.Random.Range(this.Config.MinBlockWidth, ((maxWidth + 1) | 0));
                        }

                        // 如果剩余空间刚好，使用剩余空间
                        if (((currentX + width) | 0) >= this.Config.Columns) {
                            width = remainingWidth;
                        }
                    }

                    // 随机颜色（目前只有2种：蓝色和粉色）
                    var color = UnityEngine.Random.Range(0, 2);

                    var blockData = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), currentX, yLevel, width, color);
                    rowBlocks.add(blockData);
                    currentX = (currentX + width) | 0;
                }

                return rowBlocks;
            },
            /*JewelBoardManager.GenerateRowDataFilled end.*/

            /*JewelBoardManager.GenerateRowData start.*/
            /**
             * 生成一行数据（算法）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}                               yLevel
             * @return  {System.Collections.Generic.List$1}
             */
            GenerateRowData: function (yLevel) {
                var $t;
                if (yLevel === void 0) { yLevel = 0; }
                var rowBlocks = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                var currentX = 0;

                while (currentX < this.Config.Columns) {
                    var maxWidth = UnityEngine.Mathf.Min(this.Config.MaxBlockWidth, ((this.Config.Columns - currentX) | 0));

                    // 15%概率留空
                    if (UnityEngine.Random.value < 0.15 && currentX < ((this.Config.Columns - 1) | 0)) {
                        currentX = (currentX + 1) | 0;
                        continue;
                    }

                    // 为了确保有足够的宽度为1的块可以转换为钻石，增加宽度为1的概率
                    var width;
                    if (UnityEngine.Random.value < 0.35 && maxWidth >= 1) {
                        // 35%概率生成宽度为1的块
                        width = 1;
                    } else {
                        width = UnityEngine.Random.Range(this.Config.MinBlockWidth, ((UnityEngine.Mathf.Min(3, maxWidth) + 1) | 0));
                    }

                    var existingWidth = 0;
                    $t = Bridge.getEnumerator(rowBlocks);
                    try {
                        while ($t.moveNext()) {
                            var b = $t.Current;
                            existingWidth = (existingWidth + b.Width) | 0;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }

                    if (((currentX + width) | 0) >= this.Config.Columns && ((existingWidth + width) | 0) >= this.Config.Columns) {
                        break;
                    }

                    // 随机颜色（目前只有2种：蓝色和粉色）
                    var color = UnityEngine.Random.Range(0, 2);

                    var blockData = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), currentX, yLevel, width, color);
                    rowBlocks.add(blockData);
                    currentX = (currentX + width) | 0;
                }

                return rowBlocks;
            },
            /*JewelBoardManager.GenerateRowData end.*/

            /*JewelBoardManager.CreateBlock start.*/
            /**
             * 创建块对象
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    blockData
             * @return  {void}
             */
            CreateBlock: function (blockData) {
                var blockObj = UnityEngine.Object.Instantiate(UnityEngine.GameObject, this.BlockPrefab, this.BoardContainer);

                // 确保GameObject被激活
                blockObj.SetActive(true);

                var controller = blockObj.GetComponent(JewelBlockController);

                if (UnityEngine.MonoBehaviour.op_Equality(controller, null)) {
                    controller = blockObj.AddComponent(JewelBlockController);
                }

                controller.Initialize(blockData, this.Config, this._cellWidth, this._cellHeight);
                controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);

                blockData.BlockObject = blockObj;
                this._blocks.add(blockData);

                // 如果是BigBomb，添加调试日志
                if (blockData.IsBigBomb()) {
                    UnityEngine.Debug.Log$1(System.String.format("[CreateBlock] BigBomb\u5df2\u521b\u5efa: ID={0}, X={1}, Y={2}, GameObject\u6fc0\u6d3b={3}, \u7236\u7ea7={4}", Bridge.box(blockData.Id, System.Int32), Bridge.box(blockData.X, System.Int32), Bridge.box(blockData.Y, System.Int32), Bridge.box(blockObj.activeSelf, System.Boolean, System.Boolean.toString), this.BoardContainer.name));
                }

                // 如果是钻石块，更新计数
                if (blockData.IsDiamond()) {
                    this.UpdateDiamondCount();
                }
            },
            /*JewelBoardManager.CreateBlock end.*/

            /*JewelBoardManager.StabilizeBoardInstant start.*/
            /**
             * 稳定游戏板（让所有块立即下落到底部）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            StabilizeBoardInstant: function () {
                var $t;
                var moved = true;
                while (moved) {
                    moved = false;
                    this._blocks.Sort$2(function (a, b) {
                        return Bridge.compare(a.Y, b.Y);
                    });

                    $t = Bridge.getEnumerator(this._blocks);
                    try {
                        while ($t.moveNext()) {
                            var block = $t.Current;
                            if (block.Y === 0) {
                                continue;
                            }

                            // 所有块都受重力影响（包括道具块）
                            if (!block.HasSupport(this._blocks)) {
                                block.Y = (block.Y - 1) | 0;
                                moved = true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                }
            },
            /*JewelBoardManager.StabilizeBoardInstant end.*/

            /*JewelBoardManager.RenderAllBlocks start.*/
            /**
             * 渲染所有块
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            RenderAllBlocks: function () {
                var $t;
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        if (UnityEngine.GameObject.op_Inequality(block.BlockObject, null)) {
                            var controller = block.BlockObject.GetComponent(JewelBlockController);
                            if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*JewelBoardManager.RenderAllBlocks end.*/

            /*JewelBoardManager.CanBlocksOverlap start.*/
            /**
             * 检查两个块是否可以重叠（允许道具交互，但不允许普通块重叠）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    movingBlock    
             * @param   {JewelBlockData}    targetBlock
             * @return  {boolean}
             */
            CanBlocksOverlap: function (movingBlock, targetBlock) {
                // TransformBlock 像普通块一样，不能与其他块重叠（包括其他 TransformBlock）
                // 如果目标是 TransformBlock，也不允许重叠
                if (movingBlock.IsTransformBlock() || targetBlock.IsTransformBlock()) {
                    return false; // TransformBlock 不能与其他块重叠
                }

                // 如果移动的块是横块或竖块，且目标是炸块，允许移动（用于触发交互）
                var isMovingItem = movingBlock.IsHorizontal() || movingBlock.IsVertical();
                var isTargetExplosive = targetBlock.IsExplosive();

                // 如果移动的块是炸块，且目标是横块或竖块，允许移动（用于触发交互）
                var isMovingExplosive = movingBlock.IsExplosive();
                var isTargetHorizontal = targetBlock.IsHorizontal();
                var isTargetVertical = targetBlock.IsVertical();

                // 两个BigBomb可以重叠（用于触发交互）
                var isMovingBigBomb = movingBlock.IsBigBomb();
                var isTargetBigBomb = targetBlock.IsBigBomb();

                if (isMovingBigBomb && isTargetBigBomb) {
                    UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u91cd\u53e0] \u5141\u8bb8\u4e24\u4e2aBigBomb\u91cd\u53e0\uff0c\u79fb\u52a8\u5757: ({0}, {1}), \u76ee\u6807\u5757: ({2}, {3})", Bridge.box(movingBlock.X, System.Int32), Bridge.box(movingBlock.Y, System.Int32), Bridge.box(targetBlock.X, System.Int32), Bridge.box(targetBlock.Y, System.Int32)));
                }

                // 只允许特定的道具交互重叠
                if ((isMovingItem && isTargetExplosive) || (isMovingExplosive && (isTargetHorizontal || isTargetVertical)) || (isMovingBigBomb && isTargetBigBomb)) {
                    return true; // 允许重叠用于触发交互
                }

                // 其他所有情况都不允许重叠
                return false;
            },
            /*JewelBoardManager.CanBlocksOverlap end.*/

            /*JewelBoardManager.WouldBlockOverlapAtPosition start.*/
            /**
             * 检查块在新位置是否会与其他块重叠
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    blockData           
             * @param   {number}            newX                
             * @param   {number}            newY                
             * @param   {JewelBlockData}    overlappingBlock
             * @return  {boolean}
             */
            WouldBlockOverlapAtPosition: function (blockData, newX, newY, overlappingBlock) {
                var $t;
                overlappingBlock.v = null;

                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var other = $t.Current;
                        if (other.Id === blockData.Id) {
                            continue;
                        }

                        // 检查是否在同一行（水平移动）
                        if (newY === other.Y) {
                            var wouldOverlap = newX < ((other.X + other.Width) | 0) && ((newX + blockData.Width) | 0) > other.X;
                            if (wouldOverlap) {
                                // 检查是否允许重叠（道具交互）
                                if (!this.CanBlocksOverlap(blockData, other)) {
                                    overlappingBlock.v = other;
                                    return true; // 不允许的重叠
                                }
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                return false; // 没有不允许的重叠
            },
            /*JewelBoardManager.WouldBlockOverlapAtPosition end.*/

            /*JewelBoardManager.CanBlockMoveToPosition start.*/
            /**
             * 检查块是否可以移动到指定位置（供InputHandler实时检测使用）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockController}    controller    
             * @param   {number}                  newX          
             * @param   {number}                  newY
             * @return  {boolean}
             */
            CanBlockMoveToPosition: function (controller, newX, newY) {
                var $t;
                var blockData = controller.GetBlockData();
                if (blockData == null) {
                    return false;
                }

                var isBigBomb = blockData.IsBigBomb();

                // 检查边界
                if (newX < 0 || ((newX + blockData.Width) | 0) > this.Config.Columns) {
                    if (isBigBomb) {
                        UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u79fb\u52a8\u68c0\u6d4b] \u2717 \u8d85\u51faX\u8fb9\u754c: newX={0}, Width={1}, Columns={2}", Bridge.box(newX, System.Int32), Bridge.box(blockData.Width, System.Int32), Bridge.box(this.Config.Columns, System.Int32)));
                    }
                    return false;
                }
                if (newY < 0 || newY >= this.Config.Rows) {
                    if (isBigBomb) {
                        UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u79fb\u52a8\u68c0\u6d4b] \u2717 \u8d85\u51faY\u8fb9\u754c: newY={0}, Rows={1}", Bridge.box(newY, System.Int32), Bridge.box(this.Config.Rows, System.Int32)));
                    }
                    return false;
                }

                // 检查是否会与其他块重叠
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var other = $t.Current;
                        if (other.Id === blockData.Id) {
                            continue;
                        }

                        // 对于垂直移动，检查是否在新位置（newY行）与其他块重叠
                        if (newY === other.Y) {
                            // 检查X轴是否有重叠
                            var wouldOverlap = newX < ((other.X + other.Width) | 0) && ((newX + blockData.Width) | 0) > other.X;
                            if (wouldOverlap) {
                                // 检查是否允许重叠（道具交互）
                                var canOverlap = this.CanBlocksOverlap(blockData, other);
                                if (isBigBomb) {
                                    UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u79fb\u52a8\u68c0\u6d4b] \u5728\u65b0\u4f4d\u7f6e ({0}, {1}) \u4e0e\u5757 {2} \u91cd\u53e0\uff0c\u5141\u8bb8\u91cd\u53e0: {3}", Bridge.box(newX, System.Int32), Bridge.box(newY, System.Int32), Bridge.box(other.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(canOverlap, System.Boolean, System.Boolean.toString)));
                                }

                                if (!canOverlap) {
                                    if (isBigBomb) {
                                        UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u79fb\u52a8\u68c0\u6d4b] \u2717 \u4e0d\u5141\u8bb8\u91cd\u53e0\uff0c\u963b\u6b62\u79fb\u52a8", null));
                                    }
                                    return false; // 不允许的重叠
                                }
                                // 如果允许重叠，继续检查其他块
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (isBigBomb) {
                    UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u79fb\u52a8\u68c0\u6d4b] \u2713 \u53ef\u4ee5\u79fb\u52a8\u5230\u4f4d\u7f6e ({0}, {1})", Bridge.box(newX, System.Int32), Bridge.box(newY, System.Int32)));
                }

                return true;
            },
            /*JewelBoardManager.CanBlockMoveToPosition end.*/

            /*JewelBoardManager.OnBlockMovedHorizontal start.*/
            /**
             * 块水平移动回调
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockController}    controller    
             * @param   {number}                  gridDelta
             * @return  {void}
             */
            OnBlockMovedHorizontal: function (controller, gridDelta) {
                UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u5f00\u59cb\u5904\u7406\u79fb\u52a8\uff0cgridDelta={0}, _isProcessing={1}", Bridge.box(gridDelta, System.Int32), Bridge.box(this._isProcessing, System.Boolean, System.Boolean.toString)));

                if (this._isProcessing) {
                    UnityEngine.Debug.Log$1("[\u6c34\u5e73\u79fb\u52a8] \u6b63\u5728\u5904\u7406\u4e2d\uff0c\u8df3\u8fc7");
                    return;
                }

                var blockData = controller.GetBlockData();
                if (blockData == null) {
                    UnityEngine.Debug.Log$1("[\u6c34\u5e73\u79fb\u52a8] blockData\u4e3anull\uff0c\u8df3\u8fc7");
                    return;
                }

                UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u5757\u7c7b\u578b: {0}, \u5f53\u524d\u4f4d\u7f6e: X={1}, Y={2}, Width={3}", Bridge.box(blockData.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(blockData.X, System.Int32), Bridge.box(blockData.Y, System.Int32), Bridge.box(blockData.Width, System.Int32)));

                // 在移动前计算拖动限制
                var minGridDelta = { }, maxGridDelta = { };
                this.CalculateDragLimitsForBlock(blockData, minGridDelta, maxGridDelta);

                // 限制gridDelta在允许范围内
                gridDelta = Math.max(minGridDelta.v, Math.min(gridDelta, maxGridDelta.v));

                var newX = (blockData.X + gridDelta) | 0;
                UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u65b0\u4f4d\u7f6e: newX={0} (\u539fX={1}, gridDelta={2})", Bridge.box(newX, System.Int32), Bridge.box(blockData.X, System.Int32), Bridge.box(gridDelta, System.Int32)));

                // 检查是否超出边界
                if (newX < 0 || ((newX + blockData.Width) | 0) > this.Config.Columns) {
                    // 回弹
                    controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                    return;
                }

                // 检查是否与同行其他块重叠
                var overlappingBlock = { };
                if (this.WouldBlockOverlapAtPosition(blockData, newX, blockData.Y, overlappingBlock)) {
                    UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u68c0\u6d4b\u5230\u4e0d\u5141\u8bb8\u7684\u91cd\u53e0\uff0c\u4e0e\u5176\u4ed6\u5757 {0} \u91cd\u53e0\uff0c\u963b\u6b62\u79fb\u52a8", [Bridge.box(overlappingBlock.v.Color, JewelColor, System.Enum.toStringFn(JewelColor))]));
                    // 回弹
                    controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                    return;
                }

                // 执行移动（先更新坐标，再检查交互）
                blockData.X = newX;
                UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u5750\u6807\u5df2\u66f4\u65b0: X={0}, Y={1}", Bridge.box(blockData.X, System.Int32), Bridge.box(blockData.Y, System.Int32)));
                this.RenderAllBlocks();

                // 在检查交互之前，先保存移动块是否是TransformBlock
                var wasTransformBlock = blockData.IsTransformBlock();

                // 在触发移动事件前，转换所有TransformBlock为BigBomb
                this.ConvertAllTransformBlocks();

                // 第一关移动计数增加（无论是否有第一关数据，只要 _isCurrentlyFirstLevel 是 true）
                if (this._isCurrentlyFirstLevel) {
                    this._firstLevelMoveCount = (this._firstLevelMoveCount + 1) | 0;
                    // 获取剩余步数（通过GameManager）
                    var remainingMoves = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u79fb\u52a8\u8ba1\u6570] \u2713 \u5f53\u524d\u79fb\u52a8\u6b21\u6570: {0}, \u5269\u4f59\u6b65\u6570(MovesText): {1}, _isCurrentlyFirstLevel: {2}, _hasSpawnedStep5BigBomb: {3}", Bridge.box(this._firstLevelMoveCount, System.Int32), Bridge.box(remainingMoves, System.Int32), Bridge.box(this._isCurrentlyFirstLevel, System.Boolean, System.Boolean.toString), Bridge.box(this._hasSpawnedStep5BigBomb, System.Boolean, System.Boolean.toString)));
                } else {
                    // 如果不是第一关，也打印一下，方便调试
                    var remainingMoves1 = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves1 = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u79fb\u52a8\u8ba1\u6570] \u2717 \u4e0d\u662f\u7b2c\u4e00\u5173: _isCurrentlyFirstLevel={0}, _isFirstLevel={1}, \u5269\u4f59\u6b65\u6570={2}", Bridge.box(this._isCurrentlyFirstLevel, System.Boolean, System.Boolean.toString), Bridge.box(JewelBoardManager._isFirstLevel, System.Boolean, System.Boolean.toString), Bridge.box(remainingMoves1, System.Int32)));
                }

                // 检查第一关第5步后生成bigbomb（延迟到游戏循环完成后）
                if (this._isCurrentlyFirstLevel && this._firstLevelMoveCount === 5 && !this._hasSpawnedStep5BigBomb) {
                    var remainingMoves2 = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves2 = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u2713\u2713\u2713 \u68c0\u6d4b\u5230\u7b2c5\u6b65\u5b8c\u6210\uff0c\u5269\u4f59\u6b65\u6570: {0}\uff0c\u5c06\u5728\u4e0a\u63a8\u5b8c\u6210\u540e\u751f\u6210bigbomb", [Bridge.box(remainingMoves2, System.Int32)]));
                    this._pendingStep5BigBombSpawn = true;
                } else if (this._isCurrentlyFirstLevel) {
                    var remainingMoves3 = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves3 = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u79fb\u52a8\u8ba1\u6570] \u6761\u4ef6\u4e0d\u6ee1\u8db3: _firstLevelMoveCount={0}, \u5269\u4f59\u6b65\u6570={1}, _hasSpawnedStep5BigBomb={2}", Bridge.box(this._firstLevelMoveCount, System.Int32), Bridge.box(remainingMoves3, System.Int32), Bridge.box(this._hasSpawnedStep5BigBomb, System.Boolean, System.Boolean.toString)));
                }

                // 检查道具交互：横块/竖块移动到炸块
                UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u51c6\u5907\u68c0\u67e5\u9053\u5177\u4ea4\u4e92\uff0c\u5757\u7c7b\u578b: {0}, \u662f\u6a2a\u5757:{1}, \u662f\u7ad6\u5757:{2}, \u539f\u672c\u662fTransformBlock:{3}", Bridge.box(blockData.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(blockData.IsHorizontal(), System.Boolean, System.Boolean.toString), Bridge.box(blockData.IsVertical(), System.Boolean, System.Boolean.toString), Bridge.box(wasTransformBlock, System.Boolean, System.Boolean.toString)));
                var hasSpecialEffect = this.CheckItemInteraction(blockData, wasTransformBlock);
                UnityEngine.Debug.Log$1(System.String.format("[\u6c34\u5e73\u79fb\u52a8] \u9053\u5177\u4ea4\u4e92\u68c0\u67e5\u7ed3\u679c: {0}", [Bridge.box(hasSpecialEffect, System.Boolean, System.Boolean.toString)]));

                if (!hasSpecialEffect) {
                    // 没有特殊效果，触发移动事件并正常游戏循环
                    if (!Bridge.staticEquals(this.OnMoveMade, null)) {
                        this.OnMoveMade();
                    }
                    this.StartCoroutine$1(this.GameLoop());
                }
                // 如果有特殊效果，CheckItemInteraction已经启动了协程，OnMoveMade会在特殊效果完成后调用
            },
            /*JewelBoardManager.OnBlockMovedHorizontal end.*/

            /*JewelBoardManager.OnBlockMovedVertical start.*/
            /**
             * 块垂直移动回调（非钻石道具块）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockController}    controller    
             * @param   {number}                  gridDeltaY
             * @return  {void}
             */
            OnBlockMovedVertical: function (controller, gridDeltaY) {
                var $t;
                if (this._isProcessing) {
                    return;
                }

                var blockData = controller.GetBlockData();
                if (blockData == null) {
                    return;
                }

                // 只有非钻石道具块可以垂直移动
                if (!blockData.IsNonDiamondItem()) {
                    return;
                }

                // 计算垂直拖动限制
                var minGridDeltaY = { }, maxGridDeltaY = { };
                this.CalculateVerticalDragLimitsForBlock(blockData, minGridDeltaY, maxGridDeltaY);

                // 限制gridDeltaY在允许范围内
                gridDeltaY = Math.max(minGridDeltaY.v, Math.min(gridDeltaY, maxGridDeltaY.v));

                var newY = (blockData.Y + gridDeltaY) | 0;

                // 检查是否超出边界
                if (newY < 0 || newY >= this.Config.Rows) {
                    // 回弹
                    controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                    return;
                }

                // 检查目标位置是否有其他块（使用统一的碰撞检测）
                // 对于垂直移动，需要检查块占据的所有X坐标位置
                var canMove = true;
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var other = $t.Current;
                        if (other.Id === blockData.Id) {
                            continue;
                        }

                        // 检查是否在同一列位置（垂直移动）
                        if (other.Y === newY) {
                            // 检查X轴是否有重叠
                            var wouldOverlapX = blockData.X < ((other.X + other.Width) | 0) && ((blockData.X + blockData.Width) | 0) > other.X;
                            if (wouldOverlapX) {
                                // 检查是否允许重叠（道具交互）
                                if (!this.CanBlocksOverlap(blockData, other)) {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u5782\u76f4\u79fb\u52a8] \u68c0\u6d4b\u5230\u4e0d\u5141\u8bb8\u7684\u91cd\u53e0\uff0c\u4e0e\u5176\u4ed6\u5757 {0} \u91cd\u53e0\uff0c\u963b\u6b62\u79fb\u52a8", [Bridge.box(other.Color, JewelColor, System.Enum.toStringFn(JewelColor))]));
                                    canMove = false;
                                    break;
                                }
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (!canMove) {
                    // 回弹
                    controller.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                    return;
                }

                // 执行移动
                blockData.Y = newY;
                this.RenderAllBlocks();

                // 在检查交互之前，先保存移动块是否是TransformBlock
                var wasTransformBlock = blockData.IsTransformBlock();

                // 在触发移动事件前，转换所有TransformBlock为BigBomb
                this.ConvertAllTransformBlocks();

                // 第一关移动计数增加
                if (this._isCurrentlyFirstLevel) {
                    this._firstLevelMoveCount = (this._firstLevelMoveCount + 1) | 0;
                    // 获取剩余步数（通过GameManager）
                    var remainingMoves = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u79fb\u52a8\u8ba1\u6570] \u5f53\u524d\u79fb\u52a8\u6b21\u6570: {0}, \u5269\u4f59\u6b65\u6570(MovesText): {1}, _isCurrentlyFirstLevel: {2}, _hasSpawnedStep5BigBomb: {3}", Bridge.box(this._firstLevelMoveCount, System.Int32), Bridge.box(remainingMoves, System.Int32), Bridge.box(this._isCurrentlyFirstLevel, System.Boolean, System.Boolean.toString), Bridge.box(this._hasSpawnedStep5BigBomb, System.Boolean, System.Boolean.toString)));
                }

                // 检查第一关第5步后生成bigbomb（延迟到游戏循环完成后）
                if (this._isCurrentlyFirstLevel && this._firstLevelMoveCount === 5 && !this._hasSpawnedStep5BigBomb) {
                    var remainingMoves1 = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves1 = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u2713\u2713\u2713 \u68c0\u6d4b\u5230\u7b2c5\u6b65\u5b8c\u6210\uff0c\u5269\u4f59\u6b65\u6570: {0}\uff0c\u5c06\u5728\u4e0a\u63a8\u5b8c\u6210\u540e\u751f\u6210bigbomb", [Bridge.box(remainingMoves1, System.Int32)]));
                    this._pendingStep5BigBombSpawn = true;
                } else if (this._isCurrentlyFirstLevel) {
                    var remainingMoves2 = 0;
                    if (UnityEngine.MonoBehaviour.op_Inequality(JewelGameManager.Instance, null)) {
                        remainingMoves2 = JewelGameManager.Instance.GetRemainingMoves();
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u79fb\u52a8\u8ba1\u6570] \u6761\u4ef6\u4e0d\u6ee1\u8db3: _firstLevelMoveCount={0}, \u5269\u4f59\u6b65\u6570={1}, _hasSpawnedStep5BigBomb={2}", Bridge.box(this._firstLevelMoveCount, System.Int32), Bridge.box(remainingMoves2, System.Int32), Bridge.box(this._hasSpawnedStep5BigBomb, System.Boolean, System.Boolean.toString)));
                }

                UnityEngine.Debug.Log$1("OnBlockMovedVertical: " + blockData.X + ", " + blockData.Y);
                // 检查道具交互：竖块移动到炸块（垂直移动）
                var hasSpecialEffect = this.CheckItemInteraction(blockData, wasTransformBlock);

                if (!hasSpecialEffect) {
                    // 没有特殊效果，触发移动事件并触发游戏循环（道具块现在也受重力影响）
                    if (!Bridge.staticEquals(this.OnMoveMade, null)) {
                        this.OnMoveMade();
                    }
                    this.StartCoroutine$1(this.GameLoop());
                }
                // 如果有特殊效果，CheckItemInteraction已经启动了协程，OnMoveMade会在特殊效果完成后调用
            },
            /*JewelBoardManager.OnBlockMovedVertical end.*/

            /*JewelBoardManager.CalculateDragLimitsForBlock start.*/
            /**
             * 计算块的拖动限制（供InputHandler使用）
             *
             * @instance
             * @public
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    blockData       
             * @param   {System.Int32}      minGridDelta    
             * @param   {System.Int32}      maxGridDelta
             * @return  {void}
             */
            CalculateDragLimitsForBlock: function (blockData, minGridDelta, maxGridDelta) {
                var $t;
                minGridDelta.v = (-blockData.X) | 0; // 不能移动到负坐标
                maxGridDelta.v = (this.Config.Columns - (((blockData.X + blockData.Width) | 0))) | 0; // 不能超出右边界

                // 检查同行的其他块，考虑碰撞检测
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var other = $t.Current;
                        if (other.Id !== blockData.Id && other.Y === blockData.Y) {
                            // 检查是否允许重叠（道具交互）
                            var canOverlap = this.CanBlocksOverlap(blockData, other);

                            // 左侧块
                            if (((other.X + other.Width) | 0) <= blockData.X) {
                                var maxLeftMove = (-(((blockData.X - (((other.X + other.Width) | 0))) | 0))) | 0;
                                if (!canOverlap) {
                                    // 不允许重叠，限制移动
                                    minGridDelta.v = UnityEngine.Mathf.Max(minGridDelta.v, maxLeftMove);
                                }
                            }
                            // 右侧块
                            if (other.X >= ((blockData.X + blockData.Width) | 0)) {
                                var maxRightMove = (other.X - (((blockData.X + blockData.Width) | 0))) | 0;
                                if (!canOverlap) {
                                    // 不允许重叠，限制移动
                                    maxGridDelta.v = UnityEngine.Mathf.Min(maxGridDelta.v, maxRightMove);
                                }
                            } else if (!canOverlap && blockData.X < ((other.X + other.Width) | 0) && ((blockData.X + blockData.Width) | 0) > other.X) {
                                // 块已经重叠，只能移动到一个方向
                                if (((other.X + other.Width) | 0) <= blockData.X) {
                                    minGridDelta.v = UnityEngine.Mathf.Max(minGridDelta.v, ((-(((blockData.X - (((other.X + other.Width) | 0))) | 0))) | 0));
                                }
                                if (other.X >= ((blockData.X + blockData.Width) | 0)) {
                                    maxGridDelta.v = UnityEngine.Mathf.Min(maxGridDelta.v, ((other.X - (((blockData.X + blockData.Width) | 0))) | 0));
                                }
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*JewelBoardManager.CalculateDragLimitsForBlock end.*/

            /*JewelBoardManager.CalculateVerticalDragLimitsForBlock start.*/
            /**
             * 计算块的垂直拖动限制（供InputHandler使用，非钻石道具块）
             *
             * @instance
             * @public
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    blockData        
             * @param   {System.Int32}      minGridDeltaY    
             * @param   {System.Int32}      maxGridDeltaY
             * @return  {void}
             */
            CalculateVerticalDragLimitsForBlock: function (blockData, minGridDeltaY, maxGridDeltaY) {
                var $t;
                minGridDeltaY.v = (-blockData.Y) | 0; // 不能移动到负坐标
                maxGridDeltaY.v = (((this.Config.Rows - 1) | 0) - blockData.Y) | 0; // 不能超出上边界

                var isBigBomb = blockData.IsBigBomb();

                // 对于BigBomb，允许移动到任何位置（除了边界），因为需要与其他BigBomb重叠
                if (isBigBomb) {
                    // BigBomb可以垂直移动到任何位置（只要在边界内）
                    // 只受边界限制，不受其他块限制（因为允许重叠）
                    UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u5782\u76f4\u9650\u5236] BigBomb\u5141\u8bb8\u79fb\u52a8\u5230\u4efb\u4f55\u4f4d\u7f6e\uff0c\u53ea\u53d7\u8fb9\u754c\u9650\u5236: Y\u8303\u56f4 0 \u5230 {0}", [Bridge.box(((this.Config.Rows - 1) | 0), System.Int32)]));
                    return; // 只返回边界限制，不检查其他块
                }

                // 检查可能重叠的其他块，考虑碰撞检测（对于非BigBomb的道具块）
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var other = $t.Current;
                        if (other.Id === blockData.Id) {
                            continue;
                        }

                        // 检查X轴是否有重叠
                        var overlapsX = blockData.X < ((other.X + other.Width) | 0) && ((blockData.X + blockData.Width) | 0) > other.X;
                        if (overlapsX) {
                            // 检查是否允许重叠（道具交互）
                            var canOverlap = this.CanBlocksOverlap(blockData, other);

                            if (!canOverlap) {
                                // 不允许重叠，限制移动
                                // 下方块
                                if (other.Y < blockData.Y) {
                                    var newLimit = (-(((((blockData.Y - other.Y) | 0) - 1) | 0))) | 0;
                                    minGridDeltaY.v = UnityEngine.Mathf.Max(minGridDeltaY.v, newLimit);
                                }
                                // 上方块
                                if (other.Y > blockData.Y) {
                                    var newLimit1 = (((other.Y - blockData.Y) | 0) - 1) | 0;
                                    maxGridDeltaY.v = UnityEngine.Mathf.Min(maxGridDeltaY.v, newLimit1);
                                }
                            } else {
                                // 允许重叠（比如道具交互），不限制移动
                                var isMovingBigBomb = blockData.IsBigBomb() && other.IsBigBomb();
                                if (isMovingBigBomb) {
                                    UnityEngine.Debug.Log$1(System.String.format("[BigBomb\u5782\u76f4\u9650\u5236] \u2713 \u5141\u8bb8\u4e0e\u53e6\u4e00\u4e2aBigBomb\u91cd\u53e0\uff0c\u4e0d\u9650\u5236\u79fb\u52a8: other.Y={0}, blockData.Y={1}", Bridge.box(other.Y, System.Int32), Bridge.box(blockData.Y, System.Int32)));
                                }
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            /*JewelBoardManager.CalculateVerticalDragLimitsForBlock end.*/

            /*JewelBoardManager.GameLoop start.*/
            /**
             * 游戏主循环
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.IEnumerator}
             */
            GameLoop: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    this._isProcessing = true;

                                        // 禁用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.DisableInput();
                                        }

                                        // 应用重力
                                        $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    // 检查消除
                                        $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    // 生成新行并上推
                                        $enumerator.current = this.StartCoroutine$1(this.SpawnAndPushUpFromPreview());
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    // 再次应用重力
                                        $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 4;
                                        return true;
                                }
                                case 4: {
                                    // 再次检查连击
                                        $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    // 渲染
                                        this.RenderAllBlocks();

                                        // 检查游戏结束
                                        this.CheckGameOver();

                                        // 如果上推没有发生（比如块已堆到顶部），在这里检查是否需要生成bigbomb
                                        if (this._pendingStep5BigBombSpawn) {
                                            $step = 6;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 6: {
                                    this._pendingStep5BigBombSpawn = false;
                                        UnityEngine.Debug.Log$1("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u6e38\u620f\u5faa\u73af\u5b8c\u6210\uff08\u672a\u53d1\u751f\u4e0a\u63a8\u6216\u4e0a\u63a8\u5df2\u5b8c\u6210\uff09\uff0c\u5f00\u59cb\u751f\u6210bigbomb");
                                        $enumerator.current = this.StartCoroutine$1(this.SpawnStep5BigBombs());
                                        $step = 7;
                                        return true;
                                }
                                case 7: {
                                    $step = 8;
                                    continue;
                                }
                                case 8: {
                                    this._isProcessing = false;

                                        // 重新启用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.EnableInput();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.GameLoop end.*/

            /*JewelBoardManager.ApplyGravity start.*/
            /**
             * 应用重力（优化版本：一次性计算所有下落，使用平滑动画）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.IEnumerator}
             */
            ApplyGravity: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    hasChanges,
                    maxIterations,
                    iterations,
                    sorted,
                    $t,
                    block,
                    animationTime,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    hasChanges = true;
                                        maxIterations = this.Config.Rows; // 防止无限循环
                                        iterations = 0;

                                        // 先计算所有块应该下落到的最终位置
                                        while (hasChanges && iterations < maxIterations) {
                                            hasChanges = false;
                                            iterations = (iterations + 1) | 0;

                                            sorted = new (System.Collections.Generic.List$1(JewelBlockData)).$ctor1(this._blocks);
                                            sorted.Sort$2(function (a, b) {
                                                return Bridge.compare(a.Y, b.Y);
                                            });

                                            $t = Bridge.getEnumerator(sorted);
                                            try {
                                                while ($t.moveNext()) {
                                                    block = $t.Current;
                                                    if (block.Y === 0) {
                                                        continue;
                                                    }

                                                    // 所有块都受重力影响（包括道具块）

                                                    if (!block.HasSupport(this._blocks)) {
                                                        block.Y = (block.Y - 1) | 0;
                                                        hasChanges = true;
                                                    }
                                                }
                                            } finally {
                                                if (Bridge.is($t, System.IDisposable)) {
                                                    $t.System$IDisposable$Dispose();
                                                }
                                            }
                                        }

                                        // 如果有块下落，使用平滑动画
                                        if (iterations > 1) {
                                            $step = 1;
                                            continue;
                                        } else  {
                                            $step = 3;
                                            continue;
                                        }
                                }
                                case 1: {
                                    // 使用平滑的动画时间，根据下落距离调整
                                        animationTime = UnityEngine.Mathf.Min(this.Config.GravityFallTime * 0.5, 0.15);
                                        this.StartCoroutine$1(this.AnimateBlocksSmooth(animationTime));
                                        $enumerator.current = new UnityEngine.WaitForSeconds(animationTime);
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    $step = 4;
                                    continue;
                                }
                                case 3: {
                                    // 没有变化，直接渲染
                                        this.RenderAllBlocks();
                                    $step = 4;
                                    continue;
                                }
                                case 4: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.ApplyGravity end.*/

            /*JewelBoardManager.AnimateBlocksSmooth start.*/
            /**
             * 平滑动画块位置
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}                            duration
             * @return  {System.Collections.IEnumerator}
             */
            AnimateBlocksSmooth: function (duration) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    elapsed,
                    startPositions,
                    targetPositions,
                    $t,
                    block,
                    controller,
                    rectTransform,
                    x,
                    y,
                    t,
                    $t1,
                    kvp,
                    controller1,
                    startPos,
                    targetPos,
                    rectTransform1,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    elapsed = 0.0;
                                        startPositions = new (System.Collections.Generic.Dictionary$2(JewelBlockController,UnityEngine.Vector2)).ctor();
                                        targetPositions = new (System.Collections.Generic.Dictionary$2(JewelBlockController,UnityEngine.Vector2)).ctor();

                                        // 记录所有块的起始和目标位置
                                        $t = Bridge.getEnumerator(this._blocks);
                                        try {
                                            while ($t.moveNext()) {
                                                block = $t.Current;
                                                if (UnityEngine.GameObject.op_Equality(block.BlockObject, null)) {
                                                    continue;
                                                }

                                                controller = block.BlockObject.GetComponent(JewelBlockController);
                                                if (UnityEngine.MonoBehaviour.op_Equality(controller, null)) {
                                                    continue;
                                                }

                                                rectTransform = controller.GetComponent(UnityEngine.RectTransform);
                                                if (UnityEngine.Component.op_Equality(rectTransform, null)) {
                                                    continue;
                                                }

                                                startPositions.setItem(controller, rectTransform.anchoredPosition.$clone());

                                                // 计算目标位置
                                                x = (this._cellWidth * block.X) + (this._cellWidth * block.Width / 2.0) - (this._boardWidth / 2.0);
                                                y = this._bottomOffsetY + (this._cellHeight * block.Y) + (this._cellHeight / 2.0);
                                                targetPositions.setItem(controller, new pc.Vec2( x, y ));
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 平滑插值动画
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( elapsed < duration ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = Math.max(0, Math.min(1, elapsed / duration));
                                        // 使用缓出曲线，让动画更自然
                                        t = 1.0 - Math.pow(1.0 - t, 3.0);

                                        $t1 = Bridge.getEnumerator(startPositions);
                                        try {
                                            while ($t1.moveNext()) {
                                                kvp = $t1.Current;
                                                controller1 = kvp.key;
                                                startPos = kvp.value.$clone();
                                                targetPos = targetPositions.getItem(controller1).$clone();

                                                rectTransform1 = controller1.GetComponent(UnityEngine.RectTransform);
                                                if (UnityEngine.Component.op_Inequality(rectTransform1, null)) {
                                                    rectTransform1.anchoredPosition = new pc.Vec2().lerp( startPos, targetPos, t );
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {
                                    // 确保最终位置准确
                                        this.RenderAllBlocks();

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.AnimateBlocksSmooth end.*/

            /*JewelBoardManager.CheckClearRecursive start.*/
            /**
             * 递归检查消除
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.IEnumerator}
             */
            CheckClearRecursive: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    rowsToClear,
                    totalWidth,
                    $t,
                    block,
                    diamondsToAnimate,
                    $t1,
                    row,
                    $t2,
                    block1,
                    controller,
                    maxWaitTime,
                    elapsed,
                    allAnimationsComplete,
                    animatingCount,
                    $t3,
                    diamond,
                    controller1,
                    $t4,
                    row1,
                    $t5,
                    child,
                    controller2,
                    hasDiamondDestroyed,
                    ex,
                    spawnChance,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    rowsToClear = new (System.Collections.Generic.List$1(System.Int32)).ctor();

                                        for (var r = 0; r < this.Config.Rows; r = (r + 1) | 0) {
                                            totalWidth = 0;
                                            $t = Bridge.getEnumerator(this._blocks);
                                            try {
                                                while ($t.moveNext()) {
                                                    block = $t.Current;
                                                    if (block.Y === r) {
                                                        // 非钻石道具块不算入消除宽度（视为空格）
                                                        if (!block.IsNonDiamondItem()) {
                                                            totalWidth = (totalWidth + block.Width) | 0;
                                                        }
                                                    }
                                                }
                                            } finally {
                                                if (Bridge.is($t, System.IDisposable)) {
                                                    $t.System$IDisposable$Dispose();
                                                }
                                            }

                                            if (totalWidth >= this.Config.RequiredColumnsForClear) {
                                                rowsToClear.add(r);
                                            }
                                        }

                                        if (rowsToClear.Count > 0) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 15;
                                        continue;
                                }
                                case 1: {
                                    // 播放消除动画（钻石块和普通块同时播放）
                                        diamondsToAnimate = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                                        $t1 = Bridge.getEnumerator(rowsToClear);
                                        try {
                                            while ($t1.moveNext()) {
                                                row = $t1.Current;
                                                $t2 = Bridge.getEnumerator(this._blocks);
                                                try {
                                                    while ($t2.moveNext()) {
                                                        block1 = $t2.Current;
                                                        if (block1.Y === row && UnityEngine.GameObject.op_Inequality(block1.BlockObject, null)) {
                                                            controller = block1.BlockObject.GetComponent(JewelBlockController);
                                                            if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                                                // 如果是钻石块，记录起来，同时播放动画
                                                                if (block1.IsDiamond()) {
                                                                    diamondsToAnimate.add(block1);
                                                                    controller.PlayClearAnimation(); // 立即播放钻石动画
                                                                } else {
                                                                    controller.PlayClearAnimation(); // 播放普通块动画
                                                                }
                                                            }
                                                        }
                                                    }
                                                } finally {
                                                    if (Bridge.is($t2, System.IDisposable)) {
                                                        $t2.System$IDisposable$Dispose();
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 等待所有动画完成（钻石和普通块同时进行）
                                        maxWaitTime = UnityEngine.Mathf.Max(this.Config.ClearAnimationTime, 1.2); // 取两者中较长的（钻石动画1秒+缓冲）
                                        elapsed = 0.0;
                                        allAnimationsComplete = false;

                                        if (diamondsToAnimate.Count > 0) {
                                            $step = 2;
                                            continue;
                                        } else  {
                                            $step = 9;
                                            continue;
                                        }
                                }
                                case 2: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] CheckClearRecursive: \u5f00\u59cb\u7b49\u5f85 {0} \u4e2a\u94bb\u77f3\u52a8\u753b\u5b8c\u6210\uff08\u540c\u65f6\u8fdb\u884c\uff09", [Bridge.box(diamondsToAnimate.Count, System.Int32)]));
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < maxWaitTime && !allAnimationsComplete ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 4: {
                                    allAnimationsComplete = true;
                                        animatingCount = 0;
                                        $t3 = Bridge.getEnumerator(diamondsToAnimate);
                                        try {
                                            while ($t3.moveNext()) {
                                                diamond = $t3.Current;
                                                if (UnityEngine.GameObject.op_Inequality(diamond.BlockObject, null) && diamond.BlockObject.activeSelf) {
                                                    controller1 = diamond.BlockObject.GetComponent(JewelBlockController);
                                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller1, null) && controller1.IsAnimating()) {
                                                        allAnimationsComplete = false;
                                                        animatingCount = (animatingCount + 1) | 0;
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t3, System.IDisposable)) {
                                                $t3.System$IDisposable$Dispose();
                                            }
                                        }

                                        if (!allAnimationsComplete) {
                                            $step = 5;
                                            continue;
                                        } 
                                        $step = 7;
                                        continue;
                                }
                                case 5: {
                                    $enumerator.current = new UnityEngine.WaitForSeconds(0.1);
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    elapsed += 0.1;
                                    $step = 7;
                                    continue;
                                }
                                case 7: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 8: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] CheckClearRecursive: \u6240\u6709\u52a8\u753b\u5b8c\u6210\uff0c\u7b49\u5f85\u65f6\u95f4: {0:F1}\u79d2", [Bridge.box(elapsed, System.Single, System.Single.format, System.Single.getHashCode)]));
                                    $step = 11;
                                    continue;
                                }
                                case 9: {
                                    // 没有钻石块，只等待普通块动画
                                        $enumerator.current = new UnityEngine.WaitForSeconds(this.Config.ClearAnimationTime);
                                        $step = 10;
                                        return true;
                                }
                                case 10: {
                                    $step = 11;
                                    continue;
                                }
                                case 11: {
                                    // 额外等待一小段时间确保动画完全结束
                                        $enumerator.current = new UnityEngine.WaitForSeconds(0.2);
                                        $step = 12;
                                        return true;
                                }
                                case 12: {
                                    // 移除被消除的块（动画完成后才销毁）
                                        this._blocks.RemoveAll(function (b) {
                                            return rowsToClear.contains(b.Y);
                                        });
                                        $t4 = Bridge.getEnumerator(rowsToClear);
                                        try {
                                            while ($t4.moveNext()) {
                                                row1 = $t4.Current;
                                                $t5 = Bridge.getEnumerator(this.BoardContainer);
                                                try {
                                                    while ($t5.moveNext()) {
                                                        child = Bridge.cast($t5.Current, UnityEngine.Transform);
                                                        controller2 = child.GetComponent(JewelBlockController);
                                                        if (UnityEngine.MonoBehaviour.op_Inequality(controller2, null) && controller2.GetBlockData() != null && controller2.GetBlockData().Y === row1) {
                                                            UnityEngine.MonoBehaviour.Destroy(child.gameObject);
                                                        }
                                                    }
                                                } finally {
                                                    if (Bridge.is($t5, System.IDisposable)) {
                                                        $t5.System$IDisposable$Dispose();
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t4, System.IDisposable)) {
                                                $t4.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 更新钻石块计数
                                        this.UpdateDiamondCount();

                                        // 触发事件（传递是否有钻石销毁的信息）
                                        hasDiamondDestroyed = diamondsToAnimate.Count > 0;
                                        UnityEngine.Debug.Log$1(System.String.format("[\u4e8b\u4ef6] CheckClearRecursive: \u51c6\u5907\u89e6\u53d1 OnRowCleared \u4e8b\u4ef6, \u884c\u6570: {0}, \u6709\u94bb\u77f3: {1}, \u4e8b\u4ef6\u662f\u5426\u4e3a\u7a7a: {2}", Bridge.box(rowsToClear.Count, System.Int32), Bridge.box(hasDiamondDestroyed, System.Boolean, System.Boolean.toString), Bridge.box(Bridge.staticEquals(this.OnRowCleared, null), System.Boolean, System.Boolean.toString)));
                                        if (!Bridge.staticEquals(this.OnRowCleared, null)) {
                                            UnityEngine.Debug.Log$1(System.String.format("[\u4e8b\u4ef6] CheckClearRecursive: \u89e6\u53d1 OnRowCleared \u4e8b\u4ef6, \u8ba2\u9605\u8005\u6570\u91cf: {0}", [Bridge.box(Bridge.fn.getInvocationList(this.OnRowCleared).length, System.Int32)]));
                                            try {
                                                this.OnRowCleared(rowsToClear.Count, hasDiamondDestroyed);
                                                UnityEngine.Debug.Log$1(System.String.format("[\u4e8b\u4ef6] CheckClearRecursive: OnRowCleared \u4e8b\u4ef6\u8c03\u7528\u5b8c\u6210", null));
                                            } catch (ex) {
                                                ex = System.Exception.create(ex);
                                                UnityEngine.Debug.LogError$2(System.String.format("[\u4e8b\u4ef6] CheckClearRecursive: OnRowCleared \u4e8b\u4ef6\u8c03\u7528\u5931\u8d25: {0}", [ex.Message]));
                                            }
                                        } else {
                                            UnityEngine.Debug.LogWarning$1("[\u4e8b\u4ef6] CheckClearRecursive: OnRowCleared \u4e8b\u4ef6\u4e3a\u7a7a\uff0c\u6ca1\u6709\u8ba2\u9605\u8005\uff01");
                                        }

                                        // 随机生成道具（在消除的行中随机位置）
                                        spawnChance = this.GetItemSpawnChance();
                                        if (this.Config != null && this.Config.EnableItems && UnityEngine.Random.value < spawnChance && rowsToClear.Count > 0) {
                                            this.SpawnRandomItem(rowsToClear.getItem(0));
                                        }

                                        // 再次应用重力
                                        $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 13;
                                        return true;
                                }
                                case 13: {
                                    // 递归检查
                                        $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 14;
                                        return true;
                                }
                                case 14: {
                                    $step = 15;
                                    continue;
                                }
                                case 15: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.CheckClearRecursive end.*/

            /*JewelBoardManager.CheckItemInteraction start.*/
            /**
             * 检查道具交互（横块/竖块移动到炸块，或两个大炸弹重叠）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    movedBlock           移动的块
             * @param   {boolean}           wasTransformBlock    移动的块在移动前是否是TransformBlock
             * @return  {boolean}
             */
            CheckItemInteraction: function (movedBlock, wasTransformBlock) {
                var $t, $t1, $t2;
                if (wasTransformBlock === void 0) { wasTransformBlock = false; }
                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u68c0\u67e5\u79fb\u52a8\u7684\u5757: {0} (X:{1}, Y:{2}, Width:{3}), \u539f\u672c\u662fTransformBlock:{4}", Bridge.box(movedBlock.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(movedBlock.X, System.Int32), Bridge.box(movedBlock.Y, System.Int32), Bridge.box(movedBlock.Width, System.Int32), Bridge.box(wasTransformBlock, System.Boolean, System.Boolean.toString)));

                // 检查移动的块是否是大炸弹
                var isBigBomb = movedBlock.IsBigBomb();

                // 如果移动的块是大炸弹，检查是否有另一个大炸弹在同一位置
                // 但如果移动的块原本是TransformBlock，不应该触发BigBomb效果
                if (isBigBomb && !wasTransformBlock) {
                    UnityEngine.Debug.Log$1("[\u9053\u5177\u4ea4\u4e92] \u79fb\u52a8\u7684\u662f\u5927\u70b8\u5f39\uff08\u4e0d\u662f\u4eceTransformBlock\u8f6c\u6362\u6765\u7684\uff09\uff0c\u68c0\u67e5\u662f\u5426\u6709\u53e6\u4e00\u4e2a\u5927\u70b8\u5f39\u5728\u540c\u4e00\u4f4d\u7f6e");

                    $t = Bridge.getEnumerator(this._blocks);
                    try {
                        while ($t.moveNext()) {
                            var other = $t.Current;
                            if (other.Id === movedBlock.Id) {
                                continue;
                            }

                            var isOtherBigBomb = other.IsBigBomb();
                            var isSameRow = other.Y === movedBlock.Y;
                            var isSameCol = other.X === movedBlock.X;

                            // 两个大炸弹重叠：检查是否在同一行同一列（都是1x1块）
                            // 对于垂直移动，移动后的新位置与目标块应该在同行同列
                            // 注意：如果目标块也是从TransformBlock转换来的，也不应该触发效果
                            // 但由于我们无法追踪目标块是否原本是TransformBlock，这里只检查移动的块
                            if (isOtherBigBomb && isSameRow && isSameCol) {
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u2713 \u89e6\u53d1\u4e24\u4e2a\u5927\u70b8\u5f39\u91cd\u53e0\u6548\u679c\uff01\u6e05\u9664\u6240\u6709\u5757", null));
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u79fb\u52a8\u7684BigBomb: X={0}, Y={1}", Bridge.box(movedBlock.X, System.Int32), Bridge.box(movedBlock.Y, System.Int32)));
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u76ee\u6807\u7684BigBomb: X={0}, Y={1}", Bridge.box(other.X, System.Int32), Bridge.box(other.Y, System.Int32)));

                                // 移除两个大炸弹
                                this.RemoveBlock(movedBlock);
                                this.RemoveBlock(other);

                                // 清除所有块（通过协程）
                                this.StartCoroutine$1(this.ClearAllBlocks());
                                return true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }
                } else if (isBigBomb && wasTransformBlock) {
                    UnityEngine.Debug.Log$1("[\u9053\u5177\u4ea4\u4e92] \u79fb\u52a8\u7684\u5757\u539f\u672c\u662fTransformBlock\uff0c\u5373\u4f7f\u73b0\u5728\u662f\u5927\u70b8\u5f39\uff0c\u4e5f\u4e0d\u89e6\u53d1BigBomb\u6548\u679c");
                }

                // 检查移动的块是否是横块、竖块或炸块
                var isHorizontal = movedBlock.IsHorizontal();
                var isVertical = movedBlock.IsVertical();
                var isExplosive = movedBlock.IsExplosive();

                // 如果移动的块是炸块，检查是否有横块或竖块在同一位置
                if (isExplosive) {
                    UnityEngine.Debug.Log$1("[\u9053\u5177\u4ea4\u4e92] \u79fb\u52a8\u7684\u662f\u70b8\u5757\uff0c\u68c0\u67e5\u662f\u5426\u6709\u6a2a\u5757\u6216\u7ad6\u5757\u5728\u540c\u4e00\u4f4d\u7f6e");

                    $t1 = Bridge.getEnumerator(this._blocks);
                    try {
                        while ($t1.moveNext()) {
                            var other1 = $t1.Current;
                            if (other1.Id === movedBlock.Id) {
                                continue;
                            }

                            var isOtherHorizontal = other1.IsHorizontal();
                            var isOtherVertical = other1.IsVertical();
                            var isSameRow1 = other1.Y === movedBlock.Y;
                            var isSameCol1 = other1.X === movedBlock.X;

                            UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u68c0\u67e5\u5176\u4ed6\u5757: {0} (X:{1}, Y:{2}, Width:{3}), \u662f\u6a2a\u5757:{4}, \u662f\u7ad6\u5757:{5}, \u540c\u884c:{6}, \u540c\u5217:{7}", Bridge.box(other1.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(other1.X, System.Int32), Bridge.box(other1.Y, System.Int32), Bridge.box(other1.Width, System.Int32), Bridge.box(isOtherHorizontal, System.Boolean, System.Boolean.toString), Bridge.box(isOtherVertical, System.Boolean, System.Boolean.toString), Bridge.box(isSameRow1, System.Boolean, System.Boolean.toString), Bridge.box(isSameCol1, System.Boolean, System.Boolean.toString)));

                            // 炸块移动到横块：检查是否在同一行且重叠
                            if (isOtherHorizontal && isSameRow1) {
                                var overlaps = movedBlock.X === other1.X;
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u70b8\u5757\u4e0e\u6a2a\u5757\u91cd\u53e0\u68c0\u67e5: {0} (\u70b8\u5757X:{1}, Y:{2}, \u6a2a\u5757X:{3}, Y:{4})", Bridge.box(overlaps, System.Boolean, System.Boolean.toString), Bridge.box(movedBlock.X, System.Int32), Bridge.box(movedBlock.Y, System.Int32), Bridge.box(other1.X, System.Int32), Bridge.box(other1.Y, System.Int32)));

                                if (overlaps) {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u89e6\u53d1\u70b8\u5757+\u6a2a\u5757\u6548\u679c\uff01\u6d88\u96643\u884c: {0}, {1}, {2}", Bridge.box(((movedBlock.Y - 1) | 0), System.Int32), Bridge.box(movedBlock.Y, System.Int32), Bridge.box(((movedBlock.Y + 1) | 0), System.Int32)));

                                    // 记录要消除的行
                                    var targetRow = movedBlock.Y;

                                    // 移除触发道具和炸块
                                    this.RemoveBlock(movedBlock);
                                    this.RemoveBlock(other1);

                                    // 触发特殊效果（通过协程）
                                    this.StartCoroutine$1(this.TriggerRowClear(targetRow));
                                    return true;
                                }
                            } else if (isOtherVertical && isSameCol1) {
                                var overlaps1 = movedBlock.X === other1.X && movedBlock.Y === other1.Y;
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u70b8\u5757\u4e0e\u7ad6\u5757\u91cd\u53e0\u68c0\u67e5: {0} (\u70b8\u5757\u4f4d\u7f6eX:{1}, Y:{2}, \u7ad6\u5757\u4f4d\u7f6eX:{3}, Y:{4})", Bridge.box(overlaps1, System.Boolean, System.Boolean.toString), Bridge.box(movedBlock.X, System.Int32), Bridge.box(movedBlock.Y, System.Int32), Bridge.box(other1.X, System.Int32), Bridge.box(other1.Y, System.Int32)));

                                if (overlaps1) {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u89e6\u53d1\u70b8\u5757+\u7ad6\u5757\u6548\u679c\uff01\u6d88\u96643\u5217: {0}, {1}, {2}", Bridge.box(((movedBlock.X - 1) | 0), System.Int32), Bridge.box(movedBlock.X, System.Int32), Bridge.box(((movedBlock.X + 1) | 0), System.Int32)));

                                    // 记录要消除的列
                                    var targetCol = movedBlock.X;

                                    // 移除触发道具和炸块
                                    this.RemoveBlock(movedBlock);
                                    this.RemoveBlock(other1);

                                    // 触发特殊效果（通过协程）
                                    this.StartCoroutine$1(this.TriggerColumnClear(targetCol));
                                    return true;
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$Dispose();
                        }
                    }

                    UnityEngine.Debug.Log$1("[\u9053\u5177\u4ea4\u4e92] \u70b8\u5757\u672a\u627e\u5230\u5339\u914d\u7684\u6a2a\u5757\u6216\u7ad6\u5757");
                    return false;
                }

                // 如果移动的块是横块或竖块，检查是否有炸块在同一位置
                if (!isHorizontal && !isVertical) {
                    return false;
                }

                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u79fb\u52a8\u7684\u662f\u6a2a\u5757\u6216\u7ad6\u5757\uff0c\u68c0\u67e5\u662f\u5426\u6709\u70b8\u5757\u5728\u540c\u4e00\u4f4d\u7f6e", null));

                // 检查同一行是否有炸块（横块）或同一列是否有炸块（竖块）
                $t2 = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t2.moveNext()) {
                        var other2 = $t2.Current;
                        if (other2.Id === movedBlock.Id) {
                            continue;
                        }

                        var isSameRow2 = other2.Y === movedBlock.Y;
                        var isSameCol2 = other2.X === movedBlock.X;
                        var isOtherExplosive = other2.IsExplosive();

                        UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u68c0\u67e5\u5176\u4ed6\u5757: {0} (X:{1}, Y:{2}, Width:{3}), \u662f\u70b8\u5757:{4}, \u540c\u884c:{5}, \u540c\u5217:{6}", Bridge.box(other2.Color, JewelColor, System.Enum.toStringFn(JewelColor)), Bridge.box(other2.X, System.Int32), Bridge.box(other2.Y, System.Int32), Bridge.box(other2.Width, System.Int32), Bridge.box(isOtherExplosive, System.Boolean, System.Boolean.toString), Bridge.box(isSameRow2, System.Boolean, System.Boolean.toString), Bridge.box(isSameCol2, System.Boolean, System.Boolean.toString)));

                        if (isHorizontal && isSameRow2 && isOtherExplosive) {
                            // 横块：检查是否在同一行且重叠
                            // 横块和炸块都是1x1，所以X坐标相同就算重叠
                            var overlaps2 = movedBlock.X === other2.X;
                            UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u6a2a\u5757\u4e0e\u70b8\u5757\u91cd\u53e0\u68c0\u67e5: {0} (\u6a2a\u5757X:{1}, Y:{2}, \u70b8\u5757X:{3}, Y:{4})", Bridge.box(overlaps2, System.Boolean, System.Boolean.toString), Bridge.box(movedBlock.X, System.Int32), Bridge.box(movedBlock.Y, System.Int32), Bridge.box(other2.X, System.Int32), Bridge.box(other2.Y, System.Int32)));

                            if (overlaps2) {
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u89e6\u53d1\u6a2a\u5757+\u70b8\u5757\u6548\u679c\uff01\u6d88\u96643\u884c: {0}, {1}, {2}", Bridge.box(((other2.Y - 1) | 0), System.Int32), Bridge.box(other2.Y, System.Int32), Bridge.box(((other2.Y + 1) | 0), System.Int32)));

                                // 记录要消除的行
                                var targetRow1 = other2.Y;

                                // 移除触发道具和炸块
                                this.RemoveBlock(movedBlock);
                                this.RemoveBlock(other2);

                                // 触发特殊效果（通过协程）
                                this.StartCoroutine$1(this.TriggerRowClear(targetRow1));
                                return true;
                            }
                        } else if (isVertical && isSameCol2 && isOtherExplosive) {
                            // 竖块：检查是否在同一列且重叠（都是1x1，所以X和Y都相同就算重叠）
                            var overlaps3 = movedBlock.X === other2.X && movedBlock.Y === other2.Y;
                            UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u7ad6\u5757\u4e0e\u70b8\u5757\u91cd\u53e0\u68c0\u67e5: {0} (\u7ad6\u5757\u4f4d\u7f6eX:{1}, Y:{2}, \u70b8\u5757\u4f4d\u7f6eX:{3}, Y:{4})", Bridge.box(overlaps3, System.Boolean, System.Boolean.toString), Bridge.box(movedBlock.X, System.Int32), Bridge.box(movedBlock.Y, System.Int32), Bridge.box(other2.X, System.Int32), Bridge.box(other2.Y, System.Int32)));

                            if (overlaps3) {
                                UnityEngine.Debug.Log$1(System.String.format("[\u9053\u5177\u4ea4\u4e92] \u89e6\u53d1\u7ad6\u5757+\u70b8\u5757\u6548\u679c\uff01\u6d88\u96643\u5217: {0}, {1}, {2}", Bridge.box(((other2.X - 1) | 0), System.Int32), Bridge.box(other2.X, System.Int32), Bridge.box(((other2.X + 1) | 0), System.Int32)));

                                // 记录要消除的列
                                var targetCol1 = other2.X;

                                // 移除触发道具和炸块
                                this.RemoveBlock(movedBlock);
                                this.RemoveBlock(other2);

                                // 触发特殊效果（通过协程）
                                this.StartCoroutine$1(this.TriggerColumnClear(targetCol1));
                                return true;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t2, System.IDisposable)) {
                        $t2.System$IDisposable$Dispose();
                    }
                }

                UnityEngine.Debug.Log$1("[\u9053\u5177\u4ea4\u4e92] \u672a\u627e\u5230\u5339\u914d\u7684\u70b8\u5757");
                return false;
            },
            /*JewelBoardManager.CheckItemInteraction end.*/

            /*JewelBoardManager.ClearAllBlocks start.*/
            /**
             * 清除所有块（两个大炸弹重叠时的效果）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.IEnumerator}
             */
            ClearAllBlocks: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    blocksToClear,
                    $t,
                    block,
                    controller,
                    maxWaitTime,
                    elapsed,
                    allAnimationsComplete,
                    $t1,
                    block1,
                    controller1,
                    $t2,
                    block2,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    UnityEngine.Debug.Log$1("[\u5927\u70b8\u5f39\u6548\u679c] \u5f00\u59cb\u6e05\u9664\u6240\u6709\u5757");

                                        this._isProcessing = true;

                                        // 禁用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.DisableInput();
                                        }

                                        // 收集所有需要清除的块
                                        blocksToClear = new (System.Collections.Generic.List$1(JewelBlockData)).$ctor1(this._blocks);

                                        // 播放清除动画
                                        $t = Bridge.getEnumerator(blocksToClear);
                                        try {
                                            while ($t.moveNext()) {
                                                block = $t.Current;
                                                if (UnityEngine.GameObject.op_Inequality(block.BlockObject, null)) {
                                                    controller = block.BlockObject.GetComponent(JewelBlockController);
                                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                                        controller.PlayClearAnimation();
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 等待动画完成
                                        maxWaitTime = 1.0; // 最多等待1秒
                                        elapsed = 0.0;
                                        allAnimationsComplete = false;
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( elapsed < maxWaitTime && !allAnimationsComplete ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 6;
                                        continue;
                                }
                                case 2: {
                                    allAnimationsComplete = true;
                                        $t1 = Bridge.getEnumerator(blocksToClear);
                                        try {
                                            while ($t1.moveNext()) {
                                                block1 = $t1.Current;
                                                if (UnityEngine.GameObject.op_Inequality(block1.BlockObject, null)) {
                                                    controller1 = block1.BlockObject.GetComponent(JewelBlockController);
                                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller1, null) && controller1.IsAnimating()) {
                                                        allAnimationsComplete = false;
                                                        break;
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        if (!allAnimationsComplete) {
                                            $step = 3;
                                            continue;
                                        } 
                                        $step = 5;
                                        continue;
                                }
                                case 3: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        $enumerator.current = null;
                                        $step = 4;
                                        return true;
                                }
                                case 4: {
                                    $step = 5;
                                    continue;
                                }
                                case 5: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 6: {
                                    // 移除所有块
                                        $t2 = Bridge.getEnumerator(blocksToClear);
                                        try {
                                            while ($t2.moveNext()) {
                                                block2 = $t2.Current;
                                                if (UnityEngine.GameObject.op_Inequality(block2.BlockObject, null)) {
                                                    UnityEngine.MonoBehaviour.Destroy(block2.BlockObject);
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t2, System.IDisposable)) {
                                                $t2.System$IDisposable$Dispose();
                                            }
                                        }

                                        this._blocks.clear();

                                        // 更新钻石计数（此时应该是0，因为所有块都被清除了）
                                        this.UpdateDiamondCount();

                                        UnityEngine.Debug.Log$1("[\u5927\u70b8\u5f39\u6548\u679c] \u6240\u6709\u5757\u5df2\u6e05\u9664\uff0c\u6e38\u620f\u7ee7\u7eed");

                                        // 在触发移动事件前，转换所有TransformBlock为BigBomb（虽然此时所有块都会被清除，但保持逻辑一致性）
                                        this.ConvertAllTransformBlocks();

                                        // 生成新行，继续游戏
                                        $enumerator.current = this.StartCoroutine$1(this.SpawnAndPushUpFromPreview());
                                        $step = 7;
                                        return true;
                                }
                                case 7: {
                                    // 应用重力
                                        $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 8;
                                        return true;
                                }
                                case 8: {
                                    // 更新钻石计数（新生成的块中可能包含钻石）
                                        this.UpdateDiamondCount();

                                        // 检查消除（可能触发连击）
                                        $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 9;
                                        return true;
                                }
                                case 9: {
                                    // 再次更新钻石计数（消除后可能有新的钻石）
                                        this.UpdateDiamondCount();

                                        // 触发移动完成事件（在所有棋盘稳定操作完成后）
                                        // 这确保游戏胜负条件检查发生在棋盘完全稳定之后
                                        if (!Bridge.staticEquals(this.OnMoveMade, null)) {
                                            this.OnMoveMade();
                                        }

                                        this._isProcessing = false;

                                        // 重新启用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.EnableInput();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.ClearAllBlocks end.*/

            /*JewelBoardManager.RemoveBlock start.*/
            /**
             * 移除块
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}    block
             * @return  {void}
             */
            RemoveBlock: function (block) {
                this._blocks.remove(block);
                if (UnityEngine.GameObject.op_Inequality(block.BlockObject, null)) {
                    UnityEngine.MonoBehaviour.Destroy(block.BlockObject);
                }
                this.UpdateDiamondCount();
            },
            /*JewelBoardManager.RemoveBlock end.*/

            /*JewelBoardManager.TriggerRowClear start.*/
            /**
             * 触发行消除（特殊效果）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}                            centerRow
             * @return  {System.Collections.IEnumerator}
             */
            TriggerRowClear: function (centerRow) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    // 禁用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.DisableInput();
                                        }

                                        $enumerator.current = this.StartCoroutine$1(this.ClearRows([((centerRow - 1) | 0), centerRow, ((centerRow + 1) | 0)]));
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    // 重新启用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.EnableInput();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.TriggerRowClear end.*/

            /*JewelBoardManager.TriggerColumnClear start.*/
            /**
             * 触发列消除（特殊效果）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}                            centerCol
             * @return  {System.Collections.IEnumerator}
             */
            TriggerColumnClear: function (centerCol) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    // 禁用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.DisableInput();
                                        }

                                        $enumerator.current = this.StartCoroutine$1(this.ClearColumns([((centerCol - 1) | 0), centerCol, ((centerCol + 1) | 0)]));
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    // 重新启用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.EnableInput();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.TriggerColumnClear end.*/

            /*JewelBoardManager.ClearRows start.*/
            /**
             * 消除指定行
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {Array.<number>}                    rows
             * @return  {System.Collections.IEnumerator}
             */
            ClearRows: function (rows) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    rowsToClear,
                    $t,
                    row,
                    diamondsToAnimate,
                    $t1,
                    row1,
                    $t2,
                    block,
                    controller,
                    maxWaitTime,
                    elapsed,
                    allAnimationsComplete,
                    animatingCount,
                    $t3,
                    diamond,
                    controller1,
                    $t4,
                    row2,
                    $t5,
                    child,
                    controller2,
                    hasDiamondDestroyed,
                    spawnChance,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (rows === void 0) { rows = []; }
                                        rowsToClear = new (System.Collections.Generic.List$1(System.Int32)).ctor();
                                        $t = Bridge.getEnumerator(rows);
                                        try {
                                            while ($t.moveNext()) {
                                                row = $t.Current;
                                                if (row >= 0 && row < this.Config.Rows) {
                                                    rowsToClear.add(row);
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$Dispose();
                                            }
                                        }

                                        if (rowsToClear.Count > 0) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 13;
                                        continue;
                                }
                                case 1: {
                                    // 播放消除动画（钻石块和普通块同时播放）
                                        diamondsToAnimate = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                                        $t1 = Bridge.getEnumerator(rowsToClear);
                                        try {
                                            while ($t1.moveNext()) {
                                                row1 = $t1.Current;
                                                $t2 = Bridge.getEnumerator(this._blocks);
                                                try {
                                                    while ($t2.moveNext()) {
                                                        block = $t2.Current;
                                                        if (block.Y === row1 && UnityEngine.GameObject.op_Inequality(block.BlockObject, null)) {
                                                            controller = block.BlockObject.GetComponent(JewelBlockController);
                                                            if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                                                // 如果是钻石块，记录起来，同时播放动画
                                                                if (block.IsDiamond()) {
                                                                    diamondsToAnimate.add(block);
                                                                    controller.PlayClearAnimation(); // 立即播放钻石动画
                                                                } else {
                                                                    controller.PlayClearAnimation(); // 播放普通块动画
                                                                }
                                                            }
                                                        }
                                                    }
                                                } finally {
                                                    if (Bridge.is($t2, System.IDisposable)) {
                                                        $t2.System$IDisposable$Dispose();
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 等待所有动画完成（钻石和普通块同时进行）
                                        maxWaitTime = UnityEngine.Mathf.Max(this.Config.ClearAnimationTime, 1.2); // 取两者中较长的（钻石动画1秒+缓冲）
                                        elapsed = 0.0;
                                        allAnimationsComplete = false;

                                        if (diamondsToAnimate.Count > 0) {
                                            $step = 2;
                                            continue;
                                        } else  {
                                            $step = 9;
                                            continue;
                                        }
                                }
                                case 2: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] ClearRows: \u5f00\u59cb\u7b49\u5f85 {0} \u4e2a\u94bb\u77f3\u52a8\u753b\u5b8c\u6210\uff08\u540c\u65f6\u8fdb\u884c\uff09", [Bridge.box(diamondsToAnimate.Count, System.Int32)]));
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < maxWaitTime && !allAnimationsComplete ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 4: {
                                    allAnimationsComplete = true;
                                        animatingCount = 0;
                                        $t3 = Bridge.getEnumerator(diamondsToAnimate);
                                        try {
                                            while ($t3.moveNext()) {
                                                diamond = $t3.Current;
                                                if (UnityEngine.GameObject.op_Inequality(diamond.BlockObject, null) && diamond.BlockObject.activeSelf) {
                                                    controller1 = diamond.BlockObject.GetComponent(JewelBlockController);
                                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller1, null) && controller1.IsAnimating()) {
                                                        allAnimationsComplete = false;
                                                        animatingCount = (animatingCount + 1) | 0;
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t3, System.IDisposable)) {
                                                $t3.System$IDisposable$Dispose();
                                            }
                                        }

                                        if (!allAnimationsComplete) {
                                            $step = 5;
                                            continue;
                                        } 
                                        $step = 7;
                                        continue;
                                }
                                case 5: {
                                    $enumerator.current = new UnityEngine.WaitForSeconds(0.1);
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    elapsed += 0.1;
                                    $step = 7;
                                    continue;
                                }
                                case 7: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 8: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] ClearRows: \u6240\u6709\u52a8\u753b\u5b8c\u6210\uff0c\u7b49\u5f85\u65f6\u95f4: {0:F1}\u79d2", [Bridge.box(elapsed, System.Single, System.Single.format, System.Single.getHashCode)]));
                                    $step = 11;
                                    continue;
                                }
                                case 9: {
                                    // 没有钻石块，只等待普通块动画
                                        $enumerator.current = new UnityEngine.WaitForSeconds(this.Config.ClearAnimationTime);
                                        $step = 10;
                                        return true;
                                }
                                case 10: {
                                    $step = 11;
                                    continue;
                                }
                                case 11: {
                                    // 额外等待一小段时间确保动画完全结束
                                        $enumerator.current = new UnityEngine.WaitForSeconds(0.2);
                                        $step = 12;
                                        return true;
                                }
                                case 12: {
                                    // 移除被消除的块（动画完成后才销毁）
                                        UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] \u5f00\u59cb\u9500\u6bc1\u5757\uff0c\u884c\u6570: {0}", [Bridge.box(rowsToClear.Count, System.Int32)]));
                                        this._blocks.RemoveAll(function (b) {
                                            return rowsToClear.contains(b.Y);
                                        });
                                        $t4 = Bridge.getEnumerator(rowsToClear);
                                        try {
                                            while ($t4.moveNext()) {
                                                row2 = $t4.Current;
                                                $t5 = Bridge.getEnumerator(this.BoardContainer);
                                                try {
                                                    while ($t5.moveNext()) {
                                                        child = Bridge.cast($t5.Current, UnityEngine.Transform);
                                                        controller2 = child.GetComponent(JewelBlockController);
                                                        if (UnityEngine.MonoBehaviour.op_Inequality(controller2, null) && controller2.GetBlockData() != null && controller2.GetBlockData().Y === row2) {
                                                            UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] \u9500\u6bc1\u5757\uff0c\u884c: {0}, \u5757ID: {1}, \u662f\u94bb\u77f3: {2}, \u52a8\u753b\u4e2d: {3}", Bridge.box(row2, System.Int32), Bridge.box(controller2.GetBlockData().Id, System.Int32), Bridge.box(controller2.GetBlockData().IsDiamond(), System.Boolean, System.Boolean.toString), Bridge.box(controller2.IsAnimating(), System.Boolean, System.Boolean.toString)));
                                                            UnityEngine.MonoBehaviour.Destroy(child.gameObject);
                                                        }
                                                    }
                                                } finally {
                                                    if (Bridge.is($t5, System.IDisposable)) {
                                                        $t5.System$IDisposable$Dispose();
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t4, System.IDisposable)) {
                                                $t4.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 更新钻石块计数
                                        this.UpdateDiamondCount();

                                        // 触发事件（传递是否有钻石销毁的信息）
                                        hasDiamondDestroyed = diamondsToAnimate.Count > 0;
                                        if (!Bridge.staticEquals(this.OnRowCleared, null)) {
                                            this.OnRowCleared(rowsToClear.Count, hasDiamondDestroyed);
                                        }

                                        // 随机生成道具（在消除的行中随机位置）
                                        spawnChance = this.GetItemSpawnChance();
                                        if (this.Config != null && this.Config.EnableItems && UnityEngine.Random.value < spawnChance && rowsToClear.Count > 0) {
                                            this.SpawnRandomItem(rowsToClear.getItem(0));
                                        }
                                    $step = 13;
                                    continue;
                                }
                                case 13: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.ClearRows end.*/

            /*JewelBoardManager.ClearColumns start.*/
            /**
             * 消除指定列
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {Array.<number>}                    columns
             * @return  {System.Collections.IEnumerator}
             */
            ClearColumns: function (columns) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    colsToClear,
                    $t,
                    col,
                    blocksToRemove,
                    $t1,
                    block,
                    $t2,
                    col1,
                    diamondsToAnimate,
                    $t3,
                    block1,
                    controller,
                    maxWaitTime,
                    elapsed,
                    allAnimationsComplete,
                    animatingCount,
                    $t4,
                    diamond,
                    controller1,
                    $t5,
                    block2,
                    hasDiamondDestroyed,
                    spawnChance,
                    randomRow,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (columns === void 0) { columns = []; }
                                        colsToClear = new (System.Collections.Generic.List$1(System.Int32)).ctor();
                                        $t = Bridge.getEnumerator(columns);
                                        try {
                                            while ($t.moveNext()) {
                                                col = $t.Current;
                                                if (col >= 0 && col < this.Config.Columns) {
                                                    colsToClear.add(col);
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$Dispose();
                                            }
                                        }

                                        if (colsToClear.Count > 0) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 13;
                                        continue;
                                }
                                case 1: {
                                    blocksToRemove = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();

                                        // 找到所有需要消除的块（块覆盖了要消除的列）
                                        $t1 = Bridge.getEnumerator(this._blocks);
                                        try {
                                            while ($t1.moveNext()) {
                                                block = $t1.Current;
                                                $t2 = Bridge.getEnumerator(colsToClear);
                                                try {
                                                    while ($t2.moveNext()) {
                                                        col1 = $t2.Current;
                                                        if (block.X <= col1 && ((block.X + block.Width) | 0) > col1) {
                                                            if (!blocksToRemove.contains(block)) {
                                                                blocksToRemove.add(block);
                                                            }
                                                            break; // 找到匹配就跳出内层循环
                                                        }
                                                    }
                                                } finally {
                                                    if (Bridge.is($t2, System.IDisposable)) {
                                                        $t2.System$IDisposable$Dispose();
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 播放消除动画（钻石块和普通块同时播放）
                                        diamondsToAnimate = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                                        $t3 = Bridge.getEnumerator(blocksToRemove);
                                        try {
                                            while ($t3.moveNext()) {
                                                block1 = $t3.Current;
                                                if (UnityEngine.GameObject.op_Inequality(block1.BlockObject, null)) {
                                                    controller = block1.BlockObject.GetComponent(JewelBlockController);
                                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller, null)) {
                                                        // 如果是钻石块，记录起来，同时播放动画
                                                        if (block1.IsDiamond()) {
                                                            diamondsToAnimate.add(block1);
                                                            controller.PlayClearAnimation(); // 立即播放钻石动画
                                                        } else {
                                                            controller.PlayClearAnimation(); // 播放普通块动画
                                                        }
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t3, System.IDisposable)) {
                                                $t3.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 等待所有动画完成（钻石和普通块同时进行）
                                        maxWaitTime = UnityEngine.Mathf.Max(this.Config.ClearAnimationTime, 1.2); // 取两者中较长的（钻石动画1秒+缓冲）
                                        elapsed = 0.0;
                                        allAnimationsComplete = false;

                                        if (diamondsToAnimate.Count > 0) {
                                            $step = 2;
                                            continue;
                                        } else  {
                                            $step = 9;
                                            continue;
                                        }
                                }
                                case 2: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] ClearColumns: \u5f00\u59cb\u7b49\u5f85 {0} \u4e2a\u94bb\u77f3\u52a8\u753b\u5b8c\u6210\uff08\u540c\u65f6\u8fdb\u884c\uff09", [Bridge.box(diamondsToAnimate.Count, System.Int32)]));
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < maxWaitTime && !allAnimationsComplete ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 4: {
                                    allAnimationsComplete = true;
                                        animatingCount = 0;
                                        $t4 = Bridge.getEnumerator(diamondsToAnimate);
                                        try {
                                            while ($t4.moveNext()) {
                                                diamond = $t4.Current;
                                                if (UnityEngine.GameObject.op_Inequality(diamond.BlockObject, null) && diamond.BlockObject.activeSelf) {
                                                    controller1 = diamond.BlockObject.GetComponent(JewelBlockController);
                                                    if (UnityEngine.MonoBehaviour.op_Inequality(controller1, null) && controller1.IsAnimating()) {
                                                        allAnimationsComplete = false;
                                                        animatingCount = (animatingCount + 1) | 0;
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t4, System.IDisposable)) {
                                                $t4.System$IDisposable$Dispose();
                                            }
                                        }

                                        if (!allAnimationsComplete) {
                                            $step = 5;
                                            continue;
                                        } 
                                        $step = 7;
                                        continue;
                                }
                                case 5: {
                                    $enumerator.current = new UnityEngine.WaitForSeconds(0.1);
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    elapsed += 0.1;
                                    $step = 7;
                                    continue;
                                }
                                case 7: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 8: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u94bb\u77f3\u52a8\u753b] ClearColumns: \u6240\u6709\u52a8\u753b\u5b8c\u6210\uff0c\u7b49\u5f85\u65f6\u95f4: {0:F1}\u79d2", [Bridge.box(elapsed, System.Single, System.Single.format, System.Single.getHashCode)]));
                                    $step = 11;
                                    continue;
                                }
                                case 9: {
                                    // 没有钻石块，只等待普通块动画
                                        $enumerator.current = new UnityEngine.WaitForSeconds(this.Config.ClearAnimationTime);
                                        $step = 10;
                                        return true;
                                }
                                case 10: {
                                    $step = 11;
                                    continue;
                                }
                                case 11: {
                                    // 额外等待一小段时间确保动画完全结束
                                        $enumerator.current = new UnityEngine.WaitForSeconds(0.2);
                                        $step = 12;
                                        return true;
                                }
                                case 12: {
                                    // 移除被消除的块（动画完成后才销毁）
                                        $t5 = Bridge.getEnumerator(blocksToRemove);
                                        try {
                                            while ($t5.moveNext()) {
                                                block2 = $t5.Current;
                                                this._blocks.remove(block2);
                                                if (UnityEngine.GameObject.op_Inequality(block2.BlockObject, null)) {
                                                    // 如果对象已经被动画隐藏，直接销毁
                                                    if (!block2.BlockObject.activeSelf) {
                                                        UnityEngine.MonoBehaviour.Destroy(block2.BlockObject);
                                                    } else {
                                                        // 如果还在显示，强制销毁（防止动画未完成的情况）
                                                        UnityEngine.MonoBehaviour.Destroy(block2.BlockObject);
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t5, System.IDisposable)) {
                                                $t5.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 更新钻石块计数
                                        this.UpdateDiamondCount();

                                        // 触发事件（按列数计算，但使用行清除事件，传递是否有钻石销毁的信息）
                                        hasDiamondDestroyed = diamondsToAnimate.Count > 0;
                                        if (!Bridge.staticEquals(this.OnRowCleared, null)) {
                                            this.OnRowCleared(colsToClear.Count, hasDiamondDestroyed);
                                        }

                                        // 随机生成道具（在消除的列中随机位置）
                                        spawnChance = this.GetItemSpawnChance();
                                        if (this.Config != null && this.Config.EnableItems && UnityEngine.Random.value < spawnChance && colsToClear.Count > 0) {
                                            randomRow = UnityEngine.Random.Range(0, this.Config.Rows);
                                            this.SpawnRandomItem(randomRow);
                                        }
                                    $step = 13;
                                    continue;
                                }
                                case 13: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.ClearColumns end.*/

            /*JewelBoardManager.SpecialEffectGameLoop start.*/
            /**
             * 特殊效果游戏循环
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {JewelBlockData}                    triggerBlock
             * @return  {System.Collections.IEnumerator}
             */
            SpecialEffectGameLoop: function (triggerBlock) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    this._isProcessing = true;

                                        // 禁用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.DisableInput();
                                        }

                                        // 应用重力
                                        $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    // 检查消除
                                        $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    // 生成新行并上推
                                        $enumerator.current = this.StartCoroutine$1(this.SpawnAndPushUpFromPreview());
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    // 再次应用重力
                                        $enumerator.current = this.StartCoroutine$1(this.ApplyGravity());
                                        $step = 4;
                                        return true;
                                }
                                case 4: {
                                    // 再次检查连击
                                        $enumerator.current = this.StartCoroutine$1(this.CheckClearRecursive());
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    // 渲染
                                        this.RenderAllBlocks();

                                        // 检查游戏结束
                                        this.CheckGameOver();

                                        this._isProcessing = false;

                                        // 重新启用输入
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this._inputHandler, null)) {
                                            this._inputHandler.EnableInput();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.SpecialEffectGameLoop end.*/

            /*JewelBoardManager.SpawnRandomItem start.*/
            /**
             * 随机生成道具
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {number}    row
             * @return  {void}
             */
            SpawnRandomItem: function (row) {
                var $t;
                // 在指定行的随机位置生成道具
                var randomX = UnityEngine.Random.Range(0, this.Config.Columns);

                // 检查该位置是否已有块
                var canSpawn = true;
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        if (block.Y === row && block.X <= randomX && ((block.X + block.Width) | 0) > randomX) {
                            canSpawn = false;
                            break;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (!canSpawn) {
                    return;
                }

                // 根据权重随机选择道具类型
                var itemType = this.GetRandomItemByWeight();

                // 创建道具块（1x1大小）
                var itemData = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), randomX, row, 1, itemType);
                this.CreateBlock(itemData);

                // 触发事件
                if (!Bridge.staticEquals(this.OnItemSpawned, null)) {
                    this.OnItemSpawned(itemType);
                }

                // 更新钻石块计数
                this.UpdateDiamondCount();
            },
            /*JewelBoardManager.SpawnRandomItem end.*/

            /*JewelBoardManager.GetItemSpawnChance start.*/
            /**
             * 获取道具生成概率
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {number}
             */
            GetItemSpawnChance: function () {
                if (this.ItemSpawnChance > 0) {
                    return this.ItemSpawnChance; // 使用Inspector中设置的值
                } else if (this.Config != null) {
                    return this.Config.ItemSpawnChance; // 使用Config中的值
                }
                return 0.3; // 默认值
            },
            /*JewelBoardManager.GetItemSpawnChance end.*/

            /*JewelBoardManager.GetRandomItemByWeight start.*/
            /**
             * 根据权重随机获取道具类型
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {JewelColor}
             */
            GetRandomItemByWeight: function () {
                var $t, $t1;
                if (this.Config == null) {
                    // 默认随机选择
                    var itemTypes = System.Array.init([
                        JewelColor.Diamond, 
                        JewelColor.BigBomb, 
                        JewelColor.Horizontal, 
                        JewelColor.Vertical, 
                        JewelColor.Explosive, 
                        JewelColor.TransformBlock
                    ], JewelColor);
                    return itemTypes[UnityEngine.Random.Range(0, itemTypes.length)];
                }

                // 使用权重系统
                var weightedItems = new (System.Collections.Generic.List$1(System.Tuple$2(JewelColor,System.Int32))).ctor();
                weightedItems.add({ Item1: JewelColor.Diamond, Item2: this.Config.DiamondWeight });
                weightedItems.add({ Item1: JewelColor.BigBomb, Item2: this.Config.BigBombWeight });
                weightedItems.add({ Item1: JewelColor.Horizontal, Item2: this.Config.HorizontalWeight });
                weightedItems.add({ Item1: JewelColor.Vertical, Item2: this.Config.VerticalWeight });
                weightedItems.add({ Item1: JewelColor.Explosive, Item2: this.Config.ExplosiveWeight });
                // TransformBlock使用与BigBomb相同的权重
                weightedItems.add({ Item1: JewelColor.TransformBlock, Item2: this.Config.BigBombWeight });

                var totalWeight = 0;
                $t = Bridge.getEnumerator(weightedItems);
                try {
                    while ($t.moveNext()) {
                        var item = $t.Current;
                        totalWeight = (totalWeight + item.Item2) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (totalWeight <= 0) {
                    // 如果权重总和为0，使用默认随机
                    var itemTypes1 = System.Array.init([
                        JewelColor.Diamond, 
                        JewelColor.BigBomb, 
                        JewelColor.Horizontal, 
                        JewelColor.Vertical, 
                        JewelColor.Explosive, 
                        JewelColor.TransformBlock
                    ], JewelColor);
                    return itemTypes1[UnityEngine.Random.Range(0, itemTypes1.length)];
                }

                var randomValue = UnityEngine.Random.Range(0, totalWeight);
                var currentWeight = 0;

                $t1 = Bridge.getEnumerator(weightedItems);
                try {
                    while ($t1.moveNext()) {
                        var item1 = $t1.Current;
                        currentWeight = (currentWeight + item1.Item2) | 0;
                        if (randomValue < currentWeight) {
                            return item1.Item1;
                        }
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$Dispose();
                    }
                }

                // 默认返回第一个
                return weightedItems.getItem(0).Item1;
            },
            /*JewelBoardManager.GetRandomItemByWeight end.*/

            /*JewelBoardManager.UpdateDiamondCount start.*/
            /**
             * 更新钻石块计数
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            UpdateDiamondCount: function () {
                var $t;
                var count = 0;
                $t = Bridge.getEnumerator(this._blocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        if (block.IsDiamond()) {
                            count = (count + 1) | 0;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (!Bridge.staticEquals(this.OnDiamondCountChanged, null)) {
                    this.OnDiamondCountChanged(count);
                }
            },
            /*JewelBoardManager.UpdateDiamondCount end.*/

            /*JewelBoardManager.SpawnAndPushUpFromPreview start.*/
            /**
             * 生成新行并上推（带动画）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.IEnumerator}
             */
            SpawnAndPushUpFromPreview: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    maxRows,
                    $t,
                    block,
                    newBlocks,
                    $t1,
                    blockData,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    // 检查是否有块已经达到或超过最大行数
                                        maxRows = this.Config.Rows;

                                        $t = Bridge.getEnumerator(this._blocks);
                                        $step = 1;
                                        continue;
                                }
                                case 1: {
                                    if ($t.moveNext()) {
                                            block = $t.Current;
                                            $step = 2;
                                            continue;
                                        }
                                    $step = 5;
                                    continue;
                                }
                                case 2: {
                                    if (((block.Y + 1) | 0) >= maxRows) {
                                            $step = 3;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 3: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u65b0\u884c\u751f\u6210] \u68c0\u6d4b\u5230\u5757\u5df2\u8d85\u8fc7\u884c\u6570\u9650\u5236: \u5757Y={0}, \u6700\u5927\u884c\u6570={1}\uff0c\u505c\u6b62\u751f\u6210\u65b0\u884c", Bridge.box(block.Y, System.Int32), Bridge.box(maxRows, System.Int32)));
                                        this._isProcessing = false;
                                        return false;
                                    $step = 4;
                                    continue;
                                }
                                case 4: {
                                    $step = 1;
                                    continue;
                                }
                                case 5: {
                                    // 创建新行在 Y=-1（屏幕下方）
                                        newBlocks = new (System.Collections.Generic.List$1(JewelBlockData)).ctor();
                                        $t1 = Bridge.getEnumerator(this._nextRowData);
                                        try {
                                            while ($t1.moveNext()) {
                                                blockData = $t1.Current;
                                                blockData.Y = -1; // 从下方开始
                                                this.CreateBlock(blockData);
                                                newBlocks.add(blockData);
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 使用动画让所有块同时向上移动
                                        $enumerator.current = this.StartCoroutine$1(this.AnimatePushUpBlocks(newBlocks));
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    // 生成下一行预览数据
                                        this.GenerateNextRowData();

                                        // 上推完成后，检查是否需要生成bigbomb
                                        if (this._pendingStep5BigBombSpawn) {
                                            $step = 7;
                                            continue;
                                        } 
                                        $step = 9;
                                        continue;
                                }
                                case 7: {
                                    this._pendingStep5BigBombSpawn = false;
                                        UnityEngine.Debug.Log$1("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u4e0a\u63a8\u5b8c\u6210\uff0c\u5f00\u59cb\u751f\u6210bigbomb");
                                        $enumerator.current = this.StartCoroutine$1(this.SpawnStep5BigBombs());
                                        $step = 8;
                                        return true;
                                }
                                case 8: {
                                    $step = 9;
                                    continue;
                                }
                                case 9: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.SpawnAndPushUpFromPreview end.*/

            /*JewelBoardManager.AnimatePushUpBlocks start.*/
            /**
             * 动画推动所有块向上移动（新块从下方顶上来）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @param   {System.Collections.Generic.List$1}    newBlocks
             * @return  {System.Collections.IEnumerator}
             */
            AnimatePushUpBlocks: function (newBlocks) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    duration,
                    elapsed,
                    startPositions,
                    targetPositions,
                    targetYValues,
                    $t,
                    block,
                    controller,
                    rectTransform,
                    targetY,
                    x,
                    y,
                    t,
                    $t1,
                    kvp,
                    controller1,
                    startPos,
                    targetPos,
                    rectTransform1,
                    $t2,
                    kvp1,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    duration = this.Config.RowRiseTime;
                                        elapsed = 0.0;

                                        // 记录所有块的起始位置和目标位置
                                        startPositions = new (System.Collections.Generic.Dictionary$2(JewelBlockController,UnityEngine.Vector2)).ctor();
                                        targetPositions = new (System.Collections.Generic.Dictionary$2(JewelBlockController,UnityEngine.Vector2)).ctor();
                                        targetYValues = new (System.Collections.Generic.Dictionary$2(JewelBlockData,System.Int32)).ctor();

                                        // 为所有块计算起始和目标位置
                                        $t = Bridge.getEnumerator(this._blocks);
                                        try {
                                            while ($t.moveNext()) {
                                                block = $t.Current;
                                                if (UnityEngine.GameObject.op_Equality(block.BlockObject, null)) {
                                                    continue;
                                                }

                                                controller = block.BlockObject.GetComponent(JewelBlockController);
                                                if (UnityEngine.MonoBehaviour.op_Equality(controller, null)) {
                                                    continue;
                                                }

                                                rectTransform = controller.GetComponent(UnityEngine.RectTransform);
                                                if (UnityEngine.Component.op_Equality(rectTransform, null)) {
                                                    continue;
                                                }

                                                // 记录起始位置
                                                startPositions.setItem(controller, rectTransform.anchoredPosition.$clone());

                                                // 计算目标Y坐标：旧块上移1格，新块从-1移到0
                                                targetY = newBlocks.contains(block) ? 0 : ((block.Y + 1) | 0);
                                                targetYValues.setItem(block, targetY);

                                                // 计算目标位置（基于目标Y坐标）
                                                x = (this._cellWidth * block.X) + (this._cellWidth * block.Width / 2.0) - (this._boardWidth / 2.0);
                                                y = this._bottomOffsetY + (this._cellHeight * targetY) + (this._cellHeight / 2.0);
                                                targetPositions.setItem(controller, new pc.Vec2( x, y ));
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 平滑动画
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( elapsed < duration ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = Math.max(0, Math.min(1, elapsed / duration));
                                        // 使用缓出曲线
                                        t = 1.0 - Math.pow(1.0 - t, 2.0);

                                        $t1 = Bridge.getEnumerator(startPositions);
                                        try {
                                            while ($t1.moveNext()) {
                                                kvp = $t1.Current;
                                                controller1 = kvp.key;
                                                startPos = kvp.value.$clone();
                                                targetPos = targetPositions.getItem(controller1).$clone();

                                                rectTransform1 = controller1.GetComponent(UnityEngine.RectTransform);
                                                if (UnityEngine.Component.op_Inequality(rectTransform1, null)) {
                                                    rectTransform1.anchoredPosition = new pc.Vec2().lerp( startPos, targetPos, t );
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t1, System.IDisposable)) {
                                                $t1.System$IDisposable$Dispose();
                                            }
                                        }

                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {
                                    // 更新所有块的逻辑Y坐标
                                        $t2 = Bridge.getEnumerator(targetYValues);
                                        try {
                                            while ($t2.moveNext()) {
                                                kvp1 = $t2.Current;
                                                kvp1.key.Y = kvp1.value;
                                            }
                                        } finally {
                                            if (Bridge.is($t2, System.IDisposable)) {
                                                $t2.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 确保最终位置准确
                                        this.RenderAllBlocks();

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.AnimatePushUpBlocks end.*/

            /*JewelBoardManager.GenerateNextRowData start.*/
            /**
             * 生成下一行预览数据
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            GenerateNextRowData: function () {
                this._nextRowData = this.GenerateRowData(0);
            },
            /*JewelBoardManager.GenerateNextRowData end.*/

            /*JewelBoardManager.GetNextRowData start.*/
            /**
             * 获取下一行预览数据
             *
             * @instance
             * @public
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.Generic.List$1}
             */
            GetNextRowData: function () {
                return this._nextRowData;
            },
            /*JewelBoardManager.GetNextRowData end.*/

            /*JewelBoardManager.CheckGameOver start.*/
            /**
             * 检查游戏结束
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {void}
             */
            CheckGameOver: function () {
                // 游戏机制：只有步数用完或钻石收集完才结束游戏
                // 块堆到顶不触发游戏结束，继续游戏即可

                // 注释掉原有的堆到顶判定逻辑
                // int gameOverRow = Config.GetGameOverRow();
                //
                // foreach (var block in _blocks)
                // {
                //     if (block.Y >= gameOverRow)
                //     {
                //         Debug.Log($"[游戏结束] CheckGameOver触发游戏结束！块Y={block.Y}, GameOverRow={gameOverRow}, 块颜色={block.Color}");
                //         if (OnGameOver != null)
                //         {
                //             OnGameOver();
                //         }
                //         return;
                //     }
                // }

                // 游戏胜负由GameManager的CheckWinLoseConditions判定
                // - 胜利：钻石数量为0（收集完所有钻石）
                // - 失败：步数用完且钻石未收集完
            },
            /*JewelBoardManager.CheckGameOver end.*/

            /*JewelBoardManager.SpawnStep5BigBombs start.*/
            /**
             * 生成第一关第5步的bigbomb（在上推完成后调用）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {System.Collections.IEnumerator}
             */
            SpawnStep5BigBombs: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    positions,
                    x1,
                    y1,
                    x2,
                    y2,
                    bigBombBlock1,
                    bigBombBlock2,
                    controller1,
                    controller2,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    // 检查条件
                                        if (!this._isCurrentlyFirstLevel || this._firstLevelMoveCount !== 5 || this._hasSpawnedStep5BigBomb) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    UnityEngine.Debug.LogWarning$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u2717 \u6761\u4ef6\u68c0\u67e5\u5931\u8d25: _isCurrentlyFirstLevel={0}, _firstLevelMoveCount={1}, _hasSpawnedStep5BigBomb={2}", Bridge.box(this._isCurrentlyFirstLevel, System.Boolean, System.Boolean.toString), Bridge.box(this._firstLevelMoveCount, System.Int32), Bridge.box(this._hasSpawnedStep5BigBomb, System.Boolean, System.Boolean.toString)));
                                        return false;
                                    $step = 2;
                                    continue;
                                }
                                case 2: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u2713 \u6761\u4ef6\u68c0\u67e5\u901a\u8fc7\uff0c\u4e0a\u63a8\u5df2\u5b8c\u6210\uff0c\u51c6\u5907\u751f\u6210bigbomb", null));

                                        UnityEngine.Debug.Log$1("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u5f00\u59cb\u67e5\u627e\u4f4d\u7f6e\u751f\u62102\u4e2abigbomb\uff08\u4f18\u5148\u4e0a\u4e0b\u5173\u7cfb\uff09");
                                        UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u5f53\u524d\u5757\u6570\u91cf: {0}", [Bridge.box(this._blocks.Count, System.Int32)]));

                                        // 查找可以生成2个bigbomb的位置（优先上下关系）
                                        positions = this.FindTwoPositionsForBigBombs();

                                        if (positions != null) {
                                            x1 = positions.X1;
                                            y1 = positions.Y1;
                                            x2 = positions.X2;
                                            y2 = positions.Y2;
                                            UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u627e\u5230\u4f4d\u7f6e ({0}, {1}) \u548c ({2}, {3})\uff0c\u751f\u62102\u4e2abigbomb", Bridge.box(x1, System.Int32), Bridge.box(y1, System.Int32), Bridge.box(x2, System.Int32), Bridge.box(y2, System.Int32)));

                                            // 在第一个位置生成bigbomb
                                            bigBombBlock1 = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), x1, y1, 1, JewelColor.BigBomb);

                                            this.CreateBlock(bigBombBlock1);
                                            UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u5df2\u521b\u5efa\u7b2c\u4e00\u4e2aBigBomb: ID={0}, X={1}, Y={2}, Color={3}, BlockObject={4}", Bridge.box(bigBombBlock1.Id, System.Int32), Bridge.box(bigBombBlock1.X, System.Int32), Bridge.box(bigBombBlock1.Y, System.Int32), Bridge.box(bigBombBlock1.Color, JewelColor, System.Enum.toStringFn(JewelColor)), (UnityEngine.GameObject.op_Inequality(bigBombBlock1.BlockObject, null) ? "\u5b58\u5728" : "null")));

                                            // 在第二个位置生成bigbomb
                                            bigBombBlock2 = new JewelBlockData(Bridge.identity(this._blockIdCounter, ((this._blockIdCounter = (this._blockIdCounter + 1) | 0))), x2, y2, 1, JewelColor.BigBomb);

                                            this.CreateBlock(bigBombBlock2);
                                            UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u5df2\u521b\u5efa\u7b2c\u4e8c\u4e2aBigBomb: ID={0}, X={1}, Y={2}, Color={3}, BlockObject={4}", Bridge.box(bigBombBlock2.Id, System.Int32), Bridge.box(bigBombBlock2.X, System.Int32), Bridge.box(bigBombBlock2.Y, System.Int32), Bridge.box(bigBombBlock2.Color, JewelColor, System.Enum.toStringFn(JewelColor)), (UnityEngine.GameObject.op_Inequality(bigBombBlock2.BlockObject, null) ? "\u5b58\u5728" : "null")));

                                            // 确保GameObject已激活
                                            if (UnityEngine.GameObject.op_Inequality(bigBombBlock1.BlockObject, null)) {
                                                bigBombBlock1.BlockObject.SetActive(true);
                                                controller1 = bigBombBlock1.BlockObject.GetComponent(JewelBlockController);
                                                if (UnityEngine.MonoBehaviour.op_Inequality(controller1, null)) {
                                                    controller1.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                                                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u7b2c\u4e00\u4e2aBigBomb GameObject\u5df2\u6fc0\u6d3b\uff0c\u4f4d\u7f6e\u5df2\u66f4\u65b0", null));
                                                }
                                            }

                                            if (UnityEngine.GameObject.op_Inequality(bigBombBlock2.BlockObject, null)) {
                                                bigBombBlock2.BlockObject.SetActive(true);
                                                controller2 = bigBombBlock2.BlockObject.GetComponent(JewelBlockController);
                                                if (UnityEngine.MonoBehaviour.op_Inequality(controller2, null)) {
                                                    controller2.UpdatePosition(this._cellWidth, this._cellHeight, this._boardWidth, this._boardHeight, this._bottomOffsetY);
                                                    UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u7b2c\u4e8c\u4e2aBigBomb GameObject\u5df2\u6fc0\u6d3b\uff0c\u4f4d\u7f6e\u5df2\u66f4\u65b0", null));
                                                }
                                            }

                                            this.RenderAllBlocks();

                                            // 标记已生成，防止重复生成
                                            this._hasSpawnedStep5BigBomb = true;

                                            // 触发道具生成事件
                                            if (!Bridge.staticEquals(this.OnItemSpawned, null)) {
                                                this.OnItemSpawned(JewelColor.BigBomb);
                                                this.OnItemSpawned(JewelColor.BigBomb);
                                            }

                                            UnityEngine.Debug.Log$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] 2\u4e2aBigBomb\u5df2\u751f\u6210\u5728\u4f4d\u7f6e ({0}, {1}) \u548c ({2}, {3})\uff0c\u5f53\u524d\u5757\u603b\u6570: {4}", Bridge.box(x1, System.Int32), Bridge.box(y1, System.Int32), Bridge.box(x2, System.Int32), Bridge.box(y2, System.Int32), Bridge.box(this._blocks.Count, System.Int32)));
                                        } else {
                                            UnityEngine.Debug.LogWarning$1("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u672a\u627e\u5230\u53ef\u4ee5\u751f\u62102\u4e2abigbomb\u7684\u4f4d\u7f6e");
                                            UnityEngine.Debug.LogWarning$1(System.String.format("[\u7b2c\u4e00\u5173\u7b2c5\u6b65] \u6e38\u620f\u677f\u5c3a\u5bf8: {0}x{1}, \u5f53\u524d\u5757\u6570\u91cf: {2}", Bridge.box(this.Config.Columns, System.Int32), Bridge.box(this.Config.Rows, System.Int32), Bridge.box(this._blocks.Count, System.Int32)));
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelBoardManager.SpawnStep5BigBombs end.*/

            /*JewelBoardManager.FindTwoPositionsForBigBombs start.*/
            /**
             * 查找可以生成2个bigbomb的位置（优先上下关系）
             返回: TwoPositions 两个位置的坐标，如果找不到则返回null
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {JewelBoardManager.TwoPositions}
             */
            FindTwoPositionsForBigBombs: function () {
                UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u5f00\u59cb\u67e5\u627e2\u4e2a\u4f4d\u7f6e\u751f\u6210bigbomb\uff0c\u6e38\u620f\u677f\u5c3a\u5bf8: {0}x{1}", Bridge.box(this.Config.Columns, System.Int32), Bridge.box(this.Config.Rows, System.Int32)));

                // 优先查找上下关系的两个空位
                for (var y = 0; y < ((this.Config.Rows - 1) | 0); y = (y + 1) | 0) {
                    for (var x = 0; x < this.Config.Columns; x = (x + 1) | 0) {
                        // 检查当前位置和上方位置是否都为空
                        if (this.GetBlockAt(x, y) == null && this.GetBlockAt(x, ((y + 1) | 0)) == null) {
                            UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u627e\u5230\u4e0a\u4e0b\u5173\u7cfb\u7684\u4e24\u4e2a\u7a7a\u4f4d: ({0}, {1}) \u548c ({2}, {3})", Bridge.box(x, System.Int32), Bridge.box(y, System.Int32), Bridge.box(x, System.Int32), Bridge.box(((y + 1) | 0), System.Int32)));
                            return new JewelBoardManager.TwoPositions(x, y, x, ((y + 1) | 0));
                        }
                    }
                }

                // 如果找不到上下关系，查找左右关系的两个空位
                UnityEngine.Debug.Log$1("[\u67e5\u627e\u7a7a\u4f4d] \u672a\u627e\u5230\u4e0a\u4e0b\u5173\u7cfb\u7684\u7a7a\u4f4d\uff0c\u5c1d\u8bd5\u67e5\u627e\u5de6\u53f3\u5173\u7cfb");
                for (var y1 = 0; y1 < this.Config.Rows; y1 = (y1 + 1) | 0) {
                    for (var x1 = 0; x1 < ((this.Config.Columns - 1) | 0); x1 = (x1 + 1) | 0) {
                        // 检查当前位置和右侧位置是否都为空
                        if (this.GetBlockAt(x1, y1) == null && this.GetBlockAt(((x1 + 1) | 0), y1) == null) {
                            UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u627e\u5230\u5de6\u53f3\u5173\u7cfb\u7684\u4e24\u4e2a\u7a7a\u4f4d: ({0}, {1}) \u548c ({2}, {3})", Bridge.box(x1, System.Int32), Bridge.box(y1, System.Int32), Bridge.box(((x1 + 1) | 0), System.Int32), Bridge.box(y1, System.Int32)));
                            return new JewelBoardManager.TwoPositions(x1, y1, ((x1 + 1) | 0), y1);
                        }
                    }
                }

                // 如果找不到相邻的两个空位，查找任意两个空位
                UnityEngine.Debug.Log$1("[\u67e5\u627e\u7a7a\u4f4d] \u672a\u627e\u5230\u76f8\u90bb\u7684\u4e24\u4e2a\u7a7a\u4f4d\uff0c\u5c1d\u8bd5\u67e5\u627e\u4efb\u610f\u4e24\u4e2a\u7a7a\u4f4d");
                var firstX = null;
                var firstY = null;
                for (var y2 = 0; y2 < this.Config.Rows; y2 = (y2 + 1) | 0) {
                    for (var x2 = 0; x2 < this.Config.Columns; x2 = (x2 + 1) | 0) {
                        if (this.GetBlockAt(x2, y2) == null) {
                            if (firstX == null || firstY == null) {
                                firstX = x2;
                                firstY = y2;
                            } else {
                                UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u627e\u5230\u4e24\u4e2a\u4efb\u610f\u7a7a\u4f4d: ({0}, {1}) \u548c ({2}, {3})", Bridge.box(System.Nullable.getValue(firstX), System.Int32), Bridge.box(System.Nullable.getValue(firstY), System.Int32), Bridge.box(x2, System.Int32), Bridge.box(y2, System.Int32)));
                                return new JewelBoardManager.TwoPositions(System.Nullable.getValue(firstX), System.Nullable.getValue(firstY), x2, y2);
                            }
                        }
                    }
                }

                UnityEngine.Debug.LogWarning$1("[\u67e5\u627e\u7a7a\u4f4d] \u672a\u627e\u5230\u8db3\u591f\u7684\u7a7a\u4f4d\u751f\u62102\u4e2abigbomb");
                return null;
            },
            /*JewelBoardManager.FindTwoPositionsForBigBombs end.*/

            /*JewelBoardManager.FindPositionWithTwoEmptySpaces start.*/
            /**
             * 查找有2个空位的位置（上下左右都行）（保留用于兼容性）
             *
             * @instance
             * @private
             * @this JewelBoardManager
             * @memberof JewelBoardManager
             * @return  {?System.Tuple$2}
             */
            FindPositionWithTwoEmptySpaces: function () {
                UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u5f00\u59cb\u67e5\u627e\uff0c\u6e38\u620f\u677f\u5c3a\u5bf8: {0}x{1}", Bridge.box(this.Config.Columns, System.Int32), Bridge.box(this.Config.Rows, System.Int32)));

                // 先尝试找有2个或更多空位的位置
                for (var y = 0; y < this.Config.Rows; y = (y + 1) | 0) {
                    for (var x = 0; x < this.Config.Columns; x = (x + 1) | 0) {
                        // 检查该位置是否为空
                        if (this.GetBlockAt(x, y) != null) {
                            continue; // 该位置已有块
                        }

                        // 检查上下左右是否有2个空位
                        var emptyCount = 0;

                        // 上
                        if (((y + 1) | 0) < this.Config.Rows && this.GetBlockAt(x, ((y + 1) | 0)) == null) {
                            emptyCount = (emptyCount + 1) | 0;
                        }

                        // 下
                        if (((y - 1) | 0) >= 0 && this.GetBlockAt(x, ((y - 1) | 0)) == null) {
                            emptyCount = (emptyCount + 1) | 0;
                        }

                        // 左
                        if (((x - 1) | 0) >= 0 && this.GetBlockAt(((x - 1) | 0), y) == null) {
                            emptyCount = (emptyCount + 1) | 0;
                        }

                        // 右
                        if (((x + 1) | 0) < this.Config.Columns && this.GetBlockAt(((x + 1) | 0), y) == null) {
                            emptyCount = (emptyCount + 1) | 0;
                        }

                        // 如果找到有2个或更多空位的位置，返回该位置
                        if (emptyCount >= 2) {
                            UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u627e\u5230\u4f4d\u7f6e ({0}, {1})\uff0c\u5468\u56f4\u6709 {2} \u4e2a\u7a7a\u4f4d", Bridge.box(x, System.Int32), Bridge.box(y, System.Int32), Bridge.box(emptyCount, System.Int32)));
                            return { Item1: x, Item2: y };
                        }
                    }
                }

                // 如果找不到有2个空位的位置，尝试找有1个空位的位置
                UnityEngine.Debug.Log$1("[\u67e5\u627e\u7a7a\u4f4d] \u672a\u627e\u5230\u67092\u4e2a\u7a7a\u4f4d\u7684\u4f4d\u7f6e\uff0c\u5c1d\u8bd5\u627e\u67091\u4e2a\u7a7a\u4f4d\u7684\u4f4d\u7f6e");
                for (var y1 = 0; y1 < this.Config.Rows; y1 = (y1 + 1) | 0) {
                    for (var x1 = 0; x1 < this.Config.Columns; x1 = (x1 + 1) | 0) {
                        // 检查该位置是否为空
                        if (this.GetBlockAt(x1, y1) != null) {
                            continue; // 该位置已有块
                        }

                        // 检查上下左右是否有至少1个空位
                        var hasEmpty = false;

                        // 上
                        if (((y1 + 1) | 0) < this.Config.Rows && this.GetBlockAt(x1, ((y1 + 1) | 0)) == null) {
                            hasEmpty = true;
                        } else if (((y1 - 1) | 0) >= 0 && this.GetBlockAt(x1, ((y1 - 1) | 0)) == null) {
                            hasEmpty = true;
                        } else if (((x1 - 1) | 0) >= 0 && this.GetBlockAt(((x1 - 1) | 0), y1) == null) {
                            hasEmpty = true;
                        } else if (((x1 + 1) | 0) < this.Config.Columns && this.GetBlockAt(((x1 + 1) | 0), y1) == null) {
                            hasEmpty = true;
                        }

                        if (hasEmpty) {
                            UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u627e\u5230\u4f4d\u7f6e ({0}, {1})\uff0c\u5468\u56f4\u81f3\u5c11\u67091\u4e2a\u7a7a\u4f4d", Bridge.box(x1, System.Int32), Bridge.box(y1, System.Int32)));
                            return { Item1: x1, Item2: y1 };
                        }
                    }
                }

                // 如果还是找不到，就找任意一个空位
                UnityEngine.Debug.Log$1("[\u67e5\u627e\u7a7a\u4f4d] \u672a\u627e\u5230\u6709\u76f8\u90bb\u7a7a\u4f4d\u7684\u4f4d\u7f6e\uff0c\u5c1d\u8bd5\u627e\u4efb\u610f\u7a7a\u4f4d");
                for (var y2 = 0; y2 < this.Config.Rows; y2 = (y2 + 1) | 0) {
                    for (var x2 = 0; x2 < this.Config.Columns; x2 = (x2 + 1) | 0) {
                        // 检查该位置是否为空
                        if (this.GetBlockAt(x2, y2) == null) {
                            UnityEngine.Debug.Log$1(System.String.format("[\u67e5\u627e\u7a7a\u4f4d] \u627e\u5230\u4efb\u610f\u7a7a\u4f4d ({0}, {1})", Bridge.box(x2, System.Int32), Bridge.box(y2, System.Int32)));
                            return { Item1: x2, Item2: y2 };
                        }
                    }
                }

                UnityEngine.Debug.LogWarning$1("[\u67e5\u627e\u7a7a\u4f4d] \u672a\u627e\u5230\u4efb\u4f55\u7a7a\u4f4d");
                return null; // 未找到
            },
            /*JewelBoardManager.FindPositionWithTwoEmptySpaces end.*/


        }
    });
    /*JewelBoardManager end.*/

    /*JewelBoardManager+TwoPositions start.*/
    /**
     * 两个位置的坐标类（用于替换Tuple，兼容Luna打包）
     *
     * @private
     * @class JewelBoardManager.TwoPositions
     */
    Bridge.define("JewelBoardManager.TwoPositions", {
        $kind: 1002,
        fields: {
            X1: 0,
            Y1: 0,
            X2: 0,
            Y2: 0
        },
        ctors: {
            ctor: function (x1, y1, x2, y2) {
                this.$initialize();
                this.X1 = x1;
                this.Y1 = y1;
                this.X2 = x2;
                this.Y2 = y2;
            }
        }
    });
    /*JewelBoardManager+TwoPositions end.*/
    /** @namespace System */

    /**
     * @memberof System
     * @callback System.Action
     * @return  {void}
     */


    /*JewelCharacterAnimator start.*/
    /**
     * 角色序列帧动画控制器
     *
     * @public
     * @class JewelCharacterAnimator
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("JewelCharacterAnimator", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            CharacterImage: null,
            IdleSprites: null,
            LookLeftSprites: null,
            LaughSprites: null,
            IdleTotalTime: 0,
            LookLeftTotalTime: 0,
            LaughTotalTime: 0,
            LookLeftPlayCount: 0,
            LaughPlayCount: 0,
            _currentAnimation: null,
            _isPlayingOneShot: false
        },
        ctors: {
            init: function () {
                this.IdleTotalTime = 2.0;
                this.LookLeftTotalTime = 1.5;
                this.LaughTotalTime = 1.5;
                this.LookLeftPlayCount = 1;
                this.LaughPlayCount = 1;
                this._isPlayingOneShot = false;
            }
        },
        methods: {
            /*JewelCharacterAnimator.Start start.*/
            Start: function () {
                // 开始时播放待机动画
                this.PlayIdleAnimation();
            },
            /*JewelCharacterAnimator.Start end.*/

            /*JewelCharacterAnimator.PlayIdleAnimation start.*/
            /**
             * 播放待机动画（循环）
             *
             * @instance
             * @public
             * @this JewelCharacterAnimator
             * @memberof JewelCharacterAnimator
             * @return  {void}
             */
            PlayIdleAnimation: function () {
                if (this._isPlayingOneShot) {
                    return;
                } // 如果正在播放一次性动画，不切换

                this.StopCurrentAnimation();
                if (this.IdleSprites != null && this.IdleSprites.length > 0) {
                    this._currentAnimation = this.StartCoroutine$1(this.PlaySpriteSequence(this.IdleSprites, this.IdleTotalTime, true));
                } else {
                    UnityEngine.Debug.LogWarning$1("[\u89d2\u8272\u52a8\u753b] \u5f85\u673a\u5e8f\u5217\u5e27\u672a\u52a0\u8f7d\u6216\u4e3a\u7a7a\uff01");
                }
            },
            /*JewelCharacterAnimator.PlayIdleAnimation end.*/

            /*JewelCharacterAnimator.PlayLookLeftAnimation start.*/
            /**
             * 播放向左看动画（播放完成后返回待机）
             *
             * @instance
             * @public
             * @this JewelCharacterAnimator
             * @memberof JewelCharacterAnimator
             * @return  {void}
             */
            PlayLookLeftAnimation: function () {
                UnityEngine.Debug.Log$1(System.String.format("[\u89d2\u8272\u52a8\u753b] PlayLookLeftAnimation \u88ab\u8c03\u7528, \u5e8f\u5217\u5e27\u6570\u91cf: {0}, CharacterImage: {1}", Bridge.box((this.LookLeftSprites != null ? this.LookLeftSprites.length : 0), System.Int32), (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterImage, null) ? "\u5df2\u8bbe\u7f6e" : "\u672a\u8bbe\u7f6e")));
                this.StopCurrentAnimation();
                this._isPlayingOneShot = true;
                if (this.LookLeftSprites != null && this.LookLeftSprites.length > 0) {
                    this._currentAnimation = this.StartCoroutine$1(this.PlaySpriteSequence(this.LookLeftSprites, this.LookLeftTotalTime, false, this.LookLeftPlayCount, Bridge.fn.bind(this, function () {
                        this._isPlayingOneShot = false;
                        this.PlayIdleAnimation();
                    })));
                } else {
                    UnityEngine.Debug.LogWarning$1("[\u89d2\u8272\u52a8\u753b] \u5411\u5de6\u770b\u5e8f\u5217\u5e27\u672a\u52a0\u8f7d\u6216\u4e3a\u7a7a\uff01");
                    this._isPlayingOneShot = false;
                }
            },
            /*JewelCharacterAnimator.PlayLookLeftAnimation end.*/

            /*JewelCharacterAnimator.PlayLaughAnimation start.*/
            /**
             * 播放大笑动画（播放完成后返回待机）
             *
             * @instance
             * @public
             * @this JewelCharacterAnimator
             * @memberof JewelCharacterAnimator
             * @return  {void}
             */
            PlayLaughAnimation: function () {
                UnityEngine.Debug.Log$1(System.String.format("[\u89d2\u8272\u52a8\u753b] PlayLaughAnimation \u88ab\u8c03\u7528, \u5e8f\u5217\u5e27\u6570\u91cf: {0}, CharacterImage: {1}", Bridge.box((this.LaughSprites != null ? this.LaughSprites.length : 0), System.Int32), (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterImage, null) ? "\u5df2\u8bbe\u7f6e" : "\u672a\u8bbe\u7f6e")));
                this.StopCurrentAnimation();
                this._isPlayingOneShot = true;
                if (this.LaughSprites != null && this.LaughSprites.length > 0) {
                    this._currentAnimation = this.StartCoroutine$1(this.PlaySpriteSequence(this.LaughSprites, this.LaughTotalTime, false, this.LaughPlayCount, Bridge.fn.bind(this, function () {
                        this._isPlayingOneShot = false;
                        this.PlayIdleAnimation();
                    })));
                } else {
                    UnityEngine.Debug.LogWarning$1("[\u89d2\u8272\u52a8\u753b] \u5927\u7b11\u5e8f\u5217\u5e27\u672a\u52a0\u8f7d\u6216\u4e3a\u7a7a\uff01");
                    this._isPlayingOneShot = false;
                }
            },
            /*JewelCharacterAnimator.PlayLaughAnimation end.*/

            /*JewelCharacterAnimator.StopCurrentAnimation start.*/
            /**
             * 停止当前动画
             *
             * @instance
             * @private
             * @this JewelCharacterAnimator
             * @memberof JewelCharacterAnimator
             * @return  {void}
             */
            StopCurrentAnimation: function () {
                if (this._currentAnimation != null) {
                    this.StopCoroutine$2(this._currentAnimation);
                    this._currentAnimation = null;
                }
            },
            /*JewelCharacterAnimator.StopCurrentAnimation end.*/

            /*JewelCharacterAnimator.PlaySpriteSequence start.*/
            /**
             * 播放序列帧动画
             *
             * @instance
             * @private
             * @this JewelCharacterAnimator
             * @memberof JewelCharacterAnimator
             * @param   {Array.<UnityEngine.Sprite>}        sprites       序列帧数组
             * @param   {number}                            totalTime     总时长（秒），整个动画播放一次的时间
             * @param   {boolean}                           loop          是否循环
             * @param   {number}                            playCount     播放次数（循环时忽略）
             * @param   {System.Action}                     onComplete    完成回调
             * @return  {System.Collections.IEnumerator}
             */
            PlaySpriteSequence: function (sprites, totalTime, loop, playCount, onComplete) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    frameTime,
                    currentPlay,
                    i,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (playCount === void 0) { playCount = 1; }
                                        if (onComplete === void 0) { onComplete = null; }
                                        if (sprites == null || sprites.length === 0 || UnityEngine.MonoBehaviour.op_Equality(this.CharacterImage, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    if (!Bridge.staticEquals(onComplete, null)) {
                                            onComplete();
                                        }
                                        return false;
                                    $step = 2;
                                    continue;
                                }
                                case 2: {
                                    // 根据总时长和序列帧数量计算每帧时间
                                        frameTime = totalTime / sprites.length;
                                        currentPlay = 0;
                                }
                                case 3: {
                                    i = 0;
                                        $step = 4;
                                        continue;
                                }
                                case 4: {
                                    if ( i < sprites.length ) {
                                            $step = 5;
                                            continue;
                                        }
                                    $step = 8;
                                    continue;
                                }
                                case 5: {
                                    if (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterImage, null)) {
                                            this.CharacterImage.sprite = sprites[i];
                                        }
                                        $enumerator.current = new UnityEngine.WaitForSeconds(frameTime);
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    $step = 7;
                                    continue;
                                }
                                case 7: {
                                    i = (i + 1) | 0;
                                    $step = 4;
                                    continue;
                                }
                                case 8: {
                                    currentPlay = (currentPlay + 1) | 0;

                                        if (!loop && playCount > 0 && currentPlay >= playCount) {
                                            $step = 10;
                                            continue;
                                        }
                                    $step = 9;
                                    continue;
                                }
                                case 9: {
                                    if ( loop || (playCount > 0 && currentPlay < playCount) ) {

                                            $step = 3;
                                            continue;
                                        }
                                    $step = 10;
                                    continue;
                                }
                                case 10: {
                                    if (!Bridge.staticEquals(onComplete, null)) {
                                            onComplete();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelCharacterAnimator.PlaySpriteSequence end.*/


        }
    });
    /*JewelCharacterAnimator end.*/

    /*JewelColor start.*/
    /**
     * 宝石颜色枚举（目前支持2种颜色 + 道具类型）
     *
     * @public
     * @class JewelColor
     */
    Bridge.define("JewelColor", {
        $kind: 6,
        statics: {
            fields: {
                Blue: 0,
                Pink: 1,
                Diamond: 10,
                BigBomb: 11,
                Horizontal: 12,
                Vertical: 13,
                Explosive: 14,
                TransformBlock: 15
            }
        }
    });
    /*JewelColor end.*/

    /*JewelGameManager start.*/
    /**
     * 宝石游戏管理器（单例，整合所有系统）
     *
     * @public
     * @class JewelGameManager
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("JewelGameManager", {
        inherits: [UnityEngine.MonoBehaviour],
        statics: {
            fields: {
                Instance: null,
                _hasShownWinPanel: false,
                _hasShownLosePanel: false
            },
            ctors: {
                init: function () {
                    this._hasShownWinPanel = false;
                    this._hasShownLosePanel = false;
                }
            }
        },
        fields: {
            BoardConfig: null,
            BoardManager: null,
            PreviewManager: null,
            ScoreText: null,
            ComboText: null,
            MovesText: null,
            DiamondCountText: null,
            DiamondTargetTransform: null,
            GameOverPanel: null,
            FinalScoreText: null,
            UserAgentText: null,
            WinPanel: null,
            LosePanel: null,
            CharacterAnimator: null,
            HandGuide: null,
            StoreNavigator: null,
            InitialMoves: 0,
            AutoRestartOnFail: false,
            AutoJumpToStoreOnWinLose: false,
            AutoJumpToStoreDelay: 0,
            _score: 0,
            _currentCombo: 0,
            _remainingMoves: 0,
            _diamondCount: 0,
            _targetDiamondCount: 0,
            _gameOver: false,
            _hasPlayerMoved: false,
            _winCoroutine: null,
            _loseCoroutine: null
        },
        ctors: {
            init: function () {
                this.InitialMoves = 6;
                this.AutoRestartOnFail = true;
                this.AutoJumpToStoreOnWinLose = false;
                this.AutoJumpToStoreDelay = 2.0;
                this._score = 0;
                this._currentCombo = 0;
                this._remainingMoves = 6;
                this._diamondCount = 0;
                this._targetDiamondCount = 0;
                this._gameOver = false;
                this._hasPlayerMoved = false;
            }
        },
        methods: {
            /*JewelGameManager.GetRemainingMoves start.*/
            /**
             * 获取剩余步数（供外部调用）
             *
             * @instance
             * @public
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {number}
             */
            GetRemainingMoves: function () {
                return this._remainingMoves;
            },
            /*JewelGameManager.GetRemainingMoves end.*/

            /*JewelGameManager.Awake start.*/
            Awake: function () {
                // 单例模式
                if (UnityEngine.MonoBehaviour.op_Equality(JewelGameManager.Instance, null)) {
                    JewelGameManager.Instance = this;
                } else {
                    UnityEngine.MonoBehaviour.Destroy(this.gameObject);
                    return;
                }

                // 如果没有配置，创建默认配置
                if (this.BoardConfig == null) {
                    this.BoardConfig = UnityEngine.ScriptableObject.CreateInstance(JewelBoardConfig);
                    this.BoardConfig.Columns = 12;
                    this.BoardConfig.Rows = 16;
                }
            },
            /*JewelGameManager.Awake end.*/

            /*JewelGameManager.Start start.*/
            Start: function () {
                this.InitializeGame();
            },
            /*JewelGameManager.Start end.*/

            /*JewelGameManager.InitializeGame start.*/
            /**
             * 初始化游戏
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            InitializeGame: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this.BoardManager, null)) {
                    UnityEngine.Debug.LogError$2("JewelBoardManager\u672a\u8bbe\u7f6e\uff01");
                    return;
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.PreviewManager, null)) {
                    UnityEngine.Debug.LogError$2("JewelPreviewManager\u672a\u8bbe\u7f6e\uff01");
                    return;
                }

                // 初始化管理器
                this.BoardManager.Config = this.BoardConfig;
                this.PreviewManager.Initialize(this.BoardConfig);

                // 订阅事件
                UnityEngine.Debug.Log$1(System.String.format("[\u521d\u59cb\u5316] \u8ba2\u9605\u4e8b\u4ef6, OnRowCleared: {0}", [(Bridge.staticEquals(this.BoardManager.OnRowCleared, null) ? "null" : "\u5df2\u5b58\u5728")]));
                this.BoardManager.OnRowCleared = Bridge.fn.combine(this.BoardManager.OnRowCleared, Bridge.fn.cacheBind(this, this.OnRowCleared));
                UnityEngine.Debug.Log$1(System.String.format("[\u521d\u59cb\u5316] \u8ba2\u9605\u540e, OnRowCleared: {0}", [(Bridge.staticEquals(this.BoardManager.OnRowCleared, null) ? "null" : "\u5df2\u8ba2\u9605")]));
                this.BoardManager.OnCombo = Bridge.fn.combine(this.BoardManager.OnCombo, Bridge.fn.cacheBind(this, this.OnCombo));
                this.BoardManager.OnGameOver = Bridge.fn.combine(this.BoardManager.OnGameOver, Bridge.fn.cacheBind(this, this.OnGameOver));
                this.BoardManager.OnMoveMade = Bridge.fn.combine(this.BoardManager.OnMoveMade, Bridge.fn.cacheBind(this, this.OnMoveMade));
                this.BoardManager.OnItemSpawned = Bridge.fn.combine(this.BoardManager.OnItemSpawned, Bridge.fn.cacheBind(this, this.OnItemSpawned));
                this.BoardManager.OnDiamondCountChanged = Bridge.fn.combine(this.BoardManager.OnDiamondCountChanged, Bridge.fn.cacheBind(this, this.OnDiamondCountChanged));

                // 初始化UI
                this.UpdateUI();

                // 显示 User Agent
                this.UpdateUserAgentText();

                // 初始化角色动画
                if (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterAnimator, null)) {
                    this.CharacterAnimator.PlayIdleAnimation();
                }

                // 初始化引导系统
                if (UnityEngine.MonoBehaviour.op_Inequality(this.HandGuide, null)) {
                    this.HandGuide.Initialize(this.BoardManager);
                    this.HandGuide.ShowGuide();
                }

                // 重置移动标志和游戏状态
                this._hasPlayerMoved = false;
                this._remainingMoves = this.InitialMoves;
                this._gameOver = false;
                // 注意：_hasShownWinPanel 和 _hasShownLosePanel 是静态的，不重置（整个游戏生命周期只显示一次）

                // 自动查找 StoreNavigator（如果未设置）
                if (UnityEngine.MonoBehaviour.op_Equality(this.StoreNavigator, null)) {
                    this.StoreNavigator = UnityEngine.Object.FindObjectOfType(StoreNavigator);
                }

                // 更新预览
                this.StartCoroutine$1(this.UpdatePreviewCoroutine());
            },
            /*JewelGameManager.InitializeGame end.*/

            /*JewelGameManager.UpdatePreviewCoroutine start.*/
            /**
             * 更新预览协程
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {System.Collections.IEnumerator}
             */
            UpdatePreviewCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    nextRowData,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if ( !this._gameOver ) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 3;
                                        continue;
                                }
                                case 1: {
                                    $enumerator.current = new UnityEngine.WaitForSeconds(0.1);
                                        $step = 2;
                                        return true;
                                }
                                case 2: {
                                    if (UnityEngine.MonoBehaviour.op_Inequality(this.BoardManager, null)) {
                                            nextRowData = this.BoardManager.GetNextRowData();
                                            if (nextRowData != null && UnityEngine.MonoBehaviour.op_Inequality(this.PreviewManager, null)) {
                                                this.PreviewManager.UpdatePreview(nextRowData);
                                            }
                                        }

                                        $step = 0;
                                        continue;
                                }
                                case 3: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelGameManager.UpdatePreviewCoroutine end.*/

            /*JewelGameManager.OnRowCleared start.*/
            /**
             * 行消除回调
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @param   {number}     rowCount               
             * @param   {boolean}    hasDiamondDestroyed
             * @return  {void}
             */
            OnRowCleared: function (rowCount, hasDiamondDestroyed) {
                UnityEngine.Debug.Log$1(System.String.format("[\u89d2\u8272\u52a8\u753b] OnRowCleared \u88ab\u8c03\u7528! \u884c\u6570: {0}, \u6709\u94bb\u77f3: {1}, CharacterAnimator: {2}", Bridge.box(rowCount, System.Int32), Bridge.box(hasDiamondDestroyed, System.Boolean, System.Boolean.toString), (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterAnimator, null) ? "\u5df2\u8bbe\u7f6e" : "\u672a\u8bbe\u7f6e")));

                this._currentCombo = (this._currentCombo + 1) | 0;
                var points = Bridge.Int.mul(Bridge.Int.mul(rowCount, 100), (((1 + this._currentCombo) | 0)));
                this._score = (this._score + points) | 0;

                this.UpdateUI();

                // 显示连击文字
                if (UnityEngine.MonoBehaviour.op_Inequality(this.ComboText, null)) {
                    this.ComboText.text = System.String.format("COMBO x{0}", [Bridge.box(this._currentCombo, System.Int32)]);
                    this.ComboText.gameObject.SetActive(true);
                    this.StartCoroutine$1(this.HideComboText());
                }

                // 根据是否有钻石销毁播放不同的角色动画
                if (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterAnimator, null)) {
                    UnityEngine.Debug.Log$1(System.String.format("[\u89d2\u8272\u52a8\u753b] \u884c\u6d88\u9664: {0}\u884c, \u6709\u94bb\u77f3\u9500\u6bc1: {1}", Bridge.box(rowCount, System.Int32), Bridge.box(hasDiamondDestroyed, System.Boolean, System.Boolean.toString)));
                    if (hasDiamondDestroyed) {
                        // 有钻石销毁，播放向左看动画
                        UnityEngine.Debug.Log$1("[\u89d2\u8272\u52a8\u753b] \u64ad\u653e\u5411\u5de6\u770b\u52a8\u753b");
                        this.CharacterAnimator.PlayLookLeftAnimation();
                    } else {
                        // 没有钻石销毁，播放大笑动画
                        UnityEngine.Debug.Log$1("[\u89d2\u8272\u52a8\u753b] \u64ad\u653e\u5927\u7b11\u52a8\u753b");
                        this.CharacterAnimator.PlayLaughAnimation();
                    }
                } else {
                    UnityEngine.Debug.LogWarning$1("[\u89d2\u8272\u52a8\u753b] CharacterAnimator \u672a\u8bbe\u7f6e\uff01");
                }
            },
            /*JewelGameManager.OnRowCleared end.*/

            /*JewelGameManager.OnCombo start.*/
            /**
             * 连击回调
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @param   {number}    combo
             * @return  {void}
             */
            OnCombo: function (combo) {
                this._currentCombo = combo;
            },
            /*JewelGameManager.OnCombo end.*/

            /*JewelGameManager.OnMoveMade start.*/
            /**
             * 移动完成回调
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            OnMoveMade: function () {
                // 减少剩余步数（最小为0）
                this._remainingMoves = (this._remainingMoves - 1) | 0;
                if (this._remainingMoves < 0) {
                    this._remainingMoves = 0;
                }

                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u79fb\u52a8\u5b8c\u6210\uff0c\u5269\u4f59\u6b65\u6570: {0}, \u5269\u4f59\u94bb\u77f3: {1}", Bridge.box(this._remainingMoves, System.Int32), Bridge.box(this._diamondCount, System.Int32)));

                this.UpdateUI();

                // 第一次移动后隐藏引导
                if (!this._hasPlayerMoved && UnityEngine.MonoBehaviour.op_Inequality(this.HandGuide, null)) {
                    this._hasPlayerMoved = true;
                    this.HandGuide.HideGuide();
                }

                // 检查游戏胜负条件
                this.CheckWinLoseConditions();
            },
            /*JewelGameManager.OnMoveMade end.*/

            /*JewelGameManager.OnGameOver start.*/
            /**
             * 游戏结束回调（从BoardManager触发）
             注意：当前游戏机制下，此方法不应该被调用
             游戏胜负由CheckWinLoseConditions判定（基于步数和钻石数量）
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            OnGameOver: function () {
                // 当前游戏机制：块堆到顶不触发游戏结束
                // 此方法保留，但正常情况下不应该被调用
                UnityEngine.Debug.LogWarning$1("[\u6e38\u620f\u903b\u8f91] OnGameOver\u88ab\u610f\u5916\u8c03\u7528\uff01\u5f53\u524d\u6e38\u620f\u673a\u5236\u4e0b\u4e0d\u5e94\u89e6\u53d1\u6b64\u56de\u8c03\u3002");
            },
            /*JewelGameManager.OnGameOver end.*/

            /*JewelGameManager.UpdateUI start.*/
            /**
             * 更新UI
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            UpdateUI: function () {
                if (UnityEngine.MonoBehaviour.op_Inequality(this.ScoreText, null)) {
                    this.ScoreText.text = Bridge.toString(this._score);
                }

                // 显示剩余步数（倒计时）
                if (UnityEngine.MonoBehaviour.op_Inequality(this.MovesText, null)) {
                    this.MovesText.SetNumber(this._remainingMoves);
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.DiamondCountText, null)) {
                    this.DiamondCountText.SetNumber(this._diamondCount);
                }
            },
            /*JewelGameManager.UpdateUI end.*/

            /*JewelGameManager.UpdateUserAgentText start.*/
            /**
             * 更新 User Agent 文本显示
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            UpdateUserAgentText: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this.UserAgentText, null)) {
                    return;
                }

                var userAgent = "Unknown";

                try {
                    userAgent = PlatformDetector.getUserAgent();
                    UnityEngine.Debug.Log$1(System.String.format("[UserAgent] \u83b7\u53d6\u5230 User Agent: {0}", [userAgent]));
                } catch (ex) {
                    ex = System.Exception.create(ex);
                    UnityEngine.Debug.LogWarning$1(System.String.format("[UserAgent] \u83b7\u53d6 User Agent \u5931\u8d25: {0}", [ex.Message]));
                    userAgent = "\u83b7\u53d6\u5931\u8d25";
                }

                this.UserAgentText.text = System.String.format("User Agent: {0}", [userAgent]);
            },
            /*JewelGameManager.UpdateUserAgentText end.*/

            /*JewelGameManager.OnItemSpawned start.*/
            /**
             * 道具生成回调
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @param   {JewelColor}    itemType
             * @return  {void}
             */
            OnItemSpawned: function (itemType) {
                // 可以在这里添加道具生成的特效
            },
            /*JewelGameManager.OnItemSpawned end.*/

            /*JewelGameManager.OnDiamondCountChanged start.*/
            /**
             * 钻石块数量变化回调
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @param   {number}    count
             * @return  {void}
             */
            OnDiamondCountChanged: function (count) {
                this._diamondCount = count;

                // 游戏刚开始时，记录初始钻石数量作为目标
                if (this._targetDiamondCount === 0 && count > 0 && !this._hasPlayerMoved) {
                    this._targetDiamondCount = count;
                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u521d\u59cb\u5316\u76ee\u6807\u94bb\u77f3\u6570\u91cf: {0}", [Bridge.box(this._targetDiamondCount, System.Int32)]));
                }

                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u94bb\u77f3\u6570\u91cf\u53d8\u5316: {0}/{1}", Bridge.box(count, System.Int32), Bridge.box(this._targetDiamondCount, System.Int32)));

                this.UpdateUI();

                // 如果正在处理游戏逻辑（如ClearAllBlocks、GameLoop等），跳过胜负检查
                // 胜负检查将在处理完成后通过OnMoveMade()触发
                if (UnityEngine.MonoBehaviour.op_Inequality(this.BoardManager, null) && this.BoardManager.IsProcessing) {
                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u6b63\u5728\u5904\u7406\u6e38\u620f\u903b\u8f91\uff0c\u8df3\u8fc7\u80dc\u8d1f\u68c0\u67e5\uff08\u5c06\u5728\u5904\u7406\u5b8c\u6210\u540e\u68c0\u67e5\uff09");
                    return;
                }

                // 检查是否收集完所有钻石（胜利条件）
                this.CheckWinLoseConditions();
            },
            /*JewelGameManager.OnDiamondCountChanged end.*/

            /*JewelGameManager.CheckWinLoseConditions start.*/
            /**
             * 检查游戏胜负条件
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            CheckWinLoseConditions: function () {
                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u68c0\u67e5\u6e38\u620f\u80dc\u8d1f\u6761\u4ef6, _gameOver: {0}, _hasPlayerMoved: {1}, _targetDiamondCount: {2}, _diamondCount: {3}, _remainingMoves: {4}", Bridge.box(this._gameOver, System.Boolean, System.Boolean.toString), Bridge.box(this._hasPlayerMoved, System.Boolean, System.Boolean.toString), Bridge.box(this._targetDiamondCount, System.Int32), Bridge.box(this._diamondCount, System.Int32), Bridge.box(this._remainingMoves, System.Int32)));
                if (this._gameOver) {
                    return;
                } // 游戏已结束，不再检查

                // 只有在玩家已经移动过，且已经设置了目标钻石数量后才检查胜负
                if (!this._hasPlayerMoved || this._targetDiamondCount === 0) {
                    return;
                }

                // 特殊情况：如果目标钻石数已达成但当前钻石数大于目标，说明是BigBomb清除后重新生成的
                // 此时应该重置目标钻石数，不触发胜利条件
                if (this._diamondCount > this._targetDiamondCount) {
                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u68c0\u6d4b\u5230\u94bb\u77f3\u6570\u91cf\u8d85\u8fc7\u76ee\u6807\uff08\u53ef\u80fd\u662fBigBomb\u6e05\u9664\u540e\u91cd\u65b0\u751f\u6210\uff09\uff0c\u91cd\u7f6e\u76ee\u6807\u94bb\u77f3\u6570\u91cf: {0} \u2192 {1}", Bridge.box(this._targetDiamondCount, System.Int32), Bridge.box(this._diamondCount, System.Int32)));
                    this._targetDiamondCount = this._diamondCount;
                    return;
                }

                // 如果已经显示过胜利界面，之后不再显示任何页面（胜利和失败都不显示）
                if (JewelGameManager._hasShownWinPanel) {
                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u5df2\u7ecf\u663e\u793a\u8fc7\u80dc\u5229\u754c\u9762\uff0c\u4e4b\u540e\u4e0d\u518d\u663e\u793a\u4efb\u4f55\u80dc\u8d1f\u9875\u9762");
                    return;
                }

                // 胜利条件：钻石数量为 0 且目标钻石数 > 0（收集完所有钻石）
                if (this._diamondCount === 0 && this._targetDiamondCount > 0) {
                    // 如果协程正在运行，直接返回
                    if (this._gameOver || this._winCoroutine != null) {
                        UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u80dc\u5229\u534f\u7a0b\u6b63\u5728\u8fd0\u884c\uff0c\u8df3\u8fc7\u91cd\u590d\u89e6\u53d1 (gameOver:{0}, coroutine:{1})", Bridge.box(this._gameOver, System.Boolean, System.Boolean.toString), Bridge.box(this._winCoroutine != null, System.Boolean, System.Boolean.toString)));
                        return;
                    }

                    // 立即设置游戏结束标志和显示标志，防止重复触发
                    this._gameOver = true;
                    JewelGameManager._hasShownWinPanel = true;
                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u2705 \u80dc\u5229\uff01\u6240\u6709\u94bb\u77f3\u5df2\u6536\u96c6\u5b8c\u6210\uff08\u521d\u59cb:{0} \u2192 \u5f53\u524d:0\uff09", [Bridge.box(this._targetDiamondCount, System.Int32)]));
                    this._winCoroutine = this.StartCoroutine$1(this.OnGameWin());
                    return;
                }

                // 失败条件：步数用完且钻石未收集完
                if (this._remainingMoves <= 0 && this._diamondCount > 0) {
                    // 如果已经显示过失败界面，不再显示失败页面
                    if (JewelGameManager._hasShownLosePanel) {
                        UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u5df2\u7ecf\u663e\u793a\u8fc7\u5931\u8d25\u754c\u9762\uff0c\u4e0d\u518d\u663e\u793a\u5931\u8d25\u9875\u9762");
                        return;
                    }

                    // 如果协程正在运行，直接返回
                    if (this._gameOver || this._loseCoroutine != null) {
                        UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u5931\u8d25\u534f\u7a0b\u6b63\u5728\u8fd0\u884c\uff0c\u8df3\u8fc7\u91cd\u590d\u89e6\u53d1 (gameOver:{0}, coroutine:{1})", Bridge.box(this._gameOver, System.Boolean, System.Boolean.toString), Bridge.box(this._loseCoroutine != null, System.Boolean, System.Boolean.toString)));
                        return;
                    }

                    // 立即设置游戏结束标志和显示标志，防止重复触发
                    this._gameOver = true;
                    JewelGameManager._hasShownLosePanel = true;
                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u274c \u5931\u8d25\uff01\u6b65\u6570\u7528\u5b8c\uff0c\u5269\u4f59\u94bb\u77f3: {0}/{1}", Bridge.box(this._diamondCount, System.Int32), Bridge.box(this._targetDiamondCount, System.Int32)));
                    this._loseCoroutine = this.StartCoroutine$1(this.OnGameLose());
                    return;
                }
            },
            /*JewelGameManager.CheckWinLoseConditions end.*/

            /*JewelGameManager.OnGameWin start.*/
            /**
             * 游戏胜利
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {System.Collections.IEnumerator}
             */
            OnGameWin: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e,
                    $async_e1;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    // 双重检查：如果已经显示过胜利界面，直接返回
                                        if (!JewelGameManager._hasShownWinPanel) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 3;
                                        continue;
                                }
                                case 2: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u80dc\u5229\u534f\u7a0b\u88ab\u8c03\u7528\u4f46\u6807\u5fd7\u672a\u8bbe\u7f6e\uff0c\u53ef\u80fd\u662f\u91cd\u590d\u8c03\u7528\uff0c\u76f4\u63a5\u8fd4\u56de");
                                        return false;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if (UnityEngine.MonoBehaviour.op_Inequality(this.WinPanel, null) && this.WinPanel.gameObject.activeSelf) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 5;
                                        continue;
                                }
                                case 4: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u80dc\u5229\u754c\u9762\u5df2\u663e\u793a\uff0c\u8df3\u8fc7\u91cd\u590d\u663e\u793a");
                                        return false;
                                    $step = 5;
                                    continue;
                                }
                                case 5: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u6e38\u620f\u80dc\u5229");

                                        // 播放胜利动画
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterAnimator, null)) {
                                            this.CharacterAnimator.PlayLaughAnimation();
                                        }

                                        // 等待所有钻石块飞行到目标位置完成
                                        $enumerator.current = this.StartCoroutine$1(this.WaitForAllDiamondAnimationsComplete());
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    // 再次检查，防止在等待期间被重复调用
                                        if (!JewelGameManager._hasShownWinPanel) {
                                            $step = 7;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 7: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u7b49\u5f85\u671f\u95f4\u6807\u5fd7\u88ab\u91cd\u7f6e\uff0c\u53d6\u6d88\u663e\u793a\u80dc\u5229\u754c\u9762");
                                        return false;
                                    $step = 8;
                                    continue;
                                }
                                case 8: {
                                    // 显示胜利界面（只显示一次）
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.WinPanel, null) && !this.WinPanel.gameObject.activeSelf) {
                                            $step = 9;
                                            continue;
                                        } else  {
                                            $step = 13;
                                            continue;
                                        }
                                }
                                case 9: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u663e\u793a\u80dc\u5229\u754c\u9762");
                                        this.WinPanel.Show();

                                        // 如果启用了自动跳转商店，等待指定时间后跳转
                                        if (this.AutoJumpToStoreOnWinLose) {
                                            $step = 10;
                                            continue;
                                        } 
                                        $step = 12;
                                        continue;
                                }
                                case 10: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u5c06\u5728 {0} \u79d2\u540e\u81ea\u52a8\u8df3\u8f6c\u5546\u5e97", [Bridge.box(this.AutoJumpToStoreDelay, System.Single, System.Single.format, System.Single.getHashCode)]));
                                        $enumerator.current = new UnityEngine.WaitForSeconds(this.AutoJumpToStoreDelay);
                                        $step = 11;
                                        return true;
                                }
                                case 11: {
                                    this.JumpToStore();
                                    $step = 12;
                                    continue;
                                }
                                case 12: {
                                    $step = 14;
                                    continue;
                                }
                                case 13: {
                                    if (UnityEngine.MonoBehaviour.op_Equality(this.WinPanel, null)) {
                                            UnityEngine.Debug.LogWarning$1("[\u6e38\u620f\u903b\u8f91] WinPanel\u672a\u8bbe\u7f6e\uff0c\u65e0\u6cd5\u663e\u793a\u80dc\u5229\u754c\u9762");
                                            // 如果没有界面，则使用原来的逻辑
                                            if (!this.AutoRestartOnFail) {
                                                UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u975e\u91cd\u73a9\u7248\u672c\uff0c\u80dc\u5229\u540e\u8df3\u8f6c\u5546\u5e97");
                                                this.JumpToStore();
                                            } else {
                                                UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u91cd\u73a9\u7248\u672c\uff0c\u80dc\u5229\u540e\u4e0d\u8df3\u8f6c\u5546\u5e97");
                                            }
                                        }
                                    $step = 14;
                                    continue;
                                }
                                case 14: {
                                    $step = 15;
                                    continue;
                                }
                                case 15: {
                                    // 协程结束时清除引用
                                        this._winCoroutine = null;

                                        if ($jumpFromFinally > -1) {
                                            $step = $jumpFromFinally;
                                            $jumpFromFinally = null;
                                        } else if ($async_e) {
                                            throw $async_e;
                                            return;
                                        } else if (Bridge.isDefined($returnValue)) {
                                            $tcs.setResult($returnValue);
                                            return;
                                        }
                                    $step = 16;
                                    continue;
                                }
                                case 16: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        if ($step >= 1 && $step <= 14){

                            $step = 15;
                            $enumerator.moveNext();
                            return;
                        }
                        throw $async_e;
                    }
                }), function () {
                    if ($step >= 1 && $step <= 14){

                        $step = 15;
                        $enumerator.moveNext();
                        return;
                    }

                });
                return $enumerator;
            },
            /*JewelGameManager.OnGameWin end.*/

            /*JewelGameManager.WaitForAllDiamondAnimationsComplete start.*/
            /**
             * 等待所有钻石块飞行动画完成
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {System.Collections.IEnumerator}
             */
            WaitForAllDiamondAnimationsComplete: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    allBlocks,
                    hasAnimatingDiamond,
                    $t,
                    block,
                    blockData,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u7b49\u5f85\u6240\u6709\u94bb\u77f3\u5757\u98de\u884c\u52a8\u753b\u5b8c\u6210...");

                                        // 持续检查直到所有钻石块动画完成
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    if ( true ) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 4;
                                        continue;
                                }
                                case 2: {
                                    // 查找所有正在播放动画的钻石块
                                        allBlocks = UnityEngine.Object.FindObjectsOfType(JewelBlockController);
                                        hasAnimatingDiamond = false;

                                        $t = Bridge.getEnumerator(allBlocks);
                                        try {
                                            while ($t.moveNext()) {
                                                block = $t.Current;
                                                // 检查是否为钻石块且正在播放动画
                                                if (UnityEngine.MonoBehaviour.op_Inequality(block, null) && block.gameObject.activeInHierarchy && block.IsAnimating()) {
                                                    // 通过GetBlockData()检查是否为钻石块
                                                    blockData = block.GetBlockData();
                                                    if (blockData != null && blockData.IsDiamond()) {
                                                        hasAnimatingDiamond = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$Dispose();
                                            }
                                        }

                                        // 如果没有正在播放动画的钻石块，退出循环
                                        if (!hasAnimatingDiamond) {
                                            UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u6240\u6709\u94bb\u77f3\u5757\u98de\u884c\u52a8\u753b\u5df2\u5b8c\u6210");
                                            $step = 4;
                                            continue;
                                        }

                                        // 等待一帧后再次检查
                                        $enumerator.current = null;
                                        $step = 3;
                                        return true;
                                }
                                case 3: {
                                    
                                        $step = 1;
                                        continue;
                                }
                                case 4: {
                                    // 额外等待一小段时间，确保动画完全结束
                                        $enumerator.current = new UnityEngine.WaitForSeconds(0.1);
                                        $step = 5;
                                        return true;
                                }
                                case 5: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelGameManager.WaitForAllDiamondAnimationsComplete end.*/

            /*JewelGameManager.OnGameLose start.*/
            /**
             * 游戏失败
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {System.Collections.IEnumerator}
             */
            OnGameLose: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e,
                    $async_e1;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    $step = 1;
                                    continue;
                                }
                                case 1: {
                                    // 双重检查：如果已经显示过失败界面，直接返回
                                        if (!JewelGameManager._hasShownLosePanel) {
                                            $step = 2;
                                            continue;
                                        } 
                                        $step = 3;
                                        continue;
                                }
                                case 2: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u5931\u8d25\u534f\u7a0b\u88ab\u8c03\u7528\u4f46\u6807\u5fd7\u672a\u8bbe\u7f6e\uff0c\u53ef\u80fd\u662f\u91cd\u590d\u8c03\u7528\uff0c\u76f4\u63a5\u8fd4\u56de");
                                        return false;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if (UnityEngine.MonoBehaviour.op_Inequality(this.LosePanel, null) && this.LosePanel.gameObject.activeSelf) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 5;
                                        continue;
                                }
                                case 4: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u5931\u8d25\u754c\u9762\u5df2\u663e\u793a\uff0c\u8df3\u8fc7\u91cd\u590d\u663e\u793a");
                                        return false;
                                    $step = 5;
                                    continue;
                                }
                                case 5: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u6e38\u620f\u5931\u8d25");

                                        // 播放失败动画
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.CharacterAnimator, null)) {
                                            this.CharacterAnimator.PlayIdleAnimation();
                                        }

                                        // 等待动画播放结束
                                        $enumerator.current = new UnityEngine.WaitForSeconds(0.5);
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    // 再次检查，防止在等待期间被重复调用
                                        if (!JewelGameManager._hasShownLosePanel) {
                                            $step = 7;
                                            continue;
                                        } 
                                        $step = 8;
                                        continue;
                                }
                                case 7: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u7b49\u5f85\u671f\u95f4\u6807\u5fd7\u88ab\u91cd\u7f6e\uff0c\u53d6\u6d88\u663e\u793a\u5931\u8d25\u754c\u9762");
                                        return false;
                                    $step = 8;
                                    continue;
                                }
                                case 8: {
                                    // 显示失败界面（只显示一次）
                                        if (UnityEngine.MonoBehaviour.op_Inequality(this.LosePanel, null) && !this.LosePanel.gameObject.activeSelf) {
                                            $step = 9;
                                            continue;
                                        } else  {
                                            $step = 13;
                                            continue;
                                        }
                                }
                                case 9: {
                                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u663e\u793a\u5931\u8d25\u754c\u9762");
                                        this.LosePanel.Show();

                                        // 如果启用了自动跳转商店，等待指定时间后跳转
                                        if (this.AutoJumpToStoreOnWinLose) {
                                            $step = 10;
                                            continue;
                                        } 
                                        $step = 12;
                                        continue;
                                }
                                case 10: {
                                    UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u5c06\u5728 {0} \u79d2\u540e\u81ea\u52a8\u8df3\u8f6c\u5546\u5e97", [Bridge.box(this.AutoJumpToStoreDelay, System.Single, System.Single.format, System.Single.getHashCode)]));
                                        $enumerator.current = new UnityEngine.WaitForSeconds(this.AutoJumpToStoreDelay);
                                        $step = 11;
                                        return true;
                                }
                                case 11: {
                                    this.JumpToStore();
                                    $step = 12;
                                    continue;
                                }
                                case 12: {
                                    $step = 14;
                                    continue;
                                }
                                case 13: {
                                    if (UnityEngine.MonoBehaviour.op_Equality(this.LosePanel, null)) {
                                            UnityEngine.Debug.LogWarning$1("[\u6e38\u620f\u903b\u8f91] LosePanel\u672a\u8bbe\u7f6e\uff0c\u65e0\u6cd5\u663e\u793a\u5931\u8d25\u754c\u9762");
                                            // 如果没有界面，则使用原来的逻辑
                                            if (this.AutoRestartOnFail) {
                                                UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u81ea\u52a8\u91cd\u65b0\u52a0\u8f7d\u5173\u5361");
                                                this.RestartGame();
                                            } else {
                                                UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u8df3\u8f6c\u5546\u5e97");
                                                this.JumpToStore();
                                            }
                                        }
                                    $step = 14;
                                    continue;
                                }
                                case 14: {
                                    $step = 15;
                                    continue;
                                }
                                case 15: {
                                    // 协程结束时清除引用
                                        this._loseCoroutine = null;

                                        if ($jumpFromFinally > -1) {
                                            $step = $jumpFromFinally;
                                            $jumpFromFinally = null;
                                        } else if ($async_e) {
                                            throw $async_e;
                                            return;
                                        } else if (Bridge.isDefined($returnValue)) {
                                            $tcs.setResult($returnValue);
                                            return;
                                        }
                                    $step = 16;
                                    continue;
                                }
                                case 16: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        if ($step >= 1 && $step <= 14){

                            $step = 15;
                            $enumerator.moveNext();
                            return;
                        }
                        throw $async_e;
                    }
                }), function () {
                    if ($step >= 1 && $step <= 14){

                        $step = 15;
                        $enumerator.moveNext();
                        return;
                    }

                });
                return $enumerator;
            },
            /*JewelGameManager.OnGameLose end.*/

            /*JewelGameManager.JumpToStore start.*/
            /**
             * 跳转到应用商店
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            JumpToStore: function () {
                if (UnityEngine.MonoBehaviour.op_Inequality(this.StoreNavigator, null)) {
                    UnityEngine.Debug.Log$1("[\u6e38\u620f\u903b\u8f91] \u8df3\u8f6c\u5546\u5e97");
                    this.StoreNavigator.OpenStore();
                } else {
                    UnityEngine.Debug.LogError$2("[\u6e38\u620f\u903b\u8f91] StoreNavigator\u672a\u8bbe\u7f6e\uff0c\u65e0\u6cd5\u8df3\u8f6c\u5546\u5e97\uff01");
                }
            },
            /*JewelGameManager.JumpToStore end.*/

            /*JewelGameManager.HideComboText start.*/
            /**
             * 隐藏连击文字
             *
             * @instance
             * @private
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {System.Collections.IEnumerator}
             */
            HideComboText: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    $enumerator.current = new UnityEngine.WaitForSeconds(1.5);
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    if (UnityEngine.MonoBehaviour.op_Inequality(this.ComboText, null)) {
                                            this.ComboText.gameObject.SetActive(false);
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelGameManager.HideComboText end.*/

            /*JewelGameManager.RestartGame start.*/
            /**
             * 重新开始游戏
             *
             * @instance
             * @public
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            RestartGame: function () {
                var $t;
                this._score = 0;
                this._currentCombo = 0;
                this._remainingMoves = this.InitialMoves; // 重置为初始步数
                this._diamondCount = 0;
                this._targetDiamondCount = 0; // 重置目标钻石数（会在游戏初始化时重新统计）
                this._gameOver = false;
                this._hasPlayerMoved = false;
                // 注意：_hasShownWinPanel 和 _hasShownLosePanel 是静态的，不重置（整个游戏生命周期只显示一次）

                // 隐藏所有游戏结果界面
                if (UnityEngine.GameObject.op_Inequality(this.GameOverPanel, null)) {
                    this.GameOverPanel.SetActive(false);
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.WinPanel, null)) {
                    this.WinPanel.Hide();
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.LosePanel, null)) {
                    this.LosePanel.Hide();
                }

                // 重新初始化游戏
                if (UnityEngine.MonoBehaviour.op_Inequality(this.BoardManager, null)) {
                    // 重置第一关标志，确保重试时重新加载第一关
                    this.BoardManager.ResetFirstLevel();

                    // 清除所有块
                    $t = Bridge.getEnumerator(this.BoardManager.BoardContainer);
                    try {
                        while ($t.moveNext()) {
                            var child = Bridge.cast($t.Current, UnityEngine.Transform);
                            UnityEngine.MonoBehaviour.Destroy(child.gameObject);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }

                    this.BoardManager.InitializeGame();
                }

                this.UpdateUI();

                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u6e38\u620f\u91cd\u542f\uff0c\u521d\u59cb\u5269\u4f59\u6b65\u6570: {0}", [Bridge.box(this._remainingMoves, System.Int32)]));
            },
            /*JewelGameManager.RestartGame end.*/

            /*JewelGameManager.NextLevel start.*/
            /**
             * 加载下一关（胜利后调用，不重置第一关标志，从第二关开始都是随机关）
             *
             * @instance
             * @public
             * @this JewelGameManager
             * @memberof JewelGameManager
             * @return  {void}
             */
            NextLevel: function () {
                var $t;
                this._score = 0;
                this._currentCombo = 0;
                this._remainingMoves = this.InitialMoves; // 重置为初始步数
                this._diamondCount = 0;
                this._targetDiamondCount = 0; // 重置目标钻石数（会在游戏初始化时重新统计）
                this._gameOver = false;
                this._hasPlayerMoved = false;
                // 注意：_hasShownWinPanel 和 _hasShownLosePanel 是静态的，不重置（整个游戏生命周期只显示一次）

                // 隐藏所有游戏结果界面
                if (UnityEngine.GameObject.op_Inequality(this.GameOverPanel, null)) {
                    this.GameOverPanel.SetActive(false);
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.WinPanel, null)) {
                    this.WinPanel.Hide();
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.LosePanel, null)) {
                    this.LosePanel.Hide();
                }

                // 重新初始化游戏（不重置第一关标志，所以会加载随机关卡）
                if (UnityEngine.MonoBehaviour.op_Inequality(this.BoardManager, null)) {
                    // 注意：不调用 ResetFirstLevel()，所以 _isFirstLevel 保持为 false，会加载随机关卡

                    // 清除所有块
                    $t = Bridge.getEnumerator(this.BoardManager.BoardContainer);
                    try {
                        while ($t.moveNext()) {
                            var child = Bridge.cast($t.Current, UnityEngine.Transform);
                            UnityEngine.MonoBehaviour.Destroy(child.gameObject);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$Dispose();
                        }
                    }

                    this.BoardManager.InitializeGame();
                }

                this.UpdateUI();

                UnityEngine.Debug.Log$1(System.String.format("[\u6e38\u620f\u903b\u8f91] \u52a0\u8f7d\u4e0b\u4e00\u5173\uff0c\u521d\u59cb\u5269\u4f59\u6b65\u6570: {0}", [Bridge.box(this._remainingMoves, System.Int32)]));
            },
            /*JewelGameManager.NextLevel end.*/

            /*JewelGameManager.OnDestroy start.*/
            OnDestroy: function () {
                // 取消订阅事件
                if (UnityEngine.MonoBehaviour.op_Inequality(this.BoardManager, null)) {
                    this.BoardManager.OnRowCleared = Bridge.fn.remove(this.BoardManager.OnRowCleared, Bridge.fn.cacheBind(this, this.OnRowCleared));
                    this.BoardManager.OnCombo = Bridge.fn.remove(this.BoardManager.OnCombo, Bridge.fn.cacheBind(this, this.OnCombo));
                    this.BoardManager.OnGameOver = Bridge.fn.remove(this.BoardManager.OnGameOver, Bridge.fn.cacheBind(this, this.OnGameOver));
                    this.BoardManager.OnMoveMade = Bridge.fn.remove(this.BoardManager.OnMoveMade, Bridge.fn.cacheBind(this, this.OnMoveMade));
                    this.BoardManager.OnItemSpawned = Bridge.fn.remove(this.BoardManager.OnItemSpawned, Bridge.fn.cacheBind(this, this.OnItemSpawned));
                    this.BoardManager.OnDiamondCountChanged = Bridge.fn.remove(this.BoardManager.OnDiamondCountChanged, Bridge.fn.cacheBind(this, this.OnDiamondCountChanged));
                }
            },
            /*JewelGameManager.OnDestroy end.*/


        }
    });
    /*JewelGameManager end.*/

    /*JewelHandGuide start.*/
    /**
     * 手部引导控制器
     *
     * @public
     * @class JewelHandGuide
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("JewelHandGuide", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            HandImage: null,
            HandRectTransform: null,
            GuideRow: 0,
            GuideStartColumn: 0,
            GuideEndColumn: 0,
            MoveDuration: 0,
            AutoAdjustParent: false,
            YOffset: 0,
            XOffset: 0,
            ShowDebugInfo: false,
            UseWorldPosition: false,
            _boardManager: null,
            _isActive: false,
            _moveCoroutine: null,
            _boardContainerRect: null
        },
        ctors: {
            init: function () {
                this.GuideRow = 3;
                this.GuideStartColumn = 6;
                this.GuideEndColumn = 7;
                this.MoveDuration = 1.0;
                this.AutoAdjustParent = true;
                this.YOffset = 0.0;
                this.XOffset = 0.0;
                this.ShowDebugInfo = true;
                this.UseWorldPosition = false;
                this._isActive = false;
            }
        },
        methods: {
            /*JewelHandGuide.Initialize start.*/
            /**
             * 初始化引导
             *
             * @instance
             * @public
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @param   {JewelBoardManager}    boardManager
             * @return  {void}
             */
            Initialize: function (boardManager) {
                var $t, $t1;
                this._boardManager = boardManager;

                if (UnityEngine.MonoBehaviour.op_Equality(this.HandImage, null)) {
                    this.HandImage = this.GetComponent(UnityEngine.UI.Image);
                }

                if (UnityEngine.Component.op_Equality(this.HandRectTransform, null)) {
                    this.HandRectTransform = this.GetComponent(UnityEngine.RectTransform);
                }

                // 获取游戏板容器的 RectTransform
                if (UnityEngine.MonoBehaviour.op_Inequality(this._boardManager, null) && UnityEngine.Component.op_Inequality(this._boardManager.BoardContainer, null)) {
                    this._boardContainerRect = this._boardManager.BoardContainer;

                    UnityEngine.Debug.Log$1(System.String.format("[JewelHandGuide] \u6e38\u620f\u677f\u5bb9\u5668: {0}, \u624b\u90e8\u7236\u7269\u4f53: {1}", this._boardContainerRect.name, (UnityEngine.Component.op_Inequality(this.HandRectTransform, null) ? UnityEngine.Component.op_Inequality(($t = this.HandRectTransform.parent), null) ? $t.name : null : "null")));
                }

                // 加载手部图片（如果未在Inspector中设置）
                if (UnityEngine.MonoBehaviour.op_Inequality(this.HandImage, null) && this.HandImage.sprite == null) {
                    // 尝试从Resources文件夹加载
                    var handSprite = UnityEngine.Resources.Load(UnityEngine.Sprite, "\u624b");
                    if (handSprite == null) {
                        // 尝试从素材集合文件夹加载
                        handSprite = UnityEngine.Resources.Load(UnityEngine.Sprite, "\u7d20\u6750\u96c6\u5408/\u624b");
                    }

                    if (handSprite != null) {
                        this.HandImage.sprite = handSprite;
                    } else {
                        UnityEngine.Debug.LogWarning$1("[JewelHandGuide] \u65e0\u6cd5\u52a0\u8f7d\u624b\u90e8\u56fe\u7247\u3002\u8bf7\u5728Inspector\u4e2d\u624b\u52a8\u8bbe\u7f6eHandImage\u7684Sprite\uff0c\u6216\u5c06\u56fe\u7247\u653e\u5728Resources\u6587\u4ef6\u5939\u4e2d");
                    }
                }

                // 初始隐藏
                if (UnityEngine.MonoBehaviour.op_Inequality(this.HandImage, null)) {
                    this.HandImage.gameObject.SetActive(false);
                }

                UnityEngine.Debug.Log$1(System.String.format("[JewelHandGuide] \u521d\u59cb\u5316\u5b8c\u6210\u3002\u6e38\u620f\u677f\u5bb9\u5668: {0}, \u624b\u90e8\u7236\u7269\u4f53: {1}", (UnityEngine.Component.op_Inequality(this._boardContainerRect, null) ? this._boardContainerRect.name : "null"), (UnityEngine.Component.op_Inequality(this.HandRectTransform, null) ? UnityEngine.Component.op_Inequality(($t1 = this.HandRectTransform.parent), null) ? $t1.name : null : "null")));

                // 检查手部图片组件
                if (UnityEngine.MonoBehaviour.op_Inequality(this.HandImage, null)) {
                    UnityEngine.Debug.Log$1(System.String.format("[JewelHandGuide] \u624b\u90e8\u56fe\u7247\u7ec4\u4ef6:", null));
                    UnityEngine.Debug.Log$1(System.String.format("  - Sprite: {0}", [(this.HandImage.sprite != null ? this.HandImage.sprite.name : "null")]));
                    UnityEngine.Debug.Log$1(System.String.format("  - Color: {0}", [this.HandImage.color.$clone()]));
                    UnityEngine.Debug.Log$1(System.String.format("  - Raycast Target: {0}", [Bridge.box(this.HandImage.raycastTarget, System.Boolean, System.Boolean.toString)]));
                    UnityEngine.Debug.Log$1(System.String.format("  - GameObject Active: {0}", [Bridge.box(this.HandImage.gameObject.activeSelf, System.Boolean, System.Boolean.toString)]));
                } else {
                    UnityEngine.Debug.LogWarning$1(System.String.format("[JewelHandGuide] \u26a0\ufe0f HandImage \u7ec4\u4ef6\u672a\u8bbe\u7f6e\uff01", null));
                }
            },
            /*JewelHandGuide.Initialize end.*/

            /*JewelHandGuide.ShowGuide start.*/
            /**
             * 显示引导
             *
             * @instance
             * @public
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @return  {void}
             */
            ShowGuide: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this._boardManager, null) || UnityEngine.MonoBehaviour.op_Equality(this.HandImage, null) || UnityEngine.Component.op_Equality(this.HandRectTransform, null)) {
                    UnityEngine.Debug.LogWarning$1("[JewelHandGuide] \u7ec4\u4ef6\u672a\u6b63\u786e\u521d\u59cb\u5316");
                    return;
                }

                this._isActive = true;
                this.HandImage.gameObject.SetActive(true);

                // 延迟一帧等待方块生成完成
                this.StartCoroutine$1(this.ShowGuideDelayed());
            },
            /*JewelHandGuide.ShowGuide end.*/

            /*JewelHandGuide.ShowGuideDelayed start.*/
            /**
             * 延迟显示引导（等待方块生成完成）
             *
             * @instance
             * @private
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @return  {System.Collections.IEnumerator}
             */
            ShowGuideDelayed: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    // 等待一帧，确保所有方块已生成和渲染（LoadLevelData 完成后）
                                        $enumerator.current = null;
                                        $step = 1;
                                        return true;
                                }
                                case 1: {
                                    // 🎯 直接使用与 CreateBlock 相同的计算方式
                                        this.UpdateHandPositionLikeBlock();


                                        // 开始左右移动动画
                                        if (this._moveCoroutine != null) {
                                            this.StopCoroutine$2(this._moveCoroutine);
                                        }
                                        this._moveCoroutine = this.StartCoroutine$1(this.MoveHandCoroutine());

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelHandGuide.ShowGuideDelayed end.*/

            /*JewelHandGuide.UpdateHandPositionLikeBlock start.*/
            /**
             * 使用与方块完全相同的方式更新位置（调用 BoardManager 的方法）
             *
             * @instance
             * @private
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @return  {void}
             */
            UpdateHandPositionLikeBlock: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this._boardManager, null) || UnityEngine.Component.op_Equality(this.HandRectTransform, null)) {
                    return;
                }

                var cellWidth = this._boardManager.GetCellWidth();
                var cellHeight = this._boardManager.GetCellHeight();
                var boardWidth = this._boardManager.GetBoardWidth();
                var bottomOffsetY = this._boardManager.GetBottomOffsetY();

                // 🎯 与 JewelBlockController.UpdatePosition() 完全相同的公式
                // 把手部当作一个 Width=1 的方块
                var x = (cellWidth * this.GuideStartColumn - 1) + (cellWidth * 1 / 2.0) - (boardWidth / 2.0);
                var y = bottomOffsetY + (cellHeight * this.GuideRow - 1) + (cellHeight / 2.0);

                // 应用偏移量
                x += this.XOffset;
                y += this.YOffset;

                // 设置 anchoredPosition
                this.HandRectTransform.anchoredPosition = new pc.Vec2( x, y );

            },
            /*JewelHandGuide.UpdateHandPositionLikeBlock end.*/

            /*JewelHandGuide.HideGuide start.*/
            /**
             * 隐藏引导
             *
             * @instance
             * @public
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @return  {void}
             */
            HideGuide: function () {
                this._isActive = false;

                if (this._moveCoroutine != null) {
                    this.StopCoroutine$2(this._moveCoroutine);
                    this._moveCoroutine = null;
                }

                if (UnityEngine.MonoBehaviour.op_Inequality(this.HandImage, null)) {
                    this.HandImage.gameObject.SetActive(false);
                }
            },
            /*JewelHandGuide.HideGuide end.*/

            /*JewelHandGuide.UpdateHandPosition start.*/
            /**
             * 更新手部位置（使用与方块完全相同的计算公式）
             *
             * @instance
             * @private
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @return  {void}
             */
            UpdateHandPosition: function () {
                if (UnityEngine.MonoBehaviour.op_Equality(this._boardManager, null) || UnityEngine.Component.op_Equality(this.HandRectTransform, null)) {
                    return;
                }

                // 获取游戏板的尺寸信息
                var cellWidth = this._boardManager.GetCellWidth();
                var cellHeight = this._boardManager.GetCellHeight();
                var boardWidth = this._boardManager.GetBoardWidth();
                var bottomOffsetY = this._boardManager.GetBottomOffsetY();

                // 🎯 使用与 JewelBlockController.UpdatePosition() 完全相同的公式
                // 假设手部引导是一个虚拟的 1x1 方块，位于 (GuideStartColumn, GuideRow)
                var targetX = (cellWidth * this.GuideStartColumn) + (cellWidth / 2.0) - (boardWidth / 2.0);
                var targetY = bottomOffsetY + (cellHeight * this.GuideRow) + (cellHeight / 2.0);

                // 应用偏移量
                targetX += this.XOffset;
                targetY += this.YOffset;

                // 设置位置
                this.HandRectTransform.anchoredPosition = new pc.Vec2( targetX, targetY );


            },
            /*JewelHandGuide.UpdateHandPosition end.*/

            /*JewelHandGuide.MoveHandCoroutine start.*/
            /**
             * 左右移动动画协程（使用与方块完全相同的计算公式）
             *
             * @instance
             * @private
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @return  {System.Collections.IEnumerator}
             */
            MoveHandCoroutine: function () {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    cellWidth,
                    cellHeight,
                    boardWidth,
                    bottomOffsetY,
                    startX,
                    endX,
                    y,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (UnityEngine.MonoBehaviour.op_Equality(this._boardManager, null) || UnityEngine.Component.op_Equality(this.HandRectTransform, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    cellWidth = this._boardManager.GetCellWidth();
                                        cellHeight = this._boardManager.GetCellHeight();
                                        boardWidth = this._boardManager.GetBoardWidth();
                                        bottomOffsetY = this._boardManager.GetBottomOffsetY();

                                        // 🎯 使用与方块完全相同的计算公式（把手部当作 Width=1 的方块）
                                        startX = (cellWidth * this.GuideStartColumn) + (cellWidth * 1 / 2.0) - (boardWidth / 2.0) + this.XOffset;
                                        endX = (cellWidth * this.GuideEndColumn) + (cellWidth * 1 / 2.0) - (boardWidth / 2.0) + this.XOffset;
                                        y = bottomOffsetY + (cellHeight * this.GuideRow) + (cellHeight / 2.0) + this.YOffset;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( this._isActive ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 7;
                                        continue;
                                }
                                case 4: {
                                    // 从左到右
                                        $enumerator.current = this.StartCoroutine$1(this.MoveToPosition(startX, endX, y, this.MoveDuration));
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    // 从右到左
                                        $enumerator.current = this.StartCoroutine$1(this.MoveToPosition(endX, startX, y, this.MoveDuration));
                                        $step = 6;
                                        return true;
                                }
                                case 6: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 7: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelHandGuide.MoveHandCoroutine end.*/

            /*JewelHandGuide.MoveToPosition start.*/
            /**
             * 移动到指定位置
             *
             * @instance
             * @private
             * @this JewelHandGuide
             * @memberof JewelHandGuide
             * @param   {number}                            fromX       
             * @param   {number}                            toX         
             * @param   {number}                            y           
             * @param   {number}                            duration
             * @return  {System.Collections.IEnumerator}
             */
            MoveToPosition: function (fromX, toX, y, duration) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    elapsed,
                    startPos,
                    endPos,
                    t,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    if (UnityEngine.Component.op_Equality(this.HandRectTransform, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    elapsed = 0.0;
                                        startPos = new pc.Vec2( fromX, y );
                                        endPos = new pc.Vec2( toX, y );
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < duration && this._isActive ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 6;
                                        continue;
                                }
                                case 4: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / duration;

                                        // 使用缓动曲线（ease-in-out）
                                        t = t * t * (3.0 - 2.0 * t); // Smoothstep

                                        this.HandRectTransform.anchoredPosition = new pc.Vec2().lerp( startPos, endPos, t );

                                        $enumerator.current = null;
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 6: {
                                    // 确保最终位置准确
                                        if (this._isActive && UnityEngine.Component.op_Inequality(this.HandRectTransform, null)) {
                                            this.HandRectTransform.anchoredPosition = endPos.$clone();
                                        }

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelHandGuide.MoveToPosition end.*/

            /*JewelHandGuide.OnDestroy start.*/
            OnDestroy: function () {
                if (this._moveCoroutine != null) {
                    this.StopCoroutine$2(this._moveCoroutine);
                }
            },
            /*JewelHandGuide.OnDestroy end.*/


        }
    });
    /*JewelHandGuide end.*/
    /**
     * @memberof System
     * @callback System.Func
     * @param   {JewelBlockController}    arg
     * @return  {System.Tuple$2}
     */


    /*JewelInputHandler start.*/
    /**
     * 输入处理系统（处理滑动操作）
     *
     * @public
     * @class JewelInputHandler
     * @augments UnityEngine.MonoBehaviour
     * @implements  UnityEngine.EventSystems.IPointerDownHandler
     * @implements  UnityEngine.EventSystems.IPointerUpHandler
     * @implements  UnityEngine.EventSystems.IDragHandler
     */
    Bridge.define("JewelInputHandler", {
        inherits: [UnityEngine.MonoBehaviour,UnityEngine.EventSystems.IPointerDownHandler,UnityEngine.EventSystems.IPointerUpHandler,UnityEngine.EventSystems.IDragHandler],
        fields: {
            _activeBlock: null,
            _startDragPosition: null,
            _originalPosition: null,
            _cellWidth: 0,
            _cellHeight: 0,
            _minDragX: 0,
            _maxDragX: 0,
            _minDragY: 0,
            _maxDragY: 0,
            _isDragging: false,
            _isVerticalDrag: false,
            _onBlockMovedHorizontal: null,
            _onBlockMovedVertical: null,
            _canMoveToPosition: null,
            _calculateHorizontalLimits: null,
            _calculateVerticalLimits: null,
            _getBlockAt: null,
            _inputEnabled: false
        },
        alias: [
            "OnPointerDown", "UnityEngine$EventSystems$IPointerDownHandler$OnPointerDown",
            "OnDrag", "UnityEngine$EventSystems$IDragHandler$OnDrag",
            "OnPointerUp", "UnityEngine$EventSystems$IPointerUpHandler$OnPointerUp"
        ],
        ctors: {
            init: function () {
                this._startDragPosition = new UnityEngine.Vector2();
                this._originalPosition = new UnityEngine.Vector2();
                this._isDragging = false;
                this._isVerticalDrag = false;
                this._inputEnabled = true;
            }
        },
        methods: {
            /*JewelInputHandler.Initialize start.*/
            /**
             * 初始化
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {number}           cellWidth                    
             * @param   {number}           cellHeight                   
             * @param   {System.Action}    onBlockMovedHorizontal       
             * @param   {System.Action}    onBlockMovedVertical         
             * @param   {System.Func}      calculateVerticalLimits      
             * @param   {System.Func}      canMoveToPosition            
             * @param   {System.Action}    calculateHorizontalLimits    
             * @param   {System.Func}      getBlockAt
             * @return  {void}
             */
            Initialize: function (cellWidth, cellHeight, onBlockMovedHorizontal, onBlockMovedVertical, calculateVerticalLimits, canMoveToPosition, calculateHorizontalLimits, getBlockAt) {
                if (onBlockMovedVertical === void 0) { onBlockMovedVertical = null; }
                if (calculateVerticalLimits === void 0) { calculateVerticalLimits = null; }
                if (canMoveToPosition === void 0) { canMoveToPosition = null; }
                if (calculateHorizontalLimits === void 0) { calculateHorizontalLimits = null; }
                if (getBlockAt === void 0) { getBlockAt = null; }
                this._cellWidth = cellWidth;
                this._cellHeight = cellHeight;
                this._onBlockMovedHorizontal = onBlockMovedHorizontal;
                this._onBlockMovedVertical = onBlockMovedVertical;
                this._calculateVerticalLimits = calculateVerticalLimits;
                this._canMoveToPosition = canMoveToPosition;
                this._calculateHorizontalLimits = calculateHorizontalLimits;
                this._getBlockAt = getBlockAt;
            },
            /*JewelInputHandler.Initialize end.*/

            /*JewelInputHandler.EnableInput start.*/
            /**
             * 启用输入
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @return  {void}
             */
            EnableInput: function () {
                this._inputEnabled = true;
            },
            /*JewelInputHandler.EnableInput end.*/

            /*JewelInputHandler.DisableInput start.*/
            /**
             * 禁用输入
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @return  {void}
             */
            DisableInput: function () {
                this._inputEnabled = false;
            },
            /*JewelInputHandler.DisableInput end.*/

            /*JewelInputHandler.OnPointerDown start.*/
            /**
             * 开始拖动
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {UnityEngine.EventSystems.PointerEventData}    eventData
             * @return  {void}
             */
            OnPointerDown: function (eventData) {
                if (!this._inputEnabled) {
                    return;
                } // 如果输入被禁用，直接返回

                var hitObject = eventData.pointerCurrentRaycast.gameObject;
                if (UnityEngine.GameObject.op_Equality(hitObject, null)) {
                    return;
                }

                this._activeBlock = hitObject.GetComponent(JewelBlockController);
                if (UnityEngine.MonoBehaviour.op_Equality(this._activeBlock, null)) {
                    return;
                }

                var blockData = this._activeBlock.GetBlockData();

                // 不在这里检查，而是在实际移动时根据方向检查

                this._startDragPosition = eventData.position.$clone();
                var rectTransform = this._activeBlock.GetComponent(UnityEngine.RectTransform);
                if (UnityEngine.Component.op_Inequality(rectTransform, null)) {
                    this._originalPosition = rectTransform.anchoredPosition.$clone();
                }
                this._isDragging = true;
                this._isVerticalDrag = false;

                // 计算水平拖动限制
                if (!Bridge.staticEquals(this._calculateHorizontalLimits, null)) {
                    this._calculateHorizontalLimits(this._activeBlock, 0, 0); // 占位参数，实际会在方法内部计算
                } else {
                    this.CalculateDragLimits(this._activeBlock);
                }

                // 如果是非钻石道具块，计算垂直拖动限制
                if (blockData != null && blockData.IsNonDiamondItem() && !Bridge.staticEquals(this._calculateVerticalLimits, null)) {
                    var limits = this._calculateVerticalLimits(this._activeBlock);
                    if (limits != null) {
                        this._minDragY = Bridge.Int.mul(limits.Item1, Bridge.Int.clip32(this._cellHeight));
                        this._maxDragY = Bridge.Int.mul(limits.Item2, Bridge.Int.clip32(this._cellHeight));
                    } else {
                        this._minDragY = -1000;
                        this._maxDragY = 1000;
                    }
                } else {
                    this._minDragY = -1000;
                    this._maxDragY = 1000;
                }
            },
            /*JewelInputHandler.OnPointerDown end.*/

            /*JewelInputHandler.CanMergeInDirection start.*/
            /**
             * 检查指定方向是否可以合并
             规则：
             - 横块 ↔ 炸块（任何方向）
             - 竖块 ↔ 炸块（任何方向）
             - 大炸弹 ↔ 大炸弹（任何方向）
             *
             * @instance
             * @private
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {JewelBlockData}    blockData    当前块数据
             * @param   {number}            deltaX       X方向偏移（负数=左，正数=右）
             * @param   {number}            deltaY       Y方向偏移（负数=下，正数=上）
             * @return  {boolean}                        是否可以在该方向合并
             */
            CanMergeInDirection: function (blockData, deltaX, deltaY) {
                if (Bridge.staticEquals(this._getBlockAt, null)) {
                    return false;
                }

                var x = blockData.X;
                var y = blockData.Y;

                // 根据移动方向确定检查位置
                var checkX = x;
                var checkY = y;

                if (deltaX < 0) {
                    // 向左移动，检查左边
                    checkX = (x - 1) | 0;
                } else if (deltaX > 0) {
                    // 向右移动，检查右边
                    checkX = (x + blockData.Width) | 0;
                } else if (deltaY > 0) {
                    // 向上移动，检查上方
                    checkY = (y + 1) | 0;
                } else if (deltaY < 0) {
                    // 向下移动，检查下方
                    checkY = (y - 1) | 0;
                } else {
                    return false; // 没有移动
                }

                var targetBlock = this._getBlockAt(checkX, checkY);

                // 如果目标位置为空，允许移动（对于所有块类型）
                if (targetBlock == null) {
                    return true;
                }

                // 根据当前块类型和目标块类型判断是否可以合并
                if (blockData.IsTransformBlock()) {
                    // 转换块：只能移动到空位置，不能与其他块重叠（包括其他转换块）
                    // 如果目标位置为空，允许移动；否则不允许
                    return false; // 目标位置不为空时，不允许移动
                } else if (blockData.IsHorizontal()) {
                    // 横块：可以和炸块合并（任何方向）
                    return targetBlock.IsExplosive();
                } else if (blockData.IsVertical()) {
                    // 竖块：可以和炸块合并（任何方向）
                    return targetBlock.IsExplosive();
                } else if (blockData.IsExplosive()) {
                    // 炸块：可以和横块、竖块合并（任何方向）
                    return targetBlock.IsHorizontal() || targetBlock.IsVertical();
                } else if (blockData.IsBigBomb()) {
                    // 大炸弹：只能和大炸弹合并
                    return targetBlock.IsBigBomb();
                }

                return false;
            },
            /*JewelInputHandler.CanMergeInDirection end.*/

            /*JewelInputHandler.HasAdjacentMergeableItem start.*/
            /**
             * 检查周围是否有可合并的非钻石道具（已废弃，改用CanMergeInDirection）
             规则：
             - 横块：任何方向有炸块
             - 竖块：任何方向有炸块
             - 炸块：任何方向有横块或竖块
             - 大炸弹：任何方向有另一个大炸弹
             *
             * @instance
             * @private
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {JewelBlockData}    blockData
             * @return  {boolean}
             */
            HasAdjacentMergeableItem: function (blockData) {
                if (Bridge.staticEquals(this._getBlockAt, null)) {
                    return true;
                } // 如果没有提供获取块的回调，默认允许移动

                var x = blockData.X;
                var y = blockData.Y;

                if (blockData.IsHorizontal()) {
                    // 横块：只检查左右方向是否有炸块
                    // 左边检查：块的X-1位置
                    // 右边检查：块的X+Width位置
                    var leftBlock = this._getBlockAt(((x - 1) | 0), y);
                    var rightBlock = this._getBlockAt(((x + blockData.Width) | 0), y);

                    var hasLeftExplosive = leftBlock != null && leftBlock.IsExplosive();
                    var hasRightExplosive = rightBlock != null && rightBlock.IsExplosive();

                    if (hasLeftExplosive || hasRightExplosive) {
                        UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u6a2a\u5757\u627e\u5230\u70b8\u5757 - \u5de6:{0}, \u53f3:{1}\uff0c\u53ef\u4ee5\u79fb\u52a8", Bridge.box(hasLeftExplosive, System.Boolean, System.Boolean.toString), Bridge.box(hasRightExplosive, System.Boolean, System.Boolean.toString)));
                        return true;
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u6a2a\u5757\u5de6\u53f3\u65b9\u5411\u6ca1\u6709\u70b8\u5757\uff0c\u4e0d\u53ef\u79fb\u52a8", null));
                    return false;
                } else if (blockData.IsVertical()) {
                    // 竖块：只检查上下方向是否有炸块
                    var upBlock = this._getBlockAt(x, ((y + 1) | 0));
                    var downBlock = this._getBlockAt(x, ((y - 1) | 0));

                    if ((upBlock != null && upBlock.IsExplosive()) || (downBlock != null && downBlock.IsExplosive())) {
                        UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u7ad6\u5757\u4e0a\u4e0b\u65b9\u5411\u627e\u5230\u70b8\u5757\uff0c\u53ef\u4ee5\u79fb\u52a8", null));
                        return true;
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u7ad6\u5757\u4e0a\u4e0b\u65b9\u5411\u6ca1\u6709\u70b8\u5757\uff0c\u4e0d\u53ef\u79fb\u52a8", null));
                    return false;
                } else if (blockData.IsExplosive()) {
                    // 炸块：上下方向有竖块，或左右方向有横块
                    var upBlock1 = this._getBlockAt(x, ((y + 1) | 0));
                    var downBlock1 = this._getBlockAt(x, ((y - 1) | 0));
                    var leftBlock1 = this._getBlockAt(((x - 1) | 0), y);
                    var rightBlock1 = this._getBlockAt(((x + 1) | 0), y);

                    var hasVerticalMatch = (upBlock1 != null && upBlock1.IsVertical()) || (downBlock1 != null && downBlock1.IsVertical());
                    var hasHorizontalMatch = (leftBlock1 != null && leftBlock1.IsHorizontal()) || (rightBlock1 != null && rightBlock1.IsHorizontal());

                    if (hasVerticalMatch || hasHorizontalMatch) {
                        UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u70b8\u5757\u627e\u5230\u53ef\u5408\u5e76\u9053\u5177\uff08\u7ad6\u5757\u6216\u6a2a\u5757\uff09\uff0c\u53ef\u4ee5\u79fb\u52a8", null));
                        return true;
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u70b8\u5757\u6ca1\u6709\u627e\u5230\u53ef\u5408\u5e76\u9053\u5177\uff0c\u4e0d\u53ef\u79fb\u52a8", null));
                    return false;
                } else if (blockData.IsBigBomb()) {
                    // 大炸弹：上下左右有另一个大炸弹
                    var upBlock2 = this._getBlockAt(x, ((y + 1) | 0));
                    var downBlock2 = this._getBlockAt(x, ((y - 1) | 0));
                    var leftBlock2 = this._getBlockAt(((x - 1) | 0), y);
                    var rightBlock2 = this._getBlockAt(((x + 1) | 0), y);

                    if ((upBlock2 != null && upBlock2.IsBigBomb()) || (downBlock2 != null && downBlock2.IsBigBomb()) || (leftBlock2 != null && leftBlock2.IsBigBomb()) || (rightBlock2 != null && rightBlock2.IsBigBomb())) {
                        UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u5927\u70b8\u5f39\u5468\u56f4\u627e\u5230\u53e6\u4e00\u4e2a\u5927\u70b8\u5f39\uff0c\u53ef\u4ee5\u79fb\u52a8", null));
                        return true;
                    }
                    UnityEngine.Debug.Log$1(System.String.format("[\u8f93\u5165\u5904\u7406] \u5927\u70b8\u5f39\u5468\u56f4\u6ca1\u6709\u53e6\u4e00\u4e2a\u5927\u70b8\u5f39\uff0c\u4e0d\u53ef\u79fb\u52a8", null));
                    return false;
                }

                return false;
            },
            /*JewelInputHandler.HasAdjacentMergeableItem end.*/

            /*JewelInputHandler.OnDrag start.*/
            /**
             * 拖动中
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {UnityEngine.EventSystems.PointerEventData}    eventData
             * @return  {void}
             */
            OnDrag: function (eventData) {
                if (!this._inputEnabled) {
                    return;
                } // 如果输入被禁用，直接返回
                if (!this._isDragging || UnityEngine.MonoBehaviour.op_Equality(this._activeBlock, null)) {
                    return;
                }

                var blockData = this._activeBlock.GetBlockData();
                if (blockData == null) {
                    return;
                }

                var deltaX = eventData.position.x - this._startDragPosition.x;
                var deltaY = eventData.position.y - this._startDragPosition.y;

                // 非钻石道具块可以上下移动
                var isNonDiamondItem = blockData.IsNonDiamondItem();

                if (isNonDiamondItem) {
                    // 非钻石道具块：判断是水平还是垂直拖动
                    if (!this._isVerticalDrag) {
                        // 判断拖动方向
                        var verticalThreshold = this._cellHeight * 0.3;
                        var absDeltaY = Math.abs(deltaY);
                        var absDeltaX = Math.abs(deltaX);

                        if (absDeltaY > absDeltaX || absDeltaY > verticalThreshold) {
                            this._isVerticalDrag = true;
                        }
                    }

                    if (this._isVerticalDrag) {
                        // 垂直拖动：先计算原始移动距离
                        var gridDeltaY = Math.round(deltaY / this._cellHeight);

                        // 强制限制只能移动1格（-1, 0, 1）
                        gridDeltaY = Math.max(-1, Math.min(gridDeltaY, 1));

                        // 检查是否超出垂直拖动限制
                        if (gridDeltaY < 0 && deltaY < this._minDragY) {
                            gridDeltaY = 0;
                        }
                        if (gridDeltaY > 0 && deltaY > this._maxDragY) {
                            gridDeltaY = 0;
                        }

                        // 检查目标方向是否可以合并（非钻石道具必须检查）
                        if (gridDeltaY !== 0 && !this.CanMergeInDirection(blockData, 0, gridDeltaY)) {
                            gridDeltaY = 0;
                        }

                        // 实时碰撞检测
                        if (gridDeltaY !== 0 && !Bridge.staticEquals(this._canMoveToPosition, null)) {
                            var newY = (blockData.Y + gridDeltaY) | 0;
                            if (!this._canMoveToPosition(this._activeBlock, blockData.X, newY)) {
                                gridDeltaY = 0;
                            }
                        }

                        // 只允许移动计算出的格数距离
                        var clampedDeltaY = gridDeltaY * this._cellHeight;

                        var rectTransform = this._activeBlock.GetComponent(UnityEngine.RectTransform);
                        if (UnityEngine.Component.op_Inequality(rectTransform, null)) {
                            rectTransform.anchoredPosition = new pc.Vec2( this._originalPosition.x, this._originalPosition.y + clampedDeltaY );
                        }
                    } else {
                        // 水平拖动（非钻石道具需要检查）
                        this.HandleHorizontalDragForItem(deltaX, blockData);
                    }
                } else {
                    // 普通块和钻石块：只能水平拖动，无限制
                    this.HandleHorizontalDrag(deltaX, blockData);
                }
            },
            /*JewelInputHandler.OnDrag end.*/

            /*JewelInputHandler.HandleHorizontalDragForItem start.*/
            /**
             * 处理非钻石道具的水平拖动（带合并检查）
             *
             * @instance
             * @private
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {number}            deltaX       
             * @param   {JewelBlockData}    blockData
             * @return  {void}
             */
            HandleHorizontalDragForItem: function (deltaX, blockData) {
                if (deltaX < this._minDragX) {
                    deltaX = this._minDragX;
                }
                if (deltaX > this._maxDragX) {
                    deltaX = this._maxDragX;
                }

                var gridDeltaX = Math.round(deltaX / this._cellWidth);

                // 检查目标方向是否可以合并
                if (gridDeltaX !== 0 && !this.CanMergeInDirection(blockData, gridDeltaX, 0)) {
                    gridDeltaX = 0;
                    deltaX = 0;
                }

                // 实时碰撞检测
                if (gridDeltaX !== 0 && !Bridge.staticEquals(this._canMoveToPosition, null)) {
                    var newX = (blockData.X + gridDeltaX) | 0;
                    if (!this._canMoveToPosition(this._activeBlock, newX, blockData.Y)) {
                        // 找到最近的合法位置
                        var originalX = blockData.X;
                        var bestX = originalX;

                        for (var testX = newX; testX >= originalX; testX = (testX - 1) | 0) {
                            if (this._canMoveToPosition(this._activeBlock, testX, blockData.Y)) {
                                bestX = testX;
                                break;
                            }
                        }

                        if (bestX === originalX) {
                            for (var testX1 = newX; testX1 <= originalX; testX1 = (testX1 + 1) | 0) {
                                if (this._canMoveToPosition(this._activeBlock, testX1, blockData.Y)) {
                                    bestX = testX1;
                                    break;
                                }
                            }
                        }

                        gridDeltaX = (bestX - originalX) | 0;
                        deltaX = gridDeltaX * this._cellWidth;
                    }
                }

                var rectTransform = this._activeBlock.GetComponent(UnityEngine.RectTransform);
                if (UnityEngine.Component.op_Inequality(rectTransform, null)) {
                    rectTransform.anchoredPosition = new pc.Vec2( this._originalPosition.x + deltaX, this._originalPosition.y );
                }
            },
            /*JewelInputHandler.HandleHorizontalDragForItem end.*/

            /*JewelInputHandler.HandleHorizontalDrag start.*/
            /**
             * 处理水平拖动
             *
             * @instance
             * @private
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {number}            deltaX       
             * @param   {JewelBlockData}    blockData
             * @return  {void}
             */
            HandleHorizontalDrag: function (deltaX, blockData) {
                if (deltaX < this._minDragX) {
                    deltaX = this._minDragX;
                }
                if (deltaX > this._maxDragX) {
                    deltaX = this._maxDragX;
                }

                // 实时碰撞检测
                var gridDeltaX = Math.round(deltaX / this._cellWidth);
                if (!Bridge.staticEquals(this._canMoveToPosition, null)) {
                    var newX = (blockData.X + gridDeltaX) | 0;
                    if (!this._canMoveToPosition(this._activeBlock, newX, blockData.Y)) {
                        // 找到最近的合法位置
                        var originalX = blockData.X;
                        var bestX = originalX;

                        for (var testX = newX; testX >= originalX; testX = (testX - 1) | 0) {
                            if (this._canMoveToPosition(this._activeBlock, testX, blockData.Y)) {
                                bestX = testX;
                                break;
                            }
                        }

                        if (bestX === originalX) {
                            for (var testX1 = newX; testX1 <= originalX; testX1 = (testX1 + 1) | 0) {
                                if (this._canMoveToPosition(this._activeBlock, testX1, blockData.Y)) {
                                    bestX = testX1;
                                    break;
                                }
                            }
                        }

                        gridDeltaX = (bestX - originalX) | 0;
                        deltaX = gridDeltaX * this._cellWidth;
                    }
                }

                var rectTransform = this._activeBlock.GetComponent(UnityEngine.RectTransform);
                if (UnityEngine.Component.op_Inequality(rectTransform, null)) {
                    rectTransform.anchoredPosition = new pc.Vec2( this._originalPosition.x + deltaX, this._originalPosition.y );
                }
            },
            /*JewelInputHandler.HandleHorizontalDrag end.*/

            /*JewelInputHandler.OnPointerUp start.*/
            /**
             * 结束拖动
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {UnityEngine.EventSystems.PointerEventData}    eventData
             * @return  {void}
             */
            OnPointerUp: function (eventData) {
                if (!this._inputEnabled) {
                    return;
                } // 如果输入被禁用，直接返回
                if (!this._isDragging || UnityEngine.MonoBehaviour.op_Equality(this._activeBlock, null)) {
                    return;
                }

                this._isDragging = false;

                var blockData = this._activeBlock.GetBlockData();
                if (blockData == null) {
                    this._activeBlock = null;
                    return;
                }

                var deltaX = eventData.position.x - this._startDragPosition.x;
                var deltaY = eventData.position.y - this._startDragPosition.y;

                var moved = false;

                // 非钻石道具块可以上下移动
                if (blockData.IsNonDiamondItem() && this._isVerticalDrag) {
                    // 垂直拖动
                    var gridDeltaY = Math.round(deltaY / this._cellHeight);
                    gridDeltaY = Math.max(-1, Math.min(gridDeltaY, 1));

                    if (gridDeltaY < 0 && deltaY < this._minDragY) {
                        gridDeltaY = 0;
                    }
                    if (gridDeltaY > 0 && deltaY > this._maxDragY) {
                        gridDeltaY = 0;
                    }

                    // 必须检查是否可以合并
                    if (gridDeltaY !== 0 && this.CanMergeInDirection(blockData, 0, gridDeltaY)) {
                        if (!Bridge.staticEquals(this._onBlockMovedVertical, null)) {
                            this._onBlockMovedVertical(this._activeBlock, gridDeltaY);
                            moved = true;
                        }
                    }
                } else {
                    // 水平拖动
                    if (deltaX < this._minDragX) {
                        deltaX = this._minDragX;
                    }
                    if (deltaX > this._maxDragX) {
                        deltaX = this._maxDragX;
                    }

                    var gridDeltaX = Math.round(deltaX / this._cellWidth);

                    // 对于非钻石道具，必须再次检查是否可以合并
                    if (gridDeltaX !== 0 && blockData.IsNonDiamondItem()) {
                        if (this.CanMergeInDirection(blockData, gridDeltaX, 0)) {
                            if (!Bridge.staticEquals(this._onBlockMovedHorizontal, null)) {
                                this._onBlockMovedHorizontal(this._activeBlock, gridDeltaX);
                                moved = true;
                            }
                        }
                    } else if (gridDeltaX !== 0) {
                        // 普通块和钻石块可以自由移动
                        if (!Bridge.staticEquals(this._onBlockMovedHorizontal, null)) {
                            this._onBlockMovedHorizontal(this._activeBlock, gridDeltaX);
                            moved = true;
                        }
                    }
                }

                if (!moved) {
                    // 回弹到原位置
                    this.StartCoroutine$1(this.SnapBackCoroutine(this._activeBlock));
                }

                this._activeBlock = null;
                this._isVerticalDrag = false;
            },
            /*JewelInputHandler.OnPointerUp end.*/

            /*JewelInputHandler.SnapBackCoroutine start.*/
            /**
             * 回弹动画协程
             *
             * @instance
             * @private
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {JewelBlockController}              block
             * @return  {System.Collections.IEnumerator}
             */
            SnapBackCoroutine: function (block) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    rectTransform,
                    startPos,
                    targetPos,
                    duration,
                    elapsed,
                    t,
                    $async_e;

                var $enumerator = new Bridge.GeneratorEnumerator(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    rectTransform = block.GetComponent(UnityEngine.RectTransform);
                                        if (UnityEngine.Component.op_Equality(rectTransform, null)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    startPos = rectTransform.anchoredPosition.$clone();
                                        targetPos = this._originalPosition.$clone();
                                        duration = 0.2;
                                        elapsed = 0.0;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( elapsed < duration ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 6;
                                        continue;
                                }
                                case 4: {
                                    elapsed += UnityEngine.Time.deltaTime;
                                        t = elapsed / duration;
                                        t = 1.0 - (1.0 - t) * (1.0 - t); // easeOut
                                        rectTransform.anchoredPosition = new pc.Vec2().lerp( startPos, targetPos, t );
                                        $enumerator.current = null;
                                        $step = 5;
                                        return true;
                                }
                                case 5: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 6: {
                                    rectTransform.anchoredPosition = targetPos.$clone();

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            },
            /*JewelInputHandler.SnapBackCoroutine end.*/

            /*JewelInputHandler.CalculateDragLimits start.*/
            /**
             * 计算拖动限制
             *
             * @instance
             * @private
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {JewelBlockController}    block
             * @return  {void}
             */
            CalculateDragLimits: function (block) {
                // 默认限制
                this._minDragX = -1000;
                this._maxDragX = 1000;
                this._minDragY = -1000;
                this._maxDragY = 1000;
            },
            /*JewelInputHandler.CalculateDragLimits end.*/

            /*JewelInputHandler.SetDragLimitsPixels start.*/
            /**
             * 设置水平拖动限制（像素值）
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {number}    minPixels    
             * @param   {number}    maxPixels
             * @return  {void}
             */
            SetDragLimitsPixels: function (minPixels, maxPixels) {
                this._minDragX = minPixels;
                this._maxDragX = maxPixels;
            },
            /*JewelInputHandler.SetDragLimitsPixels end.*/

            /*JewelInputHandler.SetVerticalDragLimitsPixels start.*/
            /**
             * 设置垂直拖动限制（像素值）
             *
             * @instance
             * @public
             * @this JewelInputHandler
             * @memberof JewelInputHandler
             * @param   {number}    minPixels    
             * @param   {number}    maxPixels
             * @return  {void}
             */
            SetVerticalDragLimitsPixels: function (minPixels, maxPixels) {
                this._minDragY = minPixels;
                this._maxDragY = maxPixels;
            },
            /*JewelInputHandler.SetVerticalDragLimitsPixels end.*/


        }
    });
    /*JewelInputHandler end.*/

    /*JewelLevelData start.*/
    /**
     * 关卡数据类（存储初始棋盘布局）
     *
     * @public
     * @class JewelLevelData
     * @augments UnityEngine.ScriptableObject
     */
    Bridge.define("JewelLevelData", {
        inherits: [UnityEngine.ScriptableObject],
        fields: {
            LevelName: null,
            LevelNumber: 0,
            Columns: 0,
            Rows: 0,
            InitialBlocks: null
        },
        ctors: {
            init: function () {
                this.LevelName = "Level 1";
                this.LevelNumber = 1;
                this.Columns = 12;
                this.Rows = 16;
                this.InitialBlocks = new (System.Collections.Generic.List$1(JewelLevelData.BlockPlacementData)).ctor();
            }
        },
        methods: {
            /*JewelLevelData.ClearAllBlocks start.*/
            /**
             * 清除所有块
             *
             * @instance
             * @public
             * @this JewelLevelData
             * @memberof JewelLevelData
             * @return  {void}
             */
            ClearAllBlocks: function () {
                this.InitialBlocks.clear();
            },
            /*JewelLevelData.ClearAllBlocks end.*/

            /*JewelLevelData.AddBlock start.*/
            /**
             * 添加块
             *
             * @instance
             * @public
             * @this JewelLevelData
             * @memberof JewelLevelData
             * @param   {number}        x        
             * @param   {number}        y        
             * @param   {number}        width    
             * @param   {JewelColor}    color
             * @return  {void}
             */
            AddBlock: function (x, y, width, color) {
                this.InitialBlocks.add(new JewelLevelData.BlockPlacementData(x, y, width, color));
            },
            /*JewelLevelData.AddBlock end.*/

            /*JewelLevelData.RemoveBlock start.*/
            /**
             * 移除块
             *
             * @instance
             * @public
             * @this JewelLevelData
             * @memberof JewelLevelData
             * @param   {number}    x    
             * @param   {number}    y
             * @return  {void}
             */
            RemoveBlock: function (x, y) {
                this.InitialBlocks.RemoveAll(function (b) {
                    return b.X === x && b.Y === y;
                });
            },
            /*JewelLevelData.RemoveBlock end.*/

            /*JewelLevelData.GetBlockAt start.*/
            /**
             * 获取指定位置的块
             *
             * @instance
             * @public
             * @this JewelLevelData
             * @memberof JewelLevelData
             * @param   {number}                               x    
             * @param   {number}                               y
             * @return  {JewelLevelData.BlockPlacementData}
             */
            GetBlockAt: function (x, y) {
                var $t;
                $t = Bridge.getEnumerator(this.InitialBlocks);
                try {
                    while ($t.moveNext()) {
                        var block = $t.Current;
                        if (block.Y === y && block.X <= x && ((block.X + block.Width) | 0) > x) {
                            return block;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                return null;
            },
            /*JewelLevelData.GetBlockAt end.*/

            /*JewelLevelData.IsItem start.*/
            /**
             * 判断是否是道具块
             *
             * @instance
             * @public
             * @this JewelLevelData
             * @memberof JewelLevelData
             * @param   {JewelColor}    color
             * @return  {boolean}
             */
            IsItem: function (color) {
                return color >= JewelColor.Diamond;
            },
            /*JewelLevelData.IsItem end.*/


        }
    });
    /*JewelLevelData end.*/

    /*JewelLevelData+BlockPlacementData start.*/
    /**
     * 块放置数据（序列化用）
     *
     * @public
     * @class JewelLevelData.BlockPlacementData
     */
    Bridge.define("JewelLevelData.BlockPlacementData", {
        $kind: 1002,
        fields: {
            X: 0,
            Y: 0,
            Width: 0,
            Color: 0
        },
        ctors: {
            ctor: function (x, y, width, color) {
                this.$initialize();
                this.X = x;
                this.Y = y;
                this.Width = width;
                this.Color = color;
            }
        }
    });
    /*JewelLevelData+BlockPlacementData end.*/

    /*JewelPreviewManager start.*/
    /**
     * 预览区域管理器
     *
     * @public
     * @class JewelPreviewManager
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("JewelPreviewManager", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            PreviewContainer: null,
            PreviewBlockPrefab: null,
            Config: null,
            _cellWidth: 0,
            _cellHeight: 0,
            _previewWidth: 0,
            _previewHeight: 0
        },
        methods: {
            /*JewelPreviewManager.Initialize start.*/
            /**
             * 初始化
             *
             * @instance
             * @public
             * @this JewelPreviewManager
             * @memberof JewelPreviewManager
             * @param   {JewelBoardConfig}    config
             * @return  {void}
             */
            Initialize: function (config) {
                this.Config = config;
                this.CalculatePreviewMetrics();
            },
            /*JewelPreviewManager.Initialize end.*/

            /*JewelPreviewManager.CalculatePreviewMetrics start.*/
            /**
             * 计算预览区域尺寸（确保单元格是正方形）
             *
             * @instance
             * @private
             * @this JewelPreviewManager
             * @memberof JewelPreviewManager
             * @return  {void}
             */
            CalculatePreviewMetrics: function () {
                if (UnityEngine.Component.op_Equality(this.PreviewContainer, null)) {
                    return;
                }

                this._previewWidth = this.PreviewContainer.rect.width;
                this._previewHeight = this.PreviewContainer.rect.height;

                // 计算基于宽度和高度的单元格尺寸
                var cellSizeByWidth = this._previewWidth / this.Config.Columns;
                var cellSizeByHeight = this._previewHeight; // 预览区域通常只有一行高度

                // 取较小值，确保单元格是正方形
                var cellSize = UnityEngine.Mathf.Min(cellSizeByWidth, cellSizeByHeight);

                // 使用统一的单元格尺寸（正方形）
                this._cellWidth = cellSize;
                this._cellHeight = cellSize;
            },
            /*JewelPreviewManager.CalculatePreviewMetrics end.*/

            /*JewelPreviewManager.UpdatePreview start.*/
            /**
             * 更新预览显示
             *
             * @instance
             * @public
             * @this JewelPreviewManager
             * @memberof JewelPreviewManager
             * @param   {System.Collections.Generic.List$1}    nextRowData
             * @return  {void}
             */
            UpdatePreview: function (nextRowData) {
                var $t, $t1;
                // 清除现有预览
                $t = Bridge.getEnumerator(this.PreviewContainer);
                try {
                    while ($t.moveNext()) {
                        var child = Bridge.cast($t.Current, UnityEngine.Transform);
                        UnityEngine.MonoBehaviour.Destroy(child.gameObject);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (nextRowData == null) {
                    return;
                }

                // 创建预览块
                $t1 = Bridge.getEnumerator(nextRowData);
                try {
                    while ($t1.moveNext()) {
                        var blockData = $t1.Current;
                        var previewObj = UnityEngine.Object.Instantiate(UnityEngine.GameObject, this.PreviewBlockPrefab, this.PreviewContainer);
                        var controller = previewObj.GetComponent(JewelBlockController);

                        if (UnityEngine.MonoBehaviour.op_Equality(controller, null)) {
                            controller = previewObj.AddComponent(JewelBlockController);
                        }

                        // 初始化预览块（使用半透明效果）
                        controller.Initialize(blockData, this.Config, this._cellWidth, this._cellHeight);

                        // 设置预览块位置
                        var rectTransform = previewObj.GetComponent(UnityEngine.RectTransform);
                        if (UnityEngine.Component.op_Inequality(rectTransform, null)) {
                            var x = (blockData.X * this._cellWidth) + (blockData.Width * this._cellWidth / 2.0) - (this._previewWidth / 2.0);
                            rectTransform.anchoredPosition = new pc.Vec2( x, 0 );
                        }

                        // 设置半透明效果
                        var image = previewObj.GetComponent(UnityEngine.UI.Image);
                        if (UnityEngine.MonoBehaviour.op_Inequality(image, null)) {
                            var color = image.color.$clone();
                            color.a = 0.5;
                            image.color = color.$clone();
                        }
                    }
                } finally {
                    if (Bridge.is($t1, System.IDisposable)) {
                        $t1.System$IDisposable$Dispose();
                    }
                }
            },
            /*JewelPreviewManager.UpdatePreview end.*/


        }
    });
    /*JewelPreviewManager end.*/

    /*StoreNavigator start.*/
    /**
     * 商店导航器（用于跳转到应用商店）
     支持 Luna Playable Ads 环境的运行时平台检测
     *
     * @public
     * @class StoreNavigator
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("StoreNavigator", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            IosAppId: null,
            AndroidPackageName: null,
            FallbackWebStoreUrl: null,
            UseRuntimePlatformDetection: false
        },
        ctors: {
            init: function () {
                this.IosAppId = "1476678178";
                this.AndroidPackageName = "com.sportbrain.jewelpuzzle";
                this.FallbackWebStoreUrl = "https://play.google.com/store/apps/details?id=com.sportbrain.jewelpuzzle";
                this.UseRuntimePlatformDetection = true;
            }
        },
        methods: {
            /*StoreNavigator.OpenStore start.*/
            /**
             * 打开应用商店
             *
             * @instance
             * @public
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {void}
             */
            OpenStore: function () {
                // 优先使用运行时平台检测（适用于 Playable Ads / Luna 环境）
                if (this.UseRuntimePlatformDetection) {
                    var platform = this.DetectPlatformRuntime();
                    UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u8fd0\u884c\u65f6\u68c0\u6d4b\u5230\u7684\u5e73\u53f0: {0}", [Bridge.box(platform, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType))]));

                    switch (platform) {
                        case StoreNavigator.PlatformType.iOS: 
                            this.OpenIOSStore();
                            break;
                        case StoreNavigator.PlatformType.Android: 
                            this.OpenAndroidStore();
                            break;
                        default: 
                            this.OpenWebStore();
                            break;
                    }
                } else {
                    // 使用编译时平台检测（传统方式）
                    this.OpenWebStore();
                }
            },
            /*StoreNavigator.OpenStore end.*/

            /*StoreNavigator.DetectPlatformRuntime start.*/
            /**
             * 运行时检测平台（适用于 Playable Ads 环境）
             *
             * @instance
             * @private
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {number}
             */
            DetectPlatformRuntime: function () {
                // 方法1：检查 Unity 的 RuntimePlatform
                var runtimePlatform = UnityEngine.Application.platform;
                UnityEngine.Debug.Log$1(System.String.format("1 [StoreNavigator] Application.platform = {0}", [Bridge.box(runtimePlatform, UnityEngine.RuntimePlatform, System.Enum.toStringFn(UnityEngine.RuntimePlatform))]));


                return this.DetectPlatformFromUserAgent();

            },
            /*StoreNavigator.DetectPlatformRuntime end.*/

            /*StoreNavigator.DetectPlatformFromUserAgent start.*/
            /**
             * 通过 UserAgent 检测平台（用于 Luna Playable 环境）
             *
             * @instance
             * @private
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {number}
             */
            DetectPlatformFromUserAgent: function () {
                try {
                    // 使用 Luna Bridge.NET 方式调用 JavaScript
                    if (PlatformDetector.isIOSDevice()) {
                        UnityEngine.Debug.Log$1("[StoreNavigator] Luna JavaScript \u68c0\u6d4b\u5230 iOS \u8bbe\u5907");
                        return StoreNavigator.PlatformType.iOS;
                    }

                    if (PlatformDetector.isAndroidDevice()) {
                        UnityEngine.Debug.Log$1("[StoreNavigator] Luna JavaScript \u68c0\u6d4b\u5230 Android \u8bbe\u5907");
                        return StoreNavigator.PlatformType.Android;
                    }

                    // 获取平台名称字符串
                    var platformName = PlatformDetector.getPlatformName();
                    UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] Luna JavaScript \u8fd4\u56de\u5e73\u53f0\u540d\u79f0: {0}", [platformName]));

                    if (Bridge.referenceEquals(platformName, "iOS") || Bridge.referenceEquals(platformName, "Mac")) {
                        return StoreNavigator.PlatformType.iOS;
                    } else if (Bridge.referenceEquals(platformName, "Android")) {
                        return StoreNavigator.PlatformType.Android;
                    }
                } catch (ex) {
                    ex = System.Exception.create(ex);
                    UnityEngine.Debug.LogWarning$1(System.String.format("[StoreNavigator] Luna JavaScript \u5e73\u53f0\u68c0\u6d4b\u5931\u8d25: {0}", [ex.Message]));
                }


                return StoreNavigator.PlatformType.Unknown;
            },
            /*StoreNavigator.DetectPlatformFromUserAgent end.*/

            /*StoreNavigator.OpenIOSStore start.*/
            /**
             * 打开iOS App Store
             *
             * @instance
             * @private
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {void}
             */
            OpenIOSStore: function () {

                // iOS App Store URL格式
                var storeUrl = System.String.format("https://apps.apple.com/app/id{0}", [this.IosAppId]);

                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u6253\u5f00iOS\u5546\u5e97: {0}", [storeUrl]));
                this.OpenURLPlatformSafe(storeUrl);
            },
            /*StoreNavigator.OpenIOSStore end.*/

            /*StoreNavigator.OpenAndroidStore start.*/
            /**
             * 打开Android Google Play商店
             *
             * @instance
             * @private
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {void}
             */
            OpenAndroidStore: function () {
                if (System.String.isNullOrEmpty(this.AndroidPackageName)) {
                    UnityEngine.Debug.LogWarning$1("[StoreNavigator] Android\u5305\u540d\u672a\u8bbe\u7f6e\uff0c\u4f7f\u7528\u5907\u7528\u7f51\u9875\u5546\u5e97");
                    this.OpenWebStore();
                    return;
                }

                // 在 Playable 环境中，直接使用网页版 Google Play
                // market:// 协议在浏览器中无法使用
                // 原生环境中，优先尝试使用Google Play应用
                var marketUrl = System.String.format("market://details?id={0}", [this.AndroidPackageName]);
                var webUrl = System.String.format("https://play.google.com/store/apps/details?id={0}", [this.AndroidPackageName]);

                try {
                    this.OpenURLPlatformSafe(webUrl);

                } catch (ex) {
                    ex = System.Exception.create(ex);
                    UnityEngine.Debug.LogWarning$1(System.String.format("[StoreNavigator] \u65e0\u6cd5\u6253\u5f00Google Play\u5e94\u7528: {0}\uff0c\u4f7f\u7528\u7f51\u9875\u7248", [ex.Message]));
                }
            },
            /*StoreNavigator.OpenAndroidStore end.*/

            /*StoreNavigator.OpenWebStore start.*/
            /**
             * 打开网页商店（备用方案）
             *
             * @instance
             * @private
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {void}
             */
            OpenWebStore: function () {
                if (System.String.isNullOrEmpty(this.FallbackWebStoreUrl)) {
                    UnityEngine.Debug.LogError$2("[StoreNavigator] \u5907\u7528\u7f51\u9875\u5546\u5e97URL\u672a\u8bbe\u7f6e\uff01");
                    return;
                }

                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u6253\u5f00\u7f51\u9875\u5546\u5e97: {0}", [this.FallbackWebStoreUrl]));
                this.OpenURLPlatformSafe(this.FallbackWebStoreUrl);
            },
            /*StoreNavigator.OpenWebStore end.*/

            /*StoreNavigator.OpenURLPlatformSafe start.*/
            /**
             * 跨平台安全地打开URL
             *
             * @instance
             * @private
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @param   {string}    url
             * @return  {void}
             */
            OpenURLPlatformSafe: function (url) {
                try {
                    // 在 Luna Playable 中使用 JavaScript 打开 URL（更可靠）
                    PlatformDetector.openURL(url);
                    UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u4f7f\u7528 Luna JavaScript \u6253\u5f00 URL: {0}", [url]));
                } catch (ex) {
                    ex = System.Exception.create(ex);
                    UnityEngine.Debug.LogWarning$1(System.String.format("[StoreNavigator] Luna JavaScript OpenURL \u5931\u8d25: {0}\uff0c\u4f7f\u7528 Application.OpenURL", [ex.Message]));
                    UnityEngine.Application.OpenURL(url);
                }
            },
            /*StoreNavigator.OpenURLPlatformSafe end.*/

            /*StoreNavigator.TestStoreNavigation start.*/
            /**
             * 测试商店跳转（在编辑器中使用）
             *
             * @instance
             * @public
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {void}
             */
            TestStoreNavigation: function () {
                UnityEngine.Debug.Log$1("[StoreNavigator] \u6d4b\u8bd5\u5546\u5e97\u8df3\u8f6c...");
                this.OpenStore();
            },
            /*StoreNavigator.TestStoreNavigation end.*/

            /*StoreNavigator.TestLunaPlatformDetection start.*/
            /**
             * 测试 Luna JavaScript 平台检测
             *
             * @instance
             * @public
             * @this StoreNavigator
             * @memberof StoreNavigator
             * @return  {void}
             */
            TestLunaPlatformDetection: function () {
                UnityEngine.Debug.Log$1("[StoreNavigator] \u6d4b\u8bd5 Luna \u5e73\u53f0\u68c0\u6d4b...");
                PlatformDetector.logDeviceInfo();

                var platformName = PlatformDetector.getPlatformName();
                var isiOS = PlatformDetector.isIOSDevice();
                var isAndroid = PlatformDetector.isAndroidDevice();
                var isSafari = PlatformDetector.isSafariBrowser();
                var isIOSSafari = PlatformDetector.isIOSSafari();

                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u5e73\u53f0\u540d\u79f0: {0}", [platformName]));
                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u662f\u5426iOS: {0}", [Bridge.box(isiOS, System.Boolean, System.Boolean.toString)]));
                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u662f\u5426Android: {0}", [Bridge.box(isAndroid, System.Boolean, System.Boolean.toString)]));
                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u662f\u5426Safari: {0}", [Bridge.box(isSafari, System.Boolean, System.Boolean.toString)]));
                UnityEngine.Debug.Log$1(System.String.format("[StoreNavigator] \u662f\u5426iOS Safari: {0}", [Bridge.box(isIOSSafari, System.Boolean, System.Boolean.toString)]));
            },
            /*StoreNavigator.TestLunaPlatformDetection end.*/


        }
    });
    /*StoreNavigator end.*/

    /*StoreNavigator+PlatformType start.*/
    /**
     * 平台类型枚举
     *
     * @private
     * @class number
     */
    Bridge.define("StoreNavigator.PlatformType", {
        $kind: 1006,
        statics: {
            fields: {
                Unknown: 0,
                iOS: 1,
                Android: 2,
                WebGL: 3
            }
        }
    });
    /*StoreNavigator+PlatformType end.*/

    /*UI.FrameSequenceCropData start.*/
    /** @namespace UI */

    /**
     * 序列帧裁剪数据 - 保存预处理裁剪后的信息和偏移
     *
     * @public
     * @class UI.FrameSequenceCropData
     * @augments UnityEngine.ScriptableObject
     */
    Bridge.define("UI.FrameSequenceCropData", {
        inherits: [UnityEngine.ScriptableObject],
        fields: {
            OriginalSize: null,
            FrameCount: 0,
            FrameDataList: null
        },
        ctors: {
            init: function () {
                this.OriginalSize = new UnityEngine.Vector2();
                this.OriginalSize = new pc.Vec2( 720.0, 1280.0 );
                this.FrameDataList = new (System.Collections.Generic.List$1(UI.FrameSequenceCropData.FrameCropInfo)).ctor();
            }
        },
        methods: {
            /*UI.FrameSequenceCropData.GetFrameInfo start.*/
            /**
             * 获取指定帧的裁剪信息
             *
             * @instance
             * @public
             * @this UI.FrameSequenceCropData
             * @memberof UI.FrameSequenceCropData
             * @param   {number}                                    frameIndex
             * @return  {UI.FrameSequenceCropData.FrameCropInfo}
             */
            GetFrameInfo: function (frameIndex) {
                if (frameIndex < 0 || frameIndex >= this.FrameDataList.Count) {
                    return null;
                }
                return this.FrameDataList.getItem(frameIndex);
            },
            /*UI.FrameSequenceCropData.GetFrameInfo end.*/

            /*UI.FrameSequenceCropData.GetFrameInfoByFileName start.*/
            /**
             * 根据文件名获取帧信息
             *
             * @instance
             * @public
             * @this UI.FrameSequenceCropData
             * @memberof UI.FrameSequenceCropData
             * @param   {string}                                    fileName
             * @return  {UI.FrameSequenceCropData.FrameCropInfo}
             */
            GetFrameInfoByFileName: function (fileName) {
                return System.Linq.Enumerable.from(this.FrameDataList, UI.FrameSequenceCropData.FrameCropInfo).firstOrDefault(Bridge.fn.bind(this, function (f) {
                        return Bridge.referenceEquals(f.CroppedFileName, fileName);
                    }), null);
            },
            /*UI.FrameSequenceCropData.GetFrameInfoByFileName end.*/


        }
    });
    /*UI.FrameSequenceCropData end.*/

    /*UI.FrameSequenceCropData+FrameCropInfo start.*/
    Bridge.define("UI.FrameSequenceCropData.FrameCropInfo", {
        $kind: 1002,
        fields: {
            FrameIndex: 0,
            OriginalFileName: null,
            CroppedFileName: null,
            CroppedSize: null,
            OffsetFromCenter: null,
            CropRect: null
        },
        ctors: {
            init: function () {
                this.CroppedSize = new UnityEngine.Vector2();
                this.OffsetFromCenter = new UnityEngine.Vector2();
                this.CropRect = new UnityEngine.Rect();
            }
        }
    });
    /*UI.FrameSequenceCropData+FrameCropInfo end.*/

    /*UI.FrameSequenceEffectPlayer start.*/
    /**
     * 序列帧特效播放器
     支持自动裁剪透明区域（AABB裁剪），并保存每帧相对于原中心的偏移，以保持掉落效果
     *
     * @public
     * @class UI.FrameSequenceEffectPlayer
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("UI.FrameSequenceEffectPlayer", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            FrameSpritesDirectory: null,
            FrameSprites: null,
            PreprocessedCropData: null,
            CroppedSpritesDirectory: null,
            FrameRate: 0,
            Loop: false,
            AutoPlay: false,
            AutoCropTransparent: false,
            CropPadding: 0,
            OriginalSize: null,
            TargetImage: null,
            KeepOriginalCenter: false,
            AnchorAlignment: 0,
            _frameDataList: null,
            _currentFrameIndex: 0,
            _frameTimer: 0,
            _isPlaying: false,
            _isPaused: false,
            _rectTransform: null,
            _originalSize: null,
            _originalPosition: null,
            OnPlayComplete: null
        },
        ctors: {
            init: function () {
                this.OriginalSize = new UnityEngine.Vector2();
                this._originalSize = new UnityEngine.Vector2();
                this._originalPosition = new UnityEngine.Vector2();
                this.FrameSpritesDirectory = "";
                this.CroppedSpritesDirectory = "";
                this.FrameRate = 30.0;
                this.Loop = false;
                this.AutoPlay = true;
                this.AutoCropTransparent = true;
                this.CropPadding = 0;
                this.OriginalSize = new pc.Vec2( 720.0, 1280.0 );
                this.KeepOriginalCenter = true;
                this.AnchorAlignment = UI.FrameSequenceEffectPlayer.Alignment.Center;
                this._frameDataList = new (System.Collections.Generic.List$1(UI.FrameSequenceEffectPlayer.FrameData)).ctor();
                this._currentFrameIndex = 0;
                this._frameTimer = 0.0;
                this._isPlaying = false;
                this._isPaused = false;
            }
        },
        methods: {
            /*UI.FrameSequenceEffectPlayer.Awake start.*/
            Awake: function () {
                // 获取组件
                if (UnityEngine.MonoBehaviour.op_Equality(this.TargetImage, null)) {
                    this.TargetImage = this.GetComponent(UnityEngine.UI.Image);
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.TargetImage, null)) {
                    UnityEngine.Debug.LogError$2("FrameSequenceEffectPlayer: \u672a\u627e\u5230Image\u7ec4\u4ef6\uff01");
                    return;
                }

                this._rectTransform = this.GetComponent(UnityEngine.RectTransform);
                if (UnityEngine.Component.op_Equality(this._rectTransform, null)) {
                    UnityEngine.Debug.LogError$2("FrameSequenceEffectPlayer: \u672a\u627e\u5230RectTransform\u7ec4\u4ef6\uff01");
                    return;
                }

                // 保存原始尺寸和位置
                this._originalSize = this._rectTransform.sizeDelta.$clone();
                this._originalPosition = this._rectTransform.anchoredPosition.$clone();

                // 初始化帧数据
                this.InitializeFrameData();
            },
            /*UI.FrameSequenceEffectPlayer.Awake end.*/

            /*UI.FrameSequenceEffectPlayer.Start start.*/
            Start: function () {
                if (this.AutoPlay) {
                    this.Play();
                }
            },
            /*UI.FrameSequenceEffectPlayer.Start end.*/

            /*UI.FrameSequenceEffectPlayer.Update start.*/
            Update: function () {
                if (this._isPlaying && !this._isPaused) {
                    this.UpdateAnimation();
                }
            },
            /*UI.FrameSequenceEffectPlayer.Update end.*/

            /*UI.FrameSequenceEffectPlayer.InitializeFrameData start.*/
            /**
             * 初始化帧数据（裁剪透明区域并计算偏移）
             *
             * @instance
             * @private
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            InitializeFrameData: function () {
                this._frameDataList.clear();

                // 优先使用预处理数据
                var usePreprocessedData = this.PreprocessedCropData != null && this.PreprocessedCropData.FrameDataList != null && this.PreprocessedCropData.FrameDataList.Count > 0;

                // 如果使用预处理数据，尝试自动加载序列帧
                if (usePreprocessedData) {
                    UnityEngine.Debug.Log$1(System.String.format("FrameSequenceEffectPlayer: \u4f7f\u7528\u9884\u5904\u7406\u88c1\u526a\u6570\u636e\uff0c\u5171 {0} \u5e27", [Bridge.box(this.PreprocessedCropData.FrameCount, System.Int32)]));
                    this.OriginalSize = this.PreprocessedCropData.OriginalSize.$clone(); // 使用预处理数据中的原始尺寸

                    // 如果FrameSprites为空，尝试从CropData加载
                    if (this.FrameSprites == null || this.FrameSprites.length === 0) {
                        this.LoadSpritesFromCropData();
                    }
                }

                // 检查是否有序列帧
                if (this.FrameSprites == null || this.FrameSprites.length === 0) {
                    UnityEngine.Debug.LogWarning$1("FrameSequenceEffectPlayer: \u5e8f\u5217\u5e27\u6570\u7ec4\u4e3a\u7a7a\uff01\u8bf7\u8bbe\u7f6eFrameSprites\u6216\u901a\u8fc7\u76ee\u5f55\u52a0\u8f7d\u3002\n\u5982\u679c\u4f7f\u7528\u9884\u5904\u7406\u6570\u636e\uff0c\u8bf7\u786e\u4fdd\u88c1\u526a\u540e\u7684\u56fe\u7247\u5df2\u52a0\u8f7d\u5230FrameSprites\u6570\u7ec4\u4e2d\u3002");
                    return;
                }

                for (var i = 0; i < this.FrameSprites.length; i = (i + 1) | 0) {
                    var sprite = this.FrameSprites[i];
                    if (sprite == null) {
                        UnityEngine.Debug.LogWarning$1(System.String.format("FrameSequenceEffectPlayer: \u53d1\u73b0\u7a7a\u7684Sprite\uff08\u7d22\u5f15 {0}\uff09\uff0c\u8df3\u8fc7", [Bridge.box(i, System.Int32)]));
                        continue;
                    }

                    var frameData = new UI.FrameSequenceEffectPlayer.FrameData();
                    frameData.Sprite = sprite;

                    // 优先使用预处理数据
                    if (usePreprocessedData) {
                        var cropInfo = this.PreprocessedCropData.GetFrameInfo(i);
                        if (cropInfo != null) {
                            frameData.CroppedSize = cropInfo.CroppedSize.$clone();
                            frameData.OffsetFromCenter = cropInfo.OffsetFromCenter.$clone();
                            frameData.CropRect = cropInfo.CropRect.$clone();
                        } else {
                            // 预处理数据中找不到对应帧，使用原始尺寸
                            frameData.CroppedSize = new pc.Vec2( sprite.rect.width, sprite.rect.height );
                            frameData.OffsetFromCenter = pc.Vec2.ZERO.clone();
                            frameData.CropRect = sprite.rect.$clone();
                        }
                    } else if (this.AutoCropTransparent) {
                        // 运行时裁剪透明区域并计算偏移
                        this.CropAndCalculateOffset(frameData, i);
                    } else {
                        // 不裁剪，使用原始尺寸
                        frameData.CroppedSize = new pc.Vec2( sprite.rect.width, sprite.rect.height );
                        frameData.OffsetFromCenter = pc.Vec2.ZERO.clone();
                        frameData.CropRect = sprite.rect.$clone();
                    }

                    this._frameDataList.add(frameData);
                }

                UnityEngine.Debug.Log$1((System.String.format("FrameSequenceEffectPlayer: \u521d\u59cb\u5316\u5b8c\u6210\uff0c\u5171 {0} \u5e27", [Bridge.box(this._frameDataList.Count, System.Int32)]) || "") + ((usePreprocessedData ? "\uff08\u4f7f\u7528\u9884\u5904\u7406\u6570\u636e\uff09" : "") || "") + (System.String.format("\uff0cFrameSprites.Length = {0}", [Bridge.box(this.FrameSprites.length, System.Int32)]) || ""));
            },
            /*UI.FrameSequenceEffectPlayer.InitializeFrameData end.*/

            /*UI.FrameSequenceEffectPlayer.LoadSpritesFromCropData start.*/
            /**
             * 从CropData自动加载序列帧（运行时无法自动加载，需要手动设置）
             *
             * @instance
             * @private
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            LoadSpritesFromCropData: function () {
                if (this.PreprocessedCropData == null || this.PreprocessedCropData.FrameDataList == null || this.PreprocessedCropData.FrameDataList.Count === 0) {
                    UnityEngine.Debug.LogWarning$1("FrameSequenceEffectPlayer: CropData\u65e0\u6548\uff0c\u65e0\u6cd5\u81ea\u52a8\u52a0\u8f7d\u5e8f\u5217\u5e27");
                    return;
                }

                // 在运行时无法使用AssetDatabase，所以只能提示用户
                UnityEngine.Debug.LogWarning$1((System.String.format("FrameSequenceEffectPlayer: \u68c0\u6d4b\u5230CropData\uff0c\u4f46FrameSprites\u6570\u7ec4\u4e3a\u7a7a\u3002\n", null) || "") + (System.String.format("\u8bf7\u624b\u52a8\u52a0\u8f7d\u88c1\u526a\u540e\u7684\u5e8f\u5217\u5e27\u5230FrameSprites\u6570\u7ec4\uff0c\u6216\u8bbe\u7f6eCroppedSpritesDirectory\u76ee\u5f55\u8def\u5f84\u3002\n", null) || "") + (System.String.format("CropData\u5305\u542b {0} \u5e27\uff0c\u7b2c\u4e00\u5e27\u6587\u4ef6\u540d: {1}", Bridge.box(this.PreprocessedCropData.FrameCount, System.Int32), this.PreprocessedCropData.FrameDataList.getItem(0).CroppedFileName) || ""));

                // TODO: 在编辑器模式下可以使用AssetDatabase自动加载
            },
            /*UI.FrameSequenceEffectPlayer.LoadSpritesFromCropData end.*/

            /*UI.FrameSequenceEffectPlayer.CropAndCalculateOffset start.*/
            /**
             * 裁剪透明区域并计算偏移
             *
             * @instance
             * @private
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @param   {UI.FrameSequenceEffectPlayer.FrameData}    frameData     
             * @param   {number}                                    frameIndex
             * @return  {void}
             */
            CropAndCalculateOffset: function (frameData, frameIndex) {
                var sprite = frameData.Sprite;
                if (sprite == null || sprite.texture == null) {
                    UnityEngine.Debug.LogError$2("FrameSequenceEffectPlayer: Sprite\u6216Texture\u4e3a\u7a7a\uff0c\u65e0\u6cd5\u88c1\u526a");
                    return;
                }

                var texture = sprite.texture;
                var spriteRect = sprite.rect.$clone();

                // 初始化边界值
                var xMin = 2147483647;
                var xMax = -2147483648;
                var yMin = 2147483647;
                var yMax = -2147483648;

                var foundPixel = false;

                // 尝试读取像素数据（需要纹理是可读的）
                try {
                    // 读取sprite区域的像素
                    var startX = Math.floor(spriteRect.xMin);
                    var startY = Math.floor(spriteRect.yMin);
                    var width = Math.ceil(spriteRect.width);
                    var height = Math.ceil(spriteRect.height);

                    // 确保在纹理范围内
                    startX = Math.max(0, Math.min(startX, ((texture.width - 1) | 0)));
                    startY = Math.max(0, Math.min(startY, ((texture.height - 1) | 0)));
                    width = Math.max(1, Math.min(width, ((texture.width - startX) | 0)));
                    height = Math.max(1, Math.min(height, ((texture.height - startY) | 0)));

                    // 读取像素数据
                    var pixels = texture.GetPixels$2(startX, startY, width, height);

                    // 扫描像素找到非透明区域的边界
                    for (var y = 0; y < height; y = (y + 1) | 0) {
                        for (var x = 0; x < width; x = (x + 1) | 0) {
                            var pixelIndex = (Bridge.Int.mul(y, width) + x) | 0;
                            var pixel = pixels[pixelIndex].$clone();

                            // 检查像素是否不透明（alpha > 阈值）
                            if (pixel.a > 0.01) {
                                foundPixel = true;

                                var worldX = (startX + x) | 0;
                                var worldY = (startY + y) | 0;

                                xMin = UnityEngine.Mathf.Min(xMin, worldX);
                                xMax = UnityEngine.Mathf.Max(xMax, worldX);
                                yMin = UnityEngine.Mathf.Min(yMin, worldY);
                                yMax = UnityEngine.Mathf.Max(yMax, worldY);
                            }
                        }
                    }
                } catch ($e1) {
                    $e1 = System.Exception.create($e1);
                    var ex;
                    if (Bridge.is($e1, UnityEngine.UnityException)) {
                        ex = $e1;
                        // 纹理不可读，使用sprite的bounds来估算
                        UnityEngine.Debug.LogWarning$1(System.String.format("FrameSequenceEffectPlayer: \u65e0\u6cd5\u8bfb\u53d6\u7eb9\u7406\u50cf\u7d20\u6570\u636e\uff0c\u4f7f\u7528sprite bounds\u4f30\u7b97\u3002\u9519\u8bef: {0}", [ex.Message]));
                        UnityEngine.Debug.LogWarning$1("\u63d0\u793a\uff1a\u8bf7\u5728\u7eb9\u7406\u5bfc\u5165\u8bbe\u7f6e\u4e2d\u542f\u7528 'Read/Write Enabled' \u4ee5\u652f\u6301\u8fd0\u884c\u65f6\u88c1\u526a");

                        // 使用sprite的bounds来估算
                        var bounds = sprite.bounds;
                        var size = bounds.halfExtents.$clone().scale( 2 ).$clone();
                        var center = bounds.center.$clone();

                        // 将世界坐标转换为纹理坐标
                        var pixelsPerUnit = sprite.pixelsPerUnit;
                        var textureWidth = sprite.texture.width;
                        var textureHeight = sprite.texture.height;

                        // 估算非透明区域（假设在sprite中心附近）
                        var estimatedWidth = size.x * pixelsPerUnit * 0.8; // 假设80%是有内容的
                        var estimatedHeight = size.y * pixelsPerUnit * 0.8;

                        xMin = Math.floor(spriteRect.center.x - estimatedWidth * 0.5);
                        xMax = Math.ceil(spriteRect.center.x + estimatedWidth * 0.5);
                        yMin = Math.floor(spriteRect.center.y - estimatedHeight * 0.5);
                        yMax = Math.ceil(spriteRect.center.y + estimatedHeight * 0.5);

                        foundPixel = true;
                    } else {
                        throw $e1;
                    }
                }

                // 如果没找到有效像素，使用整个sprite区域
                if (!foundPixel) {
                    xMin = Math.floor(spriteRect.xMin);
                    xMax = Math.ceil(spriteRect.xMax);
                    yMin = Math.floor(spriteRect.yMin);
                    yMax = Math.ceil(spriteRect.yMax);
                }

                // 添加容差
                xMin = UnityEngine.Mathf.Max(0, ((xMin - this.CropPadding) | 0));
                yMin = UnityEngine.Mathf.Max(0, ((yMin - this.CropPadding) | 0));
                xMax = UnityEngine.Mathf.Min(texture.width, ((xMax + this.CropPadding) | 0));
                yMax = UnityEngine.Mathf.Min(texture.height, ((yMax + this.CropPadding) | 0));

                // 确保有效尺寸
                if (xMax <= xMin) {
                    xMax = (xMin + 1) | 0;
                }
                if (yMax <= yMin) {
                    yMax = (yMin + 1) | 0;
                }

                // 计算裁剪后的尺寸
                var croppedWidth = (xMax - xMin) | 0;
                var croppedHeight = (yMax - yMin) | 0;
                frameData.CroppedSize = new pc.Vec2( croppedWidth, croppedHeight );

                // 计算裁剪矩形（相对于原始图片）
                frameData.CropRect = new UnityEngine.Rect.$ctor1(xMin, yMin, croppedWidth, croppedHeight);

                // 计算裁剪区域的中心位置（在纹理/像素坐标系中）
                var cropCenter = new pc.Vec2( xMin + croppedWidth * 0.5, yMin + croppedHeight * 0.5 );

                // 假设sprite就是原始尺寸，或者sprite中心对齐原始中心
                // 计算原始中心位置（在sprite坐标系中，相对于sprite左上角）
                var originalCenterInSprite = new pc.Vec2( spriteRect.width * 0.5, spriteRect.height * 0.5 );

                // 计算偏移：裁剪中心相对于原始中心的偏移（像素单位）
                // 这里使用相对于sprite左上角的坐标
                var cropCenterFromTopLeft = new pc.Vec2( xMin - spriteRect.xMin + croppedWidth * 0.5, yMin - spriteRect.yMin + croppedHeight * 0.5 );

                var offsetInPixels = cropCenterFromTopLeft.$clone().sub( originalCenterInSprite );

                // 如果sprite尺寸与原始尺寸不一致，需要缩放
                var scaleX = this.OriginalSize.x / spriteRect.width;
                var scaleY = this.OriginalSize.y / spriteRect.height;

                // 将偏移转换为相对于原始尺寸的偏移
                frameData.OffsetFromCenter = new pc.Vec2( offsetInPixels.x * scaleX, offsetInPixels.y * scaleY );

                UnityEngine.Debug.Log$1(System.String.format("Frame {0}: Sprite\u5c3a\u5bf8=({1}, {2}), \u88c1\u526a\u5c3a\u5bf8={3}, \u88c1\u526a\u4e2d\u5fc3\u504f\u79fb={4}, \u6700\u7ec8\u504f\u79fb={5}", Bridge.box(frameIndex, System.Int32), Bridge.box(spriteRect.width, System.Single, System.Single.format, System.Single.getHashCode), Bridge.box(spriteRect.height, System.Single, System.Single.format, System.Single.getHashCode), frameData.CroppedSize.$clone(), offsetInPixels.$clone(), frameData.OffsetFromCenter.$clone()));
            },
            /*UI.FrameSequenceEffectPlayer.CropAndCalculateOffset end.*/

            /*UI.FrameSequenceEffectPlayer.UpdateAnimation start.*/
            /**
             * 更新动画
             *
             * @instance
             * @private
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            UpdateAnimation: function () {
                if (this._frameDataList.Count === 0) {
                    return;
                }

                this._frameTimer += UnityEngine.Time.deltaTime;
                var frameDuration = 1.0 / this.FrameRate;

                if (this._frameTimer >= frameDuration) {
                    this._frameTimer -= frameDuration;
                    this._currentFrameIndex = (this._currentFrameIndex + 1) | 0;

                    if (this._currentFrameIndex >= this._frameDataList.Count) {
                        if (this.Loop) {
                            this._currentFrameIndex = 0;
                        } else {
                            this._currentFrameIndex = (this._frameDataList.Count - 1) | 0;
                            this._isPlaying = false;
                            if (!Bridge.staticEquals(this.OnPlayComplete, null)) {
                                try {
                                    this.OnPlayComplete();
                                } catch (ex) {
                                    ex = System.Exception.create(ex);
                                    UnityEngine.Debug.LogWarning$1(System.String.format("FrameSequenceEffectPlayer: \u64ad\u653e\u5b8c\u6210\u56de\u8c03\u6267\u884c\u51fa\u9519: {0}", [ex.Message]));
                                }
                            }
                            return;
                        }
                    }

                    this.UpdateFrame();
                }
            },
            /*UI.FrameSequenceEffectPlayer.UpdateAnimation end.*/

            /*UI.FrameSequenceEffectPlayer.UpdateFrame start.*/
            /**
             * 更新当前帧显示
             *
             * @instance
             * @private
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            UpdateFrame: function () {
                if (this._currentFrameIndex < 0 || this._currentFrameIndex >= this._frameDataList.Count) {
                    UnityEngine.Debug.LogWarning$1(System.String.format("FrameSequenceEffectPlayer: \u5e27\u7d22\u5f15\u8d85\u51fa\u8303\u56f4: {0}/{1}", Bridge.box(this._currentFrameIndex, System.Int32), Bridge.box(this._frameDataList.Count, System.Int32)));
                    return;
                }

                if (UnityEngine.MonoBehaviour.op_Equality(this.TargetImage, null)) {
                    UnityEngine.Debug.LogError$2("FrameSequenceEffectPlayer: TargetImage\u4e3a\u7a7a\uff0c\u65e0\u6cd5\u66f4\u65b0\u5e27");
                    return;
                }

                var frameData = this._frameDataList.getItem(this._currentFrameIndex);

                if (frameData.Sprite == null) {
                    UnityEngine.Debug.LogWarning$1(System.String.format("FrameSequenceEffectPlayer: \u5e27 {0} \u7684Sprite\u4e3a\u7a7a", [Bridge.box(this._currentFrameIndex, System.Int32)]));
                    return;
                }

                // 更新Sprite
                this.TargetImage.sprite = frameData.Sprite;

                // 更新尺寸和位置
                // 如果有裁剪数据（预处理或运行时裁剪），使用裁剪后的尺寸
                var hasCropData = this.PreprocessedCropData != null || (this.AutoCropTransparent && !pc.Vec2.equals( frameData.CroppedSize, pc.Vec2.ZERO.clone() ));

                if (hasCropData) {
                    // 设置裁剪后的尺寸
                    this._rectTransform.sizeDelta = frameData.CroppedSize.$clone();

                    // 根据对齐方式调整位置
                    if (this.KeepOriginalCenter) {
                        // 保持原始中心位置，根据偏移调整
                        this._rectTransform.anchoredPosition = this._originalPosition.$clone().add( frameData.OffsetFromCenter );
                    } else {
                        // 根据对齐方式设置位置
                        this.SetPositionByAlignment(frameData);
                    }
                } else {
                    // 不裁剪，使用原始尺寸
                    this._rectTransform.sizeDelta = this._originalSize.$clone();
                    this._rectTransform.anchoredPosition = this._originalPosition.$clone();
                }

                // 确保Image可见
                if (UnityEngine.MonoBehaviour.op_Inequality(this.TargetImage, null)) {
                    this.TargetImage.enabled = true;
                }
            },
            /*UI.FrameSequenceEffectPlayer.UpdateFrame end.*/

            /*UI.FrameSequenceEffectPlayer.SetPositionByAlignment start.*/
            /**
             * 根据对齐方式设置位置
             *
             * @instance
             * @private
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @param   {UI.FrameSequenceEffectPlayer.FrameData}    frameData
             * @return  {void}
             */
            SetPositionByAlignment: function (frameData) {
                var newPosition = this._originalPosition.$clone();

                switch (this.AnchorAlignment) {
                    case UI.FrameSequenceEffectPlayer.Alignment.Center: 
                        newPosition = this._originalPosition.$clone().add( frameData.OffsetFromCenter );
                        break;
                    case UI.FrameSequenceEffectPlayer.Alignment.Top: 
                        newPosition = new pc.Vec2( this._originalPosition.x + frameData.OffsetFromCenter.x, this._originalPosition.y );
                        break;
                    case UI.FrameSequenceEffectPlayer.Alignment.Bottom: 
                        newPosition = new pc.Vec2( this._originalPosition.x + frameData.OffsetFromCenter.x, this._originalPosition.y - (this.OriginalSize.y - frameData.CroppedSize.y) );
                        break;
                    case UI.FrameSequenceEffectPlayer.Alignment.Left: 
                        newPosition = new pc.Vec2( this._originalPosition.x, this._originalPosition.y + frameData.OffsetFromCenter.y );
                        break;
                    case UI.FrameSequenceEffectPlayer.Alignment.Right: 
                        newPosition = new pc.Vec2( this._originalPosition.x + (this.OriginalSize.x - frameData.CroppedSize.x), this._originalPosition.y + frameData.OffsetFromCenter.y );
                        break;
                }

                this._rectTransform.anchoredPosition = newPosition.$clone();
            },
            /*UI.FrameSequenceEffectPlayer.SetPositionByAlignment end.*/

            /*UI.FrameSequenceEffectPlayer.Play start.*/
            /**
             * 播放动画
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            Play: function () {
                // 如果没有初始化，尝试重新初始化
                if (this._frameDataList.Count === 0) {
                    UnityEngine.Debug.LogWarning$1("FrameSequenceEffectPlayer: \u6ca1\u6709\u53ef\u64ad\u653e\u7684\u5e27\u6570\u636e\uff0c\u5c1d\u8bd5\u91cd\u65b0\u521d\u59cb\u5316...");
                    this.InitializeFrameData();

                    if (this._frameDataList.Count === 0) {
                        UnityEngine.Debug.LogError$2("FrameSequenceEffectPlayer: \u521d\u59cb\u5316\u5931\u8d25\uff01\u8bf7\u68c0\u67e5\uff1a\n1. FrameSprites\u6570\u7ec4\u662f\u5426\u4e3a\u7a7a\n2. \u5e8f\u5217\u5e27\u56fe\u7247\u662f\u5426\u5df2\u6b63\u786e\u52a0\u8f7d\n3. Image\u7ec4\u4ef6\u662f\u5426\u5b58\u5728");
                        return;
                    }
                }

                this._isPlaying = true;
                this._isPaused = false;
                this._currentFrameIndex = 0;
                this._frameTimer = 0.0;

                UnityEngine.Debug.Log$1(System.String.format("FrameSequenceEffectPlayer: \u5f00\u59cb\u64ad\u653e\uff0c\u5171 {0} \u5e27\uff0c\u5e27\u7387 {1}fps", Bridge.box(this._frameDataList.Count, System.Int32), Bridge.box(this.FrameRate, System.Single, System.Single.format, System.Single.getHashCode)));
                this.UpdateFrame();
            },
            /*UI.FrameSequenceEffectPlayer.Play end.*/

            /*UI.FrameSequenceEffectPlayer.Pause start.*/
            /**
             * 暂停播放
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            Pause: function () {
                this._isPaused = true;
            },
            /*UI.FrameSequenceEffectPlayer.Pause end.*/

            /*UI.FrameSequenceEffectPlayer.Resume start.*/
            /**
             * 继续播放
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            Resume: function () {
                this._isPaused = false;
            },
            /*UI.FrameSequenceEffectPlayer.Resume end.*/

            /*UI.FrameSequenceEffectPlayer.Stop start.*/
            /**
             * 停止播放
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            Stop: function () {
                this._isPlaying = false;
                this._isPaused = false;
                this._currentFrameIndex = 0;
                this._frameTimer = 0.0;
            },
            /*UI.FrameSequenceEffectPlayer.Stop end.*/

            /*UI.FrameSequenceEffectPlayer.SetPosition start.*/
            /**
             * 设置播放位置（UI坐标）
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @param   {UnityEngine.Vector2}    position
             * @return  {void}
             */
            SetPosition: function (position) {
                if (UnityEngine.Component.op_Inequality(this._rectTransform, null)) {
                    this._originalPosition = position.$clone();

                    // 如果正在播放，更新当前帧位置
                    if (this._isPlaying && this._currentFrameIndex < this._frameDataList.Count) {
                        this.UpdateFrame();
                    }
                }
            },
            /*UI.FrameSequenceEffectPlayer.SetPosition end.*/

            /*UI.FrameSequenceEffectPlayer.SetPosition$1 start.*/
            /**
             * 设置播放位置（Vector3版本，自动转换为Vector2）
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @param   {UnityEngine.Vector3}    position
             * @return  {void}
             */
            SetPosition$1: function (position) {
                this.SetPosition(new pc.Vec2( position.x, position.y ));
            },
            /*UI.FrameSequenceEffectPlayer.SetPosition$1 end.*/

            /*UI.FrameSequenceEffectPlayer.SetFrame start.*/
            /**
             * 设置当前帧索引
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @param   {number}    frameIndex
             * @return  {void}
             */
            SetFrame: function (frameIndex) {
                if (frameIndex >= 0 && frameIndex < this._frameDataList.Count) {
                    this._currentFrameIndex = frameIndex;
                    this._frameTimer = 0.0;
                    this.UpdateFrame();
                }
            },
            /*UI.FrameSequenceEffectPlayer.SetFrame end.*/

            /*UI.FrameSequenceEffectPlayer.GetCurrentFrameIndex start.*/
            /**
             * 获取当前帧索引
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {number}
             */
            GetCurrentFrameIndex: function () {
                return this._currentFrameIndex;
            },
            /*UI.FrameSequenceEffectPlayer.GetCurrentFrameIndex end.*/

            /*UI.FrameSequenceEffectPlayer.GetTotalFrames start.*/
            /**
             * 获取总帧数
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {number}
             */
            GetTotalFrames: function () {
                return this._frameDataList.Count;
            },
            /*UI.FrameSequenceEffectPlayer.GetTotalFrames end.*/

            /*UI.FrameSequenceEffectPlayer.IsPlaying start.*/
            /**
             * 检查是否正在播放
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {boolean}
             */
            IsPlaying: function () {
                return this._isPlaying && !this._isPaused;
            },
            /*UI.FrameSequenceEffectPlayer.IsPlaying end.*/

            /*UI.FrameSequenceEffectPlayer.RecalculateCropData start.*/
            /**
             * 重新计算裁剪数据（用于运行时调整设置后重新计算）
             *
             * @instance
             * @public
             * @this UI.FrameSequenceEffectPlayer
             * @memberof UI.FrameSequenceEffectPlayer
             * @return  {void}
             */
            RecalculateCropData: function () {
                this.InitializeFrameData();

                // 如果正在播放，更新当前帧
                if (this._isPlaying) {
                    this.UpdateFrame();
                }
            },
            /*UI.FrameSequenceEffectPlayer.RecalculateCropData end.*/


        },
        overloads: {
            "SetPosition(Vector3)": "SetPosition$1"
        }
    });
    /*UI.FrameSequenceEffectPlayer end.*/

    /*UI.FrameSequenceEffectPlayer+Alignment start.*/
    /**
     * 对齐方式
     *
     * @public
     * @class number
     */
    Bridge.define("UI.FrameSequenceEffectPlayer.Alignment", {
        $kind: 1006,
        statics: {
            fields: {
                Center: 0,
                Top: 1,
                Bottom: 2,
                Left: 3,
                Right: 4,
                TopLeft: 5,
                TopRight: 6,
                BottomLeft: 7,
                BottomRight: 8
            }
        }
    });
    /*UI.FrameSequenceEffectPlayer+Alignment end.*/

    /*UI.FrameSequenceEffectPlayer+FrameData start.*/
    /**
     * 帧数据结构
     *
     * @public
     * @class UI.FrameSequenceEffectPlayer.FrameData
     */
    Bridge.define("UI.FrameSequenceEffectPlayer.FrameData", {
        $kind: 1002,
        fields: {
            Sprite: null,
            CroppedSize: null,
            OffsetFromCenter: null,
            CropRect: null
        },
        ctors: {
            init: function () {
                this.CroppedSize = new UnityEngine.Vector2();
                this.OffsetFromCenter = new UnityEngine.Vector2();
                this.CropRect = new UnityEngine.Rect();
            }
        }
    });
    /*UI.FrameSequenceEffectPlayer+FrameData end.*/

    /*UI.ImageNumberDisplay start.*/
    /**
     * 图片数字显示控件，支持多位数显示
     *
     * @public
     * @class UI.ImageNumberDisplay
     * @augments UnityEngine.MonoBehaviour
     */
    Bridge.define("UI.ImageNumberDisplay", {
        inherits: [UnityEngine.MonoBehaviour],
        fields: {
            _digitSprites: null,
            _number: 0,
            _spacing: 0,
            _alignment: 0,
            _showLeadingZeros: false,
            _minDigits: 0,
            _digitWidth: 0,
            _digitHeight: 0,
            _digitColor: null,
            _digitImages: null,
            _imagePool: null
        },
        props: {
            /**
             * 当前显示的数字值
             *
             * @instance
             * @public
             * @memberof UI.ImageNumberDisplay
             * @function Number
             * @type number
             */
            Number: {
                get: function () {
                    return this._number;
                },
                set: function (value) {
                    if (this._number !== value) {
                        this._number = value;
                        this.UpdateDisplay();
                    }
                }
            },
            /**
             * 数字之间的间距
             *
             * @instance
             * @public
             * @memberof UI.ImageNumberDisplay
             * @function Spacing
             * @type number
             */
            Spacing: {
                get: function () {
                    return this._spacing;
                },
                set: function (value) {
                    if (this._spacing !== value) {
                        this._spacing = value;
                        this.UpdateDisplay();
                    }
                }
            },
            /**
             * 对齐方式
             *
             * @instance
             * @public
             * @memberof UI.ImageNumberDisplay
             * @function AlignmentType
             * @type number
             */
            AlignmentType: {
                get: function () {
                    return this._alignment;
                },
                set: function (value) {
                    if (this._alignment !== value) {
                        this._alignment = value;
                        this.UpdateDisplay();
                    }
                }
            }
        },
        ctors: {
            init: function () {
                this._digitColor = new UnityEngine.Color();
                this._digitSprites = System.Array.init(10, null, UnityEngine.Sprite);
                this._number = 0;
                this._spacing = 10.0;
                this._alignment = UI.ImageNumberDisplay.Alignment.Left;
                this._showLeadingZeros = false;
                this._minDigits = 1;
                this._digitWidth = 0.0;
                this._digitHeight = 0.0;
                this._digitColor = new pc.Color( 1, 1, 1, 1 );
                this._digitImages = new (System.Collections.Generic.List$1(UnityEngine.UI.Image)).ctor();
                this._imagePool = new (System.Collections.Generic.Queue$1(UnityEngine.UI.Image)).ctor();
            }
        },
        methods: {
            /*UI.ImageNumberDisplay.Awake start.*/
            Awake: function () {
                // 初始化时更新显示
                this.UpdateDisplay();
            },
            /*UI.ImageNumberDisplay.Awake end.*/

            /*UI.ImageNumberDisplay.OnValidate start.*/
            OnValidate: function () {
                // 在编辑器中修改属性时更新显示
                if (UnityEngine.Application.isPlaying) {
                    this.UpdateDisplay();
                }
            },
            /*UI.ImageNumberDisplay.OnValidate end.*/

            /*UI.ImageNumberDisplay.SetDigitSprites start.*/
            /**
             * 设置数字图片数组
             *
             * @instance
             * @public
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @param   {Array.<UnityEngine.Sprite>}    sprites    数字0-9的图片数组
             * @return  {void}
             */
            SetDigitSprites: function (sprites) {
                if (sprites == null || sprites.length < 10) {
                    UnityEngine.Debug.LogError$2("\u6570\u5b57\u56fe\u7247\u6570\u7ec4\u5fc5\u987b\u5305\u542b10\u4e2a\u5143\u7d20\uff080-9\uff09");
                    return;
                }

                this._digitSprites = sprites;
                this.UpdateDisplay();
            },
            /*UI.ImageNumberDisplay.SetDigitSprites end.*/

            /*UI.ImageNumberDisplay.UpdateDisplay start.*/
            /**
             * 更新显示
             *
             * @instance
             * @private
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @return  {void}
             */
            UpdateDisplay: function () {
                if (this._digitSprites == null || this._digitSprites.length < 10) {
                    UnityEngine.Debug.LogWarning$1("\u6570\u5b57\u56fe\u7247\u6570\u7ec4\u672a\u6b63\u786e\u8bbe\u7f6e");
                    return;
                }

                // 将数字转换为字符串
                var numberString = Bridge.toString(this._number);

                // 处理前导零
                if (this._showLeadingZeros && numberString.length < this._minDigits) {
                    numberString = System.String.alignString(Bridge.toString(this._number), this._minDigits, 48);
                }

                // 确保有足够的Image对象
                var digitCount = numberString.length;
                while (this._digitImages.Count < digitCount) {
                    var digitImage = this.GetImageFromPool();
                    if (UnityEngine.MonoBehaviour.op_Equality(digitImage, null)) {
                        // 创建新的Image对象
                        var digitObj = new UnityEngine.GameObject.$ctor2(System.String.format("Digit_{0}", [Bridge.box(this._digitImages.Count, System.Int32)]));
                        digitObj.transform.SetParent(this.transform, false);
                        digitImage = digitObj.AddComponent(UnityEngine.UI.Image);
                        digitImage.color = this._digitColor.$clone();
                        // 保持图片原始比例
                        digitImage.preserveAspect = true;
                    }
                    this._digitImages.add(digitImage);
                }

                // 隐藏多余的Image对象
                for (var i = digitCount; i < this._digitImages.Count; i = (i + 1) | 0) {
                    this._digitImages.getItem(i).gameObject.SetActive(false);
                    this.ReturnImageToPool(this._digitImages.getItem(i));
                }

                // 移除多余的Image对象
                if (this._digitImages.Count > digitCount) {
                    this._digitImages.RemoveRange(digitCount, ((this._digitImages.Count - digitCount) | 0));
                }

                // 计算总宽度（考虑保持比例）
                var totalWidth = 0.0;
                var firstSprite = this._digitSprites[0];
                var originalWidth = firstSprite != null ? firstSprite.rect.width : 50.0;
                var originalHeight = firstSprite != null ? firstSprite.rect.height : 50.0;
                var aspectRatio = originalWidth / originalHeight;

                var digitW = 0.0;
                var digitH = 0.0;

                // 根据用户设置的宽度和高度计算实际尺寸（保持比例）
                if (this._digitWidth > 0 && this._digitHeight > 0) {
                    // 如果同时设置了宽度和高度，使用较小的值来保持比例
                    var widthBasedHeight = this._digitWidth / aspectRatio;
                    var heightBasedWidth = this._digitHeight * aspectRatio;

                    if (widthBasedHeight <= this._digitHeight) {
                        // 以宽度为准
                        digitW = this._digitWidth;
                        digitH = widthBasedHeight;
                    } else {
                        // 以高度为准
                        digitW = heightBasedWidth;
                        digitH = this._digitHeight;
                    }
                } else if (this._digitWidth > 0) {
                    // 只设置了宽度，根据比例计算高度
                    digitW = this._digitWidth;
                    digitH = this._digitWidth / aspectRatio;
                } else if (this._digitHeight > 0) {
                    // 只设置了高度，根据比例计算宽度
                    digitH = this._digitHeight;
                    digitW = this._digitHeight * aspectRatio;
                } else {
                    // 使用原始尺寸
                    digitW = originalWidth;
                    digitH = originalHeight;
                }

                if (digitCount > 0) {
                    totalWidth = digitW * digitCount + this._spacing * (((digitCount - 1) | 0));
                }

                // 设置每个数字的位置和图片
                var rectTransform = this.GetComponent(UnityEngine.RectTransform);
                var startX = 0.0;

                // 根据对齐方式计算起始X位置
                switch (this._alignment) {
                    case UI.ImageNumberDisplay.Alignment.Left: 
                        startX = -rectTransform.rect.width / 2 + digitW / 2;
                        break;
                    case UI.ImageNumberDisplay.Alignment.Right: 
                        startX = rectTransform.rect.width / 2 - totalWidth + digitW / 2;
                        break;
                    case UI.ImageNumberDisplay.Alignment.Center: 
                        startX = -totalWidth / 2 + digitW / 2;
                        break;
                }

                for (var i1 = 0; i1 < digitCount; i1 = (i1 + 1) | 0) {
                    var digitImage1 = this._digitImages.getItem(i1);
                    digitImage1.gameObject.SetActive(true);

                    // 确保保持比例
                    digitImage1.preserveAspect = true;

                    // 设置图片
                    var digitValue = System.Int32.parse(String.fromCharCode(numberString.charCodeAt(i1)));
                    if (digitValue >= 0 && digitValue < this._digitSprites.length && this._digitSprites[digitValue] != null) {
                        digitImage1.sprite = this._digitSprites[digitValue];
                    } else {
                        UnityEngine.Debug.LogWarning$1(System.String.format("\u6570\u5b57 {0} \u7684\u56fe\u7247\u672a\u8bbe\u7f6e", [Bridge.box(digitValue, System.Int32)]));
                    }

                    // 设置位置和尺寸（统一使用基准尺寸，保持比例会自动调整）
                    var digitRect = digitImage1.GetComponent(UnityEngine.RectTransform);
                    digitRect.anchorMin = new pc.Vec2( 0.5, 0.5 );
                    digitRect.anchorMax = new pc.Vec2( 0.5, 0.5 );
                    digitRect.pivot = new pc.Vec2( 0.5, 0.5 );
                    digitRect.anchoredPosition = new pc.Vec2( startX + i1 * (digitW + this._spacing), 0.0 );
                    // 设置尺寸，preserveAspect会自动保持比例
                    digitRect.sizeDelta = new pc.Vec2( digitW, digitH );

                    // 设置颜色
                    digitImage1.color = this._digitColor.$clone();
                }
            },
            /*UI.ImageNumberDisplay.UpdateDisplay end.*/

            /*UI.ImageNumberDisplay.GetImageFromPool start.*/
            /**
             * 从对象池获取Image对象
             *
             * @instance
             * @private
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @return  {UnityEngine.UI.Image}
             */
            GetImageFromPool: function () {
                if (this._imagePool.Count > 0) {
                    var image = this._imagePool.Dequeue();
                    image.gameObject.SetActive(true);
                    return image;
                }
                return null;
            },
            /*UI.ImageNumberDisplay.GetImageFromPool end.*/

            /*UI.ImageNumberDisplay.ReturnImageToPool start.*/
            /**
             * 将Image对象返回到对象池
             *
             * @instance
             * @private
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @param   {UnityEngine.UI.Image}    image
             * @return  {void}
             */
            ReturnImageToPool: function (image) {
                if (UnityEngine.MonoBehaviour.op_Inequality(image, null)) {
                    image.gameObject.SetActive(false);
                    this._imagePool.Enqueue(image);
                }
            },
            /*UI.ImageNumberDisplay.ReturnImageToPool end.*/

            /*UI.ImageNumberDisplay.SetNumber start.*/
            /**
             * 设置数字值（便捷方法）
             *
             * @instance
             * @public
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @param   {number}    number
             * @return  {void}
             */
            SetNumber: function (number) {
                this.Number = number;
            },
            /*UI.ImageNumberDisplay.SetNumber end.*/

            /*UI.ImageNumberDisplay.SetNumber$1 start.*/
            /**
             * 设置数字值（字符串形式，支持负数）
             *
             * @instance
             * @public
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @param   {string}    numberString
             * @return  {void}
             */
            SetNumber$1: function (numberString) {
                var number = { };
                if (System.Int32.tryParse(numberString, number)) {
                    this.Number = number.v;
                } else {
                    UnityEngine.Debug.LogError$2(System.String.format("\u65e0\u6cd5\u89e3\u6790\u6570\u5b57\u5b57\u7b26\u4e32: {0}", [numberString]));
                }
            },
            /*UI.ImageNumberDisplay.SetNumber$1 end.*/

            /*UI.ImageNumberDisplay.OnDestroy start.*/
            /**
             * 清理资源
             *
             * @instance
             * @private
             * @this UI.ImageNumberDisplay
             * @memberof UI.ImageNumberDisplay
             * @return  {void}
             */
            OnDestroy: function () {
                var $t;
                // 清理所有Image对象
                $t = Bridge.getEnumerator(this._digitImages);
                try {
                    while ($t.moveNext()) {
                        var image = $t.Current;
                        if (UnityEngine.MonoBehaviour.op_Inequality(image, null)) {
                            UnityEngine.MonoBehaviour.Destroy(image.gameObject);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
                this._digitImages.clear();

                // 清理对象池
                while (this._imagePool.Count > 0) {
                    var image1 = this._imagePool.Dequeue();
                    if (UnityEngine.MonoBehaviour.op_Inequality(image1, null)) {
                        UnityEngine.MonoBehaviour.Destroy(image1.gameObject);
                    }
                }
                this._imagePool.Clear();
            },
            /*UI.ImageNumberDisplay.OnDestroy end.*/


        },
        overloads: {
            "SetNumber(string)": "SetNumber$1"
        }
    });
    /*UI.ImageNumberDisplay end.*/

    /*UI.ImageNumberDisplay+Alignment start.*/
    /**
     * 对齐方式枚举
     *
     * @public
     * @class number
     */
    Bridge.define("UI.ImageNumberDisplay.Alignment", {
        $kind: 1006,
        statics: {
            fields: {
                Left: 0,
                Right: 1,
                Center: 2
            }
        }
    });
    /*UI.ImageNumberDisplay+Alignment end.*/

    if ( MODULE_reflection ) {
    var $m = Bridge.setMetadata,
        $n = ["System","UnityEngine.UI","System.Collections","UnityEngine","UI","System.Collections.Generic","UnityEngine.EventSystems"];

    /*Microsoft.CodeAnalysis.EmbeddedAttribute start.*/
    $m("Microsoft.CodeAnalysis.EmbeddedAttribute", function () { return {"att":1048832,"a":4,"at":[new Microsoft.CodeAnalysis.EmbeddedAttribute()],"m":[{"a":2,"n":".ctor","t":1,"sn":"ctor"}]}; }, $n);
    /*Microsoft.CodeAnalysis.EmbeddedAttribute end.*/

    /*CanvasScalerAdapter start.*/
    $m("CanvasScalerAdapter", function () { return {"att":1048577,"a":2,"at":[new UnityEngine.RequireComponent.ctor(UnityEngine.UI.CanvasScaler)],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"Refresh","t":8,"sn":"Refresh","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"a":2,"n":"UpdateMatchValue","t":8,"sn":"UpdateMatchValue","rt":$n[0].Void},{"at":[new UnityEngine.HeaderAttribute("\u9002\u914d\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("iPad\u6bd4\u4f8b\u9608\u503c\uff08height/width\uff09\uff0c\u5c0f\u4e8e\u7b49\u4e8e\u6b64\u503c\u65f6\u4f7f\u7528MatchForIPad")],"a":2,"n":"IPadAspectRatio","t":4,"rt":$n[0].Single,"sn":"IPadAspectRatio","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5f53height/width <= iPad\u6bd4\u4f8b\u65f6\u7684match\u503c"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"MatchForIPad","t":4,"rt":$n[0].Single,"sn":"MatchForIPad","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5f53height/width > iPad\u6bd4\u4f8b\u4e14 < 2\u65f6\u7684match\u503c"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"MatchForNormalAspect","t":4,"rt":$n[0].Single,"sn":"MatchForNormalAspect","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5f53height/width >= 2\u65f6\u7684match\u503c"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"MatchForTallAspect","t":4,"rt":$n[0].Single,"sn":"MatchForTallAspect","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u5728\u5c4f\u5e55\u5c3a\u5bf8\u6539\u53d8\u65f6\u81ea\u52a8\u66f4\u65b0")],"a":2,"n":"UpdateOnScreenSizeChange","t":4,"rt":$n[0].Boolean,"sn":"UpdateOnScreenSizeChange","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_canvasScaler","t":4,"rt":$n[1].CanvasScaler,"sn":"_canvasScaler"},{"a":1,"n":"_lastScreenHeight","t":4,"rt":$n[0].Int32,"sn":"_lastScreenHeight","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_lastScreenWidth","t":4,"rt":$n[0].Int32,"sn":"_lastScreenWidth","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*CanvasScalerAdapter end.*/

    /*GameLosePanel start.*/
    $m("GameLosePanel", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"Hide","t":8,"sn":"Hide","rt":$n[0].Void},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":1,"n":"OnRestartButtonClick","t":8,"sn":"OnRestartButtonClick","rt":$n[0].Void},{"a":1,"n":"PlayButtonScaleAnimation","t":8,"sn":"PlayButtonScaleAnimation","rt":$n[2].IEnumerator},{"a":2,"n":"Show","t":8,"sn":"Show","rt":$n[0].Void},{"at":[new UnityEngine.TooltipAttribute("\u52a8\u753b\u66f2\u7ebf\uff08\u53ef\u9009\uff0c\u5982\u679c\u4e3a\u7a7a\u5219\u4f7f\u7528\u7ebf\u6027\u63d2\u503c\uff09")],"a":2,"n":"AnimationCurve","t":4,"rt":pc.AnimationCurve,"sn":"AnimationCurve"},{"at":[new UnityEngine.HeaderAttribute("\u52a8\u753b\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u6309\u94ae\u52a8\u753b\u6301\u7eed\u65f6\u95f4\uff08\u79d2\uff09"),new UnityEngine.RangeAttribute(0.1, 2.0)],"a":2,"n":"ButtonAnimationDuration","t":4,"rt":$n[0].Single,"sn":"ButtonAnimationDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u52a8\u753b\u7ed3\u675f\u7f29\u653e\u6bd4\u4f8b"),new UnityEngine.RangeAttribute(0.5, 1.5)],"a":2,"n":"ButtonEndScale","t":4,"rt":$n[0].Single,"sn":"ButtonEndScale","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u52a8\u753b\u8d77\u59cb\u7f29\u653e\u6bd4\u4f8b"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"ButtonStartScale","t":4,"rt":$n[0].Single,"sn":"ButtonStartScale","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u6587\u672c\uff08\u53ef\u9009\uff09")],"a":2,"n":"ButtonText","t":4,"rt":$n[1].Text,"sn":"ButtonText"},{"at":[new UnityEngine.HeaderAttribute("UI\u5f15\u7528"),new UnityEngine.TooltipAttribute("\u5931\u8d25\u754c\u9762\u9762\u677f")],"a":2,"n":"Panel","t":4,"rt":$n[3].GameObject,"sn":"Panel"},{"at":[new UnityEngine.TooltipAttribute("\u91cd\u73a9\u6309\u94ae")],"a":2,"n":"RestartButton","t":4,"rt":$n[1].Button,"sn":"RestartButton"},{"a":1,"n":"_buttonOriginalScale","t":4,"rt":$n[3].Vector3,"sn":"_buttonOriginalScale"},{"a":1,"n":"_isAnimating","t":4,"rt":$n[0].Boolean,"sn":"_isAnimating","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}}]}; }, $n);
    /*GameLosePanel end.*/

    /*GameWinPanel start.*/
    $m("GameWinPanel", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":2,"n":"Hide","t":8,"sn":"Hide","rt":$n[0].Void},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":1,"n":"OnStoreButtonClick","t":8,"sn":"OnStoreButtonClick","rt":$n[0].Void},{"a":1,"n":"PlayButtonScaleAnimation","t":8,"sn":"PlayButtonScaleAnimation","rt":$n[2].IEnumerator},{"a":2,"n":"Show","t":8,"sn":"Show","rt":$n[0].Void},{"at":[new UnityEngine.TooltipAttribute("\u52a8\u753b\u66f2\u7ebf\uff08\u53ef\u9009\uff0c\u5982\u679c\u4e3a\u7a7a\u5219\u4f7f\u7528\u7ebf\u6027\u63d2\u503c\uff09")],"a":2,"n":"AnimationCurve","t":4,"rt":pc.AnimationCurve,"sn":"AnimationCurve"},{"at":[new UnityEngine.HeaderAttribute("\u52a8\u753b\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u6309\u94ae\u52a8\u753b\u6301\u7eed\u65f6\u95f4\uff08\u79d2\uff09"),new UnityEngine.RangeAttribute(0.1, 2.0)],"a":2,"n":"ButtonAnimationDuration","t":4,"rt":$n[0].Single,"sn":"ButtonAnimationDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u52a8\u753b\u7ed3\u675f\u7f29\u653e\u6bd4\u4f8b"),new UnityEngine.RangeAttribute(0.5, 1.5)],"a":2,"n":"ButtonEndScale","t":4,"rt":$n[0].Single,"sn":"ButtonEndScale","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u52a8\u753b\u8d77\u59cb\u7f29\u653e\u6bd4\u4f8b"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"ButtonStartScale","t":4,"rt":$n[0].Single,"sn":"ButtonStartScale","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u6587\u672c\uff08\u53ef\u9009\uff09")],"a":2,"n":"ButtonText","t":4,"rt":$n[1].Text,"sn":"ButtonText"},{"at":[new UnityEngine.HeaderAttribute("UI\u5f15\u7528"),new UnityEngine.TooltipAttribute("\u80dc\u5229\u754c\u9762\u9762\u677f")],"a":2,"n":"Panel","t":4,"rt":$n[3].GameObject,"sn":"Panel"},{"at":[new UnityEngine.TooltipAttribute("\u8df3\u8f6c\u5546\u5e97\u6309\u94ae")],"a":2,"n":"StoreButton","t":4,"rt":$n[1].Button,"sn":"StoreButton"},{"at":[new UnityEngine.HeaderAttribute("\u5546\u5e97\u5bfc\u822a\u5668"),new UnityEngine.TooltipAttribute("\u5546\u5e97\u5bfc\u822a\u5668\uff08\u7528\u4e8e\u8df3\u8f6c\u5546\u5e97\uff09")],"a":2,"n":"StoreNavigator","t":4,"rt":StoreNavigator,"sn":"StoreNavigator"},{"a":1,"n":"_buttonOriginalScale","t":4,"rt":$n[3].Vector3,"sn":"_buttonOriginalScale"},{"a":1,"n":"_isAnimating","t":4,"rt":$n[0].Boolean,"sn":"_isAnimating","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}}]}; }, $n);
    /*GameWinPanel end.*/

    /*JewelBlockController start.*/
    $m("JewelBlockController", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"ClearAnimationCoroutine","t":8,"sn":"ClearAnimationCoroutine","rt":$n[2].IEnumerator},{"a":1,"n":"DiamondCollectAnimationCoroutine","t":8,"sn":"DiamondCollectAnimationCoroutine","rt":$n[2].IEnumerator},{"a":2,"n":"GetBlockData","t":8,"sn":"GetBlockData","rt":JewelBlockData},{"a":1,"n":"GetItemSprite","t":8,"pi":[{"n":"color","pt":JewelColor,"ps":0}],"sn":"GetItemSprite","rt":$n[3].Sprite,"p":[JewelColor]},{"a":1,"n":"GetSpriteArray","t":8,"pi":[{"n":"color","pt":JewelColor,"ps":0}],"sn":"GetSpriteArray","rt":System.Array.type(UnityEngine.Sprite),"p":[JewelColor]},{"a":1,"n":"HighlightPulseCoroutine","t":8,"sn":"HighlightPulseCoroutine","rt":$n[2].IEnumerator},{"a":2,"n":"Initialize","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0},{"n":"config","pt":JewelBoardConfig,"ps":1},{"n":"cellWidth","pt":$n[0].Single,"ps":2},{"n":"cellHeight","pt":$n[0].Single,"ps":3}],"sn":"Initialize","rt":$n[0].Void,"p":[JewelBlockData,JewelBoardConfig,$n[0].Single,$n[0].Single]},{"a":2,"n":"IsAnimating","t":8,"sn":"IsAnimating","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":2,"n":"PlayClearAnimation","t":8,"sn":"PlayClearAnimation","rt":$n[0].Void},{"a":1,"n":"PlaySequenceFrameEffectCoroutine","t":8,"sn":"PlaySequenceFrameEffectCoroutine","rt":$n[2].IEnumerator},{"a":1,"n":"SetupHighlightMaterial","t":8,"sn":"SetupHighlightMaterial","rt":$n[0].Void},{"a":1,"n":"StartHighlightEffect","t":8,"sn":"StartHighlightEffect","rt":$n[0].Void},{"a":1,"n":"StopHighlightEffect","t":8,"sn":"StopHighlightEffect","rt":$n[0].Void},{"a":2,"n":"UpdatePosition","t":8,"pi":[{"n":"cellWidth","pt":$n[0].Single,"ps":0},{"n":"cellHeight","pt":$n[0].Single,"ps":1},{"n":"boardWidth","pt":$n[0].Single,"ps":2},{"n":"boardHeight","pt":$n[0].Single,"ps":3},{"n":"bottomOffsetY","dv":0.0,"o":true,"pt":$n[0].Single,"ps":4}],"sn":"UpdatePosition","rt":$n[0].Void,"p":[$n[0].Single,$n[0].Single,$n[0].Single,$n[0].Single,$n[0].Single]},{"a":1,"n":"UpdateSprite","t":8,"sn":"UpdateSprite","rt":$n[0].Void},{"a":2,"n":"BigBombSprite","t":4,"rt":$n[3].Sprite,"sn":"BigBombSprite"},{"at":[new UnityEngine.HeaderAttribute("\u7ec4\u4ef6\u5f15\u7528")],"a":2,"n":"BlockImage","t":4,"rt":$n[1].Image,"sn":"BlockImage"},{"at":[new UnityEngine.HeaderAttribute("\u8d34\u56fe\u914d\u7f6e")],"a":2,"n":"BlueSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"BlueSprites"},{"at":[new UnityEngine.HeaderAttribute("\u9053\u5177\u8d34\u56fe")],"a":2,"n":"DiamondSprite","t":4,"rt":$n[3].Sprite,"sn":"DiamondSprite"},{"a":2,"n":"ExplosiveSprite","t":4,"rt":$n[3].Sprite,"sn":"ExplosiveSprite"},{"at":[new UnityEngine.TooltipAttribute("\u7c89\u8272\u5757\u6d88\u5931\u7279\u6548\u64ad\u653e\u5668\uff08fense\uff09")],"a":2,"n":"FenseEffectPlayer","t":4,"rt":$n[4].FrameSequenceEffectPlayer,"sn":"FenseEffectPlayer"},{"at":[new UnityEngine.TooltipAttribute("\u9ad8\u4eae\u989c\u8272")],"a":2,"n":"HighlightColor","t":4,"rt":$n[3].Color,"sn":"HighlightColor"},{"at":[new UnityEngine.TooltipAttribute("\u9ad8\u4eae\u5f3a\u5ea6\u8303\u56f4\uff08\u6700\u5c0f\u5230\u6700\u5927\uff09")],"a":2,"n":"HighlightIntensityRange","t":4,"rt":$n[3].Vector2,"sn":"HighlightIntensityRange"},{"at":[new UnityEngine.HeaderAttribute("\u9ad8\u4eae\u6548\u679c\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u9ad8\u4eaeShader\u6750\u8d28\uff08\u5982\u679c\u4e3a\u7a7a\uff0c\u4f1a\u81ea\u52a8\u521b\u5efa\uff09")],"a":2,"n":"HighlightMaterial","t":4,"rt":$n[3].Material,"sn":"HighlightMaterial"},{"at":[new UnityEngine.TooltipAttribute("\u9ad8\u4eae\u5f3a\u5ea6\uff08\u7528\u4e8e\u63a7\u5236\u8fb9\u7f18\u9ad8\u4eae\u6548\u679c\uff09")],"a":2,"n":"HighlightPower","t":4,"rt":$n[0].Single,"sn":"HighlightPower","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u9ad8\u4eae\u8109\u51b2\u901f\u5ea6\uff08\u6bcf\u79d2\u8109\u51b2\u6b21\u6570\uff09")],"a":2,"n":"HighlightPulseSpeed","t":4,"rt":$n[0].Single,"sn":"HighlightPulseSpeed","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"HorizontalSprite","t":4,"rt":$n[3].Sprite,"sn":"HorizontalSprite"},{"at":[new UnityEngine.HeaderAttribute("\u6d88\u5931\u7279\u6548"),new UnityEngine.TooltipAttribute("\u84dd\u8272\u5757\u6d88\u5931\u7279\u6548\u64ad\u653e\u5668\uff08lanse\uff09")],"a":2,"n":"LanseEffectPlayer","t":4,"rt":$n[4].FrameSequenceEffectPlayer,"sn":"LanseEffectPlayer"},{"a":2,"n":"PinkSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"PinkSprites"},{"a":2,"n":"RectTransform","t":4,"rt":$n[3].RectTransform,"sn":"RectTransform"},{"a":2,"n":"TransformBlockSprite","t":4,"rt":$n[3].Sprite,"sn":"TransformBlockSprite"},{"a":2,"n":"VerticalSprite","t":4,"rt":$n[3].Sprite,"sn":"VerticalSprite"},{"a":1,"n":"_blockData","t":4,"rt":JewelBlockData,"sn":"_blockData"},{"a":1,"n":"_config","t":4,"rt":JewelBoardConfig,"sn":"_config"},{"a":1,"n":"_highlightCoroutine","t":4,"rt":$n[3].Coroutine,"sn":"_highlightCoroutine"},{"a":1,"n":"_highlightMaterialInstance","t":4,"rt":$n[3].Material,"sn":"_highlightMaterialInstance"},{"a":1,"n":"_isAnimating","t":4,"rt":$n[0].Boolean,"sn":"_isAnimating","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_originalMaterial","t":4,"rt":$n[3].Material,"sn":"_originalMaterial"}]}; }, $n);
    /*JewelBlockController end.*/

    /*JewelBlockData start.*/
    $m("JewelBlockData", function () { return {"att":1048577,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[0].Int32,$n[0].Int32,$n[0].Int32,$n[0].Int32,JewelColor],"pi":[{"n":"id","pt":$n[0].Int32,"ps":0},{"n":"x","pt":$n[0].Int32,"ps":1},{"n":"y","pt":$n[0].Int32,"ps":2},{"n":"width","pt":$n[0].Int32,"ps":3},{"n":"color","pt":JewelColor,"ps":4}],"sn":"ctor"},{"a":2,"n":"HasSupport","t":8,"pi":[{"n":"allBlocks","pt":$n[5].List$1(JewelBlockData),"ps":0}],"sn":"HasSupport","rt":$n[0].Boolean,"p":[$n[5].List$1(JewelBlockData)],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsBigBomb","t":8,"sn":"IsBigBomb","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsDiamond","t":8,"sn":"IsDiamond","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsExplosive","t":8,"sn":"IsExplosive","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsHorizontal","t":8,"sn":"IsHorizontal","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsItem","t":8,"sn":"IsItem","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsNonDiamondItem","t":8,"sn":"IsNonDiamondItem","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsTransformBlock","t":8,"sn":"IsTransformBlock","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsVertical","t":8,"sn":"IsVertical","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"OverlapsWith","t":8,"pi":[{"n":"other","pt":JewelBlockData,"ps":0}],"sn":"OverlapsWith","rt":$n[0].Boolean,"p":[JewelBlockData],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"BlockObject","t":16,"rt":$n[3].GameObject,"g":{"a":2,"n":"get_BlockObject","t":8,"rt":$n[3].GameObject,"fg":"BlockObject"},"s":{"a":2,"n":"set_BlockObject","t":8,"p":[$n[3].GameObject],"rt":$n[0].Void,"fs":"BlockObject"},"fn":"BlockObject"},{"a":2,"n":"Color","t":16,"rt":JewelColor,"g":{"a":2,"n":"get_Color","t":8,"rt":JewelColor,"fg":"Color","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},"s":{"a":2,"n":"set_Color","t":8,"p":[JewelColor],"rt":$n[0].Void,"fs":"Color"},"fn":"Color"},{"a":2,"n":"Id","t":16,"rt":$n[0].Int32,"g":{"a":2,"n":"get_Id","t":8,"rt":$n[0].Int32,"fg":"Id","box":function ($v) { return Bridge.box($v, System.Int32);}},"s":{"a":2,"n":"set_Id","t":8,"p":[$n[0].Int32],"rt":$n[0].Void,"fs":"Id"},"fn":"Id"},{"a":2,"n":"Width","t":16,"rt":$n[0].Int32,"g":{"a":2,"n":"get_Width","t":8,"rt":$n[0].Int32,"fg":"Width","box":function ($v) { return Bridge.box($v, System.Int32);}},"s":{"a":2,"n":"set_Width","t":8,"p":[$n[0].Int32],"rt":$n[0].Void,"fs":"Width"},"fn":"Width"},{"a":2,"n":"X","t":16,"rt":$n[0].Int32,"g":{"a":2,"n":"get_X","t":8,"rt":$n[0].Int32,"fg":"X","box":function ($v) { return Bridge.box($v, System.Int32);}},"s":{"a":2,"n":"set_X","t":8,"p":[$n[0].Int32],"rt":$n[0].Void,"fs":"X"},"fn":"X"},{"a":2,"n":"Y","t":16,"rt":$n[0].Int32,"g":{"a":2,"n":"get_Y","t":8,"rt":$n[0].Int32,"fg":"Y","box":function ($v) { return Bridge.box($v, System.Int32);}},"s":{"a":2,"n":"set_Y","t":8,"p":[$n[0].Int32],"rt":$n[0].Void,"fs":"Y"},"fn":"Y"},{"a":1,"backing":true,"n":"<BlockObject>k__BackingField","t":4,"rt":$n[3].GameObject,"sn":"BlockObject"},{"a":1,"backing":true,"n":"<Color>k__BackingField","t":4,"rt":JewelColor,"sn":"Color","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":1,"backing":true,"n":"<Id>k__BackingField","t":4,"rt":$n[0].Int32,"sn":"Id","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"backing":true,"n":"<Width>k__BackingField","t":4,"rt":$n[0].Int32,"sn":"Width","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"backing":true,"n":"<X>k__BackingField","t":4,"rt":$n[0].Int32,"sn":"X","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"backing":true,"n":"<Y>k__BackingField","t":4,"rt":$n[0].Int32,"sn":"Y","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*JewelBlockData end.*/

    /*JewelBoardConfig start.*/
    $m("JewelBoardConfig", function () { return {"att":1048577,"a":2,"at":[Bridge.apply(new UnityEngine.CreateAssetMenuAttribute(), {
        fileName: "JewelBoardConfig", menuName: "JewelGame/BoardConfig"
    } )],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"GetGameOverRow","t":8,"sn":"GetGameOverRow","rt":$n[0].Int32,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Validate","t":8,"sn":"Validate","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.RangeAttribute(0.0, 100.0)],"a":2,"n":"BigBombWeight","t":4,"rt":$n[0].Int32,"sn":"BigBombWeight","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u6d88\u9664\u52a8\u753b\u65f6\u95f4\uff08\u79d2\uff09")],"a":2,"n":"ClearAnimationTime","t":4,"rt":$n[0].Single,"sn":"ClearAnimationTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("\u6e38\u620f\u677f\u5c3a\u5bf8"),new UnityEngine.TooltipAttribute("\u5217\u6570\uff08\u5bbd\u5ea6\uff09")],"a":2,"n":"Columns","t":4,"rt":$n[0].Int32,"sn":"Columns","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u9053\u5177\u751f\u6210\u6743\u91cd\uff08\u603b\u548c\u5e94\u8be5\u4e3a100\uff0c\u7528\u4e8e\u63a7\u5236\u5404\u9053\u5177\u51fa\u73b0\u6982\u7387\uff09"),new UnityEngine.RangeAttribute(0.0, 100.0)],"a":2,"n":"DiamondWeight","t":4,"rt":$n[0].Int32,"sn":"DiamondWeight","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u542f\u7528\u9053\u5177\u7cfb\u7edf")],"a":2,"n":"EnableItems","t":4,"rt":$n[0].Boolean,"sn":"EnableItems","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.RangeAttribute(0.0, 100.0)],"a":2,"n":"ExplosiveWeight","t":4,"rt":$n[0].Int32,"sn":"ExplosiveWeight","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u6e38\u620f\u7ed3\u675f\u6761\u4ef6\uff1a\u5806\u5230\u7b2c\u51e0\u884c\uff08\u4f7f\u7528\u884c\u6570\u4f5c\u4e3a\u6700\u591a\u884c\u6570\uff09")],"a":2,"n":"GameOverRow","t":4,"rt":$n[0].Int32,"sn":"GameOverRow","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u89c6\u89c9\u6548\u679c"),new UnityEngine.TooltipAttribute("\u91cd\u529b\u4e0b\u843d\u65f6\u95f4\uff08\u79d2\uff09")],"a":2,"n":"GravityFallTime","t":4,"rt":$n[0].Single,"sn":"GravityFallTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.RangeAttribute(0.0, 100.0)],"a":2,"n":"HorizontalWeight","t":4,"rt":$n[0].Int32,"sn":"HorizontalWeight","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u521d\u59cb\u751f\u6210\u7684\u884c\u6570")],"a":2,"n":"InitialRows","t":4,"rt":$n[0].Int32,"sn":"InitialRows","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u9053\u5177\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u6d88\u9664\u4e00\u884c\u65f6\u751f\u6210\u9053\u5177\u7684\u6982\u7387\uff080-1\uff09"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"ItemSpawnChance","t":4,"rt":$n[0].Single,"sn":"ItemSpawnChance","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5b9d\u77f3\u5757\u6700\u5927\u5bbd\u5ea6")],"a":2,"n":"MaxBlockWidth","t":4,"rt":$n[0].Int32,"sn":"MaxBlockWidth","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u6700\u5927\u79fb\u52a8\u6b21\u6570\uff080\u8868\u793a\u65e0\u9650\u5236\uff09")],"a":2,"n":"MaxMoves","t":4,"rt":$n[0].Int32,"sn":"MaxMoves","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u5b9d\u77f3\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u5b9d\u77f3\u5757\u6700\u5c0f\u5bbd\u5ea6")],"a":2,"n":"MinBlockWidth","t":4,"rt":$n[0].Int32,"sn":"MinBlockWidth","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u6e38\u620f\u89c4\u5219"),new UnityEngine.TooltipAttribute("\u6bcf\u884c\u6d88\u9664\u6240\u9700\u586b\u5145\u7684\u5217\u6570\uff08\u901a\u5e38\u7b49\u4e8e\u5217\u6570\uff09")],"a":2,"n":"RequiredColumnsForClear","t":4,"rt":$n[0].Int32,"sn":"RequiredColumnsForClear","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u65b0\u884c\u4e0a\u5347\u65f6\u95f4\uff08\u79d2\uff09")],"a":2,"n":"RowRiseTime","t":4,"rt":$n[0].Single,"sn":"RowRiseTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u884c\u6570\uff08\u9ad8\u5ea6\uff09")],"a":2,"n":"Rows","t":4,"rt":$n[0].Int32,"sn":"Rows","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u76ee\u6807\u5206\u6570\uff080\u8868\u793a\u65e0\u9650\u5236\uff09")],"a":2,"n":"TargetScore","t":4,"rt":$n[0].Int32,"sn":"TargetScore","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.RangeAttribute(0.0, 100.0)],"a":2,"n":"VerticalWeight","t":4,"rt":$n[0].Int32,"sn":"VerticalWeight","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*JewelBoardConfig end.*/

    /*JewelBoardManager start.*/
    $m("JewelBoardManager", function () { return {"nested":[JewelBoardManager.TwoPositions],"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"AnimateBlocksSmooth","t":8,"pi":[{"n":"duration","pt":$n[0].Single,"ps":0}],"sn":"AnimateBlocksSmooth","rt":$n[2].IEnumerator,"p":[$n[0].Single]},{"a":1,"n":"AnimatePushUpBlocks","t":8,"pi":[{"n":"newBlocks","pt":$n[5].List$1(JewelBlockData),"ps":0}],"sn":"AnimatePushUpBlocks","rt":$n[2].IEnumerator,"p":[$n[5].List$1(JewelBlockData)]},{"a":1,"n":"ApplyGravity","t":8,"sn":"ApplyGravity","rt":$n[2].IEnumerator},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"CalculateBoardMetrics","t":8,"sn":"CalculateBoardMetrics","rt":$n[0].Void},{"a":2,"n":"CalculateDragLimitsForBlock","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0},{"n":"minGridDelta","out":true,"pt":$n[0].Int32,"ps":1},{"n":"maxGridDelta","out":true,"pt":$n[0].Int32,"ps":2}],"sn":"CalculateDragLimitsForBlock","rt":$n[0].Void,"p":[JewelBlockData,$n[0].Int32,$n[0].Int32]},{"a":1,"n":"CalculateHorizontalLimitsForInputHandler","t":8,"pi":[{"n":"controller","pt":JewelBlockController,"ps":0},{"n":"unused1","pt":$n[0].Int32,"ps":1},{"n":"unused2","pt":$n[0].Int32,"ps":2}],"sn":"CalculateHorizontalLimitsForInputHandler","rt":$n[0].Void,"p":[JewelBlockController,$n[0].Int32,$n[0].Int32]},{"a":2,"n":"CalculateVerticalDragLimitsForBlock","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0},{"n":"minGridDeltaY","out":true,"pt":$n[0].Int32,"ps":1},{"n":"maxGridDeltaY","out":true,"pt":$n[0].Int32,"ps":2}],"sn":"CalculateVerticalDragLimitsForBlock","rt":$n[0].Void,"p":[JewelBlockData,$n[0].Int32,$n[0].Int32]},{"a":1,"n":"CalculateVerticalLimitsForInputHandler","t":8,"pi":[{"n":"controller","pt":JewelBlockController,"ps":0}],"sn":"CalculateVerticalLimitsForInputHandler","rt":$n[0].Tuple$2(System.Int32,System.Int32),"p":[JewelBlockController]},{"a":1,"n":"CanBlockMoveToPosition","t":8,"pi":[{"n":"controller","pt":JewelBlockController,"ps":0},{"n":"newX","pt":$n[0].Int32,"ps":1},{"n":"newY","pt":$n[0].Int32,"ps":2}],"sn":"CanBlockMoveToPosition","rt":$n[0].Boolean,"p":[JewelBlockController,$n[0].Int32,$n[0].Int32],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"CanBlocksOverlap","t":8,"pi":[{"n":"movingBlock","pt":JewelBlockData,"ps":0},{"n":"targetBlock","pt":JewelBlockData,"ps":1}],"sn":"CanBlocksOverlap","rt":$n[0].Boolean,"p":[JewelBlockData,JewelBlockData],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"CheckClearRecursive","t":8,"sn":"CheckClearRecursive","rt":$n[2].IEnumerator},{"a":1,"n":"CheckGameOver","t":8,"sn":"CheckGameOver","rt":$n[0].Void},{"a":1,"n":"CheckItemInteraction","t":8,"pi":[{"n":"movedBlock","pt":JewelBlockData,"ps":0},{"n":"wasTransformBlock","dv":false,"o":true,"pt":$n[0].Boolean,"ps":1}],"sn":"CheckItemInteraction","rt":$n[0].Boolean,"p":[JewelBlockData,$n[0].Boolean],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"ClearAllBlocks","t":8,"sn":"ClearAllBlocks","rt":$n[2].IEnumerator},{"a":1,"n":"ClearColumns","t":8,"pi":[{"n":"columns","ip":true,"pt":$n[0].Array.type(System.Int32),"ps":0}],"sn":"ClearColumns","rt":$n[2].IEnumerator,"p":[$n[0].Array.type(System.Int32)]},{"a":1,"n":"ClearRows","t":8,"pi":[{"n":"rows","ip":true,"pt":$n[0].Array.type(System.Int32),"ps":0}],"sn":"ClearRows","rt":$n[2].IEnumerator,"p":[$n[0].Array.type(System.Int32)]},{"a":1,"n":"ConvertAllTransformBlocks","t":8,"sn":"ConvertAllTransformBlocks","rt":$n[0].Void},{"a":1,"n":"CreateBlock","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0}],"sn":"CreateBlock","rt":$n[0].Void,"p":[JewelBlockData]},{"a":1,"n":"FindPositionWithTwoEmptySpaces","t":8,"sn":"FindPositionWithTwoEmptySpaces","rt":$n[0].Nullable$1(System.Tuple$2(System.Int32,System.Int32))},{"a":1,"n":"FindTwoPositionsForBigBombs","t":8,"sn":"FindTwoPositionsForBigBombs","rt":JewelBoardManager.TwoPositions},{"a":1,"n":"GameLoop","t":8,"sn":"GameLoop","rt":$n[2].IEnumerator},{"a":1,"n":"GenerateNextRowData","t":8,"sn":"GenerateNextRowData","rt":$n[0].Void},{"a":1,"n":"GenerateRandomLevel","t":8,"sn":"GenerateRandomLevel","rt":$n[0].Void},{"a":1,"n":"GenerateRowData","t":8,"pi":[{"n":"yLevel","dv":0,"o":true,"pt":$n[0].Int32,"ps":0}],"sn":"GenerateRowData","rt":$n[5].List$1(JewelBlockData),"p":[$n[0].Int32]},{"a":1,"n":"GenerateRowDataFilled","t":8,"pi":[{"n":"yLevel","dv":0,"o":true,"pt":$n[0].Int32,"ps":0}],"sn":"GenerateRowDataFilled","rt":$n[5].List$1(JewelBlockData),"p":[$n[0].Int32]},{"a":1,"n":"GetBlockAt","t":8,"pi":[{"n":"x","pt":$n[0].Int32,"ps":0},{"n":"y","pt":$n[0].Int32,"ps":1}],"sn":"GetBlockAt","rt":JewelBlockData,"p":[$n[0].Int32,$n[0].Int32]},{"a":2,"n":"GetBoardWidth","t":8,"sn":"GetBoardWidth","rt":$n[0].Single,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"GetBottomOffsetY","t":8,"sn":"GetBottomOffsetY","rt":$n[0].Single,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"GetCellHeight","t":8,"sn":"GetCellHeight","rt":$n[0].Single,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"GetCellWidth","t":8,"sn":"GetCellWidth","rt":$n[0].Single,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"GetItemSpawnChance","t":8,"sn":"GetItemSpawnChance","rt":$n[0].Single,"box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":2,"n":"GetNextRowData","t":8,"sn":"GetNextRowData","rt":$n[5].List$1(JewelBlockData)},{"a":1,"n":"GetRandomItemByWeight","t":8,"sn":"GetRandomItemByWeight","rt":JewelColor,"box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"InitializeGame","t":8,"sn":"InitializeGame","rt":$n[0].Void},{"a":1,"n":"InitializeInputHandler","t":8,"sn":"InitializeInputHandler","rt":$n[0].Void},{"a":1,"n":"LoadLevelData","t":8,"sn":"LoadLevelData","rt":$n[0].Void},{"a":1,"n":"OnBlockMovedHorizontal","t":8,"pi":[{"n":"controller","pt":JewelBlockController,"ps":0},{"n":"gridDelta","pt":$n[0].Int32,"ps":1}],"sn":"OnBlockMovedHorizontal","rt":$n[0].Void,"p":[JewelBlockController,$n[0].Int32]},{"a":1,"n":"OnBlockMovedVertical","t":8,"pi":[{"n":"controller","pt":JewelBlockController,"ps":0},{"n":"gridDeltaY","pt":$n[0].Int32,"ps":1}],"sn":"OnBlockMovedVertical","rt":$n[0].Void,"p":[JewelBlockController,$n[0].Int32]},{"a":1,"n":"RemoveBlock","t":8,"pi":[{"n":"block","pt":JewelBlockData,"ps":0}],"sn":"RemoveBlock","rt":$n[0].Void,"p":[JewelBlockData]},{"a":1,"n":"RenderAllBlocks","t":8,"sn":"RenderAllBlocks","rt":$n[0].Void},{"a":2,"n":"ResetFirstLevel","t":8,"sn":"ResetFirstLevel","rt":$n[0].Void},{"a":1,"n":"SpawnAndPushUpFromPreview","t":8,"sn":"SpawnAndPushUpFromPreview","rt":$n[2].IEnumerator},{"a":1,"n":"SpawnRandomItem","t":8,"pi":[{"n":"row","pt":$n[0].Int32,"ps":0}],"sn":"SpawnRandomItem","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"SpawnRowData","t":8,"pi":[{"n":"yLevel","pt":$n[0].Int32,"ps":0}],"sn":"SpawnRowData","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"SpawnStep5BigBombs","t":8,"sn":"SpawnStep5BigBombs","rt":$n[2].IEnumerator},{"a":1,"n":"SpecialEffectGameLoop","t":8,"pi":[{"n":"triggerBlock","pt":JewelBlockData,"ps":0}],"sn":"SpecialEffectGameLoop","rt":$n[2].IEnumerator,"p":[JewelBlockData]},{"a":1,"n":"StabilizeBoardInstant","t":8,"sn":"StabilizeBoardInstant","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"TriggerColumnClear","t":8,"pi":[{"n":"centerCol","pt":$n[0].Int32,"ps":0}],"sn":"TriggerColumnClear","rt":$n[2].IEnumerator,"p":[$n[0].Int32]},{"a":1,"n":"TriggerRowClear","t":8,"pi":[{"n":"centerRow","pt":$n[0].Int32,"ps":0}],"sn":"TriggerRowClear","rt":$n[2].IEnumerator,"p":[$n[0].Int32]},{"a":1,"n":"UpdateDiamondCount","t":8,"sn":"UpdateDiamondCount","rt":$n[0].Void},{"a":1,"n":"WouldBlockOverlapAtPosition","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0},{"n":"newX","pt":$n[0].Int32,"ps":1},{"n":"newY","pt":$n[0].Int32,"ps":2},{"n":"overlappingBlock","out":true,"pt":JewelBlockData,"ps":3}],"sn":"WouldBlockOverlapAtPosition","rt":$n[0].Boolean,"p":[JewelBlockData,$n[0].Int32,$n[0].Int32,JewelBlockData],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"IsProcessing","t":16,"rt":$n[0].Boolean,"g":{"a":2,"n":"get_IsProcessing","t":8,"rt":$n[0].Boolean,"fg":"IsProcessing","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},"fn":"IsProcessing"},{"at":[new UnityEngine.HeaderAttribute("\u9884\u5236\u4f53")],"a":2,"n":"BlockPrefab","t":4,"rt":$n[3].GameObject,"sn":"BlockPrefab"},{"at":[new UnityEngine.HeaderAttribute("UI\u5f15\u7528")],"a":2,"n":"BoardContainer","t":4,"rt":$n[3].RectTransform,"sn":"BoardContainer"},{"at":[new UnityEngine.HeaderAttribute("\u4f4d\u7f6e\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u6700\u5e95\u4e00\u884c\uff08Y=0\uff09\u7684y\u5750\u6807\uff0c\u5982\u679c\u4e3a0\u5219\u81ea\u52a8\u8ba1\u7b97")],"a":2,"n":"BottomRowY","t":4,"rt":$n[0].Single,"sn":"BottomRowY","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("\u914d\u7f6e")],"a":2,"n":"Config","t":4,"rt":JewelBoardConfig,"sn":"Config"},{"at":[new UnityEngine.HeaderAttribute("\u9053\u5177\u914d\u7f6e\uff08\u5982\u679c\u4e3a0\u5219\u4f7f\u7528Config\u4e2d\u7684\u503c\uff09"),new UnityEngine.TooltipAttribute("\u6d88\u9664\u4e00\u884c\u65f6\u751f\u6210\u9053\u5177\u7684\u6982\u7387\uff080-1\uff09\uff0c\u5982\u679c\u4e3a0\u5219\u4f7f\u7528Config\u4e2d\u7684\u503c"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"ItemSpawnChance","t":4,"rt":$n[0].Single,"sn":"ItemSpawnChance","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("\u5173\u5361\u6570\u636e\uff08\u53ef\u9009\uff09"),new UnityEngine.TooltipAttribute("\u5982\u679c\u8bbe\u7f6e\u4e86\u5173\u5361\u6570\u636e\uff0c\u5c06\u4f7f\u7528\u5173\u5361\u6570\u636e\u4e2d\u7684\u521d\u59cb\u5e03\u5c40")],"a":2,"n":"LevelData","t":4,"rt":JewelLevelData,"sn":"LevelData"},{"a":2,"n":"OnCombo","t":4,"rt":Function,"sn":"OnCombo"},{"a":2,"n":"OnDiamondCountChanged","t":4,"rt":Function,"sn":"OnDiamondCountChanged"},{"a":2,"n":"OnGameOver","t":4,"rt":Function,"sn":"OnGameOver"},{"a":2,"n":"OnItemSpawned","t":4,"rt":Function,"sn":"OnItemSpawned"},{"a":2,"n":"OnMoveMade","t":4,"rt":Function,"sn":"OnMoveMade"},{"a":2,"n":"OnRowCleared","t":4,"rt":Function,"sn":"OnRowCleared"},{"a":2,"n":"Raycaster","t":4,"rt":$n[1].GraphicRaycaster,"sn":"Raycaster"},{"a":1,"n":"_blockIdCounter","t":4,"rt":$n[0].Int32,"sn":"_blockIdCounter","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_blocks","t":4,"rt":$n[5].List$1(JewelBlockData),"sn":"_blocks"},{"a":1,"n":"_boardHeight","t":4,"rt":$n[0].Single,"sn":"_boardHeight","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_boardWidth","t":4,"rt":$n[0].Single,"sn":"_boardWidth","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_bottomOffsetY","t":4,"rt":$n[0].Single,"sn":"_bottomOffsetY","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_cellHeight","t":4,"rt":$n[0].Single,"sn":"_cellHeight","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_cellWidth","t":4,"rt":$n[0].Single,"sn":"_cellWidth","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_firstLevelMoveCount","t":4,"rt":$n[0].Int32,"sn":"_firstLevelMoveCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_hasSpawnedStep5BigBomb","t":4,"rt":$n[0].Boolean,"sn":"_hasSpawnedStep5BigBomb","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_inputHandler","t":4,"rt":JewelInputHandler,"sn":"_inputHandler"},{"a":1,"n":"_isCurrentlyFirstLevel","t":4,"rt":$n[0].Boolean,"sn":"_isCurrentlyFirstLevel","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_isFirstLevel","is":true,"t":4,"rt":$n[0].Boolean,"sn":"_isFirstLevel","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_isProcessing","t":4,"rt":$n[0].Boolean,"sn":"_isProcessing","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_moveCount","t":4,"rt":$n[0].Int32,"sn":"_moveCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_nextRowData","t":4,"rt":$n[5].List$1(JewelBlockData),"sn":"_nextRowData"},{"a":1,"n":"_pendingStep5BigBombSpawn","t":4,"rt":$n[0].Boolean,"sn":"_pendingStep5BigBombSpawn","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}}]}; }, $n);
    /*JewelBoardManager end.*/

    /*JewelBoardManager+TwoPositions start.*/
    $m("JewelBoardManager.TwoPositions", function () { return {"td":JewelBoardManager,"att":1048579,"a":1,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[0].Int32,$n[0].Int32,$n[0].Int32,$n[0].Int32],"pi":[{"n":"x1","pt":$n[0].Int32,"ps":0},{"n":"y1","pt":$n[0].Int32,"ps":1},{"n":"x2","pt":$n[0].Int32,"ps":2},{"n":"y2","pt":$n[0].Int32,"ps":3}],"sn":"ctor"},{"a":2,"n":"X1","t":4,"rt":$n[0].Int32,"sn":"X1","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"X2","t":4,"rt":$n[0].Int32,"sn":"X2","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Y1","t":4,"rt":$n[0].Int32,"sn":"Y1","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Y2","t":4,"rt":$n[0].Int32,"sn":"Y2","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*JewelBoardManager+TwoPositions end.*/

    /*JewelCharacterAnimator start.*/
    $m("JewelCharacterAnimator", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"PlayIdleAnimation","t":8,"sn":"PlayIdleAnimation","rt":$n[0].Void},{"a":2,"n":"PlayLaughAnimation","t":8,"sn":"PlayLaughAnimation","rt":$n[0].Void},{"a":2,"n":"PlayLookLeftAnimation","t":8,"sn":"PlayLookLeftAnimation","rt":$n[0].Void},{"a":1,"n":"PlaySpriteSequence","t":8,"pi":[{"n":"sprites","pt":System.Array.type(UnityEngine.Sprite),"ps":0},{"n":"totalTime","pt":$n[0].Single,"ps":1},{"n":"loop","pt":$n[0].Boolean,"ps":2},{"n":"playCount","dv":1,"o":true,"pt":$n[0].Int32,"ps":3},{"n":"onComplete","dv":null,"o":true,"pt":Function,"ps":4}],"sn":"PlaySpriteSequence","rt":$n[2].IEnumerator,"p":[System.Array.type(UnityEngine.Sprite),$n[0].Single,$n[0].Boolean,$n[0].Int32,Function]},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"StopCurrentAnimation","t":8,"sn":"StopCurrentAnimation","rt":$n[0].Void},{"at":[new UnityEngine.HeaderAttribute("\u7ec4\u4ef6\u5f15\u7528")],"a":2,"n":"CharacterImage","t":4,"rt":$n[1].Image,"sn":"CharacterImage"},{"at":[new UnityEngine.HeaderAttribute("\u5e8f\u5217\u5e27\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u5f85\u673a\u52a8\u753b\u5e8f\u5217\u5e27")],"a":2,"n":"IdleSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"IdleSprites"},{"at":[new UnityEngine.HeaderAttribute("\u52a8\u753b\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u5f85\u673a\u52a8\u753b\u603b\u65f6\u957f\uff08\u79d2\uff09\uff0c\u6574\u4e2a\u52a8\u753b\u64ad\u653e\u4e00\u6b21\u7684\u65f6\u95f4")],"a":2,"n":"IdleTotalTime","t":4,"rt":$n[0].Single,"sn":"IdleTotalTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5927\u7b11\u52a8\u753b\u64ad\u653e\u6b21\u6570\uff080\u8868\u793a\u64ad\u653e\u4e00\u6b21\uff09")],"a":2,"n":"LaughPlayCount","t":4,"rt":$n[0].Int32,"sn":"LaughPlayCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u5927\u7b11\u52a8\u753b\u5e8f\u5217\u5e27")],"a":2,"n":"LaughSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"LaughSprites"},{"at":[new UnityEngine.TooltipAttribute("\u5927\u7b11\u52a8\u753b\u603b\u65f6\u957f\uff08\u79d2\uff09\uff0c\u6574\u4e2a\u52a8\u753b\u64ad\u653e\u4e00\u6b21\u7684\u65f6\u95f4")],"a":2,"n":"LaughTotalTime","t":4,"rt":$n[0].Single,"sn":"LaughTotalTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5411\u5de6\u770b\u52a8\u753b\u64ad\u653e\u6b21\u6570\uff080\u8868\u793a\u64ad\u653e\u4e00\u6b21\uff09")],"a":2,"n":"LookLeftPlayCount","t":4,"rt":$n[0].Int32,"sn":"LookLeftPlayCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u5411\u5de6\u770b\u52a8\u753b\u5e8f\u5217\u5e27")],"a":2,"n":"LookLeftSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"LookLeftSprites"},{"at":[new UnityEngine.TooltipAttribute("\u5411\u5de6\u770b\u52a8\u753b\u603b\u65f6\u957f\uff08\u79d2\uff09\uff0c\u6574\u4e2a\u52a8\u753b\u64ad\u653e\u4e00\u6b21\u7684\u65f6\u95f4")],"a":2,"n":"LookLeftTotalTime","t":4,"rt":$n[0].Single,"sn":"LookLeftTotalTime","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_currentAnimation","t":4,"rt":$n[3].Coroutine,"sn":"_currentAnimation"},{"a":1,"n":"_isPlayingOneShot","t":4,"rt":$n[0].Boolean,"sn":"_isPlayingOneShot","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}}]}; }, $n);
    /*JewelCharacterAnimator end.*/

    /*JewelColor start.*/
    $m("JewelColor", function () { return {"att":257,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"BigBomb","is":true,"t":4,"rt":JewelColor,"sn":"BigBomb","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Blue","is":true,"t":4,"rt":JewelColor,"sn":"Blue","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Diamond","is":true,"t":4,"rt":JewelColor,"sn":"Diamond","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Explosive","is":true,"t":4,"rt":JewelColor,"sn":"Explosive","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Horizontal","is":true,"t":4,"rt":JewelColor,"sn":"Horizontal","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Pink","is":true,"t":4,"rt":JewelColor,"sn":"Pink","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"TransformBlock","is":true,"t":4,"rt":JewelColor,"sn":"TransformBlock","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Vertical","is":true,"t":4,"rt":JewelColor,"sn":"Vertical","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}}]}; }, $n);
    /*JewelColor end.*/

    /*JewelGameManager start.*/
    $m("JewelGameManager", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"CheckWinLoseConditions","t":8,"sn":"CheckWinLoseConditions","rt":$n[0].Void},{"a":2,"n":"GetRemainingMoves","t":8,"sn":"GetRemainingMoves","rt":$n[0].Int32,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"HideComboText","t":8,"sn":"HideComboText","rt":$n[2].IEnumerator},{"a":1,"n":"InitializeGame","t":8,"sn":"InitializeGame","rt":$n[0].Void},{"a":1,"n":"JumpToStore","t":8,"sn":"JumpToStore","rt":$n[0].Void},{"a":2,"n":"NextLevel","t":8,"sn":"NextLevel","rt":$n[0].Void},{"a":1,"n":"OnCombo","t":8,"pi":[{"n":"combo","pt":$n[0].Int32,"ps":0}],"sn":"OnCombo","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":1,"n":"OnDiamondCountChanged","t":8,"pi":[{"n":"count","pt":$n[0].Int32,"ps":0}],"sn":"OnDiamondCountChanged","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":1,"n":"OnGameLose","t":8,"sn":"OnGameLose","rt":$n[2].IEnumerator},{"a":1,"n":"OnGameOver","t":8,"sn":"OnGameOver","rt":$n[0].Void},{"a":1,"n":"OnGameWin","t":8,"sn":"OnGameWin","rt":$n[2].IEnumerator},{"a":1,"n":"OnItemSpawned","t":8,"pi":[{"n":"itemType","pt":JewelColor,"ps":0}],"sn":"OnItemSpawned","rt":$n[0].Void,"p":[JewelColor]},{"a":1,"n":"OnMoveMade","t":8,"sn":"OnMoveMade","rt":$n[0].Void},{"a":1,"n":"OnRowCleared","t":8,"pi":[{"n":"rowCount","pt":$n[0].Int32,"ps":0},{"n":"hasDiamondDestroyed","pt":$n[0].Boolean,"ps":1}],"sn":"OnRowCleared","rt":$n[0].Void,"p":[$n[0].Int32,$n[0].Boolean]},{"a":2,"n":"RestartGame","t":8,"sn":"RestartGame","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":1,"n":"UpdatePreviewCoroutine","t":8,"sn":"UpdatePreviewCoroutine","rt":$n[2].IEnumerator},{"a":1,"n":"UpdateUI","t":8,"sn":"UpdateUI","rt":$n[0].Void},{"a":1,"n":"UpdateUserAgentText","t":8,"sn":"UpdateUserAgentText","rt":$n[0].Void},{"a":1,"n":"WaitForAllDiamondAnimationsComplete","t":8,"sn":"WaitForAllDiamondAnimationsComplete","rt":$n[2].IEnumerator},{"a":2,"n":"Instance","is":true,"t":16,"rt":JewelGameManager,"g":{"a":2,"n":"get_Instance","t":8,"rt":JewelGameManager,"fg":"Instance","is":true},"s":{"a":1,"n":"set_Instance","t":8,"p":[JewelGameManager],"rt":$n[0].Void,"fs":"Instance","is":true},"fn":"Instance"},{"at":[new UnityEngine.TooltipAttribute("Win/Lose\u754c\u9762\u663e\u793a\u540e\u7b49\u5f85\u591a\u5c11\u79d2\u518d\u8df3\u8f6c\u5546\u5e97"),new UnityEngine.RangeAttribute(0.0, 10.0)],"a":2,"n":"AutoJumpToStoreDelay","t":4,"rt":$n[0].Single,"sn":"AutoJumpToStoreDelay","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("Win/Lose\u754c\u9762\u51fa\u73b0\u65f6\u662f\u5426\u81ea\u52a8\u8df3\u8f6c\u5e94\u7528\u5546\u5e97")],"a":2,"n":"AutoJumpToStoreOnWinLose","t":4,"rt":$n[0].Boolean,"sn":"AutoJumpToStoreOnWinLose","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u5931\u8d25\u540e\u662f\u5426\u81ea\u52a8\u91cd\u65b0\u52a0\u8f7d\u5173\u5361\uff08\u5426\u5219\u8df3\u8f6c\u5546\u5e97\uff09")],"a":2,"n":"AutoRestartOnFail","t":4,"rt":$n[0].Boolean,"sn":"AutoRestartOnFail","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.HeaderAttribute("\u914d\u7f6e")],"a":2,"n":"BoardConfig","t":4,"rt":JewelBoardConfig,"sn":"BoardConfig"},{"at":[new UnityEngine.HeaderAttribute("\u7ba1\u7406\u5668\u5f15\u7528")],"a":2,"n":"BoardManager","t":4,"rt":JewelBoardManager,"sn":"BoardManager"},{"at":[new UnityEngine.HeaderAttribute("\u89d2\u8272\u52a8\u753b")],"a":2,"n":"CharacterAnimator","t":4,"rt":JewelCharacterAnimator,"sn":"CharacterAnimator"},{"a":2,"n":"ComboText","t":4,"rt":$n[1].Text,"sn":"ComboText"},{"a":2,"n":"DiamondCountText","t":4,"rt":$n[4].ImageNumberDisplay,"sn":"DiamondCountText"},{"a":2,"n":"DiamondTargetTransform","t":4,"rt":$n[3].RectTransform,"sn":"DiamondTargetTransform"},{"a":2,"n":"FinalScoreText","t":4,"rt":$n[1].Text,"sn":"FinalScoreText"},{"a":2,"n":"GameOverPanel","t":4,"rt":$n[3].GameObject,"sn":"GameOverPanel"},{"at":[new UnityEngine.HeaderAttribute("\u5f15\u5bfc\u7cfb\u7edf")],"a":2,"n":"HandGuide","t":4,"rt":JewelHandGuide,"sn":"HandGuide"},{"at":[new UnityEngine.HeaderAttribute("\u6e38\u620f\u89c4\u5219\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u521d\u59cb\u5269\u4f59\u6b65\u6570")],"a":2,"n":"InitialMoves","t":4,"rt":$n[0].Int32,"sn":"InitialMoves","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"LosePanel","t":4,"rt":GameLosePanel,"sn":"LosePanel"},{"a":2,"n":"MovesText","t":4,"rt":$n[4].ImageNumberDisplay,"sn":"MovesText"},{"a":2,"n":"PreviewManager","t":4,"rt":JewelPreviewManager,"sn":"PreviewManager"},{"at":[new UnityEngine.HeaderAttribute("UI\u5f15\u7528")],"a":2,"n":"ScoreText","t":4,"rt":$n[1].Text,"sn":"ScoreText"},{"at":[new UnityEngine.HeaderAttribute("\u5546\u5e97\u5bfc\u822a")],"a":2,"n":"StoreNavigator","t":4,"rt":StoreNavigator,"sn":"StoreNavigator"},{"a":2,"n":"UserAgentText","t":4,"rt":$n[1].Text,"sn":"UserAgentText"},{"at":[new UnityEngine.HeaderAttribute("\u6e38\u620f\u7ed3\u679c\u754c\u9762")],"a":2,"n":"WinPanel","t":4,"rt":GameWinPanel,"sn":"WinPanel"},{"a":1,"n":"_currentCombo","t":4,"rt":$n[0].Int32,"sn":"_currentCombo","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_diamondCount","t":4,"rt":$n[0].Int32,"sn":"_diamondCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_gameOver","t":4,"rt":$n[0].Boolean,"sn":"_gameOver","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_hasPlayerMoved","t":4,"rt":$n[0].Boolean,"sn":"_hasPlayerMoved","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_hasShownLosePanel","is":true,"t":4,"rt":$n[0].Boolean,"sn":"_hasShownLosePanel","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_hasShownWinPanel","is":true,"t":4,"rt":$n[0].Boolean,"sn":"_hasShownWinPanel","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_loseCoroutine","t":4,"rt":$n[3].Coroutine,"sn":"_loseCoroutine"},{"a":1,"n":"_remainingMoves","t":4,"rt":$n[0].Int32,"sn":"_remainingMoves","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_score","t":4,"rt":$n[0].Int32,"sn":"_score","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_targetDiamondCount","t":4,"rt":$n[0].Int32,"sn":"_targetDiamondCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_winCoroutine","t":4,"rt":$n[3].Coroutine,"sn":"_winCoroutine"},{"a":1,"backing":true,"n":"<Instance>k__BackingField","is":true,"t":4,"rt":JewelGameManager,"sn":"Instance"}]}; }, $n);
    /*JewelGameManager end.*/

    /*JewelHandGuide start.*/
    $m("JewelHandGuide", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"HideGuide","t":8,"sn":"HideGuide","rt":$n[0].Void},{"a":2,"n":"Initialize","t":8,"pi":[{"n":"boardManager","pt":JewelBoardManager,"ps":0}],"sn":"Initialize","rt":$n[0].Void,"p":[JewelBoardManager]},{"a":1,"n":"MoveHandCoroutine","t":8,"sn":"MoveHandCoroutine","rt":$n[2].IEnumerator},{"a":1,"n":"MoveToPosition","t":8,"pi":[{"n":"fromX","pt":$n[0].Single,"ps":0},{"n":"toX","pt":$n[0].Single,"ps":1},{"n":"y","pt":$n[0].Single,"ps":2},{"n":"duration","pt":$n[0].Single,"ps":3}],"sn":"MoveToPosition","rt":$n[2].IEnumerator,"p":[$n[0].Single,$n[0].Single,$n[0].Single,$n[0].Single]},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":2,"n":"ShowGuide","t":8,"sn":"ShowGuide","rt":$n[0].Void},{"a":1,"n":"ShowGuideDelayed","t":8,"sn":"ShowGuideDelayed","rt":$n[2].IEnumerator},{"a":1,"n":"UpdateHandPosition","t":8,"sn":"UpdateHandPosition","rt":$n[0].Void},{"a":1,"n":"UpdateHandPositionLikeBlock","t":8,"sn":"UpdateHandPositionLikeBlock","rt":$n[0].Void},{"at":[new UnityEngine.HeaderAttribute("\u9ad8\u7ea7\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u81ea\u52a8\u8c03\u6574\u7236\u7269\u4f53\u5c42\u7ea7\uff08\u786e\u4fdd\u5728\u6b63\u786e\u7684Canvas\u4e0b\uff09")],"a":2,"n":"AutoAdjustParent","t":4,"rt":$n[0].Boolean,"sn":"AutoAdjustParent","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u5f15\u5bfc\u7ed3\u675f\u5217\uff08\u4ece0\u5f00\u59cb\uff0c\u7b2c8\u5217=7\uff09")],"a":2,"n":"GuideEndColumn","t":4,"rt":$n[0].Int32,"sn":"GuideEndColumn","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u5f15\u5bfc\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u5f15\u5bfc\u6240\u5728\u7684\u884c\uff08\u4ece0\u5f00\u59cb\uff0c\u7b2c4\u884c=3\uff09")],"a":2,"n":"GuideRow","t":4,"rt":$n[0].Int32,"sn":"GuideRow","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u5f15\u5bfc\u8d77\u59cb\u5217\uff08\u4ece0\u5f00\u59cb\uff0c\u7b2c7\u5217=6\uff09")],"a":2,"n":"GuideStartColumn","t":4,"rt":$n[0].Int32,"sn":"GuideStartColumn","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u7ec4\u4ef6\u5f15\u7528")],"a":2,"n":"HandImage","t":4,"rt":$n[1].Image,"sn":"HandImage"},{"a":2,"n":"HandRectTransform","t":4,"rt":$n[3].RectTransform,"sn":"HandRectTransform"},{"at":[new UnityEngine.TooltipAttribute("\u5de6\u53f3\u79fb\u52a8\u901f\u5ea6\uff08\u79d2\uff09")],"a":2,"n":"MoveDuration","t":4,"rt":$n[0].Single,"sn":"MoveDuration","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("\u8c03\u8bd5\u5de5\u5177"),new UnityEngine.TooltipAttribute("\u663e\u793a\u8c03\u8bd5\u4fe1\u606f\uff08\u5728\u573a\u666f\u4e2d\u7ed8\u5236\u76ee\u6807\u4f4d\u7f6e\uff09")],"a":2,"n":"ShowDebugInfo","t":4,"rt":$n[0].Boolean,"sn":"ShowDebugInfo","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u4f7f\u7528\u4e16\u754c\u5750\u6807\u800c\u975e\u5c40\u90e8\u5750\u6807\uff08\u67d0\u4e9b\u60c5\u51b5\u4e0b\u66f4\u51c6\u786e\uff09")],"a":2,"n":"UseWorldPosition","t":4,"rt":$n[0].Boolean,"sn":"UseWorldPosition","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u624b\u90e8\u56fe\u6807\u76f8\u5bf9\u6e38\u620f\u677f\u7684X\u8f74\u504f\u79fb\uff08\u7528\u4e8e\u5fae\u8c03\u4f4d\u7f6e\uff09")],"a":2,"n":"XOffset","t":4,"rt":$n[0].Single,"sn":"XOffset","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u624b\u90e8\u56fe\u6807\u76f8\u5bf9\u6e38\u620f\u677f\u7684Y\u8f74\u504f\u79fb\uff08\u7528\u4e8e\u5fae\u8c03\u4f4d\u7f6e\uff09")],"a":2,"n":"YOffset","t":4,"rt":$n[0].Single,"sn":"YOffset","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_boardContainerRect","t":4,"rt":$n[3].RectTransform,"sn":"_boardContainerRect"},{"a":1,"n":"_boardManager","t":4,"rt":JewelBoardManager,"sn":"_boardManager"},{"a":1,"n":"_isActive","t":4,"rt":$n[0].Boolean,"sn":"_isActive","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_moveCoroutine","t":4,"rt":$n[3].Coroutine,"sn":"_moveCoroutine"}]}; }, $n);
    /*JewelHandGuide end.*/

    /*JewelInputHandler start.*/
    $m("JewelInputHandler", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"CalculateDragLimits","t":8,"pi":[{"n":"block","pt":JewelBlockController,"ps":0}],"sn":"CalculateDragLimits","rt":$n[0].Void,"p":[JewelBlockController]},{"a":1,"n":"CanMergeInDirection","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0},{"n":"deltaX","pt":$n[0].Int32,"ps":1},{"n":"deltaY","pt":$n[0].Int32,"ps":2}],"sn":"CanMergeInDirection","rt":$n[0].Boolean,"p":[JewelBlockData,$n[0].Int32,$n[0].Int32],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"DisableInput","t":8,"sn":"DisableInput","rt":$n[0].Void},{"a":2,"n":"EnableInput","t":8,"sn":"EnableInput","rt":$n[0].Void},{"a":1,"n":"HandleHorizontalDrag","t":8,"pi":[{"n":"deltaX","pt":$n[0].Single,"ps":0},{"n":"blockData","pt":JewelBlockData,"ps":1}],"sn":"HandleHorizontalDrag","rt":$n[0].Void,"p":[$n[0].Single,JewelBlockData]},{"a":1,"n":"HandleHorizontalDragForItem","t":8,"pi":[{"n":"deltaX","pt":$n[0].Single,"ps":0},{"n":"blockData","pt":JewelBlockData,"ps":1}],"sn":"HandleHorizontalDragForItem","rt":$n[0].Void,"p":[$n[0].Single,JewelBlockData]},{"a":1,"n":"HasAdjacentMergeableItem","t":8,"pi":[{"n":"blockData","pt":JewelBlockData,"ps":0}],"sn":"HasAdjacentMergeableItem","rt":$n[0].Boolean,"p":[JewelBlockData],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"Initialize","t":8,"pi":[{"n":"cellWidth","pt":$n[0].Single,"ps":0},{"n":"cellHeight","pt":$n[0].Single,"ps":1},{"n":"onBlockMovedHorizontal","pt":Function,"ps":2},{"n":"onBlockMovedVertical","dv":null,"o":true,"pt":Function,"ps":3},{"n":"calculateVerticalLimits","dv":null,"o":true,"pt":Function,"ps":4},{"n":"canMoveToPosition","dv":null,"o":true,"pt":Function,"ps":5},{"n":"calculateHorizontalLimits","dv":null,"o":true,"pt":Function,"ps":6},{"n":"getBlockAt","dv":null,"o":true,"pt":Function,"ps":7}],"sn":"Initialize","rt":$n[0].Void,"p":[$n[0].Single,$n[0].Single,Function,Function,Function,Function,Function,Function]},{"a":2,"n":"OnDrag","t":8,"pi":[{"n":"eventData","pt":$n[6].PointerEventData,"ps":0}],"sn":"OnDrag","rt":$n[0].Void,"p":[$n[6].PointerEventData]},{"a":2,"n":"OnPointerDown","t":8,"pi":[{"n":"eventData","pt":$n[6].PointerEventData,"ps":0}],"sn":"OnPointerDown","rt":$n[0].Void,"p":[$n[6].PointerEventData]},{"a":2,"n":"OnPointerUp","t":8,"pi":[{"n":"eventData","pt":$n[6].PointerEventData,"ps":0}],"sn":"OnPointerUp","rt":$n[0].Void,"p":[$n[6].PointerEventData]},{"a":2,"n":"SetDragLimitsPixels","t":8,"pi":[{"n":"minPixels","pt":$n[0].Int32,"ps":0},{"n":"maxPixels","pt":$n[0].Int32,"ps":1}],"sn":"SetDragLimitsPixels","rt":$n[0].Void,"p":[$n[0].Int32,$n[0].Int32]},{"a":2,"n":"SetVerticalDragLimitsPixels","t":8,"pi":[{"n":"minPixels","pt":$n[0].Int32,"ps":0},{"n":"maxPixels","pt":$n[0].Int32,"ps":1}],"sn":"SetVerticalDragLimitsPixels","rt":$n[0].Void,"p":[$n[0].Int32,$n[0].Int32]},{"a":1,"n":"SnapBackCoroutine","t":8,"pi":[{"n":"block","pt":JewelBlockController,"ps":0}],"sn":"SnapBackCoroutine","rt":$n[2].IEnumerator,"p":[JewelBlockController]},{"a":1,"n":"_activeBlock","t":4,"rt":JewelBlockController,"sn":"_activeBlock"},{"a":1,"n":"_calculateHorizontalLimits","t":4,"rt":Function,"sn":"_calculateHorizontalLimits"},{"a":1,"n":"_calculateVerticalLimits","t":4,"rt":Function,"sn":"_calculateVerticalLimits"},{"a":1,"n":"_canMoveToPosition","t":4,"rt":Function,"sn":"_canMoveToPosition"},{"a":1,"n":"_cellHeight","t":4,"rt":$n[0].Single,"sn":"_cellHeight","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_cellWidth","t":4,"rt":$n[0].Single,"sn":"_cellWidth","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_getBlockAt","t":4,"rt":Function,"sn":"_getBlockAt"},{"a":1,"n":"_inputEnabled","t":4,"rt":$n[0].Boolean,"sn":"_inputEnabled","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_isDragging","t":4,"rt":$n[0].Boolean,"sn":"_isDragging","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_isVerticalDrag","t":4,"rt":$n[0].Boolean,"sn":"_isVerticalDrag","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_maxDragX","t":4,"rt":$n[0].Int32,"sn":"_maxDragX","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_maxDragY","t":4,"rt":$n[0].Int32,"sn":"_maxDragY","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_minDragX","t":4,"rt":$n[0].Int32,"sn":"_minDragX","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_minDragY","t":4,"rt":$n[0].Int32,"sn":"_minDragY","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_onBlockMovedHorizontal","t":4,"rt":Function,"sn":"_onBlockMovedHorizontal"},{"a":1,"n":"_onBlockMovedVertical","t":4,"rt":Function,"sn":"_onBlockMovedVertical"},{"a":1,"n":"_originalPosition","t":4,"rt":$n[3].Vector2,"sn":"_originalPosition"},{"a":1,"n":"_startDragPosition","t":4,"rt":$n[3].Vector2,"sn":"_startDragPosition"}]}; }, $n);
    /*JewelInputHandler end.*/

    /*JewelLevelData start.*/
    $m("JewelLevelData", function () { return {"nested":[JewelLevelData.BlockPlacementData],"att":1048577,"a":2,"at":[Bridge.apply(new UnityEngine.CreateAssetMenuAttribute(), {
        fileName: "JewelLevelData", menuName: "JewelGame/LevelData"
    } )],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"AddBlock","t":8,"pi":[{"n":"x","pt":$n[0].Int32,"ps":0},{"n":"y","pt":$n[0].Int32,"ps":1},{"n":"width","pt":$n[0].Int32,"ps":2},{"n":"color","pt":JewelColor,"ps":3}],"sn":"AddBlock","rt":$n[0].Void,"p":[$n[0].Int32,$n[0].Int32,$n[0].Int32,JewelColor]},{"a":2,"n":"ClearAllBlocks","t":8,"sn":"ClearAllBlocks","rt":$n[0].Void},{"a":2,"n":"GetBlockAt","t":8,"pi":[{"n":"x","pt":$n[0].Int32,"ps":0},{"n":"y","pt":$n[0].Int32,"ps":1}],"sn":"GetBlockAt","rt":JewelLevelData.BlockPlacementData,"p":[$n[0].Int32,$n[0].Int32]},{"a":2,"n":"IsItem","t":8,"pi":[{"n":"color","pt":JewelColor,"ps":0}],"sn":"IsItem","rt":$n[0].Boolean,"p":[JewelColor],"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"RemoveBlock","t":8,"pi":[{"n":"x","pt":$n[0].Int32,"ps":0},{"n":"y","pt":$n[0].Int32,"ps":1}],"sn":"RemoveBlock","rt":$n[0].Void,"p":[$n[0].Int32,$n[0].Int32]},{"at":[new UnityEngine.HeaderAttribute("\u6e38\u620f\u677f\u914d\u7f6e")],"a":2,"n":"Columns","t":4,"rt":$n[0].Int32,"sn":"Columns","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u521d\u59cb\u68cb\u76d8\u5e03\u5c40"),new UnityEngine.TooltipAttribute("\u521d\u59cb\u5757\u6570\u636e\u5217\u8868\uff08X, Y, Width, Color\uff09")],"a":2,"n":"InitialBlocks","t":4,"rt":$n[5].List$1(JewelLevelData.BlockPlacementData),"sn":"InitialBlocks"},{"at":[new UnityEngine.HeaderAttribute("\u5173\u5361\u4fe1\u606f")],"a":2,"n":"LevelName","t":4,"rt":$n[0].String,"sn":"LevelName"},{"a":2,"n":"LevelNumber","t":4,"rt":$n[0].Int32,"sn":"LevelNumber","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Rows","t":4,"rt":$n[0].Int32,"sn":"Rows","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*JewelLevelData end.*/

    /*JewelLevelData+BlockPlacementData start.*/
    $m("JewelLevelData.BlockPlacementData", function () { return {"td":JewelLevelData,"att":1056770,"a":2,"at":[new System.SerializableAttribute()],"m":[{"a":2,"n":".ctor","t":1,"p":[$n[0].Int32,$n[0].Int32,$n[0].Int32,JewelColor],"pi":[{"n":"x","pt":$n[0].Int32,"ps":0},{"n":"y","pt":$n[0].Int32,"ps":1},{"n":"width","pt":$n[0].Int32,"ps":2},{"n":"color","pt":JewelColor,"ps":3}],"sn":"ctor"},{"a":2,"n":"Color","t":4,"rt":JewelColor,"sn":"Color","box":function ($v) { return Bridge.box($v, JewelColor, System.Enum.toStringFn(JewelColor));}},{"a":2,"n":"Width","t":4,"rt":$n[0].Int32,"sn":"Width","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"X","t":4,"rt":$n[0].Int32,"sn":"X","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"Y","t":4,"rt":$n[0].Int32,"sn":"Y","box":function ($v) { return Bridge.box($v, System.Int32);}}]}; }, $n);
    /*JewelLevelData+BlockPlacementData end.*/

    /*JewelPreviewManager start.*/
    $m("JewelPreviewManager", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"CalculatePreviewMetrics","t":8,"sn":"CalculatePreviewMetrics","rt":$n[0].Void},{"a":2,"n":"Initialize","t":8,"pi":[{"n":"config","pt":JewelBoardConfig,"ps":0}],"sn":"Initialize","rt":$n[0].Void,"p":[JewelBoardConfig]},{"a":2,"n":"UpdatePreview","t":8,"pi":[{"n":"nextRowData","pt":$n[5].List$1(JewelBlockData),"ps":0}],"sn":"UpdatePreview","rt":$n[0].Void,"p":[$n[5].List$1(JewelBlockData)]},{"at":[new UnityEngine.HeaderAttribute("\u914d\u7f6e")],"a":2,"n":"Config","t":4,"rt":JewelBoardConfig,"sn":"Config"},{"a":2,"n":"PreviewBlockPrefab","t":4,"rt":$n[3].GameObject,"sn":"PreviewBlockPrefab"},{"at":[new UnityEngine.HeaderAttribute("UI\u5f15\u7528")],"a":2,"n":"PreviewContainer","t":4,"rt":$n[3].RectTransform,"sn":"PreviewContainer"},{"a":1,"n":"_cellHeight","t":4,"rt":$n[0].Single,"sn":"_cellHeight","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_cellWidth","t":4,"rt":$n[0].Single,"sn":"_cellWidth","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_previewHeight","t":4,"rt":$n[0].Single,"sn":"_previewHeight","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_previewWidth","t":4,"rt":$n[0].Single,"sn":"_previewWidth","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}}]}; }, $n);
    /*JewelPreviewManager end.*/

    /*StoreNavigator start.*/
    $m("StoreNavigator", function () { return {"nested":[StoreNavigator.PlatformType],"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"DetectPlatformFromUserAgent","t":8,"sn":"DetectPlatformFromUserAgent","rt":StoreNavigator.PlatformType,"box":function ($v) { return Bridge.box($v, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType));}},{"a":1,"n":"DetectPlatformRuntime","t":8,"sn":"DetectPlatformRuntime","rt":StoreNavigator.PlatformType,"box":function ($v) { return Bridge.box($v, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType));}},{"a":1,"n":"OpenAndroidStore","t":8,"sn":"OpenAndroidStore","rt":$n[0].Void},{"a":1,"n":"OpenIOSStore","t":8,"sn":"OpenIOSStore","rt":$n[0].Void},{"a":2,"n":"OpenStore","t":8,"sn":"OpenStore","rt":$n[0].Void},{"a":1,"n":"OpenURLPlatformSafe","t":8,"pi":[{"n":"url","pt":$n[0].String,"ps":0}],"sn":"OpenURLPlatformSafe","rt":$n[0].Void,"p":[$n[0].String]},{"a":1,"n":"OpenWebStore","t":8,"sn":"OpenWebStore","rt":$n[0].Void},{"at":[new UnityEngine.ContextMenu.ctor("\u6d4b\u8bd5Luna\u5e73\u53f0\u68c0\u6d4b")],"a":2,"n":"TestLunaPlatformDetection","t":8,"sn":"TestLunaPlatformDetection","rt":$n[0].Void},{"at":[new UnityEngine.ContextMenu.ctor("\u6d4b\u8bd5\u5546\u5e97\u8df3\u8f6c")],"a":2,"n":"TestStoreNavigation","t":8,"sn":"TestStoreNavigation","rt":$n[0].Void},{"at":[new UnityEngine.TooltipAttribute("Android Google Play \u5305\u540d\uff08\u4f8b\u5982\uff1acom.company.game\uff09")],"a":2,"n":"AndroidPackageName","t":4,"rt":$n[0].String,"sn":"AndroidPackageName"},{"at":[new UnityEngine.TooltipAttribute("\u5907\u7528\u7f51\u9875\u5546\u5e97URL\uff08\u53ef\u9009\uff0c\u7528\u4e8e\u5176\u4ed6\u5e73\u53f0\uff09")],"a":2,"n":"FallbackWebStoreUrl","t":4,"rt":$n[0].String,"sn":"FallbackWebStoreUrl"},{"at":[new UnityEngine.HeaderAttribute("\u5546\u5e97\u914d\u7f6e"),new UnityEngine.TooltipAttribute("iOS App Store \u5e94\u7528ID\uff08\u4f8b\u5982\uff1a1234567890\uff09")],"a":2,"n":"IosAppId","t":4,"rt":$n[0].String,"sn":"IosAppId"},{"at":[new UnityEngine.HeaderAttribute("\u8fd0\u884c\u65f6\u68c0\u6d4b\uff08Luna Playable \u73af\u5883\uff09"),new UnityEngine.TooltipAttribute("\u662f\u5426\u542f\u7528\u8fd0\u884c\u65f6\u5e73\u53f0\u68c0\u6d4b\uff08\u7528\u4e8e Luna Playable Ads\uff09")],"a":2,"n":"UseRuntimePlatformDetection","t":4,"rt":$n[0].Boolean,"sn":"UseRuntimePlatformDetection","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}}]}; }, $n);
    /*StoreNavigator end.*/

    /*StoreNavigator+PlatformType start.*/
    $m("StoreNavigator.PlatformType", function () { return {"td":StoreNavigator,"att":259,"a":1,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Android","is":true,"t":4,"rt":StoreNavigator.PlatformType,"sn":"Android","box":function ($v) { return Bridge.box($v, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType));}},{"a":2,"n":"Unknown","is":true,"t":4,"rt":StoreNavigator.PlatformType,"sn":"Unknown","box":function ($v) { return Bridge.box($v, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType));}},{"a":2,"n":"WebGL","is":true,"t":4,"rt":StoreNavigator.PlatformType,"sn":"WebGL","box":function ($v) { return Bridge.box($v, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType));}},{"a":2,"n":"iOS","is":true,"t":4,"rt":StoreNavigator.PlatformType,"sn":"iOS","box":function ($v) { return Bridge.box($v, StoreNavigator.PlatformType, System.Enum.toStringFn(StoreNavigator.PlatformType));}}]}; }, $n);
    /*StoreNavigator+PlatformType end.*/

    /*FreeToPlayButton start.*/
    $m("FreeToPlayButton", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"BlinkCoroutine","t":8,"sn":"BlinkCoroutine","rt":$n[2].IEnumerator},{"a":1,"n":"ClickFeedbackAnimation","t":8,"sn":"ClickFeedbackAnimation","rt":$n[2].IEnumerator},{"a":1,"n":"OnButtonClick","t":8,"sn":"OnButtonClick","rt":$n[0].Void},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":2,"n":"StartBlinking","t":8,"sn":"StartBlinking","rt":$n[0].Void},{"a":2,"n":"StopBlinking","t":8,"sn":"StopBlinking","rt":$n[0].Void},{"at":[new UnityEngine.TooltipAttribute("\u95ea\u70c1\u7684\u989c\u8272A")],"a":2,"n":"BlinkColorA","t":4,"rt":$n[3].Color,"sn":"BlinkColorA"},{"at":[new UnityEngine.TooltipAttribute("\u95ea\u70c1\u7684\u989c\u8272B")],"a":2,"n":"BlinkColorB","t":4,"rt":$n[3].Color,"sn":"BlinkColorB"},{"at":[new UnityEngine.HeaderAttribute("\u95ea\u70c1\u6548\u679c\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u95ea\u70c1\u95f4\u9694\u65f6\u95f4\uff08\u79d2\uff09"),new UnityEngine.RangeAttribute(0.1, 2.0)],"a":2,"n":"BlinkInterval","t":4,"rt":$n[0].Single,"sn":"BlinkInterval","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("UI\u5f15\u7528"),new UnityEngine.TooltipAttribute("\u6309\u94ae\u7ec4\u4ef6")],"a":2,"n":"Button","t":4,"rt":$n[1].Button,"sn":"Button"},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u80cc\u666f\u56fe\u7247")],"a":2,"n":"ButtonBackground","t":4,"rt":$n[1].Image,"sn":"ButtonBackground"},{"at":[new UnityEngine.TooltipAttribute("\u6309\u94ae\u6587\u672c\u7ec4\u4ef6")],"a":2,"n":"ButtonText","t":4,"rt":$n[1].Text,"sn":"ButtonText"},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u542f\u7528\u989c\u8272\u95ea\u70c1")],"a":2,"n":"EnableColorBlink","t":4,"rt":$n[0].Boolean,"sn":"EnableColorBlink","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u542f\u7528\u7f29\u653e\u52a8\u753b")],"a":2,"n":"EnableScaleAnimation","t":4,"rt":$n[0].Boolean,"sn":"EnableScaleAnimation","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u53ef\u9009\u7684\u56fe\u6807")],"a":2,"n":"IconImage","t":4,"rt":$n[1].Image,"sn":"IconImage"},{"at":[new UnityEngine.TooltipAttribute("\u95ea\u70c1\u65f6\u7684\u6700\u5927\u900f\u660e\u5ea6"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"MaxAlpha","t":4,"rt":$n[0].Single,"sn":"MaxAlpha","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u7f29\u653e\u52a8\u753b\u7684\u6700\u5927\u7f29\u653e\u6bd4\u4f8b"),new UnityEngine.RangeAttribute(1.0, 1.5)],"a":2,"n":"MaxScale","t":4,"rt":$n[0].Single,"sn":"MaxScale","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u95ea\u70c1\u65f6\u7684\u6700\u5c0f\u900f\u660e\u5ea6"),new UnityEngine.RangeAttribute(0.0, 1.0)],"a":2,"n":"MinAlpha","t":4,"rt":$n[0].Single,"sn":"MinAlpha","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u7f29\u653e\u52a8\u753b\u7684\u6700\u5c0f\u7f29\u653e\u6bd4\u4f8b"),new UnityEngine.RangeAttribute(0.8, 1.0)],"a":2,"n":"MinScale","t":4,"rt":$n[0].Single,"sn":"MinScale","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.HeaderAttribute("\u5546\u5e97\u5bfc\u822a\u5668"),new UnityEngine.TooltipAttribute("\u5546\u5e97\u5bfc\u822a\u5668\uff08\u7528\u4e8e\u8df3\u8f6c\u5546\u5e97\uff09")],"a":2,"n":"StoreNavigator","t":4,"rt":StoreNavigator,"sn":"StoreNavigator"},{"a":1,"n":"_blinkCoroutine","t":4,"rt":$n[3].Coroutine,"sn":"_blinkCoroutine"},{"a":1,"n":"_isBlinking","t":4,"rt":$n[0].Boolean,"sn":"_isBlinking","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_originalScale","t":4,"rt":$n[3].Vector3,"sn":"_originalScale"}]}; }, $n);
    /*FreeToPlayButton end.*/

    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty start.*/
    $m("IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"}]}; }, $n);
    /*IAmAnEmptyScriptJustToMakeCodelessProjectsCompileProperty end.*/

    /*UI.FrameSequenceCropData start.*/
    $m("UI.FrameSequenceCropData", function () { return {"nested":[$n[4].FrameSequenceCropData.FrameCropInfo],"att":1048577,"a":2,"at":[Bridge.apply(new UnityEngine.CreateAssetMenuAttribute(), {
        fileName: "FrameSequenceCropData", menuName: "UI/\u5e8f\u5217\u5e27\u88c1\u526a\u6570\u636e"
    } )],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"GetFrameInfo","t":8,"pi":[{"n":"frameIndex","pt":$n[0].Int32,"ps":0}],"sn":"GetFrameInfo","rt":$n[4].FrameSequenceCropData.FrameCropInfo,"p":[$n[0].Int32]},{"a":2,"n":"GetFrameInfoByFileName","t":8,"pi":[{"n":"fileName","pt":$n[0].String,"ps":0}],"sn":"GetFrameInfoByFileName","rt":$n[4].FrameSequenceCropData.FrameCropInfo,"p":[$n[0].String]},{"at":[new UnityEngine.TooltipAttribute("\u603b\u5e27\u6570")],"a":2,"n":"FrameCount","t":4,"rt":$n[0].Int32,"sn":"FrameCount","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u5e27\u6570\u636e\u5217\u8868"),new UnityEngine.TooltipAttribute("\u6bcf\u5e27\u7684\u88c1\u526a\u4fe1\u606f")],"a":2,"n":"FrameDataList","t":4,"rt":$n[5].List$1(UI.FrameSequenceCropData.FrameCropInfo),"sn":"FrameDataList"},{"at":[new UnityEngine.HeaderAttribute("\u57fa\u672c\u4fe1\u606f"),new UnityEngine.TooltipAttribute("\u539f\u59cb\u7279\u6548\u5c3a\u5bf8")],"a":2,"n":"OriginalSize","t":4,"rt":$n[3].Vector2,"sn":"OriginalSize"}]}; }, $n);
    /*UI.FrameSequenceCropData end.*/

    /*UI.FrameSequenceCropData+FrameCropInfo start.*/
    $m("UI.FrameSequenceCropData.FrameCropInfo", function () { return {"td":$n[4].FrameSequenceCropData,"att":1056770,"a":2,"at":[new System.SerializableAttribute()],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"at":[new UnityEngine.TooltipAttribute("\u88c1\u526a\u77e9\u5f62\uff08\u76f8\u5bf9\u4e8e\u539f\u59cb\u56fe\u7247\uff09")],"a":2,"n":"CropRect","t":4,"rt":$n[3].Rect,"sn":"CropRect"},{"at":[new UnityEngine.TooltipAttribute("\u88c1\u526a\u540e\u7684\u6587\u4ef6\u540d")],"a":2,"n":"CroppedFileName","t":4,"rt":$n[0].String,"sn":"CroppedFileName"},{"at":[new UnityEngine.TooltipAttribute("\u88c1\u526a\u540e\u7684\u5c3a\u5bf8")],"a":2,"n":"CroppedSize","t":4,"rt":$n[3].Vector2,"sn":"CroppedSize"},{"at":[new UnityEngine.TooltipAttribute("\u5e27\u7d22\u5f15")],"a":2,"n":"FrameIndex","t":4,"rt":$n[0].Int32,"sn":"FrameIndex","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u76f8\u5bf9\u4e8e\u539f\u59cb\u4e2d\u5fc3\u7684\u504f\u79fb")],"a":2,"n":"OffsetFromCenter","t":4,"rt":$n[3].Vector2,"sn":"OffsetFromCenter"},{"at":[new UnityEngine.TooltipAttribute("\u539f\u59cb\u6587\u4ef6\u540d")],"a":2,"n":"OriginalFileName","t":4,"rt":$n[0].String,"sn":"OriginalFileName"}]}; }, $n);
    /*UI.FrameSequenceCropData+FrameCropInfo end.*/

    /*UI.FrameSequenceEffectPlayer start.*/
    $m("UI.FrameSequenceEffectPlayer", function () { return {"nested":[$n[4].FrameSequenceEffectPlayer.Alignment,$n[4].FrameSequenceEffectPlayer.FrameData],"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"CropAndCalculateOffset","t":8,"pi":[{"n":"frameData","pt":$n[4].FrameSequenceEffectPlayer.FrameData,"ps":0},{"n":"frameIndex","pt":$n[0].Int32,"ps":1}],"sn":"CropAndCalculateOffset","rt":$n[0].Void,"p":[$n[4].FrameSequenceEffectPlayer.FrameData,$n[0].Int32]},{"a":2,"n":"GetCurrentFrameIndex","t":8,"sn":"GetCurrentFrameIndex","rt":$n[0].Int32,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"GetTotalFrames","t":8,"sn":"GetTotalFrames","rt":$n[0].Int32,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"InitializeFrameData","t":8,"sn":"InitializeFrameData","rt":$n[0].Void},{"a":2,"n":"IsPlaying","t":8,"sn":"IsPlaying","rt":$n[0].Boolean,"box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"LoadSpritesFromCropData","t":8,"sn":"LoadSpritesFromCropData","rt":$n[0].Void},{"a":2,"n":"Pause","t":8,"sn":"Pause","rt":$n[0].Void},{"a":2,"n":"Play","t":8,"sn":"Play","rt":$n[0].Void},{"a":2,"n":"RecalculateCropData","t":8,"sn":"RecalculateCropData","rt":$n[0].Void},{"a":2,"n":"Resume","t":8,"sn":"Resume","rt":$n[0].Void},{"a":2,"n":"SetFrame","t":8,"pi":[{"n":"frameIndex","pt":$n[0].Int32,"ps":0}],"sn":"SetFrame","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":2,"n":"SetPosition","t":8,"pi":[{"n":"position","pt":$n[3].Vector2,"ps":0}],"sn":"SetPosition","rt":$n[0].Void,"p":[$n[3].Vector2]},{"a":2,"n":"SetPosition","t":8,"pi":[{"n":"position","pt":$n[3].Vector3,"ps":0}],"sn":"SetPosition$1","rt":$n[0].Void,"p":[$n[3].Vector3]},{"a":1,"n":"SetPositionByAlignment","t":8,"pi":[{"n":"frameData","pt":$n[4].FrameSequenceEffectPlayer.FrameData,"ps":0}],"sn":"SetPositionByAlignment","rt":$n[0].Void,"p":[$n[4].FrameSequenceEffectPlayer.FrameData]},{"a":1,"n":"Start","t":8,"sn":"Start","rt":$n[0].Void},{"a":2,"n":"Stop","t":8,"sn":"Stop","rt":$n[0].Void},{"a":1,"n":"Update","t":8,"sn":"Update","rt":$n[0].Void},{"a":1,"n":"UpdateAnimation","t":8,"sn":"UpdateAnimation","rt":$n[0].Void},{"a":1,"n":"UpdateFrame","t":8,"sn":"UpdateFrame","rt":$n[0].Void},{"at":[new UnityEngine.TooltipAttribute("\u5bf9\u9f50\u65b9\u5f0f")],"a":2,"n":"AnchorAlignment","t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"AnchorAlignment","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"at":[new UnityEngine.HeaderAttribute("\u88c1\u526a\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u662f\u5426\u81ea\u52a8\u88c1\u526a\u900f\u660e\u533a\u57df")],"a":2,"n":"AutoCropTransparent","t":4,"rt":$n[0].Boolean,"sn":"AutoCropTransparent","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u81ea\u52a8\u64ad\u653e")],"a":2,"n":"AutoPlay","t":4,"rt":$n[0].Boolean,"sn":"AutoPlay","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u88c1\u526a\u8fb9\u754c\u7684\u5bb9\u5dee\u503c\uff08\u50cf\u7d20\uff09\uff0c\u7528\u4e8e\u6269\u5c55\u88c1\u526a\u8fb9\u754c")],"a":2,"n":"CropPadding","t":4,"rt":$n[0].Int32,"sn":"CropPadding","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u88c1\u526a\u540e\u56fe\u7247\u6240\u5728\u76ee\u5f55\uff08\u5982\u679c\u4f7f\u7528\u9884\u5904\u7406\u88c1\u526a\u4e14FrameSprites\u4e3a\u7a7a\uff0c\u4f1a\u4ece\u6b64\u76ee\u5f55\u52a0\u8f7d\uff09")],"a":2,"n":"CroppedSpritesDirectory","t":4,"rt":$n[0].String,"sn":"CroppedSpritesDirectory"},{"at":[new UnityEngine.TooltipAttribute("\u64ad\u653e\u5e27\u7387\uff08\u6bcf\u79d2\u64ad\u653e\u5e27\u6570\uff09")],"a":2,"n":"FrameRate","t":4,"rt":$n[0].Single,"sn":"FrameRate","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"at":[new UnityEngine.TooltipAttribute("\u5e8f\u5217\u5e27\u56fe\u7247\u6570\u7ec4\uff08\u6309\u64ad\u653e\u987a\u5e8f\uff0c\u53ef\u901a\u8fc7\u76ee\u5f55\u81ea\u52a8\u52a0\u8f7d\uff09")],"a":2,"n":"FrameSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"FrameSprites"},{"at":[new UnityEngine.HeaderAttribute("\u5e8f\u5217\u5e27\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u5e8f\u5217\u5e27\u76ee\u5f55\u8def\u5f84\uff08\u76f8\u5bf9\u4e8eAssets\uff0c\u4f8b\u5982\uff1atexiao/lanse\uff09")],"a":2,"n":"FrameSpritesDirectory","t":4,"rt":$n[0].String,"sn":"FrameSpritesDirectory"},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u4fdd\u6301\u539f\u59cb\u4e2d\u5fc3\u4f4d\u7f6e")],"a":2,"n":"KeepOriginalCenter","t":4,"rt":$n[0].Boolean,"sn":"KeepOriginalCenter","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u5faa\u73af\u64ad\u653e")],"a":2,"n":"Loop","t":4,"rt":$n[0].Boolean,"sn":"Loop","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":2,"n":"OnPlayComplete","t":4,"rt":Function,"sn":"OnPlayComplete"},{"at":[new UnityEngine.TooltipAttribute("\u539f\u59cb\u5c3a\u5bf8\uff08\u7528\u4e8e\u8ba1\u7b97\u504f\u79fb\uff09")],"a":2,"n":"OriginalSize","t":4,"rt":$n[3].Vector2,"sn":"OriginalSize"},{"at":[new UnityEngine.TooltipAttribute("\u9884\u5904\u7406\u88c1\u526a\u6570\u636e\uff08\u5982\u679c\u4f7f\u7528\u9884\u5904\u7406\u88c1\u526a\uff0c\u8bf7\u8bbe\u7f6e\u6b64\u6570\u636e\uff09")],"a":2,"n":"PreprocessedCropData","t":4,"rt":$n[4].FrameSequenceCropData,"sn":"PreprocessedCropData"},{"at":[new UnityEngine.HeaderAttribute("\u663e\u793a\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("Image\u7ec4\u4ef6\uff08\u5982\u679c\u4e3a\u7a7a\u5219\u81ea\u52a8\u83b7\u53d6\uff09")],"a":2,"n":"TargetImage","t":4,"rt":$n[1].Image,"sn":"TargetImage"},{"a":1,"n":"_currentFrameIndex","t":4,"rt":$n[0].Int32,"sn":"_currentFrameIndex","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"_frameDataList","t":4,"rt":$n[5].List$1(UI.FrameSequenceEffectPlayer.FrameData),"sn":"_frameDataList"},{"a":1,"n":"_frameTimer","t":4,"rt":$n[0].Single,"sn":"_frameTimer","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_isPaused","t":4,"rt":$n[0].Boolean,"sn":"_isPaused","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_isPlaying","t":4,"rt":$n[0].Boolean,"sn":"_isPlaying","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"_originalPosition","t":4,"rt":$n[3].Vector2,"sn":"_originalPosition"},{"a":1,"n":"_originalSize","t":4,"rt":$n[3].Vector2,"sn":"_originalSize"},{"a":1,"n":"_rectTransform","t":4,"rt":$n[3].RectTransform,"sn":"_rectTransform"}]}; }, $n);
    /*UI.FrameSequenceEffectPlayer end.*/

    /*UI.FrameSequenceEffectPlayer+Alignment start.*/
    $m("UI.FrameSequenceEffectPlayer.Alignment", function () { return {"td":$n[4].FrameSequenceEffectPlayer,"att":258,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Bottom","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"Bottom","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"BottomLeft","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"BottomLeft","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"BottomRight","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"BottomRight","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"Center","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"Center","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"Left","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"Left","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"Right","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"Right","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"Top","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"Top","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"TopLeft","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"TopLeft","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}},{"a":2,"n":"TopRight","is":true,"t":4,"rt":$n[4].FrameSequenceEffectPlayer.Alignment,"sn":"TopRight","box":function ($v) { return Bridge.box($v, UI.FrameSequenceEffectPlayer.Alignment, System.Enum.toStringFn(UI.FrameSequenceEffectPlayer.Alignment));}}]}; }, $n);
    /*UI.FrameSequenceEffectPlayer+Alignment end.*/

    /*UI.FrameSequenceEffectPlayer+FrameData start.*/
    $m("UI.FrameSequenceEffectPlayer.FrameData", function () { return {"td":$n[4].FrameSequenceEffectPlayer,"att":1056770,"a":2,"at":[new System.SerializableAttribute()],"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"CropRect","t":4,"rt":$n[3].Rect,"sn":"CropRect"},{"a":2,"n":"CroppedSize","t":4,"rt":$n[3].Vector2,"sn":"CroppedSize"},{"a":2,"n":"OffsetFromCenter","t":4,"rt":$n[3].Vector2,"sn":"OffsetFromCenter"},{"a":2,"n":"Sprite","t":4,"rt":$n[3].Sprite,"sn":"Sprite"}]}; }, $n);
    /*UI.FrameSequenceEffectPlayer+FrameData end.*/

    /*UI.ImageNumberDisplay start.*/
    $m("UI.ImageNumberDisplay", function () { return {"nested":[$n[4].ImageNumberDisplay.Alignment],"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"Awake","t":8,"sn":"Awake","rt":$n[0].Void},{"a":1,"n":"GetImageFromPool","t":8,"sn":"GetImageFromPool","rt":$n[1].Image},{"a":1,"n":"OnDestroy","t":8,"sn":"OnDestroy","rt":$n[0].Void},{"a":1,"n":"OnValidate","t":8,"sn":"OnValidate","rt":$n[0].Void},{"a":1,"n":"ReturnImageToPool","t":8,"pi":[{"n":"image","pt":$n[1].Image,"ps":0}],"sn":"ReturnImageToPool","rt":$n[0].Void,"p":[$n[1].Image]},{"a":2,"n":"SetDigitSprites","t":8,"pi":[{"n":"sprites","pt":System.Array.type(UnityEngine.Sprite),"ps":0}],"sn":"SetDigitSprites","rt":$n[0].Void,"p":[System.Array.type(UnityEngine.Sprite)]},{"a":2,"n":"SetNumber","t":8,"pi":[{"n":"number","pt":$n[0].Int32,"ps":0}],"sn":"SetNumber","rt":$n[0].Void,"p":[$n[0].Int32]},{"a":2,"n":"SetNumber","t":8,"pi":[{"n":"numberString","pt":$n[0].String,"ps":0}],"sn":"SetNumber$1","rt":$n[0].Void,"p":[$n[0].String]},{"a":1,"n":"UpdateDisplay","t":8,"sn":"UpdateDisplay","rt":$n[0].Void},{"a":2,"n":"AlignmentType","t":16,"rt":$n[4].ImageNumberDisplay.Alignment,"g":{"a":2,"n":"get_AlignmentType","t":8,"rt":$n[4].ImageNumberDisplay.Alignment,"fg":"AlignmentType","box":function ($v) { return Bridge.box($v, UI.ImageNumberDisplay.Alignment, System.Enum.toStringFn(UI.ImageNumberDisplay.Alignment));}},"s":{"a":2,"n":"set_AlignmentType","t":8,"p":[$n[4].ImageNumberDisplay.Alignment],"rt":$n[0].Void,"fs":"AlignmentType"},"fn":"AlignmentType"},{"a":2,"n":"Number","t":16,"rt":$n[0].Int32,"g":{"a":2,"n":"get_Number","t":8,"rt":$n[0].Int32,"fg":"Number","box":function ($v) { return Bridge.box($v, System.Int32);}},"s":{"a":2,"n":"set_Number","t":8,"p":[$n[0].Int32],"rt":$n[0].Void,"fs":"Number"},"fn":"Number"},{"a":2,"n":"Spacing","t":16,"rt":$n[0].Single,"g":{"a":2,"n":"get_Spacing","t":8,"rt":$n[0].Single,"fg":"Spacing","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},"s":{"a":2,"n":"set_Spacing","t":8,"p":[$n[0].Single],"rt":$n[0].Void,"fs":"Spacing"},"fn":"Spacing"},{"at":[new UnityEngine.TooltipAttribute("\u5bf9\u9f50\u65b9\u5f0f\uff1aLeft=\u5de6\u5bf9\u9f50\uff0cRight=\u53f3\u5bf9\u9f50\uff0cCenter=\u5c45\u4e2d"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_alignment","t":4,"rt":$n[4].ImageNumberDisplay.Alignment,"sn":"_alignment","box":function ($v) { return Bridge.box($v, UI.ImageNumberDisplay.Alignment, System.Enum.toStringFn(UI.ImageNumberDisplay.Alignment));}},{"at":[new UnityEngine.HeaderAttribute("\u989c\u8272\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u6570\u5b57\u56fe\u7247\u7684\u989c\u8272"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_digitColor","t":4,"rt":$n[3].Color,"sn":"_digitColor"},{"at":[new UnityEngine.TooltipAttribute("\u6bcf\u4e2a\u6570\u5b57\u56fe\u7247\u7684\u9ad8\u5ea6\uff08\u5982\u679c\u4e3a0\u5219\u4f7f\u7528\u56fe\u7247\u539f\u59cb\u9ad8\u5ea6\uff09"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_digitHeight","t":4,"rt":$n[0].Single,"sn":"_digitHeight","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_digitImages","t":4,"rt":$n[5].List$1(UnityEngine.UI.Image),"sn":"_digitImages"},{"at":[new UnityEngine.HeaderAttribute("\u6570\u5b57\u56fe\u7247\u914d\u7f6e"),new UnityEngine.TooltipAttribute("\u6570\u5b570-9\u7684\u56fe\u7247\u6570\u7ec4\uff0c\u7d22\u5f15\u5bf9\u5e94\u6570\u5b57\u503c"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_digitSprites","t":4,"rt":System.Array.type(UnityEngine.Sprite),"sn":"_digitSprites"},{"at":[new UnityEngine.HeaderAttribute("\u6570\u5b57\u56fe\u7247\u5c3a\u5bf8"),new UnityEngine.TooltipAttribute("\u6bcf\u4e2a\u6570\u5b57\u56fe\u7247\u7684\u5bbd\u5ea6\uff08\u5982\u679c\u4e3a0\u5219\u4f7f\u7528\u56fe\u7247\u539f\u59cb\u5bbd\u5ea6\uff09"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_digitWidth","t":4,"rt":$n[0].Single,"sn":"_digitWidth","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}},{"a":1,"n":"_imagePool","t":4,"rt":$n[5].Queue$1(UnityEngine.UI.Image),"sn":"_imagePool"},{"at":[new UnityEngine.TooltipAttribute("\u6700\u5c0f\u663e\u793a\u4f4d\u6570\uff08\u7528\u4e8e\u524d\u5bfc\u96f6\uff09"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_minDigits","t":4,"rt":$n[0].Int32,"sn":"_minDigits","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.HeaderAttribute("\u663e\u793a\u8bbe\u7f6e"),new UnityEngine.TooltipAttribute("\u5f53\u524d\u663e\u793a\u7684\u6570\u5b57\u503c"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_number","t":4,"rt":$n[0].Int32,"sn":"_number","box":function ($v) { return Bridge.box($v, System.Int32);}},{"at":[new UnityEngine.TooltipAttribute("\u662f\u5426\u663e\u793a\u524d\u5bfc\u96f6"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_showLeadingZeros","t":4,"rt":$n[0].Boolean,"sn":"_showLeadingZeros","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"at":[new UnityEngine.TooltipAttribute("\u6570\u5b57\u4e4b\u95f4\u7684\u95f4\u8ddd"),new UnityEngine.SerializeFieldAttribute()],"a":1,"n":"_spacing","t":4,"rt":$n[0].Single,"sn":"_spacing","box":function ($v) { return Bridge.box($v, System.Single, System.Single.format, System.Single.getHashCode);}}]}; }, $n);
    /*UI.ImageNumberDisplay end.*/

    /*UI.ImageNumberDisplay+Alignment start.*/
    $m("UI.ImageNumberDisplay.Alignment", function () { return {"td":$n[4].ImageNumberDisplay,"att":258,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Center","is":true,"t":4,"rt":$n[4].ImageNumberDisplay.Alignment,"sn":"Center","box":function ($v) { return Bridge.box($v, UI.ImageNumberDisplay.Alignment, System.Enum.toStringFn(UI.ImageNumberDisplay.Alignment));}},{"a":2,"n":"Left","is":true,"t":4,"rt":$n[4].ImageNumberDisplay.Alignment,"sn":"Left","box":function ($v) { return Bridge.box($v, UI.ImageNumberDisplay.Alignment, System.Enum.toStringFn(UI.ImageNumberDisplay.Alignment));}},{"a":2,"n":"Right","is":true,"t":4,"rt":$n[4].ImageNumberDisplay.Alignment,"sn":"Right","box":function ($v) { return Bridge.box($v, UI.ImageNumberDisplay.Alignment, System.Enum.toStringFn(UI.ImageNumberDisplay.Alignment));}}]}; }, $n);
    /*UI.ImageNumberDisplay+Alignment end.*/

    }});
