# ScoutBot
An up to date scouting app for the 2016 FRC competition.

Built on [Ionic2][ionic2-website].

Works on Android and <sup>theoretically</sup> works on Windows 10.

## Features

### Pit scouting
<!-- TODO: Add features of pit scouting here once pit scouting is implemented -->

### Game scouting
| Input type | Name | Example |
| :--------- | :--- | :------ |
| **General** | | |
| integer | Team number | _2976_ |
| radio | Number / color of team | _Blue 1_, _Red 3_, etc. |
| text | Scout name | _Bob_ |
| checkbox | Robot fouled | _False_ |
| checkbox | Dead robot | _False_ |
| radio | Defense A | _Portcullis_ or _Cheval de Frise_ |
| radio | Defense B | _Moat_ or _Ramparts_ |
| radio | Defense C | _Drawbridge_ or _Sally Port_ |
| radio | Defense D | _Rock Wall_ or _Rough Terrain_ |
| **Autonomous** | | |
| radio | Defense attempted | _Portcullis_, _Drawbridge_, _None_, etc. |
| checkbox | Successfully crossed | _False_ |
| checkbox | Grabbed ball | _False_ |
| checkbox | Scored in high goal | _False_ |
| checkbox | Scored in low goal | _False_ |
| **Teleop** | | |
| integer | Defense A <span style="color:#13b140;">Makes</span> | _2_ |
| integer | Defense A <span style="color:#f53d3d;">Misses</span> | _3_ |
| integer | Defense B <span style="color:#13b140;">Makes</span> | _2_ |
| integer | Defense B <span style="color:#f53d3d;">Misses</span> | _0_ |
| integer | Defense C <span style="color:#13b140;">Makes</span> | _0_ |
| integer | Defense C <span style="color:#f53d3d;">Misses</span> | _1_ |
| integer | Defense D <span style="color:#13b140;">Makes</span> | _1_ |
| integer | Defense D <span style="color:#f53d3d;">Misses</span> | _2_ |
| checkbox | Breached low bar | _True_ |
| integer | High goal <span style="color:#13b140;">Makes</span> | _1_ |
| integer | High goal <span style="color:#f53d3d;">Misses</span> | _1_ |
| integer | Low goal <span style="color:#13b140;">Makes</span> | _2_ |
| integer | Low goal <span style="color:#f53d3d;">Misses</span> | _0_ |
| **Endgame** | | |
| checkbox | Challenged tower | _True_ |
| checkbox | Scaled tower | _False_ |
| **Roles** | | |
| checkbox | High shooting | _True_ |
| checkbox | Low shooting | _True_ |
| checkbox | Breaching | _True_ |
| checkbox | Defending | _False_ |

### Todo
- [ ] Have an option for pit scouting
- [ ] Make this work with Bluetooth _or_ QR codes instead of just QR codes
- [ ] Have a swipe option on the makes / misses
    - i.e. _swipe left: decrement_ and _swipe right: increment_

## Screenshots
<!-- TODO: Add screenshots -->

## Installation
### Get this repository
1. Install [NodeJS][nodejs-website] and NPM
2. Install [ionic2][ionic2-install]
3. Create an app called `ScoutBot`
4. Clone this repository and put this into the new folder
5. Add platforms Android and Windows
6. Try `ionic serve` to make sure that it works

### Install on your device
1. Connect your device to your computer via USB
2. Build to your device
    - If Android, do `ionic run android`
    - If Windows, do `ionic run windows`
<!--  -->
For reference, these are the conditions under which I built my app:

| `ionic info`            |
| :---------------------- | :------------------ |
| **Framework**           | **Version**         |
| Cordova CLI             | 6.2.0               |
| Gulp version            | CLI version 3.9.1   |
| Gulp local              | Local version 3.9.1 |
| Ionic Framework Version | 2.0.0-beta.7        |
| Ionic CLI Version       | 2.0.0-beta.32       |
| Ionic App Lib Version   | 2.0.0-beta.18       |
| OS                      | Windows 10          |
| Node Version            | v6.2.0              |

<!--  Links down here -->
[ionic2-website]: https://ionic.io/2
[nodejs-website]: https://nodejs.org/en/
[ionic2-install]: http://ionicframework.com/docs/v2/getting-started/installation/
