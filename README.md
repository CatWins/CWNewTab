# CWNewTab
CWNewTab is a browser extension that turns your stating page into win95 like desktop, showing all your bookmarks as icons.

### What can you do with it right away:
* Drag bookmark icons around freely, or snap them to the grid
* Create and delete bookmarks and folders
* Open bookmark folders as windows
* Change the background color of the page
* Set your picture as wallpaper instead of plain background color

![](https://raw.githubusercontent.com/CatWins/CWNewTab/main/assets/background_color.gif)
![](https://raw.githubusercontent.com/CatWins/CWNewTab/main/assets/folders_and_windows.gif)
![](https://raw.githubusercontent.com/CatWins/CWNewTab/main/assets/moving_icon.gif)

## Building
Make sure you have Node.js installed as well as its package manager npm.  
The code also uses Gulp to automate workflow, so you need it to be installed globally:  
  
`sudo npm install -g gulp`  
  
Then to install all dependencies run from the base directory (the one contains package.json):  
  
`npm ci`  
  
And finally:  
  
`gulp`  

#### And you are done!
The `build.xpi` file is firefox archive, and the unarchived files should be in `output` directory.
