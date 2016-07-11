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

        this.autoBallGrabbed = false;
        this.autoHighGoal = false;
        this.autoLowGoal = false;

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
                name: "Lowbar",
                made: false
            }
        };

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

        this.endgame = {
            challengedTower: false,
            scaled: false
        };

        this.roles = {
            highShooting: false,
            lowShooting: false,
            breaching: false,
            defending: false
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
        if(this.defenses[groupLetter][makesOrMisses] < 35) this.defenses[groupLetter][makesOrMisses]++;
    }
    decrementDefense(groupLetter, makesOrMisses) {
        if(this.defenses[groupLetter][makesOrMisses] > 0) this.defenses[groupLetter][makesOrMisses]--;
    }

    incrementGoal(highOrLow, makesOrMisses) {
        if(this.goals[highOrLow][makesOrMisses] < 35) this.goals[highOrLow][makesOrMisses]++;
    }
    decrementGoal(highOrLow, makesOrMisses) {
        if(this.goals[highOrLow][makesOrMisses] > 0) this.goals[highOrLow][makesOrMisses]--;
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

    // Returns a string
    boolToBin(booleanValue) {
        return booleanValue ? "1" : "0";
    }

    // Returns a hexadecimal string
    binToHex(binaryString) {
        return parseInt(binaryString, 2).toString(16);
    }

    // Parameter base10Num can be either a string or an integer
    // Returns a base 36 string
    decToBase36(base10Num) {
        return parseInt(base10Num, 10).toString(36);
    }

    getText() {

        let scoutInfo = {
            color: this.colorNumber[0] === "R" ? 0 : 3,
            number: +this.colorNumber.slice(-1),
            name: this.scout
        };

        let foul = this.boolToBin(this.foul);
        let deadBot = this.boolToBin(this.deadBot);

        let defenseA = {
            name: this.boolToBin(this.defenses.a.name === "Cheval de Frise"),
            makes: this.decToBase36(this.defenses.a.makes),
            misses: this.decToBase36(this.defenses.a.misses)
        };
        let defenseB = {
            name: this.boolToBin(this.defenses.b.name === "Ramparts"),
            makes: this.decToBase36(this.defenses.b.makes),
            misses: this.decToBase36(this.defenses.b.misses)
        };
        let defenseC = {
            name: this.boolToBin(this.defenses.c.name === "Sally Port"),
            makes: this.decToBase36(this.defenses.c.makes),
            misses: this.decToBase36(this.defenses.c.misses)
        };
        let defenseD = {
            name: this.boolToBin(this.defenses.d.name === "Rough Terrain"),
            makes: this.decToBase36(this.defenses.d.makes),
            misses: this.decToBase36(this.defenses.d.misses)
        };

        let autonomousDefense = "N";
        if(this.autonomousDefense === "A") autonomousDefense = 0;
        if(this.autonomousDefense === "B") autonomousDefense = 2;
        if(this.autonomousDefense === "C") autonomousDefense = 4;
        if(this.autonomousDefense === "D") autonomousDefense = 6;
        if(this.autonomousDefense === "E") autonomousDefense = 8;
        if(this.autonomousSuccessful) autonomousDefense++;

        let autoBallGrabbed = this.boolToBin(this.autoBallGrabbed);
        let autoHighGoal = this.boolToBin(this.autoHighGoal);
        let autoLowGoal = this.boolToBin(this.autoLowGoal);

        let lowbarMade = this.boolToBin(this.defenses.e.made);

        let teleopHighGoal = {
            makes: this.decToBase36(this.goals.high.makes),
            misses: this.decToBase36(this.goals.high.misses)
        };

        let teleopLowGoal = {
            makes: this.decToBase36(this.goals.low.makes),
            misses: this.decToBase36(this.goals.low.misses)
        };

        let endgame = {
            challengedTower: this.boolToBin(this.endgame.challengedTower),
            scaled: this.boolToBin(this.endgame.scaled)
        };

        let roles = {
            highShooting: this.boolToBin(this.roles.highShooting),
            lowShooting: this.boolToBin(this.roles.lowShooting),
            breaching: this.boolToBin(this.roles.breaching),
            defending: this.boolToBin(this.roles.defending)
        };

        let final = this.teamNumber + "" +
        (scoutInfo.color + scoutInfo.number) +
        scoutInfo.name +
        "@" +
        this.binToHex(foul + deadBot) +
        this.binToHex(defenseA.name + defenseB.name + defenseC.name + defenseD.name) +
        autonomousDefense +
        this.binToHex(autoBallGrabbed + autoHighGoal + autoLowGoal) +
        defenseA.makes +
        defenseA.misses +
        defenseB.makes +
        defenseB.misses +
        defenseC.makes +
        defenseC.misses +
        defenseD.makes +
        defenseD.misses +
        lowbarMade +
        teleopHighGoal.makes +
        teleopHighGoal.misses +
        teleopLowGoal.makes +
        teleopLowGoal.misses +
        this.binToHex(endgame.challengedTower + endgame.scaled) +
        this.binToHex(roles.highShooting + roles.lowShooting + roles.breaching + roles.defending);

        console.log(final);
        return final;
    }
}
