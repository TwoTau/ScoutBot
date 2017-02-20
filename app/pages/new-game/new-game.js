import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';
import {GameDataService} from '../../providers/game-data-service/game-data-service';

@Page({
    templateUrl: 'build/pages/new-game/new-game.html',
    providers: [GameDataService]
})

export class NewGamePage {
    static get parameters() {
        return [[NavController], [GameDataService]];
    }

    constructor(nav, dataService) {
        this.nav = nav;
        this.storage = new Storage(SqlStorage);

        this.dataService = dataService;

        this.gameMode = "pre";

        this.storage.get("colorNumber").then((colorNumber) => {
            this.colorNumber = (colorNumber === undefined) ? "Red 1" : colorNumber;
            this.navbarColor = this.colorNumber.split(" ")[0].toLowerCase();
        });

        this.storage.get("scout").then((name) => {
            this.scout = (name === undefined) ? "Scout" : name;
        });

        this.allTeams = [];

        this.storage.get("eventCode").then(value => {
            if(value !== "false" && value !== undefined) {
                this.loadTeamsFromDb();
            }
        });

        this.teamNumber;
        this.teamName = "???";

        this.foul = false;
        this.deadBot = false;

        this.autoBallGrabbed = false;
        this.autoHighGoal = false;
        this.autoLowGoal = false;

        this.goals = {
            high: {
                makes: 0,
                misses: 0
            },
            low: {
                makes: 0,
                misses: 0
            }
        };

        this.gears = {
            makes: 0,
            misses: 0
        };

        this.roles = {
            highShooting: false,
            lowShooting: false,
            gears: false,
            defense: false
        };

    }

    loadTeamsFromDb() {
        this.storage.query("CREATE TABLE IF NOT EXISTS eventteams (number INTEGER PRIMARY KEY, nickname TEXT, website TEXT)").then(data => {}, error => {
            console.log("create error -> " + JSON.stringify(error.err));
        });

        this.storage.query("SELECT * FROM eventteams").then(data => {
            if(data.res.rows.length > 0) {
                for(let i = 0; i < data.res.rows.length; i++) {
                    this.allTeams.push({
                        number: data.res.rows.item(i).number,
                        name: this.unescape(data.res.rows.item(i).nickname)
                    });
                }
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error.err));
        });
    }

    unescape(escapedName) {
        return escapedName.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39/g, "'");
    }

    changeTeamName() {
        // allTeams stores team numbers as integers but this.teamNumber is a string
        let team = this.allTeams.find(team => team.number === +this.teamNumber);
        this.teamName = team !== undefined ? team.name : "???";
    }

    incrementGoal(highOrLow, makesOrMisses) {
        if(this.goals[highOrLow][makesOrMisses] < 500) this.goals[highOrLow][makesOrMisses] += 10;
    }
    decrementGoal(highOrLow, makesOrMisses) {
        if(this.goals[highOrLow][makesOrMisses] > 0) this.goals[highOrLow][makesOrMisses] -= 10;
    }

    incrementGear(makesOrMisses) {
        if(makesOrMisses == "makes" && this.gears.makes < 18) {
            this.gears.makes++;
        }
        else if(makesOrMisses == "misses" && this.gears.misses < 40) {
            this.gears.misses++;
        }
    }
    decrementGear(makesOrMisses) {
        if(this.gears[makesOrMisses] > 0) this.gears[makesOrMisses]--;
    }

    makeQR() {
        if(!this.teamNumber) {
            return this.notFilledOutError("Team number", "Pregame");
        }
        if(this.defenses.a.name === "Portcullis / Cheval de Frise") {
            return this.notFilledOutError("Defense A", "Pregame");
        } if(this.defenses.b.name === "Moat / Ramparts") {
            return this.notFilledOutError("Defense B", "Pregame");
        } if(this.defenses.c.name === "Drawbridge / Sally Port") {
            return this.notFilledOutError("Defense C", "Pregame");
        } if(this.defenses.d.name === "Rock Wall / Rough Terrain") {
            return this.notFilledOutError("Defense D", "Pregame");
        }
        qr.canvas({
            canvas: document.getElementById("qrCode"),
            value: this.getText()
        });
    }

    notFilledOutError(fieldUnfilled, section) {
        let message = "You have not filled out the field <b>" + fieldUnfilled + "</b>. in the <b>" + section + "</b> section.";

        let alert = Alert.create({
            title: "Incomplete section",
            subTitle: message,
            buttons: ["Dismiss"]
        });

        this.nav.present(alert);
    }

    getText() {
        let text = this.dataService.encode({
            teamNumber: this.teamNumber,
            scoutColorNumber: this.colorNumber,
            scoutName: this.scout,
            foul: this.foul,
            deadBot: this.deadBot,
            defenses: this.defenses,
            autonomousDefense: this.autonomousDefense,
            autonomousSuccessful: this.autonomousSuccessful,
            autoBallGrabbed: this.autoBallGrabbed,
            autoHighGoal: this.autoHighGoal,
            autoLowGoal: this.autoLowGoal,
            goals: this.goals,
            endgame: this.endgame,
            roles: this.roles
        });
        console.log("Encoded: " + text);
        console.log("Decoded: " + JSON.stringify(this.dataService.decode(text)));

        return text;
    }
}
