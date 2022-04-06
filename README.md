![dy](https://telegra.ph/file/3a3edf8916e3239522a34.jpg)
<h2 align="center">Adii-MD</h2>
<h3 align="center">Multi-Device Bot</h3>

--------------
<h2 align="center">Installation</h2>


#### Deploy to Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Adiixyz/Adii-MD02)

#### Heroku Buildpack
| BuildPack | LINK |
|--------|--------|
| **FFMPEG** |[here](https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest) |
| **IMAGEMAGICK** | [here](https://github.com/DuckyTeam/heroku-buildpack-imagemagick) |

## FOR `termux` USER

```cmd
git clone https://github.com/Adiixyz/Adii-MD02
cd Adii-MD02
npm install
npm update
```

## FOR WINDOWS/VPS/RDP USER
* Download And Install Git [`Click Here`](https://git-scm.com/downloads)
* Download And Install NodeJS [`Click Here`](https://nodejs.org/en/download)
* Download And Install FFmpeg [`Click Here`](https://ffmpeg.org/download.html) (**Don't Forget Add FFmpeg to PATH enviroment variables**)
* Download And Install ImageMagick [`Click Here`](https://imagemagick.org/script/download.php)

```cmd
git clone https://github.com/Adiixyz/Adii-MD02
cd Adii-MD02
npm install
npm update
```

#### Installing the FFmpeg
* Download one of the FFmpeg versions [here](https://ffmpeg.org/download.html).
* Extract file to `C:\` path.
* Rename the extracted folder to `ffmpeg`.
* Run Command Prompt as Administrator.
* Run the following command:
```cmd
> setx /m PATH "C:\ffmpeg\bin;%PATH%"
```
If successful, it will give you a message like:
`SUCCESS: specified value was saved`.

* Now that you have FFmpeg installed, verify that it worked by running this command to see the version:
```cmd
> ffmpeg -version
```
---------

## Run

```cmd
node .
```

---------
