import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/new-game/new-game.html'
})

export class NewGamePage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
        this.storage = new Storage(SqlStorage);

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

        this.autonomousDefense = "N";

        this.autonomousSuccessful = false;

        this.ballGrabbed = false;

        this.defenses = {
            a: {
                name: "Portcullis / Cheval de Frise",
                makes: 0,
                misses: 0
            },
            b: {
                name: "Moat / Ramparts",
                makes: 0,
                misses: 0
            },
            c: {
                name: "Drawbridge / Sally Port",
                makes: 0,
                misses: 0
            },
            d: {
                name: "Rock Wall / Rough Terrain",
                makes: 0,
                misses: 0
            },
            e: {
                name: "Lowbar"
            }
        };

        this.roles = {
            highShooting: false,
            lowShooting: false,
            breaching: false,
            defending: false
        };

        this.endgame = {
            challengedTower: false,
            scaled: false
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
                        name: unescape(data.res.rows.item(i).nickname)
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

    incrementDefense(groupLetter, makesOrMisses) {
        if(this.defenses[groupLetter][makesOrMisses] < 99) this.defenses[groupLetter][makesOrMisses]++;
    }

    decrementDefense(groupLetter, makesOrMisses) {
        if(this.defenses[groupLetter][makesOrMisses] > 0) this.defenses[groupLetter][makesOrMisses]--;
    }

    makeQR() {
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

    boolToBin(booleanValue) {
        return booleanValue ? 1 : 0;
    }

    getText() {

        let scoutInfo = {
            color: this.colorNumber[0] === "R" ? 0 : 3,
            number: +this.colorNumber.slice(-1),
            name: this.scout
        };

        let foul = this.boolToBin(this.foul);
        let deadBot = this.boolToBin(this.deadBot);

        let autonomousSuccessful = this.boolToBin(this.autonomousSuccessful);

        let defenseA = {
            name: this.boolToBin(this.defenses.a.name === "Cheval de Frise"),
            makes: defenses.a.makes,
            misses: defenses.a.misses
        };
        let defenseB = {
            name: this.boolToBin(this.defenses.b.name === "Ramparts"),
            makes: defenses.b.makes,
            misses: defenses.b.misses
        };
        let defenseC = {
            name: this.boolToBin(this.defenses.c.name === "Sally Port"),
            makes: defenses.c.makes,
            misses: defenses.c.misses
        };
        let defenseD = {
            name: this.boolToBin(this.defenses.d.name === "Rough Terrain"),
            makes: defenses.d.makes,
            misses: defenses.d.misses
        };

        let ballGrabbed = this.boolToBin(this.ballGrabbed);

        let stuff = [
            scoutInfo.color + scoutInfo.number,
            scoutInfo.name,
            foul,
            deadBot,
            defenseA.name,
            defenseB.name,
            defenseC.name,
            defenseD.name,
            this.autonomousDefense,
            autonomousSuccessful,
            ballGrabbed
        ];
        console.log(stuff.join(","));
        return stuff.join(",");
    }
}
