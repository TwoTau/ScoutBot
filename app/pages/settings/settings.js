import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';
import {Http} from '@angular/http';

@Page({
    templateUrl: 'build/pages/settings/settings.html'
})

export class SettingsPage {
    static get parameters() {
        return [[NavController], [Http]];
    }

    constructor(nav, http) {
        this.nav = nav;
        this.http = http;

        this.teamsLoaded = false;
        this.allTeams = [];

        this.http = http;

        this.ranNum = 0;

        this.storage = new Storage(SqlStorage);

        this.storage.get("randNumber").then(info => {
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
        let eventYear = +eventCode.substr(0, 4);
        if(eventYear < 2016 || eventYear > 2017 || eventCode < 8 || eventCode.length > 9) {
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

    onInvalidCode(invalidEventCode) {
        let message = "The event code <strong>" + invalidEventCode + "</strong> is not a valid Blue Alliance event code for this year or you do not have internet.";
        let alert = Alert.create({
            title: "Invalid event code",
            subTitle: message,
            buttons: ["Dismiss"]
        });
        this.nav.present(alert);
    }

    askForEventCode() {
        let prompt = Alert.create({
            title: "Add new event",
            message: "Enter the Blue Alliance event code for your event. To find this, go to your event on TBA and look at the end of the URL (e.x. 2016wasno, 2016ohcl, or 2016mawor). <strong>Requires internet connection</strong>.",
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
                            this.http.get(this.makeUrl(eventCode)).subscribe(data => {
                                this.allTeams = data.json();
                                this.teamsLoaded = true;
                                document.getElementById("addChangeEvent").innerHTML = "Change event";
                            }, error => {
                                this.onInvalidCode(eventCode);
                            });
                        } else {
                            this.onInvalidCode(eventCode);
                        }
                    }
                }
            ]
        });

        this.nav.present(prompt);
    }
}
