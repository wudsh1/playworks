# LunaSampleGame

We wanted to provide the Luna commuinty with a free sample 2D game as an introduction on building creatives with Luna Playable.

This sample game includes some of [our free assets](https://github.com/LunaCommunity/Luna-Free-Assets) used for UI elements to create the end card for this game! 

You can check out our Free assets on our github community.

## Branches Differences

**The Master branch** of this project has already been modified to be exportable to Luna Playground as a lightweight editable playable. All you need to do is [install the Luna Plugin](https://docs.lunalabs.io/docs/playable/setup/install-luna), and un-comment the luna attributes code located in GameManager.cs and PauseManager.cs to access variables in Playground. Then build for playground (Plugin UI -> Playground -> Build & upload).

**The Dev branch** has been stripped of all changes made in the Master branch to work in Luna. Downloading this branch and following the steps below will provide you with a great hands-on opportunity to learn how to use the Luna Plugin. 


## Dev Branch Walkthrough

1. **Plugin Install:** After you have downloaded and opened the Dev branch of this game, you'll need to add the Luna Playable Plugin to the project. We have a comprehensive guide on installing playable [here](https://docs.lunalabs.io/docs/playable/setup/install-luna) in our docs.

2. **Fixing Diagnostic Errors:** Upon opening the Luna Plugin (Tools tab -> Luna Playable), you'll first need to check 2 things before you can attempt to build: First is if the appropriate scene is added for exporting with the plugin (Plugin UI -> Settings -> Basic), tick the scene that matches the name of the one you want (Scenes appear in the plugin window that are added to your Unity build settings). Second is if your MSBuild path is correct (Plugin UI -> Settings -> Advanced).

Now you can hit the 'Build Develop' button in the bottom left corner of the Plugin UI. However as we have not made any changes to our project yet, the build will fail and a window will pop up. Select 'Show Report' which will take you to the [Diagnostics panel](https://docs.lunalabs.io/docs/playable/code/project-diagnostics) (**shown in the image below, on the left**) to be shown the errors. 

In this case one of the problems is that we have a script that makes calls to Unity's Advertisement package, which is not supported or needed in your Luna build. As we don't need this in the Luna build, we can exclude this script in the plugin Code Excludes menu (Plugin UI -> Code -> Exclusions). Once on this menu, drop down the scripts folder and find the problem script and tick it to have it be excluded in the Luna build. (**Shown in the image below, on the righthand side**). 

![alt text](https://i.imgur.com/6at9Pqm.jpg)

The second error pertains to one line in a script that is essential to the game's functionality. In this case, rather than exclude the whole file we can preprocess this line (shown below).

![alt text](https://i.imgur.com/VcvA9hp.png)

3. **Size Breakdown:** Now you will be able to build with no errors, however we have not yet checked the size of the playable. To do so navigate to the Size Breakdown tab (Luna UI -> Size breakdown), and select a platform to calculate playable size for. For this project the largest percentage of the size is produced by the textures, in the Luna Plugin you can tweak your asset sizing and file type to allow to reduce this. Dropping down the Texture list you can see that the character sprites, and UI elements. So in the Texture settings menu (Plugin UI -> Assets -> Textures) we can find these files/folders and reduce their export size. 

![alt text](https://i.imgur.com/orvcVFB.jpg)

You now have a fully working & lightweight Playable that once you export to Playground will be edittable for endless versions! 

To export to playground go to: Plugin UI -> Playground -> 'Build & upload' button.

For further information about Luna Playable and Luna Replay, consider checking out our [Documentation](https://docs.lunalabs.io/)!
