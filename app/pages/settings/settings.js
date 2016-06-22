import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/settings/settings.html'
})

export class SettingsPage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
        this.allTeams = [];

        this.ranNum = 0;

        this.storage = new Storage(SqlStorage);

        this.storage.get("randNumber").then((info) => {
            this.ranNum = info;
        });
    }

    resetStorageNumber() {
        this.ranNum = Math.floor(Math.random()*100);
        this.storage.set("randNumber", this.ranNum);
    }

    makeUrl(eventCode) {
        return "https://www.thebluealliance.com/api/v2/event/" + eventCode + "/teams?X-TBA-App-Id=frc2976:post-season-scouting-app:v01"
    }

    validateEventCode(eventCode) {
        if(+eventCode.substr(0, 4) < 2016 || +eventCode.substr(0, 4) > 2017) {
            return false;
        }

        let eventName = eventCode.substr(4);
        for(let i = 0; i < 10; i++) {
            if(eventName.indexOf(i + "") >= 0) {
                return false;
            }
        }

        return true;
    }

    getEvent() {
        this.askForEventCode();
    }

    onSuccess(self, res) {
        self.allTeams = JSON.parse(res);
        // for(let team of self.allTeams) {
        //     console.log(team.nickname);
        // }
    }

    askForEventCode() {
        let prompt = Alert.create({
            title: "Add new event",
            message: "Enter the Blue alliance event code for your event. To find this, go to your event on TBA and look at the end of the URL (e.x. 2016wasno, 2016ohcl, or 2016mawor). *Requires internet connection",
            inputs: [
                {
                    name: "eventcode",
                    placeholder: "2016wasno"
                }
            ],
            buttons: [
                {
                    text: "Cancel",
                    handler: data => {

                    }
                },
                {
                    text: "Add",
                    handler: data => {
                        let eventCode = data.eventcode.toLowerCase();
                        if(this.validateEventCode(eventCode)) {
                            console.log("validated");
                            let tba_url = this.makeUrl(eventCode);
                            this.httpGetAsync(tba_url, this.onSuccess);
                        } else {
                            console.log("noperinos");
                        }
                    }
                }
            ]
        });

        this.nav.present(prompt);
    }

    httpGetAsync(theUrl, callback) {
        let xmlHttp = new XMLHttpRequest();
        var self = this;
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(self, xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.send(null);
    }
}
