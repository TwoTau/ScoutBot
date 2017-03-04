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

        this.storage.get("darkscheme").then(value => {
            this.darkscheme = value;
        });

        this.teamNumber;
        this.teamName = "???";
        this.matchNumber;

        this.foul = false;
        this.deadBot = false;

        this.startingPosition;
        this.startsWithGear = false;
        this.startsWithBalls = false;

        this.crossedBaseline = false;
        this.autoGear = "0";
        this.autoGearLocation;
        this.autoBallGrabbed = false;
        this.autoHighGoal = 0;
        this.autoLowGoal = 0;

        this.gears = {
            makes: 0,
            misses: 0
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

        this.scaling;

        this.roles = {
            highShooting: false,
            lowShooting: false,
            gears: false,
            defense: false
        };

        this.comments = "";

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

    incrementGoal(highOrLow, makesOrMisses, numIncrement) {
        this.goals[highOrLow][makesOrMisses] += numIncrement;
        if(this.goals[highOrLow][makesOrMisses] > 500) {
            this.goals[highOrLow][makesOrMisses] = 500;
        }
    }
    decrementGoal(highOrLow, makesOrMisses, numIncrement) {
        this.goals[highOrLow][makesOrMisses] -= numIncrement;
        if(this.goals[highOrLow][makesOrMisses] < 0) {
            this.goals[highOrLow][makesOrMisses] = 0;
        }
    }

    incrementGear(makesOrMisses) {
        if(makesOrMisses == "makes" && this.gears.makes < 20) {
            this.gears.makes++;
        } else if(makesOrMisses == "misses" && this.gears.misses < 50) {
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
        if(!this.matchNumber) {
            return this.notFilledOutError("Match number", "Pregame");
        }
        if(!this.startingPosition) {
            return this.notFilledOutError("Starting position", "Pregame");
        }
        if(this.autoGear !== "0" && !this.autoGearLocation) {
            return this.notFilledOutError("Auto gear location", "During");
        }
        if(this.comments.includes('"') || this.comments.includes("'") || this.comments.includes(",")) {
            this.nav.present(Alert.create({
                title: "Comments section invalid",
                subTitle: "Section <b>comments</b> may not contain commas or quotation marks.",
                buttons: ["Dismiss"]
            }));
            return;
        }

        let qrElement = document.getElementById("qrCode");
        qr.canvas({
            canvas: qrElement,
            value: this.getText()
        });
        qrElement.style.display = "block";
    }

    notFilledOutError(fieldUnfilled, section) {
        let message = "You have not filled out the field <b>" + fieldUnfilled + "</b> in the <b>" + section + "</b> section.";

        let alert = Alert.create({
            title: "Incomplete section",
            subTitle: message,
            buttons: ["Dismiss"]
        });

        this.nav.present(alert);
    }

    getText() {
        let autoGearLocation = this.autoGearLocation;
        if(this.autoGear === "0") {
            autoGearLocation = "";
        }
        let text = this.dataService.encode({
            teamNumber: this.teamNumber,
            scoutColorNumber: this.colorNumber,
            scoutName: this.scout,
            matchNumber: this.matchNumber,
            foul: this.foul,
            deadBot: this.deadBot,
            startingPosition: this.startingPosition,
            startsWithGear: this.startsWithGear,
            startsWithBalls: this.startsWithBalls,
            crossedBaseline: this.crossedBaseline,
            autoGear: this.autoGear,
            autoGearLocation: this.autoGearLocation,
            autoBallGrabbed: this.autoBallGrabbed,
            autoHighGoal: this.autoHighGoal,
            autoLowGoal: this.autoLowGoal,
            gears: this.gears,
            goals: this.goals,
            scaling: this.scaling,
            roles: this.roles,
            comments: this.comments
        });
        console.log("Encoded: " + text);
        // console.log("Decoded: " + this.dataService.decode(text).csvRowArray.join(","));

        return text;
    }
}
