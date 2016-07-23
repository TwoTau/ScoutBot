import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';
import {Http} from '@angular/http';
import {TeamStorageService} from '../../providers/team-storage-service/team-storage-service';

@Page({
    templateUrl: 'build/pages/settings/settings.html',
    providers: [TeamStorageService]
})

export class SettingsPage {
    static get parameters() {
        return [[NavController], [Http], [TeamStorageService]];
    }

    constructor(nav, http, teamService) {
        this.nav = nav;
        this.http = http;
        this.teamStorageService = teamService;

        this.storage = new Storage(SqlStorage);

        this.storage.query("CREATE TABLE IF NOT EXISTS eventteams (number INTEGER PRIMARY KEY, nickname TEXT, website TEXT)").then(data => {
            console.log("created from js thing");
        }, error => {
            console.log("create error -> " + JSON.stringify(error.err));
        });

        this.allTeams = [];

        this.eventCode = false;

        this.storage.get("eventCode").then(value => {
            if(value !== "false" && value !== undefined) {
                this.eventCode = value;
                this.loadFromDb();
            }
        });

        this.storage.get("isMaster").then(value => {
            this.isMaster = (value === undefined) ? false : value;
        });

        this.storage.get("hasPitScouting").then(value => {
            this.hasPitScouting = (value === undefined) ? false : value;
        });

        this.storage.get("scout").then(value => {
            this.scout = (value === undefined) ? "" : value;
        });

        this.storage.get("colorNumber").then(value => {
            this.colorNumber = (value === undefined) ? "Red 1" : value;
        });
    }

    loadFromDb() {
        this.storage.query("SELECT * FROM eventteams").then(data => {
            if(data.res.rows.length > 0) {
                for(let i = 0; i < data.res.rows.length; i++) {
                    this.allTeams.push({
                        number: data.res.rows.item(i).number,
                        name: this.unescape(data.res.rows.item(i).nickname),
                        website: decodeURIComponent(data.res.rows.item(i).website)
                    });
                }
                document.getElementById("addChangeEvent").innerHTML = "Change event";
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error.err));
        });
    }

    addTeamToDb(number, name, website) {
        this.storage.query("INSERT INTO eventteams (number, nickname, website) VALUES ('" + number + "', '" + this.escape(name) + "', '" + encodeURIComponent(website) + "')").then(data => {

        }, error => {
            console.log("insert error -> " + JSON.stringify(error.err) + " with " + name + ", " + website + ", " + website);
        });
    }

    // NOTE: SqlStorage will set the value as a string, so all numbers or booleans are stringified
    updateStorage(key) {
        // console.log("Changed key '" + key + "'. Now, it is: " + this[key]);
        this.storage.set(key, this[key]);
    }

    // returns a URL to the BlueAllianceAPI to make a GET request to get event information
    makeUrl(eventCode) {
        return "https://www.thebluealliance.com/api/v2/event/" + eventCode + "/teams?X-TBA-App-Id=frc2976:post-season-scouting-app:v01"
    }

    escape(teamName) {
        var entityMap = {
            "&": "&amp;",
            '"': '&quot;',
            "'": '&#39;'
        };

        return teamName.replace(/[&"']/g, function(c) {
            return entityMap[c];
        });
    }

    unescape(escapedName) {
        return escapedName.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39/g, "'");
    }

    // is the eventCode in the form of a BlueAllianceAPI event code
    isValidEventCode(eventCode) {
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
                    handler: data => {}
                },
                {
                    text: "Add",
                    handler: data => {
                        let eventCode = data.eventcode.toLowerCase();

                        if(this.isValidEventCode(eventCode)) { // it fits the format
                            this.http.get(this.makeUrl(eventCode)).subscribe(data => { // HTTP GET from the BlueAllianceAPI
                                this.clearDb();

                                let teams = data.json();

                                // for some reason, a for-of loop doesn't work here
                                for(let i = 0; i < teams.length; i++) {
                                    this.addTeamToDb(teams[i].team_number, teams[i].nickname, teams[i].website);
                                }

                                this.loadFromDb();

                                this.eventCode = eventCode;
                                this.updateStorage("eventCode");
                            }, error => { // not a recognized event code (404) or no internet connection
                                this.onInvalidCode(eventCode);
                            });
                        } else { // invalid format
                            this.onInvalidCode(eventCode);
                        }
                    }
                }
            ]
        });

        this.nav.present(prompt);
    }

    clearDb() {
        this.storage.query("DELETE FROM eventteams").then(data => {
            this.allTeams = [];
            document.getElementById("addChangeEvent").innerHTML = "Add event";
        }, error => {
            console.log("delete error -> " + JSON.stringify(error.err));
        });
    }

    removeEventCode() {
        this.clearDb();
        this.eventCode = false;
        this.updateStorage("eventCode");
    }
}
