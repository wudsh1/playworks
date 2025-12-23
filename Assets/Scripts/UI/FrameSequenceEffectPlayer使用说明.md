# 序列帧特效播放器使用说明

## ⚠️ 重要：关于打包大小

如果你的特效图片很大（如720x1280），打包后会占用很多空间。**强烈建议使用预处理裁剪工具**，可以大大减少打包大小！

## 预处理裁剪（推荐）- 减少打包大小

### 步骤1：预处理裁剪序列帧

1. 打开菜单：`Tools` → `序列帧预处理裁剪工具`
2. 设置参数：
   - **源目录路径**：输入原始特效目录，例如：`texiao/lanse`
   - **输出目录路径**：输入裁剪后的输出目录，例如：`texiao/lanse_cropped`
   - **原始尺寸**：设置为原始特效尺寸，例如：`720, 1280`
   - **裁剪容差**：可选，默认0
3. 点击"开始裁剪处理"
4. 工具会自动：
   - 裁剪每帧的透明区域
   - 生成新的小图片（体积更小）
   - 保存偏移数据到ScriptableObject

### 步骤2：使用裁剪后的图片

1. 在GameObject上添加 `FrameSequenceEffectPlayer` 组件
2. 加载裁剪后的序列帧：
   - 在Inspector中设置 `Frame Sprites Directory` 为裁剪后的目录（如：`texiao/lanse_cropped`）
   - 或者手动加载裁剪后的图片到 `Frame Sprites` 数组
3. **重要**：设置 `Preprocessed Crop Data` 为生成的 `CropData.asset` 文件
4. **取消勾选** `Auto Crop Transparent`（因为已经预处理过了）

**效果：**
- ✅ 打包体积大幅减小（只包含裁剪后的有效区域）
- ✅ 播放效果完全一致（偏移信息已保存）
- ✅ 运行时性能更好（不需要读取像素数据）

---

## 快速开始（不使用预处理）

### 1. 创建GameObject并添加组件

1. 在Unity场景中创建一个新的GameObject（或使用现有的UI GameObject）
2. 添加 `Image` 组件（如果没有）
3. 添加 `FrameSequenceEffectPlayer` 组件

### 2. 加载序列帧

有两种方式加载序列帧：

#### 方式一：通过目录自动加载（推荐）

1. 在Inspector中找到 `FrameSequenceEffectPlayer` 组件
2. 在"从目录加载序列帧"区域：
   - 输入目录路径，例如：`texiao/lanse`
   - 或者点击"选择目录"按钮浏览选择
3. 点击"加载"按钮
4. 系统会自动加载该目录下所有图片并按文件名排序

**注意：** 目录路径是相对于 `Assets` 文件夹的，不需要包含 `Assets/` 前缀

#### 方式二：手动拖拽

1. 直接将序列帧图片从Project窗口拖拽到 `Frame Sprites` 数组中
2. 确保顺序正确

### 3. 配置参数

#### 基本设置
- **Frame Rate（帧率）**: 播放速度，例如30fps
- **Loop（循环）**: 是否循环播放
- **Auto Play（自动播放）**: 是否在Start时自动播放

#### 裁剪设置（可选）

**重要：裁剪功能是可选的！**

- **Auto Crop Transparent（自动裁剪透明区域）**: 
  - ✅ **勾选**：自动裁剪每帧的透明区域，保存偏移，保持掉落效果
  - ❌ **不勾选**：不裁剪，使用原始图片尺寸，所有帧尺寸相同

- **Crop Padding（裁剪容差）**: 裁剪边界扩展像素数（默认0）

- **Original Size（原始尺寸）**: 原始特效尺寸，用于计算偏移（默认720x1280）

#### 显示设置
- **Target Image**: Image组件引用（如果为空会自动获取）
- **Keep Original Center**: 是否保持原始中心位置
- **Anchor Alignment**: 对齐方式（当不保持原始中心时）

## 使用场景

### 场景1：需要裁剪透明区域，保持掉落效果

适用于：特效有掉落动画，每帧有效区域大小不同

**设置：**
1. ✅ 勾选 `Auto Crop Transparent`
2. 设置 `Original Size` 为原始特效尺寸（例如 720, 1280）
3. 设置 `Keep Original Center` 为 true

**效果：** 
- 每帧会自动裁剪透明区域
- 保存偏移信息
- 播放时根据偏移调整位置，掉落效果自然

### 场景2：不需要裁剪，使用原始尺寸

适用于：所有帧尺寸相同，或不需要动态裁剪

**设置：**
1. ❌ 不勾选 `Auto Crop Transparent`

**效果：**
- 使用原始图片尺寸
- 所有帧尺寸相同
- 播放更简单直接

## 代码使用示例

### 播放控制

```csharp
using UI;

// 获取组件
FrameSequenceEffectPlayer player = GetComponent<FrameSequenceEffectPlayer>();

// 播放
player.Play();

// 暂停
player.Pause();

// 继续
player.Resume();

// 停止
player.Stop();

// 设置位置
player.SetPosition(new Vector2(100, 200));

// 跳转到指定帧
player.SetFrame(10);

// 获取当前帧
int currentFrame = player.GetCurrentFrameIndex();

// 获取总帧数
int totalFrames = player.GetTotalFrames();
```

### 事件监听

```csharp
// 播放完成事件
player.OnPlayComplete += () => {
    Debug.Log("播放完成！");
    // 你的代码
};
```

## 注意事项

### 1. 纹理设置

如果使用裁剪功能，需要确保纹理可读：
1. 在Project窗口选择图片
2. 在Inspector的Import Settings中
3. 勾选 "Read/Write Enabled"
4. 点击 Apply

### 2. 图片导入设置

确保图片已导入为Sprite格式：
1. 选择图片
2. 在Texture Type中选择 "Sprite (2D and UI)"
3. 点击 Apply

### 3. 文件名规范

为了正确排序，建议使用数字编号：
- ✅ 好：`蓝色_00001.png`, `蓝色_00002.png`
- ❌ 不好：`蓝色_1.png`, `蓝色_2.png`（可能排序错误）

## 常见问题

### Q: 裁剪后掉落效果不对？
A: 检查以下几点：
1. `Original Size` 是否正确设置为原始特效尺寸
2. `Keep Original Center` 是否勾选
3. 纹理是否启用了 Read/Write Enabled

### Q: 不想裁剪怎么办？
A: 直接取消勾选 `Auto Crop Transparent` 即可，所有帧会使用原始尺寸。

### Q: 如何调整播放速度？
A: 修改 `Frame Rate` 参数，例如：
- 30 = 30帧/秒
- 60 = 60帧/秒
- 15 = 15帧/秒（慢速）

### Q: 可以动态加载不同的特效吗？
A: 可以，通过代码修改 `FrameSprites` 数组，然后调用 `RecalculateCropData()` 重新计算。

## 示例场景

参考 `Assets/texiao/lanse` 目录，这是一个完整的序列帧特效示例：
- 30帧序列帧图片
- 命名规范：`蓝色_00001.png` ~ `蓝色_00030.png`
- 每帧都是 720x1280 尺寸

